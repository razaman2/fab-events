import ReactiveVue
    from 'app/helpers/ReactiveVue';
import Component
    from 'vue-class-component';
import {Vue} from 'vue/types/vue';

@Component
export default class CustomExpansionItem extends ReactiveVue {
    public template(createElement: Vue.CreateElement) {
        return createElement('q-expansion-item', {
            props: {
                'header-class': 'bg-grey-2 text-primary text-h6',
                label: 'Custom Expansion Item',
                ...this.$vnode.data?.props
            },
            on: this.$listeners
        }, this.$slots.default);
    }
}
