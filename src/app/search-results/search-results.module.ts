import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AllOriginsService } from './allorigins.service';
import { BingService } from './bing.service';
import { GoogleService } from './google.service';
import { SearchResultsService } from './search-results.service';

@NgModule({
  providers: [
    AllOriginsService,
    BingService,
    GoogleService,
    SearchResultsService
  ],
  imports: [
    CommonModule
  ]
})
export class SearchResultsModule { }
