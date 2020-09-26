<script lang="ts">
import {
    Component,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";
import Subscriptions
    from "app/helpers/Subscriptions";

@Component
export default class App extends ReactiveVue {
    protected mounted() {
        console.log('Subscription:', Subscriptions.get());
    }

    protected beforeDestroy() {
        Subscriptions.get().unsubscribe();
    }

    public template(createElement: Vue.CreateElement) {
        return createElement('div', {
            attrs: {id: 'q-app'}
        }, [
            createElement('router-view', {
                props: {key: this.$route.fullPath}
            })
        ]);
    }
}
</script>
