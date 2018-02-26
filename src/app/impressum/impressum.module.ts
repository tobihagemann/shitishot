import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ImpressumComponent } from './impressum.component';
import { ImpressumRoutingModule } from './impressum-routing.module';

@NgModule({
  declarations: [
    ImpressumComponent
  ],
  imports: [
    CommonModule,
    ImpressumRoutingModule
  ]
})
export class ImpressumModule { }
