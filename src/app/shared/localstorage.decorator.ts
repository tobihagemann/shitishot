/**
 * Property decorator for transparently retrieving/storing property from/in local storage when getter/setter is used.
 * @param defaultValue Getter returns `defaultValue` if local storage doesn't contain anything yet.
 * @param key Key for local storage item. If null, it'll be the same as the property name.
 */
export function LocalStorage(defaultValue?: any, key?: string) {
  return function (target: any, propertyName: string) {
    key = key || propertyName;
    const privateProperty = `_${propertyName}`;
    Object.defineProperty(target, propertyName, {
      configurable: false,
      get: function () {
        if (this[privateProperty] != null) {
          return this[privateProperty];
        }
        const value = JSON.parse(localStorage.getItem(key));
        if (value != null) {
          this[privateProperty] = value;
          return this[privateProperty];
        } else {
          return defaultValue;
        }
      },
      set: function (value) {
        this[privateProperty] = value;
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
  }
}
