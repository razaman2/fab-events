import {GetterTree} from 'vuex';
import {StateInterface} from '../index';
import {GlobalStateInterface} from './state';

const getters: GetterTree<GlobalStateInterface, StateInterface> = {
    GET_DRAWER_STATUS(state) {
        return (side: 'left' | 'right') => {
            return state.drawer[side];
        }
    }
};

export default getters;
