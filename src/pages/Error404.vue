<script lang="ts">
import {Component} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";

@Component
export default class Error404 extends ReactiveVue {
    public template(createElement: Vue.CreateElement) {
        return createElement('div', {
            class: 'fullscreen bg-blue text-white text-center q-pa-md flex flex-center'
        }, [
            createElement('div', [
                createElement('div', {
                    style: 'font-size: 30vh'
                }, '404'),
                createElement('div', {
                    class: 'text-h2',
                    style: 'opacity:.4'
                }, 'Oops. Nothing here...'),
                createElement('q-btn', {
                    class: 'q-mt-xl',
                    props: {
                        color: 'white',
                        'text-color': 'blue',
                        unelevated: true,
                        to: '/',
                        label: 'Go Home',
                        'no-caps': true
                    }
                })
            ])
        ])
    }
}
</script>
