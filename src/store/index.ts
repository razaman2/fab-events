import {store} from 'quasar/wrappers'
import Vuex
    from 'vuex'
import createPersistedState
    from 'vuex-persistedstate';
import {EventsStateInterface} from "src/store/events/state";
import {GlobalStateInterface} from "src/store/global/state";
import events
    from './events';
import global
    from './global';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export interface StateInterface {
    // Define your own store structure, using submodules if needed
    // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
    events: EventsStateInterface;
    global: GlobalStateInterface;
}

export default store(function ({Vue}) {
    Vue.use(Vuex);

    const paths = {
        events: ['events', 'phones', 'emails', 'addresses'],
        global: ['drawer.left']
    };

    return new Vuex.Store<StateInterface>({
        plugins: [
            createPersistedState({
                storage: sessionStorage,
                key: 'fab-events',
                paths: [...paths.events, ...paths.global]
            })
        ],

        modules: {
            events,
            global
        },

        // enable strict mode (adds overhead!)
        // for dev mode only
        strict: !!process.env.DEV
    });
});
