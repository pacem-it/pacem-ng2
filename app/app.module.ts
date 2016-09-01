import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { routing, pages }  from './app.routing';

import { AppComponent }  from './app.component';

import { PageNotFoundComponent } from './app.404.component';

import { PacemBindService } from './../pacem/pacem-ui';

@NgModule({
    imports: [
        BrowserModule, FormsModule, routing, HttpModule
    ],
    providers: [PacemBindService], //<- defining the provider here, makes it a singleton at application-level
    declarations: pages.map(p => p.component).concat([
        AppComponent,
        PageNotFoundComponent
    ]),
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }