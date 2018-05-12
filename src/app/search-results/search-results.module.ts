import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AllOriginsService } from './allorigins.service';
import { BingService } from './bing.service';
import { GoogleService } from './google.service';
import { SearchResultsService } from './search-results.service';
import { YandexService } from './yandex.service';

@NgModule({
  providers: [
    AllOriginsService,
    BingService,
    GoogleService,
    SearchResultsService,
    YandexService
  ],
  imports: [
    CommonModule
  ]
})
export class SearchResultsModule { }
