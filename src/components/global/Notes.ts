import {
    Component,
    Vue
} from 'vue-property-decorator';
import moment
    from 'moment';
import { getFirestoreTimestamp } from 'app/helpers/CommonHelper';
import Collection
    from 'app/helpers/Collection';
import { Note } from 'components/models';
import NoteForm
    from 'components/global/NoteForm';
import DocumentCache
    from 'app/helpers/DocumentCache';
import firebase
    from 'firebase';

@Component
export default class Notes extends Collection {
    protected relationships: Array<{ id: string, firstName: string, lastName: string }> = [];

    protected mounted() {
        //This shows us if a user has been pulled in or not
        //This is checking to see if the user is already pulled in
        const cache = new DocumentCache(() => this.getData('notes', []));

        this.$watch(() => this.getData('notes'), async () => {
            //stores array of associations search notes where item.createdBy = id
            this.relationships = await cache.getDocuments({
                search: (item) => {
                    return {
                        for: 'createdBy',
                        equals: item.createdBy
                    };
                },
                relationship: async (id) => {
                    const user = await this.$firebase.firestore().collection('users').doc(id).get();
                    return user.data();
                }
            });
        });

        if (Array.isArray(this.belongsTo) && this.belongsTo.length) {
            this.belongsTo[0]().addBeforeDocumentCreatedListeners((collection: Collection, params: { batch: firebase.firestore.WriteBatch }) => {
                this.getData('notes', []).forEach((note: object) => {
                    this.super('create', {
                        batch: params.batch,
                        doc: this.getCollection().doc(),
                        data: note
                    });
                });
            });
        }
    }

    public getDocuments() {
        return this.getQuery().onSnapshot((snapshot: { [p: string]: any }) => {
            this.setData({
                notes: snapshot.empty ? snapshot.docs : snapshot.docs.map((doc: { data: Function }) => {
                    return doc.data();
                })
            });
        });
    }

    // START HTML NODES

    public template(createElement: Vue.CreateElement) {
        return this.$createElement('div', {
            class: 'column'
        }, [this.getNotesTable()]);
    }

    protected getNotesTable() {
        return this.$createElement('q-table', {
            props: {
                data: this.getData('notes', []),
                separator: 'cell',
                flat: true
            },
            scopedSlots: {
                body: (props: { row: Note }) => this.getBodySlot(props),
                header: () => this.getHeaderSlot()
            }
        });
    }

    protected getNewNoteButton() {
        return this.$createElement('q-icon', {
            class: 'cursor-pointer',
            props: {
                name: 'add',
                size: '3em',
                color: 'positive'
            },
            on: {
                click: () => this.$q.dialog({
                    component: NoteForm,
                    notes: this
                })
            }
        });
    }

    public isShouldUpdate(data: object) {
        return false;
    }

    protected getBodySlot(props: { row: Note }) {
        const user = this.relationships?.find((user) => {
            return (user.id === props.row.createdBy);
        });

        return this.$createElement('q-tr', [
            this.$createElement('q-td', {
                //both required
                style: 'word-break: normal; white-space: normal;'
            }, props.row.title),
            this.$createElement('q-td', {
                //both required
                style: 'word-break: break-word; white-space: normal;'
            }, props.row.description),
            this.$createElement('q-td', user ? `${user.firstName} ${user.lastName}` : ''),
            this.$createElement('q-td', {
                attrs: {
                    colspan: '2'
                }
            }, moment(getFirestoreTimestamp(props.row.createdAt)).format('MM-DD-YY hh:mm A'))
        ]);
    }

    protected getHeaderSlot() {
        return this.$createElement('q-tr', {
            class: 'text-left',
            slot: 'header'
        }, [
            this.$createElement('q-th', {
                props: {
                    //headers need to be auto width
                    'width': '25%'
                }
            }, 'Title'),
            this.$createElement('q-th', 'Description'),
            this.$createElement('q-th', {
                props: {
                    'auto-width': true
                }
            }, 'Created By'),
            this.$createElement('q-th', {
                props: {
                    'auto-width': true
                }
            }, 'Created At'),
            this.$createElement('q-th', {
                props: {
                    'auto-width': true
                }
            }, [this.getNewNoteButton()])
        ]);
    }

    // END HTML NODES

    public create(params: {
        [p: string]: any,
        data?: { [p: string]: any } | Function,
        doc?: firebase.firestore.DocumentReference,
        batch?: firebase.firestore.WriteBatch
    }) {
        if (Array.isArray(this.belongsTo) && this.belongsTo.length && this.belongsTo[0]().getData('id')) {
            return this.super('create', params);
        } else if (params.data?.hasOwnProperty('title') && params.data?.hasOwnProperty('description')) {
            return this.$set(this.state.props, 'notes', [
                this.getPayload({ data: params.data })
            ].concat(this.getData('notes', [])));
        }
    }

    public getCollectionName() {
        return 'notes';
    }

    public getDocumentOwners() {
        return this.super('getDocumentOwners').concat(Array.isArray(this.belongsTo) ? this.belongsTo.map((relationship) => {
            return `${relationship().getData('id')} ${relationship().getCollectionName()}`;
        }) : []);
    }

    public getQuery() {
        return this.getCollection().orderBy('createdAt', 'desc')
            .where('belongsTo', 'array-contains', (Array.isArray(this.belongsTo) && this.belongsTo.length) ?
                `${this.belongsTo[0]().getData('id')} ${this.belongsTo[0]().getCollectionName()}` : '');
    }
}
