import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TitlesService } from './titles.service';
import { WikipediaService } from './wikipedia.service';

@NgModule({
  providers: [
    TitlesService,
    WikipediaService
  ],
  imports: [
    CommonModule
  ]
})
export class TitlesModule { }
