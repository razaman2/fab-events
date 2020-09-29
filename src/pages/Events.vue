<script lang="ts">
import {Component} from 'vue-property-decorator'
import Collection
    from "app/helpers/Collection";
import Subscriptions
    from "app/helpers/Subscriptions";
import {Event} from 'components/models'
import {getFirestoreTimestamp} from "app/helpers/CommonHelper";
import moment
    from 'moment';

@Component
export default class Events extends Collection {
    protected get events() {
        return this.$store.getters["events/GET_EVENTS"]();
    }

    protected get phone() {
        return (id: string) => {
            return this.$store.getters["events/GET_PHONES"](id);
        }
    }

    protected get email() {
        return (id: string) => {
            return this.$store.getters["events/GET_EMAILS"](id);
        }
    }

    protected get address() {
        return (id: string) => {
            return this.$store.getters["events/GET_ADDRESSES"](id);
        }
    }

    protected mounted() {
        const subscription = this.getDocuments((collection: Collection) => {
            return collection.getCollection().onSnapshot((snapshot) => {
                this.$store.commit("events/SET_EVENTS", {
                    events: snapshot.empty ? snapshot.docs : snapshot.docs.map((event) => {
                        this.getEventDependencies(event);

                        return event.data();
                    })
                });

                if (!snapshot.empty && !Subscriptions.get().hasSubscription(`Events`)) {
                    Subscriptions.get().subscribe(`Events`, subscription);
                }
            });
        });
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('q-page', {props: {padding: true}}, [
            this.$createElement('div', {
                class: 'column'
            }, [this.getEventsTable()])
        ]);
    }

    protected getHeaderSlot() {
        return this.$createElement('q-tr', {
            class: 'text-left',
            slot: 'header'
        }, [
            this.$createElement('q-th', {
                class: 'content-width'
            }, 'Name'),

            this.$createElement('q-th', {
                class: 'content-width'
            }, 'Phone'),

            this.$createElement('q-th', {
                class: 'content-width'
            }, 'Email'),

            this.$createElement('q-th', {
                props: {'auto-width': true},
                style: {'border-right': 'none'}
            }, 'Created At'),

            this.$createElement('q-th', {
                props: {'auto-width': true},
                style: {'border-left': 'none'}
            }, [this.getNewEventButton()])
        ]);
    }

    protected getBodySlot(props: { row: Event }) {
        return this.$createElement('q-tr', {
            class: 'cursor-pointer',
            on: {click: () => this.$router.push(`/event/${props.row.id}`)}
        }, [
            this.$createElement('q-td', props.row.name),

            this.$createElement('q-td', this.phone(props.row.id)?.number),

            this.$createElement('q-td', this.email(props.row.id)?.address),

            this.$createElement('q-td', {
                attrs: {colspan: '2'}
            }, moment(getFirestoreTimestamp(props.row.createdAt)).format('MM-DD-YY hh:mm A'))
        ]);
    }

    protected getEventsTable() {
        return this.$createElement('q-table', {
            props: {
                title: 'Event Bookings',
                data: this.events,
                separator: 'cell'
            },
            scopedSlots: {
                body: (props: any) => this.getBodySlot(props),
                header: () => this.getHeaderSlot()
            }
        });
    }

    protected getNewEventButton() {
        return this.$createElement('q-icon', {
            class: 'cursor-pointer',
            props: {
                name: 'add',
                size: '3em',
                color: 'positive'
            },
            on: {click: () => this.$router.push('/event')}
        });
    }

    // END HTML NODES

    public getCollectionName() {
        return 'events';
    }

    protected getEventDependencies(event: { id: string }) {
        this.getEventEmail(event);
        this.getEventPhone(event);
        // this.getEventAddress(event);
    }

    protected getEventAddress(event: { id: string }) {
        if (!Subscriptions.get().hasSubscription(`Event/${event.id}/Addresses`)) {
            const subscription = this.$firebase.firestore().collection('addresses')
                .where('belongsTo', 'array-contains', `${event.id} events`)
                .onSnapshot((snapshot) => {
                    if (!snapshot.empty) {
                        this.$store.commit("events/SET_ADDRESSES", {address: snapshot.docs[0].data()});
                    }
                });

            Subscriptions.get().subscribe(`Event/${event.id}/Addresses`, subscription);
        }
    }

    protected getEventPhone(event: { id: string }) {
        if (!Subscriptions.get().hasSubscription(`Event/${event.id}/Phones`)) {
            const subscription = this.$firebase.firestore().collection('phones')
                .where('belongsTo', 'array-contains', `${event.id} events`)
                .onSnapshot((snapshot) => {
                    if (!snapshot.empty) {
                        this.$store.commit("events/SET_PHONES", {phone: snapshot.docs[0].data()});
                    }
                });

            Subscriptions.get().subscribe(`Event/${event.id}/Phones`, subscription);
        }
    }

    protected getEventEmail(event: { id: string }) {
        if (!Subscriptions.get().hasSubscription(`Event/${event.id}/Emails`)) {
            const subscription = this.$firebase.firestore().collection('emails')
                .where('belongsTo', 'array-contains', `${event.id} events`)
                .onSnapshot((snapshot) => {
                    if (!snapshot.empty) {
                        this.$store.commit("events/SET_EMAILS", {email: snapshot.docs[0].data()});
                    }
                });

            Subscriptions.get().subscribe(`Event/${event.id}/Emails`, subscription);
        }
    }
}
</script>

<style scoped>

.content-width {
    width: fit-content;
}

</style>
