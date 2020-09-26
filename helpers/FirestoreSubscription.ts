import Subscription from './Interfaces/Subscription'

export default class FirestoreSubscription {
  private subscriptions: Array<Subscription> = [];

  public static create() {
    return new FirestoreSubscription();
  }

  public subscribe(name: string, handler: Function) {
    if (this.isNameAvailable(name)) {
      this.subscriptions.push({name, handler});
    }
  }

  public replace(name: string, handler: Function) {
    this.unsubscribe(name);
    this.subscriptions.push({name, handler});
  }

  public unsubscribe(subscriptions?: any) {
    if (!Array.isArray(subscriptions)) {
      subscriptions = subscriptions ? [subscriptions] : [];
    }
    if (subscriptions.length) {
      subscriptions.forEach((name: string) => {
        const subscription = this.find(name);
        if (subscription) {
          subscription.handler();
          this.remove(subscription);
          console.log(`%cUnsubscribed From Subscription (${name})`, 'background-color: yellow; color: red; font-weight: bold; padding: 3px;');
        }
      });
    } else {
      this.subscriptions.forEach((subscription) => {
        subscription.handler();
      });
      this.subscriptions = [];
    }
  }

  public size() {
    return this.subscriptions.length;
  }

  public hasSubscription(name: string) {
    return !!this.find(name);
  }

  private remove(subscription: Subscription) {
    this.subscriptions.splice(this.subscriptions.indexOf(subscription), 1);
  }

  private find(name: string) {
    return this.subscriptions.find((subscription) => {
      return (subscription.name === name);
    });
  }

  private isNameAvailable(name: string) {
    if (this.find(name)) {
      throw new Error(`There is already a subscription called "${name}".`);
    } else {
      return true;
    }
  }

  public registrations() {
      return this.subscriptions;
  }
}
