import {
    Component,
    Prop,
    Vue,
    Watch
} from 'vue-property-decorator';
import ObjectManager
    from 'app/helpers/ObjectManager';
import Validators
    from "app/helpers/Validators";

@Component
export default class ReactiveVue extends Vue {
    @Prop({
        type: ReactiveVue
    }) protected readonly model?: ReactiveVue;

    @Prop({
        type: Object,
        default: () => ({})
    }) protected readonly data?: { [p: string]: any };

    @Watch('data', {immediate: true})
    protected onDataChanged(data: object) {
        if (!new Validators().isEmpty(data)) {
            this.setData(data);
        }
    }

    private eventRegistrations: Array<string> = [];

    protected mapping: { [key: string]: string } = {};

    protected state: { props: { [p: string]: any } } = {
        props: {}
    };

    private loading: { status: boolean, text: string } = {
        status: false,
        text: 'Please wait...'
    };

    protected loadingStatus(status?: boolean) {
        if (status !== undefined) {
            this.loading.status = status;
        }

        return this.loading.status;
    }

    protected loadingText(message?: string) {
        if (message !== undefined) {
            this.loading.text = message;
        }

        return this.loading.text;
    }

    protected async safeRequest(request: {
        try: Function,
        catch?: (error: any) => any,
        finally?: Function
    }) {
        this.loadingStatus(true);
        try {
            return await request.try();
        } catch (e) {
            return request.catch ? await request.catch(e) : console.log(e);
        } finally {
            if (request.finally) {
                await request.finally();
            }

            this.loadingStatus(false);
        }
    }

    protected render(createElement: Vue.CreateElement) {
        return this.template(createElement);
    }

    // START HTML NODES
    public template(createElement: Vue.CreateElement): Vue.VNode | undefined {
        return createElement('p', {
            class: 'text-red text-center q-pa-md'
        }, 'Template Not Provided!');
    }

    // END HTML NODES

    protected componentWrite(data: object) {
        const manager = ObjectManager.on(data);
        const paths = manager.paths();

        for (const path1 of paths) {
            const path2 = path1.replace(/.\w+(?=$)/, '');
            const path3 = Array.isArray(manager.get(path2)) ? path2 : path1;

            const segments = path3.split('.');
            segments.reduce((object, current, index) => {
                if (current.length) {
                    if (index === (segments.length - 1)) {
                        const ignored = path1.match(/([\w.]*?)\.*(coords|createdAt|updatedAt)/);
                        if (ignored) {
                            this.$set(this.getData(ignored[1]), ignored[2], manager.get(path2));
                        } else {
                            this.$set(object, current, manager.get(path3));
                        }
                    } else if (object.hasOwnProperty(current)) {
                        return object[current];
                    } else {
                        this.$set(object, current, RegExp(`(?<=${current}\\.)\\d+`).test(path3) ? [] : {});
                    }
                    return object[current];
                }
            }, this.getData());
        }

        console.log(`%cSet Data: ${this.constructor.name}`, 'color: orange;', this.getData(), this);
    }

    protected super(name: string, ...params: Array<any>) {
        return (this.constructor as { [p: string]: any }).super.options.methods[name].call(this, ...params);
    }

    public getData(path = '', alternative?: any): any {
        return this.model ?
            this.model.getData(path, alternative) :
            ObjectManager.on(this.state.props).get(path, alternative);
    }

    public setData(data: object) {
        this.model ? this.model.setData(data) : this.componentWrite(data);

        return this;
    }

    public repData(data = {}) {
        this.$set(this.state, 'props', {});
        return this.setData(data);
    }

    public addEventListeners(...handlers: Array<Function | { [p: string]: Function }>) {
        handlers.forEach((handler) => {
            if (new Validators().isObject(handler)) {
                Object.entries(handler).forEach(([key, value]) => {
                    if (!this.eventRegistrations.includes(key) && key.length) {
                        this.eventRegistrations.push(key);
                        this.$on(`${this.constructor.name}${key ? `.${key}` : ''}`, value);
                    }
                });
            } else if (typeof handler === "function") {
                this.$on(`${this.constructor.name}}`, handler);
            }
        });
    }

    public notifyEventListeners(name?: string, ...params: Array<any>) {
        (name ? [name] : this.eventRegistrations.concat([''])).forEach((registration) => {
            this.$emit(`${this.constructor.name}${registration ? `.${registration}` : ''}`, this, ...params);
        });
    }

    public isValid() {
        return false;
    }
}
