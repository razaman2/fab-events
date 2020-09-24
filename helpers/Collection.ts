import FirestoreUpdate
    from 'app/helpers/interfaces/FirestoreUpdate';
import ReactiveVue
    from 'app/helpers/ReactiveVue';
import {
    Component,
    Prop,
    Watch
} from 'vue-property-decorator';
import firebase
    from 'firebase';

@Component
export default class Collection extends ReactiveVue {
    @Prop({
        required: false,
        type: Array
    }) protected readonly belongsTo: Array<() => Collection> | undefined;

    @Watch('state.props.id', { immediate: true })
    protected onCollectionIDChanged(id: string) {
        if (id) {
            this.subscription();
        }
    }

    @Watch('doc', { immediate: true })
    protected onCollectionDocChanged(doc: firebase.firestore.DocumentReference) {
        if (doc) {
            this.subscription = doc.onSnapshot((snapshot) => {
                if (snapshot.exists) {
                    this.$set(this.state, 'props', (snapshot.data() ?? {}));
                }
            });
        }
    }

    protected doc: firebase.firestore.DocumentReference | undefined;

    protected subscription = () => {
    };

    protected beforeDestroy() {
        this.subscription();
    }

    protected logging() {
        return true;
    }

    protected isDocumentExists() {
        return !!this.getData('id', '');
    }

    protected isDatabaseRecord(data: object) {
        return ((typeof data === 'function') ? data(this.getData()).hasOwnProperty('id') : data.hasOwnProperty('id'));
    }

    public isShouldUpdate(data: object) {
        return this.isDocumentExists() && !this.isDatabaseRecord(data);
    }

    public getDocuments(id?: string) {
        return this.getCollection().doc(id).onSnapshot((snapshot: firebase.firestore.DocumentSnapshot) => {
            this.$set(this.state, 'props', snapshot.exists ? (snapshot.data() ?? {}) : {});
        });
    }

    protected getPayload(params: {
        user?: Function
        data?: object,
        doc?: firebase.firestore.DocumentReference,
    }) {
        const { data = {}, doc, user } = params;

        return {
            ...data,
            id: doc?.id ?? '',
            createdBy: this.getUser(user),
            createdAt: this.getTimestamp()
        };
    }

    /**
     * creates a record for the collection in the database
     *
     * @params.data
     * if params.data is provided, this data will be saved to the document, this is optional, if not provided, it will uses the data
     * that's already available on the class in state.params.
     *
     * @params.doc
     * this is a firestore document reference, if a doc is not provided, one will be created automatically, it is useful to provide
     * your own doc, if you wanted to have reference to it, for example, knowing the id of the document your data was being stored in.
     *
     * @params.batch
     * when a batch is provided, your document will not be saved to the database, it will be added to the batch, and saved when the batch
     * is committed. if a batch was not provided, the document will save to the database immediately. it is recommended to use a batch for
     * atomically persisting multiple documents.
     */
    public create(params: {
        [p: string]: any,
        data?: { [p: string]: any } | Function,
        doc?: firebase.firestore.DocumentReference,
        batch?: firebase.firestore.WriteBatch
    }) {
        const { data, doc, batch } = params;

        this.doc = doc ? doc : this.getCollection().doc();

        const documentData = data ? ((typeof data === 'function') ? data(this.getData()) : data) : this.getData();

        if (Array.isArray(this.belongsTo) && this.belongsTo.length) {
            const relationships = this.belongsTo.map((relationship) => {
                return `${relationship()?.getDoc()?.id} ${relationship()?.getCollectionName()}`;
            });

            documentData.belongsTo = Array.isArray(documentData.belongsTo) ? documentData.belongsTo.concat(relationships) : relationships;
        }

        const payload = this.getPayload({
            ...params,
            doc: this.getDoc(),
            data: this.confirm(documentData, 'create')
        });

        console.log(`%cSet Data: ${this.constructor.name}`, 'color: green;', {
            ...params,
            data: payload
        });

        this.log({
            ...params,
            data: payload,
            operation: 'create'
        });

        this.notifyBeforeDocumentCreatedListeners(params);

        return batch ? batch.set(this.doc, payload) : this.doc.set(payload);
    }

    public update(params: {
        [p: string]: any,
        data: { [p: string]: any } | Function,
        doc?: firebase.firestore.DocumentReference,
        batch?: firebase.firestore.WriteBatch
    }) {
        console.log(`%cSet Data: ${this.constructor.name}`, 'color: lightblue;', params);

        const { data, batch, doc } = params;

        const document = doc ?? this.getCollection().doc(this.getData('id'));

        const payload = this.confirm((typeof data === 'function') ? data(this.getData()) : data, 'update');

        this.log({
            ...params,
            data: payload
        });

        this.notifyBeforeDocumentUpdatedListeners(params);

        return batch ? batch.set(document, payload, { merge: true }) : document.set(payload, { merge: true });
    }

