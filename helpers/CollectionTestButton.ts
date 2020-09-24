import ReactiveVue
    from 'app/helpers/ReactiveVue';
import Collection
    from 'app/helpers/Collection';

export default class CollectionTestButton extends ReactiveVue {
    public constructor(vue: Vue, protected component: Collection) {
        super(vue);
    }

    public template(createElement: Vue.CreateElement): Vue.VNode {
        return this.$createElement('q-btn', {
            props: {
                label: 'test',
                color: 'secondary'
            },
            on: {
                click: () => console.log({
                    'Collection Name': this.component.getCollectionName(),
                    'Collection Ref': this.component.getCollection(),
                    'Document Owners': this.component.getDocumentOwners(),
                    'Collection Data': this.component.getData()
                })
            }
        });
    }
}
