<script lang="ts">
import {Component} from 'vue-property-decorator'
import Collection
    from "app/helpers/Collection";
import {date} from 'quasar';
import env
    from "app/env";
import Address
    from "components/global/Address";
import CustomExpansionItem
    from "components/global/CustomExpansionItem";

@Component
export default class Event extends Collection {
    protected state = {
        props: {
            date: date.formatDate(Date.now(), 'YYYY/MM/DD'),
            time: date.formatDate(Date.now(), 'HH:mm')
        }
    };

    public template(createElement: Vue.CreateElement) {
        return createElement('q-card', [
            createElement('q-card-section', [
                this.getEventName()
            ]),
            this.getAddress(),
            createElement('q-card-section', [
                this.getDate(),
                this.getTime()
            ]),
            createElement('q-card-actions', [
                this.$scopedSlots.create && this.$scopedSlots.create(this)
            ])
        ]);
    }

    protected getEventName() {
        return this.$createElement('q-input', {
            attrs: {autocomplete: 'none'},
            props: {
                label: 'Name',
                value: this.getData('name', ''),
                debounce: env.DEBOUNCE.MEDIUM
            },
            on: {
                input: (name: string) => this.setData({name})
            }
        });
    }

    protected getAddress() {
        return this.$createElement(CustomExpansionItem, {
            props: {
                label: 'Address',
            }
        }, [
            this.$createElement('div', {
                class: 'q-px-md'
            }, [
                this.$createElement(Address, {
                    ref: 'address',
                    props: {
                        belongsTo: [() => this]
                    }
                })
            ])
        ]);
    }

    protected getDate() {
        return this.$createElement('q-input', {
            props: {
                label: 'Date',
                value: this.getData('date', ''),
                mask: '####-##-##'
            },
            on: {input: (date: string) => this.setData({date})}
        }, [
            this.$createElement('div', {slot: 'append'}, [
                this.$createElement('q-icon', {
                    class: 'cursor-pointer',
                    props: {name: 'event'}
                }, [
                    this.$createElement('q-popup-proxy', [
                        this.$createElement('q-date', {
                            props: {value: this.getData('date', '')},
                            on: {input: (date: string) => this.setData({date})}
                        })
                    ])
                ])
            ])
        ]);
    }

    protected getTime() {
        return this.$createElement('q-input', {
            props: {
                label: 'Time',
                value: this.getData('time', ''),
                mask: '##:##'
            },
            on: {input: (time: string) => this.setData({time})}
        }, [
            this.$createElement('div', {slot: 'append'}, [
                this.$createElement('q-icon', {
                    class: 'cursor-pointer',
                    props: {name: 'access_time'}
                }, [
                    this.$createElement('q-popup-proxy', [
                        this.$createElement('q-time', {
                            props: {value: this.getData('time', '')},
                            on: {input: (time: string) => this.setData({time})}
                        })
                    ])
                ])
            ])
        ]);
    }

    public getCollectionName(): string {
        return 'events'
    }
}
</script>
