<script lang="ts">
import {Component} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";
import Event
    from "components/Event.vue";
import Collection
    from "app/helpers/Collection";
import Subscriptions
    from "app/helpers/Subscriptions";

@Component
export default class Index extends ReactiveVue {
    protected mounted() {
        const event = (this.$refs.event as Collection);

        event.addEventListeners({
            creating: () => {
                console.log('Creating Event');
            },
            created: () => {
                console.log('Created Event');
            },
            updating: () => {
                console.log('Updating Event');
            },
            updated: () => {
                console.log('Updated Event');
            }
        });

        const eventId = this.$route.params.id;

        if (eventId) {
            Subscriptions.get().subscribe(`Event/${eventId}`, event.getDocuments(eventId));
            const subscription = ((this.$refs.event as Collection).$refs.address as Collection).getDocuments((collection: Collection) => {
                return collection.getCollection().where('belongsTo', 'array-contains', `${eventId} events`).onSnapshot((snapshot) => {
                    collection.repData(snapshot.empty ? {} : snapshot.docs[0].data());
                    const addressSubscription = `Event/${eventId}/Address/${snapshot.docs[0].id}`;
                    if (!Subscriptions.get().hasSubscription(addressSubscription)) {
                        Subscriptions.get().subscribe(addressSubscription, subscription);
                    }
                });
            })
        }
    }

    protected beforeDestroy() {
        Subscriptions.get().unsubscribe([
            `Event/${this.$route.params.id}`,
            `Event/${this.$route.params.id}/Address/${this.getData('id')}`
        ]);
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('div', [
            createElement(Event, {
                ref: 'event',
                scopedSlots: {
                    create: (component: Collection) => {
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
                                            console.log('Component:', component);
                                            const batch = this.$firebase.firestore().batch();
                                            component.create({batch});
                                            (component.$refs.address as Collection).create({batch});
                                            await batch.commit();
                                            component.notifyEventListeners('created');
                                            this.$router.push(`/${component.getDoc().id}`);
                                        }
                                    });
                                }
                            }
                        })
                    }
                }
            })
        ]);
    }

    // END HTML NODES
}
</script>
