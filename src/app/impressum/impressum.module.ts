import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImpressumRoutingModule } from './impressum-routing.module';
import { ImpressumComponent } from './impressum.component';

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
