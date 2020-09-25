export enum AddressTypes {
    Residential = 'residential',
    Commercial = 'commercial'
}

export const AddressTypeList = Object.entries(AddressTypes).map(([key, value]) => {
    return {
        key,
        value
    };
});
