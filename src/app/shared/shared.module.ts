import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { L10nResolver } from './l10n-resolver.service';

@NgModule({
  providers: [
    L10nResolver
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule
  ]
})
export class SharedModule { }
