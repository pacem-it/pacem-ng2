/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
import { NgModule, Directive, Component, Injectable, Compiler, Renderer, Input, Output, EventEmitter,
    Optional, Host, Self, SkipSelf,
    ViewContainerRef, ViewChild, ElementRef, ComponentRef, forwardRef,
    DoCheck, ChangeDetectorRef, KeyValueDiffers, KeyValueDiffer, ChangeDetectionStrategy,
    OnDestroy, OnInit, OnChanges, AfterViewInit, SimpleChange, SimpleChanges, Attribute } from '@angular/core';
import { Validators, Validator, ValidatorFn, NG_VALIDATORS, AbstractControl, NgControl,
    SelectControlValueAccessor, NgSelectOption, CheckboxControlValueAccessor, ControlValueAccessor, NG_VALUE_ACCESSOR, NgModel, NgForm,
    FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PacemUtils, PacemDate, PacemCoreModule, PacemPromise } from './pacem-core';
import { PacemHttp } from './pacem-net';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import { PacemBalloon, PacemHighlight, PacemUIModule, PacemSnapshot, PacemLightbox } from './pacem-ui';
import { Http, Response, XHRBackend }     from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
// Observable class extensions
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';
// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

interface IDatasourceItem {
    value: any
    caption: any
    selected?: boolean
    entity: any
}

interface IFetchData {
    sourceUrl: string;
    verb?: string;
    params?: any;
    dependsOn?: { prop: string, alias?: string };
    textProperty?: string;
    valueProperty?: string;
    fetch?: Promise<IDatasourceItem[]>;
}

@Injectable()
class DatasourceFetcher {

    onFetched = new EventEmitter();
    onFetching = new EventEmitter();

    constructor(private http: Http) { }

    /**
     * Returns the url and the body dictionary necessary for the request.
     * @param verb
     * @param urlTmpl Url template (`{token}` placeholders accepted)
     * @param body
     */
    private prepareRequest(verb: string, urlTmpl: string, params: { [key: string]: any }): { url: string, body: any } {
        let isPost = verb === 'post';
        let body = {}, url = urlTmpl;
        let asyncs = [];
        let fnNject = (prop: string, value: any) => {
            let pattern = new RegExp(`\{${prop}\}`, 'ig');
            if (pattern.test(urlTmpl)) {
                url = url.replace(pattern, value);
            } else if (!isPost)
                url += (url.indexOf('?') == -1 ? '?' : '&') + prop + '=' + encodeURI(value);
            else
                body[prop] = value;
        };
        for (let prop in params) {
            let value = params[prop];
            fnNject(prop, value);
        }
        return { url: url, body: body };
    }

    private createDatasource(items: IDatasourceItem[], valueProperty?:string) {
        let datasource = new Datasource(items.length);
        //datasource.textProperty = data.textProperty;
        datasource.valueProperty = valueProperty;
        Datasource.prototype.splice.apply(datasource, (<any[]>[0, datasource.length]).concat(items));
        return datasource;
    }

    fetch(data: IFetchData, entity?: any): Observable<Datasource> {
        let fn = data.fetch;
        if (fn) {
            this.onFetching.emit({});
            let obs: Observable<Datasource> = Observable
                .fromPromise(fn)
                .map(items => this.createDatasource(items, data.valueProperty));
            let subs = obs.subscribe(_ => {
                subs.unsubscribe();
                this.onFetched.emit({});
            });
            return obs;
        }
        //
        let verb = (data.verb || 'get').toLowerCase();
        let isPost = verb === 'post';
        let url = data.sourceUrl;
        let params = data.params || {};
        let dependsOn = data.dependsOn;
        //
        if (dependsOn) {
            params[dependsOn.alias || dependsOn.prop] = entity[dependsOn.prop];
        }
        //
        this.onFetching.emit({});
        var request = this.prepareRequest(verb, url, params);
        let observable: Observable<Response> = verb === 'post' ? this.http.post(request.url, request.body) : this.http.get(request.url);
        return observable.map((r: Response) => {
            this.onFetched.emit({});
            let json = r.json();
            if (!!json.success) {
                let items: IDatasourceItem[] =
                    (json.result as any[])
                        .map((i) => {
                            let value = i, caption = i, tp = data.textProperty, vp = data.valueProperty;
                            if (tp) {
                                caption = i[tp];
                                if (vp)
                                    value = i[vp];
                            }
                            return { value: value, caption: caption, entity: i };
                        });
                return this.createDatasource(items, data.valueProperty);
            }
        });
    }
}

class Datasource extends Array<IDatasourceItem> {
    //textProperty: string;
    valueProperty: string;
}

interface IPacemWithDatasource {
    datasource: Datasource;
}

interface IPacemWithFetchableDatasource extends IPacemWithDatasource {
    fetchData: IFetchData;
    fetching: boolean;
}

interface IPacemWithEntity extends IPacemWithFetchableDatasource {
    entity: any;
    model: NgModel;
    //readonly: boolean;
}

function getDateFormats(dotNetFormat: string) {
    var format = dotNetFormat.replace(/^{0:|}$/g, '');
    var retval = {};
    /*
     * IMPORTANT:
     * need to have the jquery in ISO format, with hyphens "-" as separators!
     */
    switch (format) {
        case 'D':
            return 'longDate';
        case 'd':
            return 'shortDate';
        case 'f':
            return 'short';
        case 'F':
            return 'medium';
        default:
            return format;
    }
}

export declare type pacemFieldMetadata = {
    prop: string;
    type: string;
    display: { name: string, description: string, short: string, watermark: string, null?: string, ui: string, format: string };
    extra: any;
    isReadOnly: boolean;
    dataType: string;
    isComplexType: boolean;
    isNullable: boolean;
    validators: { type: string, errorMessage: string, params?: any }[];
}

