import {
    Address,
    Email,
    Event,
    Phone
} from "components/models";

export interface EventsStateInterface {
    events: Array<Event>;
    emails: Array<Email>;
    phones: Array<Phone>;
    addresses: Array<Address>;
}

const state: EventsStateInterface = {
    events: [],
    emails: [],
    phones: [],
    addresses: []
};

export default state;
