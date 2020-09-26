<script lang="ts">
import {
    Component,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";

@Component
export default class PageName extends ReactiveVue {
    public template(createElement: Vue.CreateElement) {
        return createElement('q-page', {
            props: {padding: true}
        }, [
            createElement('div', {
                class: 'row text-h1 text-warning justify-center'
            }, 'Welcome')
        ]);
    }
}
</script>