    public remove(params: {
        [p: string]: any,
        doc?: firebase.firestore.DocumentReference,
        batch?: firebase.firestore.WriteBatch
    }) {
        console.log(`%cSet Data: ${this.constructor.name}`, 'color: red;', params);

        const { batch, doc } = params;

        const document = doc ?? this.getCollection().doc(this.getData('id'));

        this.log({
            ...params,
            data: {},
            operation: 'delete'
        });

        this.notifyBeforeDocumentDeletedListeners(params);

        return batch ? batch.delete(document) : document.delete();
    }

    protected databaseWrite(data: object) {
        const batch = this.$firebase.firestore().batch();

        this.update({
            data,
            batch
        });

        batch.commit();
    }

    public setData(data: object) {
        if (this.isShouldUpdate(data)) {
            this.databaseWrite(data);
        } else {
            this.model ? this.model.setData(data) : this.componentWrite(data);
        }

        return this;
    }

    protected log(params: {
        data: object,
        user?: Function,
        operation?: string,
        batch?: firebase.firestore.WriteBatch
    }) {
        if (this.logging()) {
            const { data, operation, batch, user } = params;

            const payload = {
                belongsTo: this.getDocumentOwners(),
                createdBy: this.getUser(user),
                createdAt: this.getTimestamp(),
                before: /create/i.test(`${operation}`) ? {} : this.getData(),
                after: data,
                type: this.constructor.name,
                operation: operation ?? 'update'
            };

            console.log(`%cSet Data: ${this.constructor.name}`, 'color: yellow;', payload);

            return new FirestoreUpdate(this.$firebase.firestore).create({
                data: payload,
                batch
            });
        }
    }

    protected confirm(data: { [p: string]: any }, operation: string) {
        return data;
    }

    public getTimestamp() {
        return (this.$firebase.firestore as { [p: string]: any }).FieldValue.serverTimestamp();
    }

    public getUser(user: Function | undefined) {
        return user ? user('id') : this.user('id');
    }

    public getCollection() {
        return this.$firebase.firestore().collection(this.getCollectionName());
    }

    public getDoc() {
        const id = this.getData('id');
        return id ? this.getCollection().doc(id) : this.doc;
    }

    public getDocumentOwners(): Array<string> {
        return [`${this.getDoc()?.id} ${this.getCollectionName()}`];
    }

    public getCollectionName(): string {
        throw new Error(`Collection Name In ${this.constructor.name} Was Not Provided.`);
    }

    public addBeforeDocumentUpdatedListeners(...handlers: Array<Function>) {
        handlers.forEach((handler) => {
            this.$on(`${this.constructor.name}.before-updated`, handler);
        });
    }

    protected notifyBeforeDocumentUpdatedListeners(...params: Array<any>) {
        this.$emit(`${this.constructor.name}.before-updated`, this, ...params);
    }

    public addBeforeDocumentDeletedListeners(...handlers: Array<Function>) {
        handlers.forEach((handler) => {
            this.$on(`${this.constructor.name}.before-deleted`, handler);
        });
    }

    protected notifyBeforeDocumentDeletedListeners(...params: Array<any>) {
        this.$emit(`${this.constructor.name}.before-deleted`, this, ...params);
    }

    public addBeforeDocumentCreatedListeners(...handlers: Array<Function>) {
        handlers.forEach((handler) => {
            this.$on(`${this.constructor.name}.before-created`, handler);
        });
    }

    protected notifyBeforeDocumentCreatedListeners(...params: Array<any>) {
        this.$emit(`${this.constructor.name}.before-created`, this, ...params);
    }

    public addDocumentDeletedListeners(...handlers: Array<Function>) {
        handlers.forEach((handler) => {
            this.$on(`${this.constructor.name}.deleted`, handler);
        });
    }

    public notifyDocumentDeletedListeners(...params: Array<any>) {
        this.$emit(`${this.constructor.name}.deleted`, this, ...params);
    }

    public addDocumentUpdatedListeners(...handlers: Array<Function>) {
        handlers.forEach((handler) => {
            this.$on(`${this.constructor.name}.updated`, handler);
        });
    }

    public notifyDocumentUpdatedListeners(...params: Array<any>) {
        this.$emit(`${this.constructor.name}.updated`, this, ...params);
    }

    public addDocumentCreatedListeners(...handlers: Array<Function>) {
        handlers.forEach((handler) => {
            this.$on(`${this.constructor.name}.created`, handler);
        });
    }

    public notifyDocumentCreatedListeners(...params: Array<any>) {
        this.$emit(`${this.constructor.name}.created`, this, ...params);
    }
}
