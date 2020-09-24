<script lang="ts">
import {
    Component,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";

@Component
export default class App extends ReactiveVue {
    public template(createElement: Vue.CreateElement) {
        return createElement('div', {
            attrs: {
                id: 'q-app'
            }
        }, [
            createElement('router-view', {
                props: {key: this.$route.fullPath}
            })
        ]);
    }
}
</script>
