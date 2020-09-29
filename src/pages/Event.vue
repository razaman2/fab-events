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
    protected get event() {
        const id = this.$route.params.id;
        return id ? this.$store.getters["events/GET_EVENTS"](id) : {};
    }

    protected mounted() {
        if (this.$route.params.id) {
            const event = (this.$refs.event as Collection);

            // When the page is refreshed, we loose the Events Subscription. If this happens, we subscribe to the current event document.
            if (!Subscriptions.get().hasSubscription(`Events`)) {
                Subscriptions.get().subscribe(`Event/${this.event.id}`, event.getDocuments(this.event.id));
            }

            if (!Subscriptions.get().hasSubscription(`Event/${this.event.id}/Phones`)) {
                const subscription = (event.$refs.phone as Collection).getDocuments((collection: Collection) => {
                    return collection.getCollection().where('belongsTo', 'array-contains', `${this.event.id} events`)
                        .onSnapshot((snapshot) => {
                            snapshot.forEach((phone) => {
                                collection.repData(phone.data());
                                const name = `Event/${this.event.id}/Phone/${phone.id}`;
                                if (!Subscriptions.get().hasSubscription(name)) {
                                    Subscriptions.get().subscribe(name, subscription);
                                }
                            });
                        });
                });
            } else {
                this.$watch(() => this.$store.getters["events/GET_PHONES"](this.event.id), (phone) => {
                    (event.$refs.phone as Collection).repData(phone);
                }, {immediate: true});
            }

            if (!Subscriptions.get().hasSubscription(`Event/${this.event.id}/Emails`)) {
                const subscription = (event.$refs.email as Collection).getDocuments((collection: Collection) => {
                    return collection.getCollection().where('belongsTo', 'array-contains', `${this.event.id} events`)
                        .onSnapshot((snapshot) => {
                            snapshot.forEach((email) => {
                                collection.repData(email.data());
                                const name = `Event/${this.event.id}/Email/${email.id}`;
                                if (!Subscriptions.get().hasSubscription(name)) {
                                    Subscriptions.get().subscribe(name, subscription);
                                }
                            });
                        });
                });
            } else {
                this.$watch(() => this.$store.getters["events/GET_EMAILS"](this.event.id), (email) => {
                    (event.$refs.email as Collection).repData(email);
                }, {immediate: true});
            }

            // We are listening for when the address is showing, and only then are we calling for the data.
            (this.$refs.event as Collection).addEventListeners({
                onAddressShowing: (collection: Collection) => {
                    const id = collection.getData('id');
                    if (!Subscriptions.get().hasSubscription(`Event/${id}/Addresses`)) {
                        if (id) {
                            const subscription = (event.$refs.address as Collection).getDocuments((collection: Collection) => {
                                return collection.getCollection().where('belongsTo', 'array-contains', `${id} events`)
                                    .onSnapshot((snapshot) => {
                                        snapshot.forEach((address) => {
                                            collection.repData(address.data());
                                            const name = `Event/${id}/Address/${address.id}`;
                                            if (!Subscriptions.get().hasSubscription(name)) {
                                                Subscriptions.get().subscribe(name, subscription);
                                            }
                                        });
                                    });
                            });
                        }
                    } else {
                        this.$watch(() => this.$store.getters["events/GET_ADDRESSES"](id), (address) => {
                            (event.$refs.address as Collection).repData(address);
                        }, {immediate: true});
                    }
                }
            });
        }
    }

    protected beforeDestroy() {
        const event = (this.$refs.event as Collection);
        const id = event.getData('id');

        Subscriptions.get().unsubscribe([
            `Event/${id}`,
            `Event/${id}/Email/${(event.$refs.email as Collection).getData('id')}`,
            `Event/${id}/Address/${(event.$refs.address as Collection).getData('id')}`,
            `Event/${id}/Phone/${(event.$refs.phone as Collection).getData('id')}`
        ]);
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('q-page', {
            props: {padding: true}
        }, [
            createElement(Event, {
                ref: 'event',
                props: {data: this.event},
                scopedSlots: {
                    create: (component: Collection) => {
                        if (!component.getData('id')) {
                            return createElement('q-btn', {
                                class: 'fit',
                                props: {
                                    label: 'save event',
                                    color: 'positive',
                                    loading: this.loadingStatus()
                                },
                                on: {
                                    click: () => this.safeRequest({
                                        try: async () => {
                                            const batch = this.$firebase.firestore().batch();
                                            component.create({batch});
                                            (component.$refs.phone as Collection).create({batch});
                                            (component.$refs.address as Collection).create({batch});
                                            (component.$refs.email as Collection).create({batch});
                                            await batch.commit();
                                            component.notifyEventListeners('created');
                                            this.$router.push(`/event/${component.getDoc().id}`);
                                        }
                                    })
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
