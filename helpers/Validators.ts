export default class Validators {
  public isObject(subject: any) {
    return /^{.*}$/.test(JSON.stringify(subject));
  }

  public isString(subject: any) {
    return (typeof subject === 'string');
  }

  public isInteger(subject: any) {
    return /^\d+$/.test(subject);
  }

  public isNumber(subject: any) {
    return /^\d*\.*\d*$/.test(subject);
  }

  public isDecimal(subject: any) {
    return /^\d*\.\d+$/.test(subject);
  }

  public isArray(subject: any) {
    return Array.isArray(subject);
  }

  public isEmpty(subject: any) {
    if (this.isArray(subject)) {
      return /^\[]$/.test(JSON.stringify(subject));
    } else if (this.isObject(subject)) {
      return /^{}$/.test(JSON.stringify(subject));
    } else if (this.isString(subject)) {
      return (subject.trim().length === 0);
    } else {
      return true;
    }
  }
}
