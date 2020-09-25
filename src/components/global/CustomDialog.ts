import ReactiveVue
    from 'app/helpers/ReactiveVue';
import {Component} from 'vue-property-decorator';
import {Vue} from 'vue/types/vue';

@Component
export default class CustomDialog extends ReactiveVue {
    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('q-dialog', {
            ref: 'dialog'
        }, [
            createElement('q-card', {
                class: 'q-dialog-plugin'
            }, [
                this.getDialogHeader(),
                this.getDialogContent()
            ])
        ]);
    }

    protected getDialogHeader() {
        return this.$createElement('q-card-section', {
            class: 'bg-primary relative'
        }, [
            this.getDialogTitle(),
            this.getDialogCloseButton()
        ]);
    }

    protected getDialogCloseButton() {
        return this.$createElement('q-icon', {
            style: 'position: absolute; top: 50%; transform: translateY(-50%); right: 0;',
            class: 'cursor-pointer q-mr-sm',
            props: {
                name: 'highlight_off',
                size: '2em',
                color: 'white'
            },
            on: {
                click: () => this.hide()
            }
        });
    }

    protected getDialogTitle() {
        return this.$createElement('h6', {
            class: 'no-margin text-center text-white'
        }, 'Custom Dialog');
    }

    protected getDialogContent() {
        return this.$createElement('p', {
            class: 'text-center text-red q-pa-md'
        }, 'Dialog content not provided!');
    }

    // END HTML NODES

    protected show() {
        // @ts-ignore
        this.$refs.dialog.show();
    }

    protected hide() {
        // @ts-ignore
        this.$refs.dialog.hide();
    }

    protected onDialogHide() {
        this.$emit('hide');
    }

    protected onOKClick() {
        this.$emit('ok');
        this.hide();
    }

    protected onCancelClick() {
        this.hide();
    }
}
