import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { L10nLoader } from 'angular-l10n';

@Injectable()
export class L18nResolver implements Resolve<void> {

  constructor(private l10nLoader: L10nLoader) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<void> {
    return this.l10nLoader.load();
  }

}
