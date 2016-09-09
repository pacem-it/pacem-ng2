import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgModel } from '@angular/forms';
import { PacemDatetimePicker } from './../pacem/pacem-scaffolding';

@Component({
    selector: 'app-pacem-calendar',
    template: `<h2>Pacem Datetime Picker</h2>
<p>Custom <i>datepicker</i> component.<br />
Standard version:</p>

<pacem-datetime-picker [(dateValue)]="value"></pacem-datetime-picker>

<p>Minute-level precision:</p>

<pacem-datetime-picker precision="minute" [(dateValue)]="value"></pacem-datetime-picker>

<p>Second-level precision:</p>

<pacem-datetime-picker precision="second" [(dateValue)]="value"></pacem-datetime-picker>

<p>Challenging ancient times:</p>

<pacem-datetime-picker precision="minute" [min]="min0" [max]="value || now" [(dateValue)]="value0"></pacem-datetime-picker>
`
})
export class PacemCalendarComponent {
    
    value0: Date | string = "1975-02-15T15:35:00.000Z"; //new Date(1975, 1, 15, 16, 35, 0, 0);
    value: Date;

    private now = new Date();
    private min0 = new Date(-76, 1, 1);
}