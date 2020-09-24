import ObjectManager
    from 'app/helpers/ObjectManager';

export default class Store {
    public static get(vue: Vue) {
        return {
            company: this.company.bind(this, vue),
            user: this.user.bind(this, vue),
            settings: this.settings.bind(this, vue)
        };
    }

    public static wrap(object: object) {
        return {
            get: ({path, alternative}: {path: string, alternative?: any}) => {
                return this.getObjectProperty.bind(this, object, path, alternative).call(this);
            }
        }
    }

    protected static user(vue: Vue, { path, alternative }: { path: string, alternative?: any }) {
        return this.getObjectProperty.bind(this, vue.$store.getters['auth/GET_USER'], path, alternative).call(this);
    }

    protected static company(vue: Vue, { path = '', alternative }: { path: string, alternative?: any }) {
        return this.getObjectProperty(vue.$store.getters['auth/GET_COMPANY'], path, alternative).call(this);
    }

    protected static settings(vue: Vue, { path = '', alternative }: { path: string, alternative?: any }) {
        return {
            user: () => {
                return this.getObjectProperty(vue.$store.getters['auth/GET_SETTINGS'], path, alternative).call(this);
            },
            company: () => {
                return this.getObjectProperty(vue.$store.getters['company/GET_SETTINGS'], path, alternative).call(this);
            }
        };
    }

    protected static getObjectProperty(object: object, path = '', alternative?: any) {
        return ObjectManager.on(object).get(path, alternative);
    }
}
