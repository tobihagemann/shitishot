/**
 * Property decorator for transparently retrieving/storing property from/in local storage when getter/setter is used.
 * @param defaultValue Getter returns `defaultValue` if local storage doesn't contain anything yet.
 */
export function LocalStorage(defaultValue = null) {
  return function (target: any, key: string) {
    Object.defineProperty(target, key, {
      configurable: false,
      get: function () {
        return JSON.parse(localStorage.getItem(key)) || defaultValue;
      },
      set: function (value) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
  }
}
