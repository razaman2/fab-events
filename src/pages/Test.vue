<script lang="ts">
import {
    Component,
    Vue
} from 'vue-property-decorator'
import ReactiveVue
    from "app/helpers/ReactiveVue";
import Editor
    from "components/test/Editor";
import History
    from "components/test/History";

@Component
export default class PageName extends ReactiveVue {
    private editor = new Editor(new History());

    // private history = new History();

    public template(createElement: Vue.CreateElement) {
        return createElement('q-layout', {
            props: {view: 'lHh Lpr lFf'}
        }, [
            createElement('q-page-container', [
                createElement('q-page', {props: {padding: true}}, [
                    createElement('div', [
                        createElement('q-input', {
                            props: {
                                type: 'textarea',
                                label: 'Message',
                                autogrow: true,
                                value: this.getData('message')
                            },
                            on: {
                                input: (message: string) => this.setData({message})
                            }
                        }),
                        createElement('div', {
                            class: 'row q-mt-md q-gutter-x-xs justify-end'
                        }, [
                            createElement('q-btn', {
                                props: {
                                    label: 'save',
                                    color: 'positive',
                                    disable: (this.getData('message', '').length < 3)
                                },
                                on: {
                                    click: () => {
                                        this.editor.createState(this.getData('message', ''));
                                        this.repData();
                                    }
                                }
                            }),
                            createElement('q-btn', {
                                props: {
                                    label: 'undo',
                                    color: 'negative',
                                    disable: this.editor.isEmptyHistory()
                                },
                                on: {
                                    click: () => {
                                        this.editor.restore();
                                        this.setData({message: this.editor.getContent()});
                                    }
                                }
                            })
                        ])
                    ])
                ])
            ])
        ]);
    }
}
</script>
