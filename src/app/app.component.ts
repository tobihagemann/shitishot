import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslationService } from 'angular-l10n';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  constructor(private titleService: Title, private translationService: TranslationService) { }

  ngOnInit() {
    this.translationService.translationChanged().subscribe(() => this.titleService.setTitle(this.translationService.translate('The Shit Is Hot')));
  }

}
