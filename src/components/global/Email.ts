import Collection
    from 'app/helpers/Collection';
import {
    Component,
    Prop
} from 'vue-property-decorator';
import {ucf} from 'app/helpers/CommonHelper';
import env
    from 'app/env';
import {Vue} from 'vue/types/vue';

@Component
export default class Email extends Collection {
    @Prop({
        default: 'primary',
        type: String
    }) protected readonly type?: string;

    protected state = {
        props: {type: this.type}
    };

    protected isValidEmail() {
        return /^(([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5}){1,25})+([;.](([a-zA-Z0-9_\-.]+)@{[a-zA-Z0-9_\-.]+0\.([a-zA-Z]{2,5}){1,25})+)*$/;
    }

    protected get isAfterSlotVisible() {
        return !/none/i.test(`${this.type}`);
    }

    protected get getEmailTypeOptions() {
        return ['primary', 'secondary', 'work', 'other'].map((type) => {
            return {
                label: ucf(type),
                value: type
            };
        });
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return this.getEmailInput();
    }

    public getEmailInput() {
        return this.$createElement('q-input', {
            props: this.getEmailComponentProps(),
            on: this.getEmailComponentEvents()
        }, [this.getAfterSlot()]);
    }

    protected getEmailTypeInput() {
        return this.$createElement('q-select', {
            props: {
                options: this.getEmailTypeOptions,
                value: ucf(this.getData('type', '')),
                'emit-value': true
            },
            on: {input: (type: string) => this.setData({type})}
        });
    }

    protected getAfterSlot() {
        if (this.isAfterSlotVisible) {
            return this.$createElement('div', {
                slot: 'after'
            }, [this.getEmailTypeInput()]);
        }
    }

    protected getEmailComponentProps() {
        const email = this.getData('address', '');
        return {
            rules: [!this.isValidEmail().test(email)],
            'error-message': 'Invalid email. Please use proper format. Ex: user@sablecrm.com',
            value: email,
            label: 'Email',
            type: 'email',
            'lazy-rules': true,
            debounce: env.DEBOUNCE.AGGRESSIVE
        };
    }

    protected getEmailComponentEvents() {
        return {
            input: (address: string) => this.setData({address})
        };
    }

    // END HTML NODES

    public getCollectionName() {
        return 'emails';
    }

    protected getSaveButton() {
        if (!this.getData('id')) {
            return this.$createElement('q-btn', {
                props: {
                    label: 'save',
                    color: 'positive',
                    loading: this.loadingStatus()
                },
                on: {
                    click: () => this.safeRequest({
                        try: async () => {
                            const batch = this.$firebase.firestore().batch();
                            this.create({batch});

                            await batch.commit();
                            this.notifyEventListeners('created');
                        }
                    })
                }
            });
        }
    }

    /**
     * access the email.address before saving to database and transform lowercase
     * and strip whitespaces.
     */
    protected confirm(data: { [p: string]: any }) {
        const {address, ...rest} = data;
        return address ? {
            ...rest,
            address: address ? address.trim().toLowerCase() : ''
        } : data;
    }
}
