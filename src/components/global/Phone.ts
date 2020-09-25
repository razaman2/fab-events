import Collection
    from 'app/helpers/Collection';
import {
    Component,
    Prop,
    Watch
} from 'vue-property-decorator';
import { ucf } from 'app/helpers/CommonHelper';
import env
    from 'app/env';
import { Vue } from 'vue/types/vue';

@Component
export default class Phone extends Collection {
    @Prop({
        default: 'mobile',
        type: String
    }) protected readonly type?: string;

    protected state = {
        props: {
            type: this.type,
            validated: false
        }
    };

    protected get phone() {
        return {
            number: this.getData('number', ''),
            type: this.getData('type', '')
        };
    }

    protected get isTypeMobile() {
        return /mobile/i.test(this.getData('type', ''));
    }

    protected get isValidLength() {
        return (this.getData('number', '').replace(/\D/g, '').length === 10);
    }

    protected get isValidated() {
        return (this.getData('validated', false));
    }

    protected get isAfterSlotVisible() {
        return !/none/i.test(`${this.type}`);
    }

    protected get getPhoneTypeOptions() {
        return ['home', 'work', 'mobile', 'other'].map((type) => {
            return {
                label: ucf(type),
                value: type
            };
        });
    }

    @Watch('isValidLength', { immediate: true })
    onPhoneLengthChanged(status: boolean) {
        /**
         * we need to invalidate the phone, whenever the length changes.
         * this is because we dont know if its a valid phone, just by having the proper length.
         */
        if (this.isValidated && !status) {
            this.setData({ validated: false });
        }
    }

    @Watch('phone', { immediate: true })
    protected async onPhoneNumberChanged(phone: { number: string, type: string }) {
        return this.safeRequest({
            try: async () => {
                if (this.isTypeMobile && this.isValidLength && !this.isValidated) {
                    const response = await this.$axios.post(`${env.SABLE_API_URL}/api/validate/mobile`, { phone: phone.number });
                    if (response.data) {
                        this.setData({ validated: true });
                    } else {
                        this.setData({ validated: false });
                        this.$q.dialog({
                            title: 'Mobile Validation Failed',
                            message: 'The provided phone is not a valid mobile. You will not be able to text this number.'
                        });
                    }
                }
            },
            catch: (error) => {
                this.setData({ validated: false });
                this.$q.dialog({
                    title: 'Something Went Wrong!',
                    message: error.message
                });
            }
        });
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return this.getPhoneInput();
    }

    protected getPhoneInput() {
        return this.$createElement('q-input', {
            props: this.getPhoneComponentProps(),
            on: this.getPhoneComponentEvents()
        }, [this.getAfterSlot()]);
    }

    protected getPhoneComponentEvents() {
        return {
            input: (number: string) => this.setData({ number })
        };
    }

    protected getPhoneComponentProps() {
        return {
            value: this.getData('number', ''),
            mask: 'phone',
            label: 'Phone',
            type: 'tel',
            loading: this.loadingStatus,
            debounce: env.DEBOUNCE.AGGRESSIVE
        };
    }

    protected getPhoneTypeInput() {
        return this.$createElement('q-select', {
            props: {
                options: this.getPhoneTypeOptions,
                value: ucf(this.getData('type', '')),
                'emit-value': true
            },
            on: {
                input: (type: string) => this.setData({ type })
            }
        });
    }

    protected getAfterSlot() {
        if (this.isAfterSlotVisible) {
            return this.$createElement('div', {
                slot: 'after'
            }, [this.getPhoneTypeInput()]);
        }
    }

    // END HTML NODES

    public getCollectionName() {
        return 'phones';
    }
}
