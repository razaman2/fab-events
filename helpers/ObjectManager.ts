export default class ObjectManager {
    constructor(protected object: {}) {
    }

    public paths(object?: object) {
        const subject = object ? object : this.object;
        return Object.entries(subject).reduce((paths: Array<string>, [key, val]) => {
            try {
                if (/^({.+}|\[.+])$/.test(JSON.stringify(val))) {
                    this.paths(val).forEach((item: any) => {
                        paths.push(`${key}.${item}`);
                    });
                } else {
                    paths.push(`${key}`);
                }
            } catch (e) {
                paths.push(`${key}`);
            }
            return paths;
        }, []);
    }

    public get(path?: string, alternative: any = undefined) {
        const requested = `${path}`.split('.').reduce((object: any, current) => {
            try {
                return object[current];
            } catch (e) {
                return alternative;
            }
        }, this.object);
        return (requested !== undefined) ? requested : path ? alternative : this.object;
    }

    public set(path: string, value: any, object?: any) {
        const subject = object ? object : this.object;
        const paths = path.split('.');
        paths.reduce((accumulator, current, index) => {
            if (current.length) {
                if (index === (paths.length - 1)) {
                    accumulator[current] = value;
                } else if (accumulator.hasOwnProperty(current)) {
                    return accumulator[current];
                } else {
                    accumulator[current] = RegExp(`(?<=${current}\\.)\\d+`).test(path) ? [] : {};
                }
                return accumulator[current];
            }
        }, subject);
        return subject;
    }

    public copy(object: object) {
        const subject = new ObjectManager(object);
        subject.paths().forEach((path: string) => {
            this.set(path, subject.get(path));
        });
        return this;
    }

    public data() {
        return this.object;
    }

    public clone() {
        return JSON.parse(JSON.stringify(this.object));
    }

    public static on(object: object) {
        return new ObjectManager((object === undefined) ? {} : object);
    }
}
