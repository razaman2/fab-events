<script lang="ts">
import {Component} from 'vue-property-decorator'
import ReactiveVue
    from 'app/helpers/ReactiveVue';
import Event
    from 'components/Event.vue';
import Collection
    from 'app/helpers/Collection';
import Subscriptions
    from 'app/helpers/Subscriptions';

@Component
export default class Index extends ReactiveVue {
    protected mounted() {
        const eventId = this.$route.params.id;

        const event = (this.$refs.event as Collection);

        event.addEventListeners({
            onAddressShowing: (collection: Collection) => {
                const id = collection.getData('id');
                if (id) {
                    const subscriptionAddress = ((this.$refs.event as Collection).$refs.address as Collection).getDocuments((collection: Collection) => {
                        return collection.getCollection().where('belongsTo', 'array-contains', `${id} events`)
                            .onSnapshot((snapshot) => {
                                collection.repData(snapshot.empty ? {} : snapshot.docs[0].data());
                                const addressSubscription = `Event/${id}/Address/${snapshot.docs[0]?.id}`;
                                if (!snapshot.empty && !Subscriptions.get().hasSubscription(addressSubscription)) {
                                    Subscriptions.get().subscribe(addressSubscription, subscriptionAddress);
                                }
                            });
                    });
                }
            }
        });

        if (eventId) {
            Subscriptions.get().subscribe(`Event/${eventId}`, event.getDocuments(eventId));

            const subscriptionPhone = ((this.$refs.event as Collection).$refs.phone as Collection).getDocuments((collection: Collection) => {
                return collection.getCollection().where('belongsTo', 'array-contains', `${eventId} events`).onSnapshot((snapshot) => {
                    collection.repData(snapshot.empty ? {} : snapshot.docs[0].data());
                    const phoneSubscription = `Event/${eventId}/Phone/${snapshot.docs[0]?.id}`;
                    if (!snapshot.empty && !Subscriptions.get().hasSubscription(phoneSubscription)) {
                        Subscriptions.get().subscribe(phoneSubscription, subscriptionPhone);
                    }
                });
            });

            const subscriptionEmail = ((this.$refs.event as Collection).$refs.email as Collection).getDocuments((collection: Collection) => {
                return collection.getCollection().where('belongsTo', 'array-contains', `${eventId} events`).onSnapshot((snapshot) => {
                    collection.repData(snapshot.empty ? {} : snapshot.docs[0].data());
                    const emailSubscription = `Event/${eventId}/Email/${snapshot.docs[0]?.id}`;
                    if (!snapshot.empty && !Subscriptions.get().hasSubscription(emailSubscription)) {
                        Subscriptions.get().subscribe(emailSubscription, subscriptionEmail);
                    }
                });
            });
        }
    }

    protected beforeDestroy() {
        const event = (this.$refs.event as Collection);
        const eventId = event.getData('id');

        Subscriptions.get().unsubscribe([
            `Event/${eventId}`,
            `Event/${eventId}/Phone/${(event.$refs.email as Collection).getData('id')}`,
            `Event/${eventId}/Address/${(event.$refs.address as Collection).getData('id')}`,
            `Event/${eventId}/Phone/${(event.$refs.phone as Collection).getData('id')}`
        ]);
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('q-page', {
            props: {padding: true}
        }, [
            createElement(Event, {
                ref: 'event',
                scopedSlots: {
                    create: (component: Collection) => {
                        if (!(this.$refs.event as Collection)?.getData('id')) {
                            return createElement('q-btn', {
                                class: 'fit',
                                props: {
                                    label: 'save event',
                                    color: 'positive',
                                    loading: this.loadingStatus
                                },
                                on: {
                                    click: () => {
                                        this.safeRequest({
                                            try: async () => {
                                                const batch = this.$firebase.firestore().batch();
                                                component.create({batch});
                                                (component.$refs.phone as Collection).create({batch});
                                                (component.$refs.address as Collection).create({batch});
                                                (component.$refs.email as Collection).create({batch});
                                                await batch.commit();
                                                component.notifyEventListeners('created');
                                                this.$router.push(`/${component.getDoc().id}`);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    }
                }
            })
        ]);
    }

    // END HTML NODES
}
</script>
