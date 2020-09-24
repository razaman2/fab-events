export default class ErrorModals {
    private static modals: { [p: string]: Function } = {
        'inactive user': (vue: Vue) => {
            vue.$q.dialog({
                title: 'Login Error',
                message: 'Your user does not have access to SableCRM at this time. Please contact your company admin for details.'
            });
        },
        'missing user settings': (vue: Vue) => {
            vue.$q.dialog({
                title: 'Login Error',
                message: 'Unable to find User Settings. Please contact SableCRM team.'
            });
        }
    };

    public static show(params: { name: string, vue: Vue }) {
        return this.modals[params.name](params.vue);
    }
}
