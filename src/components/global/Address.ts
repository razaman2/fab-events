import {
    AddressTypeList,
    AddressTypes
} from './AddressTypes';
import {ucf} from 'app/helpers/CommonHelper';
import Collection
    from 'app/helpers/Collection';
import {
    Component,
    Vue
} from 'vue-property-decorator';
import ObjectManager
    from 'app/helpers/ObjectManager';
import Store
    from 'app/helpers/Store';
import GeocodeAddressModal
    from './GeocodeAddressModal';
import Geocoder
    from 'app/helpers/Geocoder';
import env
    from 'app/env';

@Component
export default class Address extends Collection {
    protected hiddenFields = ['city', 'state', 'county', 'country'];

    protected countries: { [key: string]: any } = {
        ca: 'ca',
        canada: 'ca',
        us: 'us',
        usa: 'us',
        'united states': 'us'
    };

    protected state = {
        props: {
            address: {
                country: 'us',
                type: AddressTypes.Residential
            }
        }
    };

    // START HTML NODES
    public template(createElement: Vue.CreateElement) {
        return createElement('div', [this.getAddressFields()]);
    }

    protected getAddressFields() {
        return [
            this.getAddress1Input(),
            this.getAddress2Input(),
            this.getZipInput(),
            this.getAddressTypeInput(),
            this.getCityInput(),
            this.getStateInput(),
            this.getCountyInput(),
            this.getCountryInput(),
            this.getCrossStreetInput()
        ];
    }

    protected getAddress1Input() {
        return this.$createElement('q-input', {
            attrs: {autocomplete: 'none'},
            props: {
                label: 'Address1',
                value: this.getData('address.address1', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (address1: string) => this.setData({address: {address1}})}
        });
    }

    protected getAddress2Input() {
        return this.$createElement('q-input', {
            attrs: {autocomplete: 'none'},
            props: {
                label: 'Address2',
                value: this.getData('address.address2', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (address2: string) => this.setData({address: {address2}})}
        });
    }

    protected getCityInput() {
        return this.$createElement('q-input', {
            class: `${!this.showOnZipEntry('city') ? ' hidden' : ''}`,
            attrs: {autocomplete: 'none'},
            props: {
                label: 'City',
                value: this.getData('address.city', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (city: string) => this.setData({address: {city}})}
        });
    }

    protected getStateInput() {
        return this.$createElement('q-input', {
            class: `${!this.showOnZipEntry('state') ? ' hidden' : ''}`,
            attrs: {autocomplete: 'none'},
            props: {
                label: 'State',
                mask: 'AA',
                value: this.getData('address.state', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (state: string) => this.setData({address: {state}})}
        });
    }

    protected getZipInput() {
        return this.$createElement('q-input', {
            ref: 'zip',
            attrs: {autocomplete: 'none'},
            props: {
                label: 'Zip',
                mask: '#####',
                type: 'tel',
                value: this.getData('address.zip', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (zip: string) => this.geocodeAddress(zip)}
        }, [
            this.$createElement('q-icon', {
                class: 'self-center cursor-pointer',
                props: {
                    name: 'info',
                    size: '2em'
                },
                nativeOn: {click: () => this.zipInfo()}
            })
        ]);
    }

    protected getCountyInput() {
        return this.$createElement('q-input', {
            class: `${!this.showOnZipEntry('county') ? ' hidden' : ''}`,
            attrs: {autocomplete: 'none'},
            props: {
                label: 'County',
                value: this.getData('address.county', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (county: string) => this.setData({address: {county}})}
        });
    }

    protected getCrossStreetInput() {
        return this.$createElement('q-input', {
            attrs: {autocomplete: 'none'},
            props: {
                label: 'Cross Street',
                value: this.getData('address.crossstreet', ''),
                debounce: env.DEBOUNCE.AGGRESSIVE
            },
            on: {input: (crossstreet: string) => this.setData({address: {crossstreet}})}
        });
    }

    protected getCountryInput() {
        const country = this.getData('address.country', '');
        return this.$createElement('q-select', {
            class: `${!this.showOnZipEntry('country') ? ' hidden' : ''}`,
            props: {
                label: 'Country',
                value: country,
                options: this.getCountryOptions(),
                'display-value': country.toUpperCase(),
                'emit-value': true
            },
            on: {input: (country: string) => this.setData({address: {country}})}
        });
    }

    protected getAddressTypeInput() {
        const type = this.getData('address.type', '');
        return this.$createElement('q-select', {
            props: {
                'display-value': ucf(type),
                'emit-value': true,
                label: 'Type',
                value: type,
                options: this.getAddressTypeOptions()
            },
            on: {input: (type: string) => this.setData({address: {type}})}
        });
    }

    // END HTML NODES

    protected get showOnZipEntry() {
        return (field: string) => {
            return (this.getData('address.zip', '').length === 5) && this.hiddenFields.includes(field);
        };
    }

    protected zipInfo() {
        this.$q.dialog({
            title: 'Did you know?',
            message: 'The Zipcode can be used, to automatically populate City, State, County, and Country inputs.',
            preventClose: true,
            ok: {
                color: 'positive',
                label: 'ok'
            }
        });
    }

    protected getCountryOptions() {
        return ['us', 'ca'].map((country) => {
            return {
                label: country.toUpperCase(),
                value: country
            };
        });
    }

    public getCollectionName() {
        return 'addresses';
    }

    protected getAddressTypeOptions() {
        return AddressTypeList.map((type) => {
            return {
                label: type.key,
                value: type.value
            };
        });
    }

    /**
     * perform address lookup, using zipcode
     */
    protected async geocodeAddress(zip: string) {
        const data: { address: { zip: string } } = {address: {zip}};
        try {
            if (/\d{5}/.test(zip)) {
                const response = await new Geocoder().getCoords(zip);

                if (!response.data.results.length) {
                    this.$q.notify({
                        type: 'warning',
                        position: 'center',
                        message: `No geocoding results returned for ${zip}.`,
                        timeout: 500
                    });
                } else if (response.data.results.length > 1) {
                    this.$q.dialog({
                        component: GeocodeAddressModal,
                        addresses: response.data.results,
                        collection: this
                    });
                } else {
                    data.address = this.getAddress(response.data.results[0]);
                }
            }
        } finally {
            this.setData(data);
        }
    }

    public getAddress(address: { location: { lat: number, lng: number }, address_components: object }) {
        const data = {
            address: {
                coords: {},
                zip: ''
            }
        };

        const manager = ObjectManager.on(address.address_components);
        manager.paths().forEach((path) => {
            ObjectManager.on(data.address).set(path, manager.get(path));
        });

        data.address.coords = this.getCoords(address.location);

        return data.address;
    }

    protected getCoords(location: { lat: number, lng: number }) {
        return location ?
            new (this.$firebase.firestore as { [p: string]: any }).GeoPoint(location.lat, location.lng) :
            new (this.$firebase.firestore as { [p: string]: any }).GeoPoint(0, 0);
    }

    protected confirm(data: { [p: string]: any }) {
        const {address, ...rest} = data;
        if (data.address?.hasOwnProperty('country')) {
            data = {
                ...rest,
                address: {
                    ...address,
                    country: this.getSableCountry(Store.wrap(data.address).get({path: 'country'}))
                }
            };
        }

        return data;
    }

    /**
     * transform company input to supported sable values
     * sable values are listed in the countries object on component
     */
    protected getSableCountry(country: string) {
        return this.countries[country ? `${country}`.trim().toLowerCase() : ''] ?? '';
    }
}
