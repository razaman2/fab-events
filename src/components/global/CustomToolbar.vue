<script lang="ts">
import {
    Component,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from 'app/helpers/ReactiveVue';

@Component
export default class CustomToolbar extends ReactiveVue {
    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return this.$createElement('q-toolbar', [
            this.$createElement('q-btn', {
                props: this.getComponentProps(),
                on: this.getComponentEvents()
            }),

            this.$createElement('q-toolbar-title', {
                class: 'cursor-pointer',
                on: {click: () => this.$router.push('/')}
            }, `Shay's Fab Events`),

            this.$createElement('div', `Quasar v${this.$q.version}`)
        ]);
    }

    protected getComponentProps() {
        return {
            flat: true,
            dense: true,
            round: true,
            icon: 'menu',
            'aria-label': 'Menu'
        };
    }

    protected getComponentEvents() {
        return {
            click: () => this.notifyEventListeners('onMenuClicked')
        };
    }

    // END HTML NODES
}
</script>
