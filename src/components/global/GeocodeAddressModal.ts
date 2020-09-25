import {
    Component,
    Prop
} from 'vue-property-decorator';
import CustomDialog
    from 'components/global/CustomDialog';
import Address
    from 'components/global/Address';

@Component
export default class GeocodeAddressModal extends CustomDialog {
    @Prop({
        required: true,
        type: Array
    }) protected readonly addresses?: Array<{ formatted_address: string }>;

    @Prop({
        required: true,
        type: Address
    }) protected readonly collection?: Address;

    // START HTML NODES
    protected getDialogTitle() {
        return this.$createElement('h6', {
            class: 'no-margin text-center text-white'
        }, 'Multiple Items Returned');
    }

    protected getDialogContent() {
        return this.$createElement('q-card-section', {
            class: 'q-mt-md q-gutter-y-sm'
        }, this.addresses?.map((address: any) => {
            return this.$createElement('q-card', {
                class: 'cursor-pointer geocode-item',
                on: {
                    click: () => {
                        this.collection?.setData({address: this.collection?.getAddress(address)});
                        this.hide();
                    }
                }
            }, [
                this.$createElement('q-card-section', {
                    class: 'text-center'
                }, address.formatted_address)
            ]);
        }));
    }

    // END HTML NODES
}
