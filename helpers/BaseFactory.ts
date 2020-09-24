import ObjectManager
  from './ObjectManager';
import Validators
  from './Validators';

export default abstract class BaseFactory extends Validators {
  public constructor(protected key = '') {
    super();
  }

  protected instances: { [key: string]: object } = {
    ...this.getCompanyInstances(),
    default: this.getDefaultInstances()
  };

  public make(name: string) {
    const searches = this.getSearches();
    while (searches.length) {
      const registration = ObjectManager.on(this.instances).get(`${searches.pop()}`);
      if (this.isObject(registration)) {
        const instance = registration[`${name}`.toLowerCase()];
        if (instance) {
          return instance;
        }
      } else if (registration) {
        return registration;
      }
    }
    return this.getDefaultInstance();
  }

  /**
   * instantiate instance with provided arguments
   */
  protected with(...args: any) {
    const [instance, ...options] = args;
    return options ? new instance(...options) : new instance();
  }

  protected getSearches() {
    return ['default', this.key];
  }

  /**
   * instantiate and return resolved instance
   */
  public instantiate(name = '') {
    const instance = this.make(name);
    return {with: this.with.bind(this, instance)};
  }

  /**
   * object of application default instances
   */
  protected getDefaultInstances(): object {
    return {};
  }

  /**
   * object of company specific instances
   */
  protected getCompanyInstances(): object {
    return {};
  }

  /**
   * default instance to return when a requested instance
   * was not found
   */
  protected abstract getDefaultInstance(): object;
}