function MakeValueAccessorProvider(type: any) {
    return {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

export abstract class BaseValueAccessor implements ControlValueAccessor {

    constructor(private ngControl: NgControl) {
        ngControl.valueAccessor = this;
    }

    protected _value: any;

    get value(): any { return this._value; };

    set value(v: any) {
        if (v !== this._value && !(v == null && this._value == null)) {
            console.log(`${this['constructor'].name}: ${JSON.stringify(this._value)} > ${JSON.stringify(v)}`);
            this._value = v;
            this.onChange(v);
        }
    }

    /**
     * Silently changes the model value.
     * @param value new value
     */
    writeValue(value: any) {
        if (this._value !== value)
            this._value = value;
    }

    protected forceWriteValue(value: any) {
        this._value = value;
        this.onChange(value);
    }

    private onChange = (_) => { };
    private onTouched = () => { };
    registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
    registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}

@Directive({
    selector: '.pacem-radio-list[ngModel]'
})
class RadioControlListValueAccessor extends BaseValueAccessor {

    constructor(model: NgModel) {
        super(model);
    }
}

@Directive({
    selector:
    'input.pacem-radio[type=radio][ngModel]',
    host: { '(change)': 'onChange($event.target.value);changeValue($event.target.value)', '(blur)': 'onTouched()' }
})
class RadioControlValueAccessor extends BaseValueAccessor {

    constructor(private _renderer: Renderer, private _elementRef: ElementRef, model: NgModel, private list: RadioControlListValueAccessor) {
        super(model);
    }

    writeValue(value: any): void {
        super.writeValue(value);
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', value == this._elementRef.nativeElement.value);
    }

    private changeValue(v: any): void {
        let list = this.list;
        if (list)
            list.value = v;
    }

}

function MakeValidatorProvider(type: any) {
    return {
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => type),
        multi: true
    };
}

const emptyVal = '';

function isNullOrEmpty(v: any) {
    return v === null || v === undefined || v === '' || v === emptyVal;
}

//#region VALIDATORS integration

@Directive({
    selector: '[min][formControlName],[min][formControl],[min][ngModel]',
    providers: [MakeValidatorProvider(MinValidator)]
})
class MinValidator implements Validator {
    private _validator: ValidatorFn;

    constructor( @Attribute('min') min: number | Date) {
        this._validator = (control: AbstractControl): { [key: string]: any } => {
            if (Validators.required(control) /* != null && != undefined */) return null;
            var v: number | Date = control.value;
            return v < min ?
                { 'min': { 'minValue': min, 'actualValue': v } } :
                null;
        };

    }
    validate(c: AbstractControl): { [key: string]: any } { return this._validator(c); }
}

@Directive({
    selector: '[max][formControlName],[max][formControl],[max][ngModel]',
    providers: [MakeValidatorProvider(MaxValidator)]
})
class MaxValidator implements Validator {
    private _validator: ValidatorFn;

    constructor( @Attribute('max') max: number | Date) {
        this._validator = (control: AbstractControl): { [key: string]: any } => {
            if (Validators.required(control) /* != null && != undefined */) return null;
            var v: number | Date = control.value;
            return v > max ?
                { 'max': { 'maxValue': max, 'actualValue': v } } :
                null;
        };

    }
    validate(c: AbstractControl): { [key: string]: any } { return this._validator(c); }
}

type compareOperators = 'notEqual' | 'equal' | 'less' | 'greater' | 'lessOrEqual' | 'greaterOrEqual';

@Directive({
    selector: '[compare][formControlName],[compare][formControl],[compare][ngModel]',
    providers: [MakeValidatorProvider(CompareValidator)]
})
class CompareValidator implements Validator {
    private _validator: ValidatorFn;
    private _benchmark: any;
    private _ctrl: AbstractControl;

    @Input('compare') set compareToValue(v: any) {
        this._benchmark = v;
        if (this._ctrl)
            this._ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }

    constructor( @Attribute('operator') operator: compareOperators) {
        this._validator = (control: AbstractControl): { [key: string]: any } => {
            this._ctrl = control;
            if (Validators.required(control) /* != null && != undefined */) return null;
            let v = control.value,
                bm = this._benchmark;
            if (v == null) v = '';
            if (bm == null) bm = '';
            //
            let result = !isNullOrEmpty(v) && (
                ((v > bm && operator != 'greater' && operator != 'greaterOrEqual')
                    || (v < bm && operator != 'less' && operator != 'lessOrEqual')
                    || ((v == bm) && operator != 'equal' && operator != 'lessOrEqual' && operator != 'greaterOrEqual')
                    || (v != bm && operator == 'equal'))
            )
                ?
                { 'compare': { 'compare': bm, 'actualValue': v } } :
                null;
            return result;
        };

    }
    validate(c: AbstractControl): { [key: string]: any } { return this._validator(c); }
}

//#endregion 

@Injectable()
export class PacemExecCommand {

    private getSurroundingNode(selection, tagName) {
        var node = selection.anchorNode;
        while (node && node.nodeName.toUpperCase() !== tagName.toUpperCase()) {
            node = node.parentNode;
        }
        return node;
    }

    static knownCommands = { BOLD: 'bold', ITALIC: 'italic', UNDERLINE: 'underline', LINK: 'hyperlink', ORDEREDLIST: 'orderedList', UNORDEREDLIST: 'unorderedList' };

    exec(command: string, arg?: string, target?) {
        ///<param name="command" type="String" />
        ///<param name="arg" type="String" optional="true" />
        ///<param name="target" type="String" optional="true" />
        let knownCommands = PacemExecCommand.knownCommands;
        var promise = new Promise((resolve, reject) => {
            switch (command) {
                case knownCommands.LINK:
                    var selection = document.getSelection();
                    var anchorNode = this.getSurroundingNode(selection, 'A');

                    //console.log('selection: ' + selection);
                    var current = "http://";
                    var regex = /<a.*href=\"([^\"]*)/;
                    if (anchorNode && regex.test(anchorNode.outerHTML))
                        current = regex.exec(anchorNode.outerHTML)[1];
                    //console.log('link: ' + current);
                    if (arg === 'current')
                        return current == 'http://' ? '' : current;
                    var link = arg || (arg === void 0 && window.prompt('link (empty to unlink):', current));
                    if (!link)
                        document.execCommand('unlink');
                    else {
                        document.execCommand('createLink', false, link);
                        anchorNode = this.getSurroundingNode(selection, 'A');
                        if (anchorNode) anchorNode.setAttribute('target', target || '_blank');
                    }
                    resolve();
                    break;
                case knownCommands.ORDEREDLIST:
                    document.execCommand('insertOrderedList');
                    resolve();
                    break;
                case knownCommands.UNORDEREDLIST:
                    document.execCommand('insertUnorderedList');
                    resolve();
                    break;
                default:
                    document.execCommand(command);
                    resolve();
                    break;
            }
        });
        return promise;
    }
}

const keys = {
    UP: 38,
    DOWN: 40,
    TAB: 9,
    ENTER: 13
};

/**
 * PacemDatetimePicker Component
   TODO: add timezone selection/set (local is currently assumed)
 */
@Component({
    selector: 'pacem-datetime-picker',
    template: `<div class="pacem-datetime-picker">
    <div class="pacem-datetime-picker-year">
    <select class="pacem-select" [(ngModel)]="year" #yearel>
        <option value="">...</option>
        <option *ngFor="let yr of years" [value]="yr">{{ yr }}</option>
    </select></div>
    <div class="pacem-datetime-picker-month">
    <select class="pacem-select" [(ngModel)]="month" #monthel>
        <option value="">...</option>
        <option *ngFor="let mth of months" [value]="mth.value">{{ mth.date | date: 'MMM' }}</option>
    </select></div>
    <div class="pacem-datetime-picker-date">
    <select class="pacem-select" [(ngModel)]="date" [disabled]="(yearel.value === '' || monthel.value === '')">
        <option value="">...</option>
        <option *ngFor="let dt of dates" [value]="dt.value" [disabled]="dt.date > _maxDate || dt.date < _minDate">{{ dt.date | date: 'EEE dd' }}</option>
    </select></div>
    <div class="pacem-datetime-picker-hours" *ngIf="precision != 'day'">
    <select class="pacem-select" [(ngModel)]="hours">
        <option *ngFor="let hr of a24" [value]="hr">{{ hr | number:'2.0-0' }}</option>
    </select></div>
    <div class="pacem-datetime-picker-minutes" *ngIf="precision != 'day'">
    <select class="pacem-select" [(ngModel)]="minutes">
        <option *ngFor="let min of a60" [value]="min">{{ min | number:'2.0-0' }}</option>
    </select></div>
    <div class="pacem-datetime-picker-seconds" *ngIf="precision == 'second'">
    <select class="pacem-select" [(ngModel)]="seconds">
        <option *ngFor="let sec of a60" [value]="sec">{{ sec | number:'2.0-0' }}</option>
    </select></div>
    <dl class="pacem-datetime-picker-preview" [pacemHidden]="!value">
        <dt>local:</dt><dd>{{ dateValue | date:'medium' }}</dd>
        <dt>iso:</dt><dd>{{ dateValue?.toISOString() }}</dd>
    </dl>
</div>`, providers: [NgModel]
})
export class PacemDatetimePicker extends BaseValueAccessor implements OnChanges, OnInit, AfterViewInit, OnDestroy {

    @Output('dateValueChange') onchange = new EventEmitter<Date>();

    private _dateValue: Date;
    get dateValue() {
        return this._dateValue;
    }
    @Input() set dateValue(v: Date | string) {
        let date = PacemUtils.parseDate(v);
        let former = this._dateValue && this._dateValue.valueOf();
        let current = date && date.valueOf();
        if (former !== current) {
            this._dateValue = date;
            this.disassembleDate(date);
            if (date)
                this.buildupDates();
            this.onchange.emit(date);
            this.value = v; // keep same type (Date or string equivalent)
        }
    }

    private _minDate: Date;
    @Input('min') set minDate(v: string | Date) {
        if (!v) return;
        this._minDate = PacemUtils.parseDate(v);
    }
    private _maxDate: Date;
    @Input('max') set maxDate(v: string | Date) {
        if (!v) return;
        this._maxDate = PacemUtils.parseDate(v);
    }
    @Input() precision: 'day' | 'minute' | 'second' = 'day';

    private disassembleDate(v: Date) {
        if (!v) return;
        this._year = v.getFullYear();
        this._month = v.getMonth();
        this._date = v.getDate();
        this._hours = v.getHours();
        this._minutes = v.getMinutes();
        this._seconds = v.getSeconds();
    }

    private months: { value: number, date: Date }[] = [];
    private dates: { value: number, date: Date }[] = [];
    private a24: number[] = [];
    private a60: number[] = [];
    private years: number[] = [];
    private datesAssembler = new Subject<any[]>();
    private subscription: Subscription;
    private subscription2: Subscription;

    //#region date properties
    private _year: number | string;
    private get year() {
        return this._year;
    }
    private set year(v: number | string) {
        if (this._year != v) {
            this._year = isNullOrEmpty(v) ? emptyVal : +v;
            this.buildupDates();
        }
    }
    private _month: number | string;
    private get month() {
        return this._month;
    }
    private set month(v: number | string) {
        if (this._month != v) {
            this._month = isNullOrEmpty(v) ? emptyVal : +v;
            this.buildupDates();
        }
    }
    private _date: number | string;
    private get date() {
        return this._date;
    }
    private set date(v: number | string) {
        if (this._date != v) {
            this._date = isNullOrEmpty(v) ? emptyVal : +v;
            this.buildup();
        }
    }
    private _hours: number = 0;
    private get hours() {
        return this._hours;
    }
    private set hours(v: number) {
        if (this._hours != v) {
            this._hours = +v;
            this.buildup();
        }
    }
    private _minutes: number = 0;
    private get minutes() {
        return this._minutes;
    }
    private set minutes(v: number) {
        if (this._minutes != v) {
            this._minutes = +v;
            this.buildup();
        }
    }
    private _seconds: number = 0;
    private get seconds() {
        return this._seconds;
    }
    private set seconds(v: number) {
        if (this._seconds != v) {
            this._seconds = +v;
            this.buildup();
        }
    }
    //#endregion

    constructor(private model: NgModel) {
        super(model);
        const today = new Date();
        let year = this.year = today.getFullYear();
        this.minDate = new Date(year - 100, 0, 1);
        this.maxDate = new Date(year + 10, 11, 31);
        this.month = today.getMonth();
        //
        let months = [], hours = [], minutes = [];
        // months
        for (let i = 0; i < 12; i++) {
            months.push({ value: i, date: new Date(year, i, 1) });
        }
        this.months = months;
        // hours
        for (let i = 0; i < 24; i++) {
            hours.push(i);
        }
        this.a24 = hours;
        // minutes/secs
        for (let i = 0; i < 60; i++) {
            minutes.push(i);
        }
        this.a60 = minutes;
    }

    private setupYears() {
        let years = [];
        for (let i = this._minDate.getFullYear(); i <= this._maxDate.getFullYear(); i++) {
            years.push(i);
        }
        this.years = years;
    }

    ngOnInit() {
        this.setupYears();
        this.subscription = this.datesAssembler.asObservable()
            .debounceTime(20)
            .subscribe((dates: any[]) => {
                this.dates = dates;
                let adjusted = dates.length ? Math.min(<number>this.date, dates[dates.length - 1].value) : null;
                if (adjusted != this.date)
                    this.date = adjusted;
                else
                    this.buildup();
            });
        this.subscription2 = this.model.valueChanges.subscribe(c => {
            this.dateValue = c;
        });
    }

    ngOnDestroy() {
        this.subscription2.unsubscribe();
        this.subscription.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['minDate'] || changes['maxDate'])
            this.setupYears();
    }

    ngAfterViewInit() {
        this.buildupDates();
    }

    private buildupDates(evt?: Event) {
        if (evt) evt.stopPropagation();
        const v = this;
        if (!isNullOrEmpty(v.year) && !isNullOrEmpty(v.month)) {
            let day = 1,
                dates = [],
                isDate = (k: number) => {
                    try {
                        let monthvalue = +v.month, parsed = new Date(+v.year, +v.month, k);
                        return parsed.getMonth() == monthvalue;
                    } catch (e) {
                        return false;
                    }
                };
            do {
                dates.push({ value: day, date: new Date(+v.year, +v.month, day) });
            } while (isDate(++day));

            this.datesAssembler.next(dates);
        } else
            this.datesAssembler.next([]);
    }

    private buildup(evt?: Event) {
        if (evt) evt.stopPropagation();
        //
        const v = this;
        let year = '', month = '', date = '';
        if (isNullOrEmpty(v.year) || isNullOrEmpty(v.month) || isNullOrEmpty(v.date))
            this.dateValue = null;
        else
            //
            try {

                let value = new Date();
                value.setFullYear(+v.year);
                value.setMonth(+v.month);
                value.setDate(+v.date);
                value.setHours(v.hours);
                value.setMinutes(v.minutes);
                value.setSeconds(v.seconds);
                value.setMilliseconds(0);
                if (!Number.isNaN(value.valueOf())) {
                    this.dateValue = value;
                }
                else
                    this.dateValue = null;
            } catch (e) {
                this.dateValue = null;
            }
    }
}

