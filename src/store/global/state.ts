export interface GlobalStateInterface {
    drawer: {
        right: boolean,
        left: boolean
    }
}

const state: GlobalStateInterface = {
    drawer: {
        right: false,
        left: false
    }
};

export default state;
