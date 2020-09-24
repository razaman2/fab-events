<script lang="ts">
import {Component} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";
import CustomToolbar
    from "components/global/CustomToolbar.vue";
import CustomDrawer
    from "components/global/CustomDrawer.vue";

@Component
export default class MainLayout extends ReactiveVue {
    protected mounted() {
        (this.$refs.toolbar as ReactiveVue)?.addEventListeners({
            onMenuClicked: () => {
                (this.$refs.drawer as CustomDrawer)?.toggle();
            }
        });
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('q-layout', {
            props: {view: 'lHh Lpr lFf'}
        }, [
            this.getHeaderComponent(),
            this.getDrawerComponent(),
            this.getPageContainerComponent()
        ]);
    }

    protected getHeaderComponent() {
        return this.$createElement('q-header', {
            props: {elevated: true}
        }, [this.$createElement(CustomToolbar, {ref: 'toolbar'})]);
    }

    protected getDrawerComponent(side = 'left') {
        return this.$createElement(CustomDrawer, {
            ref: 'drawer',
            props: {side}
        });
    }

    protected getPageContainerComponent() {
        return this.$createElement('q-page-container', [
            this.$createElement('router-view', {
                props: {key: this.$route.fullPath}
            })
        ]);
    }

    // END HTML NODES
}
</script>