@Component({
    selector: 'pacem-autocomplete',
    template: `<div class="pacem-autocomplete">
    <input  (keyup)="onKeyup($event);fetchTerm(search.value)"
            (search)="fetchTerm(search.value)"
            (keydown)="onKeydown($event)"
            (blur)="onBlur($event)"
            (focus)="onFocus($event);"
            [placeholder]="placeholder"
            type="search" #search 
            [attr.id]="root.nativeElement.id +'_acq'"
            class="pacem-input"
            (popup)="resize(balloon, search)"
            [ngClass]="{ 'ng-invalid': model.invalid, 'ng-dirty': model.dirty, 'ng-valid': model.valid, 'ng-pristine': model.pristine }"
            [value]="caption"
            [pacemBalloon]="balloon" [pacemBalloonOptions]="{ position: 'bottom', trigger: 'focus', behavior: 'menu' }" />
    <div #balloon hidden><ol [hidden]="!datasource?.length">
        <li *ngFor="let item of datasource; let ndx = index" 
            (mousedown)="onClick($event, ndx)"
            [ngClass]="{ 'pacem-focused': focusIndex == ndx }" [innerHTML]="item.caption | pacemHighlight:search.value"></li>
    </ol></div>
</div>`
})
class PacemAutocomplete extends BaseValueAccessor implements IPacemWithDatasource, OnChanges, OnDestroy {

