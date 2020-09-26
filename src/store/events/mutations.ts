import {MutationTree} from 'vuex';
import {EventsStateInterface} from './state';

const mutation: MutationTree<EventsStateInterface> = {
    SET_EVENTS(state, payload) {
        state.events = payload.events;
    },

    SET_PHONES(state, payload) {
        state.phones = state.phones.filter((phone) => {
            return phone.id !== payload.phone.id;
        }).concat([payload.phone]);
    },

    SET_EMAILS(state, payload) {
        state.emails = state.emails.filter((email) => {
            return email.id !== payload.email.id;
        }).concat([payload.email]);
    },

    SET_ADDRESSES(state, payload) {
        state.addresses = state.addresses.filter((address) => {
            return address.id !== payload.address.id;
        }).concat([payload.address]);
    }
};

export default mutation;
