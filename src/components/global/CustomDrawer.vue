<script lang="ts">
import {
    Component,
    Prop,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";

@Component
export default class CustomDrawer extends ReactiveVue {
    @Prop({
        type: String,
        default: () => 'left'
    }) protected readonly side?: string;

    private opened = false;

    public template(createElement: Vue.CreateElement) {
        return createElement('q-drawer', {
            props: {
                value: this.opened,
                side: this.side,
                'content-class': 'bg-grey-1',
                'show-if-above': false,
                bordered: true
            }
        });
    }

    public toggle() {
        this.opened = !this.opened;
    }

    public open() {
        this.opened = true;
    }

    public close() {
        this.opened = false;
    }
}
</script>
