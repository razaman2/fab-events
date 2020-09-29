import FirestoreUpdate
    from 'app/helpers/interfaces/FirestoreUpdate';
import ReactiveVue
    from 'app/helpers/ReactiveVue';
import {
    Component,
    Prop
} from 'vue-property-decorator';
import firebase
    from 'firebase';
import Subscriptions
    from 'app/helpers/Subscriptions';

@Component
export default class Collection extends ReactiveVue {
    @Prop({
        type: Array
    }) protected readonly belongsTo?: Array<() => Collection>;

    protected doc: firebase.firestore.DocumentReference | { [p: string]: any } = {};

    protected beforeDestroy() {
        Subscriptions.get().unsubscribe(`${this.constructor.name}/${this.getDoc().id}`);
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

    public getDocuments(param?: string | Function) {
        if (typeof param === 'function') {
            return param(this);
        } else {
            return this.getCollection().doc(param).onSnapshot((snapshot: firebase.firestore.DocumentSnapshot) => {
                this.repData(snapshot.exists ? (snapshot.data() ?? {}) : {});
            });
        }
    }

    protected getPayload(params: {
        user?: { id: string },
        company?: { id: string },
        data?: { belongsTo?: Array<string> },
        doc?: firebase.firestore.DocumentReference,
    }) {
        const { data = {}, doc, user, company } = params;

        const relationship = this.getCompany(company);
        const createdBy = this.getUser(user);

        const payload: { [p: string]: any } = {
            ...data,
            id: doc?.id ?? '',
            createdAt: this.getTimestamp()
        };

        if (relationship) {
            payload.belongsTo = Array.isArray(data.belongsTo) ? data.belongsTo.concat(`${relationship} companies`) : [`${relationship} companies`];
        }

        if (createdBy) {
            payload.createdBy = createdBy;
        }

        return payload;
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
    } = {}) {
        const { data, doc, batch } = params;

        this.doc = doc ? doc : this.getCollection().doc();

        const documentData = data ? ((typeof data === 'function') ? data(this.getData()) : data) : this.getData();

        if (this.isHaveRelationships()) {
            const relationships = this.getRelationships().map((relationship) => {
                return `${relationship()?.getDoc()?.id} ${relationship()?.getCollectionName()}`;
            });

            documentData.belongsTo = Array.isArray(documentData.belongsTo) ? documentData.belongsTo.concat(relationships) : relationships;
        }

        const payload = this.getPayload({
            ...params,
            doc: (this.getDoc() as firebase.firestore.DocumentReference),
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

        this.notifyEventListeners('creating', params);

        Subscriptions.get().subscribe(`${this.constructor.name}/${this.getDoc().id}`, this.getDocuments(this.getDoc().id));

        return batch ? batch.set((this.getDoc() as firebase.firestore.DocumentReference), payload) : this.getDoc().set(payload);
    }

    public update(params: {
        [p: string]: any,
        data: { [p: string]: any } | Function,
        doc?: firebase.firestore.DocumentReference,
        batch?: firebase.firestore.WriteBatch
    }) {
        console.log(`%cSet Data: ${this.constructor.name}`, 'color: lightblue;', params);

        const { data, batch, doc } = params;

        if (doc) {
            this.doc = doc;
        }

        const payload = this.confirm((typeof data === 'function') ? data(this.getData()) : data, 'update');

        this.log({
            ...params,
            data: payload
        });

        this.notifyEventListeners('updating', params);

        return batch ? batch.set((this.getDoc() as firebase.firestore.DocumentReference), payload, { merge: true }) : this.getDoc().set(payload, { merge: true });
    }

    public remove(params: {
        [p: string]: any,
        doc?: firebase.firestore.DocumentReference,
        batch?: firebase.firestore.WriteBatch
    } = {}) {
        console.log(`%cSet Data: ${this.constructor.name}`, 'color: red;', params);

        const { batch, doc } = params;

        if (doc) {
            this.doc = doc;
        }

        this.log({
            ...params,
            data: {},
            operation: 'delete'
        });

        this.notifyEventListeners('deleting', params);

        return batch ? batch.delete(this.getDoc() as firebase.firestore.DocumentReference) : this.getDoc().delete();
    }

    protected async databaseWrite(data: object) {
        const batch = this.$firebase.firestore().batch();

        this.update({
            data,
            batch
        });

        await batch.commit();

        this.notifyEventListeners('updated');
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
        user?: { id: string },
        operation?: string,
        batch?: firebase.firestore.WriteBatch
    }) {
        if (this.logging()) {
            const { data, operation, batch, user } = params;

            const createdBy = this.getUser(user);

            const payload: any = {
                belongsTo: this.getDocumentOwners(),
                createdAt: this.getTimestamp(),
                before: /create/i.test(`${operation}`) ? {} : this.getData(),
                after: data,
                type: this.constructor.name,
                operation: operation ?? 'update'
            };

            if (createdBy) {
                payload.createdBy = createdBy;
            }

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

    public getCollection() {
        return this.$firebase.firestore().collection(this.getCollectionName());
    }

    public getDoc() {
        const id = this.getData('id');
        if (this.doc.id && (this.doc.id === id)) {
            return this.doc;
        } else {
            return id ? this.getCollection().doc(id) : this.doc.id ? this.doc : this.getCollection().doc();
        }
    }

    public getPrimaryRelationship() {
        return (this.getRelationships()[0]() as Collection);
    }

    protected isHaveRelationships() {
        return Array.isArray(this.belongsTo) && this.belongsTo.length;
    }

    protected getRelationships() {
        return this.isHaveRelationships() ? (this.belongsTo ?? []) : [];
    }

    public getDocumentOwners(): Array<string> {
        return [`${this.getDoc().id} ${this.getCollectionName()}`];
    }

    public getCollectionName(): string {
        throw new Error(`Collection Name In ${this.constructor.name} Was Not Provided.`);
    }
    public getUser(user?: { id: string }) {
        return user ? user.id : '';
    }

    public getCompany(company?: { id: string }) {
        return company ? company.id : '';
    }
}