    constructor(private model: NgModel, private root: ElementRef) {
        super(model);
        this.subscription1 = this.model.valueChanges
            .subscribe(_ => this.updateCaption(_));
    }

    @Input() datasource: Datasource;
    @Output('query') onquery = new EventEmitter<string>();
    @Input() placeholder: string;
    @Input() textProperty: string;

    private searchTermStream = new Subject<string>();
    private caption: string = '';

    private focusIndex: number = -1;
    private subscription: Subscription;
    private subscription1: Subscription;

    private resize(popup: HTMLElement, benchmark: HTMLElement) {
        popup.style.minWidth = benchmark.offsetWidth + 'px';
    }

    private fetchTerm(term) {
        this.searchTermStream.next(term);
    }

    private updateCaption(value: any) {
        if (value == null) return;
        let caption: any = '';
        if (this.textProperty && this.textProperty in value)
            caption = value[this.textProperty];
        else
            caption = value;
        this.caption = caption;
    }

    private selectValue(ndx: number) {
        if (!(this.datasource && this.datasource.length > ndx)) {
            this.focusIndex = -1;
            return;
        }
        this.focusIndex = ndx;
        let value = this.datasource[ndx].entity;
        this.value = value;
        this.searchTermStream.next(null);
        this.datasource.splice(0);
    }

    ngOnChanges(changes: SimpleChanges) {
        var c = changes["datasource"];
        if (c && c.currentValue)
            this.focusIndex = Math.min(0, (<Datasource>c.currentValue).length - 1);
        else
            this.focusIndex = -1;
    }

    private onFocus(evt) {
        this.subscription = this.searchTermStream
            .debounceTime(600)
            .distinctUntilChanged()
            .subscribe(_ => {
                if (_ == null) return;
                if (this.model.value)
                    this.value = null;
                this.onquery.emit(_);
            });
    }

    private onBlur(evt) {
        this.subscription.unsubscribe();
    }

    private onClick(evt, ndx) {
        evt.preventDefault();
        //evt.stopPropagation();
        this.selectValue(ndx);
    }

    private onKeyup(evt: KeyboardEvent) {
        if (evt.keyCode == keys.ENTER) {
            evt.preventDefault();
            if (this.focusIndex >= 0)
                this.selectValue(this.focusIndex);
        }
    }

    private onKeydown(evt: KeyboardEvent) {
        switch (evt.keyCode) {
            case keys.TAB:

                if (this.focusIndex >= 0)
                    this.selectValue(this.focusIndex);

                break;
            case keys.UP:
            case keys.DOWN:

                evt.preventDefault();
                let ds = this.datasource;
                if (!(ds && ds.length))
                    this.focusIndex = -1;
                let ndx = this.focusIndex + (evt.keyCode == keys.UP ? -1 : 1);
                this.focusIndex = (ndx + ds.length) % ds.length;

                break;
        }
    }

    ngOnDestroy() {
        this.subscription1.unsubscribe();
    }

}

@Directive({
    selector: '[contenteditable]',
    providers: [PacemExecCommand],
    host: {
        '(blur)': "onTyped()",
        '(keyup)': "onTyped()",
        '(change)': "onTyped()",
        '(keydown)': "onKeydown($event)",
        '[innerHTML]': "viewValue"
    }
})
class PacemContentEditable extends BaseValueAccessor implements OnInit, OnDestroy {

    constructor(private element: ElementRef, private sce: DomSanitizer, private execCommand: PacemExecCommand, ctrl: NgControl) {
        super(ctrl);
        this.subscription = ctrl.valueChanges.subscribe(_ => {
            if (this.container && _ != this.container.innerHTML)
                this.setViewValue(_);
        });
    }

    private subscription: any;
    private container: HTMLElement;
    private viewValue: SafeHtml;
    private dashboard: HTMLElement[] = [];

    ngOnInit() {
        this.container = this.element.nativeElement;

        let dashboard = document.createElement('div');
        this.container.parentElement.insertBefore(dashboard, this.container.nextSibling);
        // add specific buttons
        for (var cmdName in PacemExecCommand.knownCommands) {
            var cmd = PacemExecCommand.knownCommands[cmdName];
            var btn = document.createElement('button');
            btn.className = `pacem-command pacem-${cmdName.toLowerCase()}`;
            btn.dataset['pacemCommand'] = btn.innerText = cmd;
            btn.addEventListener('click', this.exec, false);
            dashboard.insertBefore(btn, null);
            this.dashboard.push(btn);
        }
    }

