import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';
import { CustomUrlParser } from './custom-url-parser';

/**
 * Custom implementation of `UrlSerializer` based on `DefaultUrlSerializer`.
 * The `parse()` method of this serializer does not decode fragments, which is used to share custom games.
 */
export class CustomUrlSerializer implements UrlSerializer {

  private defaultUrlSerializer = new DefaultUrlSerializer();

  parse(url: string): UrlTree {
    const parser = new CustomUrlParser(url);
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
