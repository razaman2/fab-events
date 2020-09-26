import {GetterTree} from 'vuex';
import {StateInterface} from '../index';
import {EventsStateInterface} from './state';

const getters: GetterTree<EventsStateInterface, StateInterface> = {
    GET_EVENTS(state) {
        return (id: string) => {
            return (id !== undefined) ? state.events.find((event) => {
                return event.id === id;
            }) : state.events;
        }
    },

    GET_PHONES(state) {
        return (id: string) => {
            return (id !== undefined) ? state.phones.find((phone) => {
                return (phone.id === id) || (phone.belongsTo.includes(`${id} events`));
            }) : state.phones;
        }
    },

    GET_EMAILS(state) {
        return (id: string) => {
            return (id !== undefined) ? state.emails.find((email) => {
                return (email.id === id) || (email.belongsTo.includes(`${id} events`));
            }) : state.emails;
        }
    },

    GET_ADDRESSES(state) {
        return (id: string) => {
            return (id !== undefined) ? state.addresses.find((address) => {
                return (address.id === id) || (address.belongsTo.includes(`${id} events`));
            }) : state.addresses;
        }
    }
};

export default getters;
