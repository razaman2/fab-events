import firebase
    from 'firebase';
import ReactiveVue
    from 'app/helpers/ReactiveVue';

export default class FirestoreDocumentChangeHandler {
    public constructor(protected collection: ReactiveVue) {
    }

    public process(snapshot: firebase.firestore.QuerySnapshot) {
        const operations = snapshot.docChanges().reduce((operations: {
            added: Array<object>,
            modified: Array<object>,
            removed: Array<object>
        }, change: firebase.firestore.DocumentChange) => {
            if (change.type === 'added') {
                operations.added.push(change.doc.data());
            } else if (change.type === 'modified') {
                operations.modified.push(change.doc.data());
            } else if (change.type === 'removed') {
                operations.removed.push(change.doc.data());
            }

            return operations;
        }, {
            added: [],
            modified: [],
            removed: []
        });

        const items = this.collection.getData('items', []);

        if (operations.added.length) {
            this.collection.$set(this.collection.getData(), 'items', operations.added.concat(items));
        }

        if (operations.removed.length) {
            operations.removed.forEach((change: { id?: string }) => {
                const index = items.findIndex((item: { id: string }) => {
                    return (item.id === change.id);
                });

                if (index > -1) {
                    this.collection.$delete(this.collection.getData().items, index);
                }
            });
        }

        if (operations.modified.length) {
            operations.modified.forEach((change: { [p: string]: any, id?: string }) => {
                const index = items.findIndex((item: { id: string }) => {
                    return (item.id === change.id);
                });

                if (index > -1) {
                    Object.keys(items[index]).forEach((key) => {
                        delete items[index][key];
                    });

                    Object.keys(change).forEach((key) => {
                        this.collection.$set(items[index], key, change[key]);
                    });
                }
            });
        }
    }
}
