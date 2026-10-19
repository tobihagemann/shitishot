import { describe, expect, it } from 'vitest';
import { buildShareUrl, parseFragment } from './fragment.js';

describe('parseFragment', () => {
  it('splits titles on raw commas before decoding and ignores the 2018 search-engine key', () => {
    expect(parseFragment('#t=Foo%2C%20Bar,Baz&l=en&s=Yandex')).toEqual({ titles: ['Foo, Bar', 'Baz'], lang: 'en', invalid: [] });
  });

  it('round-trips titles with reserved characters through a share URL', () => {
    const titles = ['Neatsville, Kentucky', 'Tom & Jerry', 'E=mc²', 'C#', '100 % Wolle', 'Größenwahn'];
    const url = new URL(buildShareUrl('https://shitishot.de', titles, 'de'));
    expect(parseFragment(url.hash)).toEqual({ titles, lang: 'de', invalid: [] });
  });

  it('returns every title, leaving the cap to callers', () => {
    expect(parseFragment('#t=a,b,c,d,e,f,g').titles).toHaveLength(7);
  });

  it('collects malformed percent-encodings instead of throwing', () => {
    expect(parseFragment('#t=Katze,%,%E2%82&l=de')).toEqual({ titles: ['Katze'], lang: 'de', invalid: ['%', '%E2%82'] });
  });
});
