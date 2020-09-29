import {MutationTree} from 'vuex';
import {GlobalStateInterface} from './state';

const mutation: MutationTree<GlobalStateInterface> = {
    OPEN_DRAWER(state, payload: { side: 'left' | 'right' }) {
        state.drawer[payload.side] = true;
    },

    CLOSE_DRAWER(state, payload: { side: 'left' | 'right' }) {
        state.drawer[payload.side] = false;
    },

    TOGGLE_DRAWER(state, payload: { side: 'left' | 'right' }) {
        state.drawer[payload.side] = !state.drawer[payload.side];
    }
};

export default mutation;