    private exec = (ev: MouseEvent) => {
        ev.preventDefault();
        ev.stopPropagation();
        var cmd = (<HTMLElement>(ev.srcElement || ev.target)).dataset['pacemCommand'];
        this.execCommand.exec(cmd).then(() => this.onTyped());
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.dashboard.forEach(btn => {
            btn.removeEventListener('click', this.exec, false);
        });
        this.dashboard.splice(0);
        this.container.nextElementSibling.remove();
    }

    viewToModelUpdate(newValue: any): void {
        var html = newValue || this.container.innerHTML;
        if (html == '<br>')
            html = '';
        if (html != this._value) {
            this.value = html;
        }
    }

    private onKeydown(evt) {
        let $execCommand = this.execCommand, commands = PacemExecCommand.knownCommands;
        if (evt.keyCode === 13 && evt.shiftKey) {
            // enter
            evt.preventDefault();
            evt.stopPropagation();
            //
            document.execCommand('insertHTML', false, /*evt.shiftKey ?*/ '<br>' /*: '<br><br>'*/);
        }
        else if (evt.ctrlKey) {

            //console.log(evt.keyCode + ': ' + String.fromCharCode(evt.keyCode));

            switch (evt.keyCode) {
                case 49:
                    // `1`
                    evt.preventDefault();
                    evt.stopPropagation();
                    //
                    $execCommand.exec(commands.ORDEREDLIST);
                    break;
                case 189:
                    // `dash`
                    evt.preventDefault();
                    evt.stopPropagation();
                    //
                    $execCommand.exec(commands.UNORDEREDLIST);
                    break;
                case 72:
                    // `h`yperlink
                    evt.preventDefault();
                    evt.stopPropagation();
                    //
                    $execCommand.exec(commands.LINK).then(() => this.onTyped());
                    break;
            }
        }
    }

    private onTyped() {
        this.viewToModelUpdate(this.container.innerHTML);
    };

    private setViewValue(v?: any) {
        this.viewValue = this.sce.bypassSecurityTrustHtml(v || this.value);
    }
}

@Component({
    selector: 'pacem-thumbnail[ngModel]',
    template: `<img [ngStyle]="{ 'width': width+'px', 'height': height+'px' }" class="pacem-thumbnail" [attr.src]="source" (click)="changing=true" />
<pacem-lightbox #lightbox [show]="changing" (close)="changing=false">
    <pacem-snapshot (select)="onchange($event)" #snapshot>
    Webcam access is <b>impossile</b> on this machine!
    </pacem-snapshot>
</pacem-lightbox>
`})
class PacemThumbnail extends BaseValueAccessor {

    @ViewChild('lightbox') lightbox: PacemLightbox;
    @ViewChild('snapshot') snapshot: PacemSnapshot;
    @Input() mode: 'url' | 'binary' = 'binary';
    @Input() width: number;
    @Input() height: number;
    private changing: boolean;

    constructor(private model: NgModel) {
        super(model);
    }

    private get source(): string {
        switch (this.mode) {
            case 'url':
                return this.value;
            case 'binary':
                return 'data:image/png;base64,' + this.value;
        }
    }

    private onchange(dataUrl: string) {
        this.changing = false;
        PacemUtils.cropImage(dataUrl, this.width, this.height)
            .then((resizedDataUrl) => {
                switch (this.mode) {
                    case 'url':
                        this.value = resizedDataUrl;
                        break;
                    case 'binary':
                        this.value = resizedDataUrl.substr(resizedDataUrl.indexOf(',') + 1);
                        break;
                }
            });
    }

}

