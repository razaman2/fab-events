<script lang="ts">
import {
    Component,
    Prop,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from 'app/helpers/ReactiveVue';
import {Navigation} from "components/models";

@Component
export default class CustomDrawer extends ReactiveVue {
    @Prop({
        type: String,
        default: () => 'left'
    }) protected readonly side?: string;

    private main: Array<Navigation> = [
        {
            title: 'Event Bookings',
            icon: 'event',
            path: '/events'
        },
        {
            title: 'Clients',
            icon: 'people',
            path: '/contacts'
        }
    ];

    protected get opened() {
        return this.$store.getters['global/GET_DRAWER_STATUS'](this.side);
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('q-drawer', {
            props: {
                value: this.opened,
                side: this.side,
                'content-class': 'bg-grey-1',
                'show-if-above': false,
                bordered: true
            }
        }, [
            this.$createElement('q-list', [
                this.$createElement('div', {
                    class: 'column'
                }, [
                    this.getLogoutButton(createElement),
                    this.$createElement('q-separator'),
                    this.getNavigation(this.main),
                    // this.getExpansion(this.getNavigation(this.admin), {
                    //     label: 'Admin',
                    //     icon: 'build'
                    // }),
                    // this.getExpansion(this.getNavigation(this.devs), {
                    //     label: 'Super',
                    //     icon: 'settings'
                    // })
                ])
            ])
        ]);
    }

    protected getNavigation(items: Array<Navigation> = []) {
        return items.map((item) => {
            return this.$createElement('q-item', {
                props: {
                    clickable: true,
                    to: item.path,
                    'inset-level': item.inset
                },
                on: {
                    click: () => item.action ? item.action() : () => {
                    }
                }
            }, [
                this.$createElement('q-item-section', {
                    props: {side: true}
                }, [
                    this.$createElement('q-icon', {
                        props: {
                            name: item.icon,
                            size: '2em'
                        }
                    })
                ]),
                this.$createElement('q-item-section', [
                    this.$createElement('q-item-label', item.title)
                ])
            ]);
        });
    }

    protected getExpansion(navigation: Array<Vue.VNode>, {icon, label}: { icon: string, label: string }) {
        return this.$createElement('q-expansion-item', {
            props: {
                color: 'blue',
                icon,
                label,
                'expand-separator': true
            }
        }, navigation);
    }

    protected getLogoutButton(createElement: Vue.CreateElement) {
        return this.$createElement('q-btn', {
            class: 'bg-red text-white q-ma-xs',
            props: {
                label: 'Logout',
                align: 'left',
                icon: 'logout',
                flat: true,
                dense: true
            },
            on: {click: () => this.logout()}
        });
    }

    // END HTML NODES

    public logout() {
        return this.$firebase.auth().signOut();
    }

    public toggle() {
        this.$store.commit('global/TOGGLE_DRAWER', {side: this.side});
    }

    public open() {
        this.$store.commit('global/OPEN_DRAWER', {side: this.side});
    }

    public close() {
        this.$store.commit('global/CLOSE_DRAWER', {side: this.side});
    }
}
</script>
