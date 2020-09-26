import Timestamp = firebase.firestore.Timestamp;
import firebase
    from "firebase";

export interface Note {
    id: string,
    title: string,
    description: string,
    createdBy: string,
    createdAt: Timestamp
}

export interface Event {
    id: string,
    name: string,
    createdAt: Timestamp
}

export interface Email {
    id: string,
    address: string,
    type: string,
    belongsTo: Array<string>,
    createdAt: Timestamp
}

export interface Phone {
    id: string,
    number: string,
    type: string,
    validated: boolean,
    belongsTo: Array<string>,
    createdAt: Timestamp
}

export interface Address {
    id: string,
    address: {
        address1: string,
        address2: string,
        city: string,
        state: string,
        zip: string,
        county: string,
        country: string,
        crossstreet: string,
        type: string
    },
    belongsTo: Array<string>,
    createdAt: Timestamp
}
