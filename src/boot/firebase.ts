import * as firebase
    from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore/memory';
import 'firebase/storage';
import env
    from 'app/env';

import {boot} from 'quasar/wrappers';

const config = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    databaseURL: env.FIREBASE_DATABASE_URL,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGE_SENDER_ID,
    appId: env.FIREBASE_APP_ID
};

declare module 'vue/types/vue' {
    interface Vue {
        $firebase: firebase.app.App;
    }
}

export default boot(({Vue}: { Vue: any }) => {
    Vue.prototype.$firebase = firebase.initializeApp(config);
});