@Component({
    selector: 'pacem-select-many[ngModel]',
    template: `<ul class="pacem-select-many" *ngIf="!readonly"><li *ngFor="let item of datasource; let ndx=index">
    <input type="checkbox" [value]="item.value" (change)="toggle($event, item)" [checked]="item.selected" [id]="uid+'_'+ndx" />
    <label [attr.for]="uid+'_'+ndx">{{ item.caption }}</label>
</li></ul>
<ul class="pacem-select-many" *ngIf="readonly">
    <li [hidden]="!item.selected" *ngFor="let item of datasource"><span class="pacem-readonly">{{ item.caption }}</span></li>
</ul>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class PacemSelectMany extends BaseValueAccessor implements IPacemWithDatasource
    //, DoCheck
    , OnChanges, OnDestroy {

    @Input() datasource: Datasource;
    @Input() readonly: boolean;

    constructor(private ref: ChangeDetectorRef, private ctrl: NgModel) {
        super(ctrl);
        this.subscription = ctrl.valueChanges.subscribe(_ =>
            this.checkValue()
        );
    }

    private uid: string = PacemUtils.uniqueCode();
    private subscription: Subscription;

    private toggle(evt: Event, item: IDatasourceItem) {
        evt.preventDefault();
        evt.stopPropagation();
        item.selected = !item.selected;
        this.updateArrayOfValues();
    }

    private updateArrayOfValues() {
        if (this.datasource) {
            let value = [];
            Array.prototype.splice.apply(value, [0, value.length].concat(this.datasource.filter(_ => _.selected === true).map(_ => _.entity)));
            this.value = (value.length ? value : null);
        }
    }

    private updateDatasource() {
        if (!this.datasource) return;
        let items = this.value as any[];
        this.datasource.forEach(_ => {
            let valueProp = this.datasource.valueProperty;
            let value = _.value;
            let pred = (i: any) => i == value;
            if (valueProp)
                pred = (i: any) => i[valueProp] == value;
            _.selected = items ? (items.findIndex(pred) > -1) : false;
        });
        this.ref.markForCheck();
    }

    private checkValue() {
        this.updateDatasource();
    }

    ngOnChanges(changes: SimpleChanges) {
        let c = changes['datasource'];
        if (c && c.currentValue)
            this.updateDatasource();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

@Directive({
    selector: 'option[pacemDefaultSelectOption]'
})
class PacemDefaultSelectOption implements DoCheck {

    @Input('pacemDefaultSelectOption') defaultValues: any[] = [];

    ngDoCheck() {
        if (this.defaultValues.indexOf(this.select.value) >= 0 || this.select.value === undefined)
            this.select.writeValue(this.optionRef.nativeElement.value);
    }

    constructor(private select: SelectControlValueAccessor, private optionRef: ElementRef) {
    }

}

@NgModule({
    imports: [FormsModule, CommonModule, PacemUIModule, PacemCoreModule],
    declarations: [CompareValidator, MinValidator, MaxValidator, PacemDatetimePicker, RadioControlValueAccessor, RadioControlListValueAccessor,
        PacemSelectMany, PacemAutocomplete, PacemDefaultSelectOption, PacemContentEditable, PacemThumbnail],
    exports: [CompareValidator, MinValidator, MaxValidator, PacemDatetimePicker, RadioControlValueAccessor, RadioControlListValueAccessor,
        PacemSelectMany, PacemAutocomplete, PacemDefaultSelectOption, PacemContentEditable, PacemThumbnail],
    providers: [PacemExecCommand, DatasourceFetcher]
})
class PacemScaffoldingInternalModule { }

@Injectable()
export class PacemFieldBuilder {

    public createComponent(selector: string, template: string, ctrlRef: string, injectDirectives?: any[]): any {

        @Component({
            selector: selector,
            template: template,
            providers: injectDirectives/*,
            changeDetection: ChangeDetectionStrategy.OnPush*/
        })
        class PacemFieldDynamicField implements IPacemWithEntity, OnChanges, OnDestroy, OnInit, AfterViewInit
        //, DoCheck // don't implement DoCheck HERE!
        {
            @Input() entity: any;
            @Input() fetchData: IFetchData;
            @ViewChild(ctrlRef) ctrl: NgModel;

            get model() {
                return this.ctrl;
            }

            private sub1: Subscription;
            private sub2: Subscription;
            private subscription: Subscription;
            private subv: Subscription;
            //private differer: KeyValueDiffer;

            constructor(
                private ref: ChangeDetectorRef,
                private fetcher: DatasourceFetcher/*,
                private differs: KeyValueDiffers*/) {
                this.sub1 = this.fetcher.onFetching.subscribe(_ => {
                    this.fetching = true;
                    //this.ref.detectChanges();
                });
                this.sub2 = this.fetcher.onFetched.subscribe(_ => {
                    this.fetching = false;
                    //this.ref.detectChanges();
                });
            }
            datasource: Datasource;
            fetching: boolean;
            hasValue: boolean;

            private checkHasValue = () => {
                var ctrl = this.ctrl;
                if (ctrl && ctrl.valueAccessor) {
                    let _ = ctrl.value;
                    this.hasValue = (_ !== undefined && _ !== null && _ !== '');
                }
            }

            ngAfterViewInit() {
                var ctrl = this.ctrl;
                if (ctrl && ctrl.valueAccessor) {
                    let fn = this.checkHasValue;
                    this.subv = ctrl.valueChanges.subscribe(fn);
                    fn();
                }
            }

            ngOnInit() {
                if (this.fetchData)
                    this.fetch();
            }

            ngOnChanges(changes: SimpleChanges) {
                let c = changes['fetchData'];
                if (c && c.currentValue)
                    this.fetch();
            }

            private fetch(extend?: any) {
                if (extend) {
                    this.fetchData.params = this.fetchData.params || {};
                    PacemUtils.extend(this.fetchData.params, extend);
                }
                //this.differer = this.differs.find(this.fetchData).create(null);
                if (this.subscription)
                    this.subscription.unsubscribe();
                this.subscription = this.fetcher
                    .fetch(this.fetchData, this.entity)
                    .subscribe(ds => {
                        this.datasource = ds;
                        this.ref.markForCheck();
                    });
            }

            ngOnDestroy() {
                if (this.subscription)
                    this.subscription.unsubscribe();
                if (this.subv)
                    this.subv.unsubscribe();
                this.sub1.unsubscribe();
                this.sub2.unsubscribe();
            }
        };

        @NgModule({
            imports: [FormsModule, CommonModule, PacemUIModule, PacemCoreModule, PacemScaffoldingInternalModule],
            declarations: [PacemFieldDynamicField],
            exports: [PacemFieldDynamicField]
        })
        class PacemFieldDynamicModule { }

        return PacemFieldDynamicModule;
    }

}

@Component({
    selector: 'pacem-field',
    template: `
    <div #placeholder hidden></div>
    `,
    //entryComponents: [PacemSelectMany, PacemAutocomplete],
    providers: [/*PacemContentEditable, PacemDefaultSelectOption, DatasourceFetcher*/, PacemFieldBuilder,
        PacemDate, MinValidator, MaxValidator, CompareValidator]
})
export class PacemField implements OnChanges, AfterViewInit, OnDestroy {

    @ViewChild('label') labelElementRef: ElementRef;
    // reference for a <div> with #dynamicContentPlaceHolder
    @ViewChild('placeholder', { read: ViewContainerRef })
    protected dynamicComponentTarget: ViewContainerRef;
    // this will be reference to dynamic content - to be able to destroy it
    private componentRef: ComponentRef<IPacemWithEntity>;
    private subscription: Subscription;

    @Input() field: pacemFieldMetadata;
    @Input() entity: any;
    @Input() readonly: boolean;
    @Input('params') parameters: { [key: string]: any } = [];

    private _form: NgForm;
    @Input() set form(v: NgForm) {
        if (v == this._form) return;
        this._form = v;
        this.syncControl();
    }

    constructor(private compiler: Compiler, private builder: PacemFieldBuilder) {
    }

    private syncControl(v?: NgForm) {
        if (this.readonly) return;
        let model = (this.componentRef && this.componentRef.instance && this.componentRef.instance.model);
        if (model) {
            let frmCtrl = this._form && this._form.control,
                name = this.field.prop;
            if (frmCtrl && !frmCtrl.contains(name))
                frmCtrl.addControl(name, model.control);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        // only handle reference changes (for now)
        let c: SimpleChange;
        if ((c = changes['field'] || changes['readonly']) && !c.isFirstChange()) {
            this.rebuildInputField();
        }
        if (this.componentRef && this.componentRef.instance) {
            if ((c = changes['entity']) && !c.isFirstChange())
                this.componentRef.instance.entity = c.currentValue;
        }
    }

    ngAfterViewInit() {
        this.rebuildInputField();
    }

    ngOnDestroy() {
        this.dispose();
    }

    private dispose() {
        if (this.componentRef) {
            let model = (this.componentRef.instance && this.componentRef.instance.model);
            if (model) {
                let frmCtrl = this._form && this._form.control,
                    name = this.field.prop;
                if (frmCtrl && frmCtrl.contains(name))
                    frmCtrl.removeControl(name);
            }
            this.componentRef.destroy();
        }
        if (this.subscription && !this.subscription.closed) this.subscription.unsubscribe();
    }

    private uid: string = `_${PacemUtils.uniqueCode()}`;

    private rebuildInputField() {
        this.dispose();
        if (!this.field || !this.entity) return;
        //
        let field = this.field;
        let caption = (field.display && field.display.name) || field.prop;
        //
        let tmpl: string, detailTmpl: string, tagName: string = 'input',
            innerHtml: string, wrapperOpener: string = '', wrapperCloser: string = '', fieldAttrs: string = '',
            fetchData: IFetchData;
        let attrs: { [key: string]: string }
            =
            {
                'placeholder': (field.display && field.display.watermark) || '',
                'name': field.prop,
                'id': this.uid,
                'class': 'pacem-input',
                '[(ngModel)]': `entity.${field.prop}`
            }
            ;

        // label
        let label: HTMLLabelElement = document.createElement('label');
        label.htmlFor = this.uid;
        label.innerText = caption;
        PacemUtils.addClass(label, 'pacem-label');

        // setting what will be the `#name => ngModel` template reference (for validation)
        let formReference = (field.prop + this.uid/*PacemUtils.uniqueCode()*/).toLowerCase();
        attrs['#' + formReference] = 'ngModel';
        //attrs['#' + field.prop] = 'ngForm';
        switch (field.display && field.display.ui) {
            // TODO: remove this (use dataType = 'HTML' instead).
            case 'contentEditable':
                console.warn('`contentEditable` ui hint is deprecated. Lean on `dataType` equal to \'HTML\' instead.');
                tagName = 'div';
                attrs['contenteditable'] = 'true';
                attrs['class'] = 'pacem-contenteditable';
                detailTmpl = `<div class="pacem-readonly" [innerHTML]="entity.${field.prop}"></div>`;
                break;
            case 'snapshot':
                tagName = 'pacem-thumbnail';
                let w = attrs['[width]'] = field.extra.width;
                let h = attrs['[height]'] = field.extra.height;
                let mode = attrs['mode'] = field.type.toLowerCase() === 'string' ? 'string' : 'binary';
                detailTmpl = `<img class="pacem-readonly" width="${w}" height="${h}" [attr.src]="'${(mode == "string" ? "" : "data:image/png;base64,")}'+entity.${field.prop}" />`;
                break;
            case 'oneToMany':
                // select
                tagName = 'select';
                attrs['(mousewheel)'] = '$event.preventDefault()';
                attrs['class'] = 'pacem-select';
                innerHtml = `<option *ngFor="let item of datasource" [value]="item.value">{{ item.caption }}</option>`;
                let watermark = attrs['placeholder'];
                delete attrs['placeholder'];
                if (watermark)
                    innerHtml = `<option value="" [pacemDefaultSelectOption]="[null]" class="pacem-watermark">${watermark}</option>` + innerHtml;
                fetchData = field.extra;
                let compareTo = field.prop;
                if (fetchData.valueProperty) compareTo = field.prop + '.' + fetchData.valueProperty;
                detailTmpl = `<template ngFor 
            [ngForOf]="datasource" 
            let-item="$implicit" 
            let-ndx="index"><span class="pacem-readonly" *ngIf="item.value == entity.${ compareTo}">{{ item.caption }}</span></template>`;
                break;
            case 'manyToMany':
                // checkboxlist
                tagName = 'pacem-select-many';
                attrs['[datasource]'] = 'datasource';
                delete attrs['class'];
                delete attrs['placeholder'];
                fetchData = field.extra;
                detailTmpl = `<pacem-select-many [ngModel]="entity.${field.prop}" [datasource]="datasource" [readonly]="true"></pacem-select-many>`;
                break;
            case 'suggest':
            case 'autocomplete':
                tagName = 'pacem-autocomplete';
                label.htmlFor = this.uid + '_acq';
                attrs['[datasource]'] = 'datasource';
                attrs['(query)'] = "fetch({ 'q': $event })";
                attrs['pacemBalloon'] = '#balloon';
                attrs['[pacemBalloonOptions]'] = "{ position: 'auto', trigger: 'focus', behavior: 'menu' }";
                fetchData = field.extra;
                if (fetchData.textProperty) {
                    attrs['textProperty'] = fetchData.textProperty;
                    detailTmpl = `<span class="pacem-readonly">{{ entity.${field.prop}?.${fetchData.textProperty} }}</span>`;
                }
                break;
            default:
                switch ((field.dataType || field.type).toLowerCase()) {
                    case 'html':
                        tagName = 'div';
                        attrs['contenteditable'] = 'true';
                        attrs['class'] = 'pacem-contenteditable';
                        detailTmpl = `<div class="pacem-readonly" [innerHTML]="entity.${field.prop}"></div>`;
                        break;
                    case 'enumeration':
                        // radiobutton list
                        tagName = 'ol';
                        attrs['class'] = 'pacem-radio-list';
                        innerHtml = '';
                        detailTmpl = '<span class="pacem-readonly">';
                        (<Datasource>this.field.extra.enum).forEach((kvp, j) => {
                            detailTmpl += `<span *ngIf="${kvp.value} == entity.${field.prop}">${kvp.caption}</span>`;
                            innerHtml +=
                                `<li><input [(ngModel)]="${attrs['[(ngModel)]']}" type="radio" class="pacem-radio" name="${attrs['name']}" value="${kvp.value}" id="${attrs['id']}_${j}" />
<label for="${attrs['id']}_${j}">${kvp.caption}</label></li>`;
                        });
                        //innerHtml +='';
                        detailTmpl += '</span>';
                        delete attrs['type'];
                        delete attrs['name'];
                        break;
                    case 'password':
                        attrs['type'] = 'password';
                        break;
                    case 'emailaddress':
                        attrs['type'] = 'email';
                        break;
                    case "color":
                        attrs['type'] = 'color';
                        break;
                    case "time":
                        attrs['type'] = 'time';
                        break;
                    case "datetime":
                        tagName = 'pacem-datetime-picker';
                        delete attrs['placeholder'];
                        delete attrs['class'];
                        attrs['precision'] = 'minute';
                        detailTmpl = `<span class="pacem-readonly">{{ entity.${field.prop} | pacemDate | date:${getDateFormats((field.display && field.display.format) || 'medium')} }}</span>`;
                        break;
                    case "date":
                        tagName = 'pacem-datetime-picker';
                        delete attrs['placeholder'];
                        delete attrs['class'];
                        detailTmpl = `<span class="pacem-readonly">{{ entity.${field.prop} | pacemDate | date:${getDateFormats((field.display && field.display.format) || 'medium')} }}</span>`;
                        break;
                    case "url":
                        attrs['type'] = 'url';
                        break;
                    case "phonenumber":
                        attrs['type'] = 'tel';
                        break;
                    case "multilinetext":
                        tagName = 'textarea';
                        attrs['rows'] = '3';
                        break;
                    default:
                        switch ((field.type || '').toLowerCase()) {
                            case "boolean":
                                attrs['type'] = 'checkbox';
                                attrs['class'] += ' pacem-checkbox';
                                detailTmpl = `<span class="pacem-checkbox pacem-readonly" [ngClass]="{ 'pacem-checked' : entity.${field.prop} }"></span>`
                                break;
                            case "byte":
                                attrs['type'] = 'number';
                                attrs['min'] = '0';
                                attrs['max'] = '255';
                                break;
                            case "int32":
                            case "int64":
                            case "integer":
                            case "int":
                            case "long":
                                attrs['type'] = 'number';
                                break;
                            case "double":
                            case "decimal":
                            case "float":
                            case "single":
                                attrs['type'] = 'number';
                                attrs['step'] = 'any';
                                break;
                            default:
                                attrs['type'] = 'text';
                                break;
                        }
                        break;
                }
                break;
        }

        // validators
        let validatorsTmpl: string = '', validators = [];
        if (field.validators && field.validators.length) {
            validatorsTmpl += `<ol class="pacem-validators" [hidden]="${formReference}.valid || ${formReference}.pristine">`;
            field.validators.forEach((validator) => {
                switch (validator.type) {
                    case 'required':
                        attrs['required'] = 'required';
                        PacemUtils.addClass(label, 'pacem-required');
                        validatorsTmpl += `<li *ngIf="${formReference}.errors" [hidden]="!${formReference}.errors.required">${validator.errorMessage}</li>`;
                        break;
                    case 'length':
                        let max = validator.params && validator.params['max'];
                        let min = validator.params && validator.params['min'];
                        if (max != null) {
                            attrs['maxlength'] = max;
                        }
                        if (min != null) {
                            attrs['minlength'] = min;
                        }
                        validatorsTmpl += `<li *ngIf="${formReference}.errors" [hidden]="!${formReference}.errors.maxlength && !${formReference}.errors.minlength">${validator.errorMessage}</li>`;
                        break;
                    case 'range':
                        let maxNum = validator.params && validator.params['max'];
                        let minNum = validator.params && validator.params['min'];
                        if (maxNum != null) {
                            attrs['max'] = maxNum;
                        }
                        if (minNum != null) {
                            attrs['min'] = minNum;
                        }
                        validatorsTmpl += `<li *ngIf="${formReference}.errors" [hidden]="!${formReference}.errors.max && !${formReference}.errors.min">${validator.errorMessage}</li>`;

                        break;
                    case 'email':
                        attrs['pattern'] = "[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z0-9]{2,6}";
                        validatorsTmpl += `<li *ngIf="${formReference}.errors" [hidden]="!${formReference}.errors.pattern">${validator.errorMessage}</li>`;
                        break;
                    case 'regex':
                        attrs['pattern'] = validator.params['pattern'];
                        validatorsTmpl += `<li *ngIf="${formReference}.errors" [hidden]="!${formReference}.errors.pattern">${validator.errorMessage}</li>`;
                        break;
                    case 'compare':
                        let comparedTo = attrs['[compare]'] = `entity.${validator.params['to']}`;
                        let operator = attrs['operator'] = validator.params['operator'] || 'equal';
                        // In case of `date(time)` try to add some interaction with `datetime-picker`'s min/max props.
                        if (tagName === 'pacem-datetime-picker') {
                            switch (operator) {
                                case 'lessOrEqual':
                                case 'less': // approximation: edge value won't be allowed but will result enabled on the `datetime-picker`
                                    attrs['[max]'] = comparedTo;
                                    break;
                                case 'greaterOrEqual':
                                case 'greater': // approximation: edge value won't be allowed but will result enabled on the `datetime-picker`
                                    attrs['[min]'] = comparedTo;
                                    break;
                            }
                        }
                        validatorsTmpl += `<li *ngIf="${formReference}.errors" [hidden]="!${formReference}.errors.compare">${validator.errorMessage}</li>`;
                }
            });
            validatorsTmpl += '</ol>';
        }

        if (field.isReadOnly) {
            attrs['readonly'] = 'readonly';
            attrs['tabindex'] = '-1';
        }
        let el = document.createElement(tagName);
        let elOuterHtml: string = el.outerHTML;
        let selfClosing = !(new RegExp(`</${tagName}`, 'i').test(elOuterHtml));
        if (selfClosing && !elOuterHtml.endsWith('/>'))
            elOuterHtml = elOuterHtml.replace('>', '/>');
        //
        if (attrs['class']) attrs['class'] += ' form-control';
        else attrs['class'] = 'form-control';
        for (var prop in attrs)
            elOuterHtml = elOuterHtml.replace(selfClosing ? /\/>$/ : /></, ` ${prop}="${attrs[prop]}"${(selfClosing ? '/>' : '><')}`);
        if (innerHtml && !selfClosing)
            elOuterHtml = elOuterHtml.replace('><', `>${innerHtml}<`);

        if (!detailTmpl)
            detailTmpl = `<span class="pacem-readonly">{{ entity.${field.prop} }}</span>`;

        let labelOuterHtml = label.outerHTML;
        // tooltip?
        if (field.extra && !!field.extra.tooltip && field.display && field.display.description) {
            let toolTipID: string = `ttip${this.uid}`;
            labelOuterHtml = labelOuterHtml.replace(/>/, ` [ngClass]="{ 'pacem-tooltip': !readonly }" pacemBalloon="#${toolTipID}" [pacemBalloonOptions]="{ position: 'auto', behavior: 'tooltip', disabled: readonly, hoverDelay: 0, hoverTimeout: 0 }">`)
                + `<div hidden id="${toolTipID}">${field.display.description}</div>`;
        }

        tmpl = `<div class="pacem-field form-group" [ngClass]="{ 'pacem-fetching': fetching, 'pacem-has-value': hasValue }" ${fieldAttrs}>`
            + labelOuterHtml
            + (!this.readonly ? ('<div class="pacem-input-container">' //*ngIf="!readonly"
                + wrapperOpener + elOuterHtml + wrapperCloser
                + validatorsTmpl
                + '</div>') // *ngIf="!readonly"
                : detailTmpl//.replace(/\/?>/, ' *ngIf="readonly">')
            ) + '</div>';

        const selector = 'pacem-input';
        let input = this.builder.createComponent(selector, tmpl, formReference);
        let cmpRef: any = input;
        this.compiler
            .compileModuleAndAllComponentsAsync<IPacemWithEntity>(cmpRef)
            .then((factory) => {
                // our component will be inserted after #dynamicContentPlaceHolder
                this.componentRef = this.dynamicComponentTarget.createComponent(factory.componentFactories.find((cmp) => cmp.selector == selector), 0);
                // and here we have access to our dynamic component
                let component = this.componentRef.instance;
                component.entity = this.entity;
                if (fetchData)
                    component.fetchData = PacemUtils.extend({ params: this.parameters }, fetchData);
                this.syncControl();
            });
    }
}

@NgModule({
    imports: [FormsModule, ReactiveFormsModule, CommonModule, PacemUIModule, PacemCoreModule, PacemScaffoldingInternalModule],
    declarations: [PacemField],
    exports: [PacemField, PacemDatetimePicker],
    providers: [PacemExecCommand]
})
export class PacemScaffoldingModule { }