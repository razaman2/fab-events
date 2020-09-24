import { Route } from 'vue-router';

export default class Authorization {
    public static authorize({ route, roles }: { route: Route, roles: Array<string> }) {
        // route has allowed roles array
        if (route.meta.rolesAllowed) {
            // roles allowed array is empty
            if (!route.meta.rolesAllowed.length) {
                return true;
            } else {
                // route allows any role
                if (route.meta.rolesAllowed.includes('*')) {
                    return true;
                }
                // route has one or more allowed roles
                for (const role of route.meta.rolesAllowed) {
                    if (roles.includes(role)) {
                        return true;
                    }
                }
                // user does not have any allowed roles
                return false;
            }
        } else {
            // route does not have allowed roles array
            return true;
        }
    }
}
