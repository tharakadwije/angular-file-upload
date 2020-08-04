import { Component, OnInit } from '@angular/core';
import { LocaleService } from '@pc/pc-sui';

@Component({
    selector: 'app-so-component',
    templateUrl: './so.components.html'
})
export class SOComponent implements OnInit {

    messages: any[] = [];
    persistMessages: any[] = [];

    constructor(
        private localeService: LocaleService,
    ) { }

    ngOnInit() {
        
    }

}
