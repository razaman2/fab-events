import {
    Component,
    Prop
} from 'vue-property-decorator';
import CustomDialog
    from 'components/global/CustomDialog';
import Notes
    from 'components/global/Notes';

@Component
export default class NoteForm extends CustomDialog {
    @Prop({
        required: true,
        type: Notes
    }) protected readonly notes?: Notes;

    // START HTML NODES
    protected getDialogTitle() {
        const component = this.super('getDialogTitle');
        component.children[0].text = 'New Note';
        return component;
    }

    protected getDialogContent() {
        return this.$createElement('div', {
            class: 'column q-px-md'
        }, [
            this.getTitleInput(),
            this.getDescriptionInput(),
            this.getSaveButton()
        ]);
    }

    protected getTitleInput() {
        return this.$createElement('q-input', {
            props: {
                value: this.getData('title'),
                label: 'Title'
            },
            on: {
                input: (title: string) => this.setData({ title })
            }
        });
    }

    protected getDescriptionInput() {
        return this.$createElement('q-input', {
            props: {
                value: this.getData('description'),
                label: 'Description',
                type: 'textarea',
                autogrow: true
            },
            on: {
                input: (description: string) => this.setData({ description })
            }
        });
    }

    protected getSaveButton() {
        return this.$createElement('q-btn', {
            class: 'q-my-md',
            props: {
                loading: this.loadingStatus(),
                label: 'Save',
                color: 'positive'
            },
            on: {
                click: () => this.submit()
            }
        });
    }

    // END HTML NODES

    protected submit() {
        return this.safeRequest({
            try: async () => {
                const batch = this.$firebase.firestore().batch();

                this.notes?.create({
                    batch,
                    data: this.getData()
                });

                await batch.commit();

                this.hide();
            },
            catch: (error) => {
                this.hide();
                this.$q.dialog({
                    title: 'Something Went Wrong!',
                    message: error.message
                });
            }
        });
    }
}
