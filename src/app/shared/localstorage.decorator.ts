/**
 * Property decorator for transparently retrieving/storing property from/in local storage when getter/setter is used.
 * @param defaultValue Getter returns `defaultValue` if local storage doesn't contain anything yet.
 */
export function LocalStorage(defaultValue = null) {
  return function (target: any, key: string) {
    const privateProperty = `_${key}`;
    Object.defineProperty(target, key, {
      configurable: false,
      get: function () {
        if (this[privateProperty]) {
          return this[privateProperty];
        }
        const value = JSON.parse(localStorage.getItem(key));
        if (value) {
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
