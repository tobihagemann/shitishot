/**
 * Test via a getter in the options object to see if the passive property is accessed.
 * Reference: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
 */
export function supportsPassiveEventListener(): boolean {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) { }
  return supportsPassive;
}
