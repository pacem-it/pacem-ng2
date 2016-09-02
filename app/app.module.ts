import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule }    from '@angular/http';
import { CommonModule }    from '@angular/common';

import { routing, pages }  from './app.routing';

import { AppComponent }  from './app.component';

import { PageNotFoundComponent } from './app.404.component';

import { PacemModule } from './../pacem/pacem-module';

@NgModule({
    imports: [
        BrowserModule, FormsModule, HttpModule,CommonModule, PacemModule, routing
    ],
    declarations: pages.map(p => p.component).concat([
        AppComponent,
        PageNotFoundComponent
    ]),
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }