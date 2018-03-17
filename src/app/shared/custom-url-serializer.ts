import { DefaultUrlSerializer, UrlSegment, UrlSegmentGroup, UrlSerializer, UrlTree, PRIMARY_OUTLET } from '@angular/router';

/**
 * Custom implementation of `UrlSerializer` based on `DefaultUrlSerializer`.
 * The `parse()` method of this serializer does not decode fragments, which is used to share custom games.
 */
export class CustomUrlSerializer implements UrlSerializer {

  private defaultUrlSerializer = new DefaultUrlSerializer();

  parse(url: string): UrlTree {
    const parser = new UrlParser(url);
    const tree = new UrlTree();
    tree.root = parser.parseRootSegment();
    tree.queryParams = parser.parseQueryParams();
    tree.fragment = parser.parseFragment();
    return tree;
  }

  serialize(tree: UrlTree): string {
    return this.defaultUrlSerializer.serialize(tree);
  }

}

// ---
// From here, it's basically copy & paste from https://github.com/angular/angular/blob/master/packages/router/src/url_tree.ts.
// The only difference is that `parseFragment()` of `UrlParser` does not call `decodeURIComponent()` on the fragment.
// ---

function decode(s: string): string {
  return decodeURIComponent(s);
}

// Query keys/values should have the "+" replaced first, as "+" in a query string is " ".
// decodeURIComponent function will not decode "+" as a space.
function decodeQuery(s: string): string {
  return decode(s.replace(/\+/g, '%20'));
}

const SEGMENT_RE = /^[^\/()?;=&#]+/;
function matchSegments(str: string): string {
  const match = str.match(SEGMENT_RE);
  return match ? match[0] : '';
}

const QUERY_PARAM_RE = /^[^=?&#]+/;
// Return the name of the query param at the start of the string or an empty string
function matchQueryParams(str: string): string {
  const match = str.match(QUERY_PARAM_RE);
  return match ? match[0] : '';
}

const QUERY_PARAM_VALUE_RE = /^[^?&#]+/;
// Return the value of the query param at the start of the string or an empty string
function matchUrlQueryParamValue(str: string): string {
  const match = str.match(QUERY_PARAM_VALUE_RE);
  return match ? match[0] : '';
}

class UrlParser {
  private remaining: string;

  constructor(private url: string) { this.remaining = url; }

  parseRootSegment(): UrlSegmentGroup {
    this.consumeOptional('/');

    if (this.remaining === '' || this.peekStartsWith('?') || this.peekStartsWith('#')) {
      return new UrlSegmentGroup([], {});
    }

    // The root segment group never has segments
    return new UrlSegmentGroup([], this.parseChildren());
  }

  parseQueryParams(): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    if (this.consumeOptional('?')) {
      do {
        this.parseQueryParam(params);
      } while (this.consumeOptional('&'));
    }
    return params;
  }

  parseFragment(): string | null {
    return this.consumeOptional('#') ? this.remaining : null;
  }

  private parseChildren(): { [outlet: string]: UrlSegmentGroup } {
    if (this.remaining === '') {
      return {};
    }

    this.consumeOptional('/');

    const segments: UrlSegment[] = [];
    if (!this.peekStartsWith('(')) {
      segments.push(this.parseSegment());
    }

    while (this.peekStartsWith('/') && !this.peekStartsWith('//') && !this.peekStartsWith('/(')) {
      this.capture('/');
      segments.push(this.parseSegment());
    }

    let children: { [outlet: string]: UrlSegmentGroup } = {};
    if (this.peekStartsWith('/(')) {
      this.capture('/');
      children = this.parseParens(true);
    }

    let res: { [outlet: string]: UrlSegmentGroup } = {};
    if (this.peekStartsWith('(')) {
      res = this.parseParens(false);
    }

    if (segments.length > 0 || Object.keys(children).length > 0) {
      res[PRIMARY_OUTLET] = new UrlSegmentGroup(segments, children);
    }

    return res;
  }

  // parse a segment with its matrix parameters
  // ie `name;k1=v1;k2`
  private parseSegment(): UrlSegment {
    const path = matchSegments(this.remaining);
    if (path === '' && this.peekStartsWith(';')) {
      throw new Error(`Empty path url segment cannot have parameters: '${this.remaining}'.`);
    }

    this.capture(path);
    return new UrlSegment(decode(path), this.parseMatrixParams());
  }

  private parseMatrixParams(): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    while (this.consumeOptional(';')) {
      this.parseParam(params);
    }
    return params;
  }

  private parseParam(params: { [key: string]: any }): void {
    const key = matchSegments(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    let value: any = '';
    if (this.consumeOptional('=')) {
      const valueMatch = matchSegments(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[decode(key)] = decode(value);
  }

  // Parse a single query parameter `name[=value]`
  private parseQueryParam(params: { [key: string]: any }): void {
    const key = matchQueryParams(this.remaining);
    if (!key) {
      return;
    }
    this.capture(key);
    let value: any = '';
    if (this.consumeOptional('=')) {
      const valueMatch = matchUrlQueryParamValue(this.remaining);
      if (valueMatch) {
        value = valueMatch;
        this.capture(value);
      }
    }

    const decodedKey = decodeQuery(key);
    const decodedVal = decodeQuery(value);

    if (params.hasOwnProperty(decodedKey)) {
      // Append to existing values
      let currentVal = params[decodedKey];
      if (!Array.isArray(currentVal)) {
        currentVal = [currentVal];
        params[decodedKey] = currentVal;
      }
      currentVal.push(decodedVal);
    } else {
      // Create a new value
      params[decodedKey] = decodedVal;
    }
  }

  // parse `(a/b//outlet_name:c/d)`
  private parseParens(allowPrimary: boolean): { [outlet: string]: UrlSegmentGroup } {
    const segments: { [key: string]: UrlSegmentGroup } = {};
    this.capture('(');

    while (!this.consumeOptional(')') && this.remaining.length > 0) {
      const path = matchSegments(this.remaining);

      const next = this.remaining[path.length];

      // if is is not one of these characters, then the segment was unescaped
      // or the group was not closed
      if (next !== '/' && next !== ')' && next !== ';') {
        throw new Error(`Cannot parse url '${this.url}'`);
      }

      let outletName: string = undefined!;
      if (path.indexOf(':') > -1) {
        outletName = path.substr(0, path.indexOf(':'));
        this.capture(outletName);
        this.capture(':');
      } else if (allowPrimary) {
        outletName = PRIMARY_OUTLET;
      }

      const children = this.parseChildren();
      segments[outletName] = Object.keys(children).length === 1 ? children[PRIMARY_OUTLET] :
        new UrlSegmentGroup([], children);
      this.consumeOptional('//');
    }

    return segments;
  }

  private peekStartsWith(str: string): boolean { return this.remaining.startsWith(str); }

  // Consumes the prefix when it is present and returns whether it has been consumed
  private consumeOptional(str: string): boolean {
    if (this.peekStartsWith(str)) {
      this.remaining = this.remaining.substring(str.length);
      return true;
    }
    return false;
  }

  private capture(str: string): void {
    if (!this.consumeOptional(str)) {
      throw new Error(`Expected "${str}".`);
    }
  }
}
