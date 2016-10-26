/// <reference types="core-js" />
import { Compiler, EventEmitter, ViewContainerRef, ElementRef, OnDestroy, OnInit, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { NgControl, ControlValueAccessor, NgModel, NgForm } from '@angular/forms';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
export declare type pacemFieldMetadata = {
    prop: string;
    type: string;
    display: {
        name: string;
        description: string;
        short: string;
        watermark: string;
        null?: string;
        ui: string;
        format: string;
    };
    extra: any;
    isReadOnly: boolean;
    dataType: string;
    isComplexType: boolean;
    isNullable: boolean;
    validators: {
        type: string;
        errorMessage: string;
        params?: any;
    }[];
};
export declare abstract class BaseValueAccessor implements ControlValueAccessor {
    private ngControl;
    constructor(ngControl: NgControl);
    protected _value: any;
    value: any;
    /**
     * Silently changes the model value.
     * @param value new value
     */
    writeValue(value: any): void;
    protected forceWriteValue(value: any): void;
    private onChange;
    private onTouched;
    registerOnChange(fn: (_: any) => void): void;
    registerOnTouched(fn: () => void): void;
}
export declare class PacemExecCommand {
    private getSurroundingNode(selection, tagName);
    static knownCommands: {
        BOLD: string;
        ITALIC: string;
        UNDERLINE: string;
        LINK: string;
        ORDEREDLIST: string;
        UNORDEREDLIST: string;
    };
    exec(command: string, arg?: string, target?: any): Promise<{}>;
}
/**
 * PacemDatetimePicker Component
   TODO: add timezone selection/set (local is currently assumed)
 */
export declare class PacemDatetimePicker extends BaseValueAccessor implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    private model;
    onchange: EventEmitter<Date>;
    private _dateValue;
    dateValue: Date | string;
    private _minDate;
    minDate: string | Date;
    private _maxDate;
    maxDate: string | Date;
    precision: 'day' | 'minute' | 'second';
    private disassembleDate(v);
    private months;
    private dates;
    private a24;
    private a60;
    private years;
    private datesAssembler;
    private subscription;
    private subscription2;
    private _year;
    private year;
    private _month;
    private month;
    private _date;
    private date;
    private _hours;
    private hours;
    private _minutes;
    private minutes;
    private _seconds;
    private seconds;
    constructor(model: NgModel);
    private setupYears();
    ngOnInit(): void;
    ngOnDestroy(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    private buildupDates(evt?);
    private buildup(evt?);
}
export declare class PacemFieldBuilder {
    createComponent(selector: string, template: string, ctrlRef: string, injectDirectives?: any[]): any;
}
export declare class PacemField implements OnChanges, AfterViewInit, OnDestroy {
    private compiler;
    private builder;
    labelElementRef: ElementRef;
    protected dynamicComponentTarget: ViewContainerRef;
    private componentRef;
    private subscription;
    field: pacemFieldMetadata;
    entity: any;
    readonly: boolean;
    parameters: {
        [key: string]: any;
    };
    private _form;
    form: NgForm;
    constructor(compiler: Compiler, builder: PacemFieldBuilder);
    private syncControl(v?);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private dispose();
    private uid;
    private rebuildInputField();
}
export declare class PacemScaffoldingModule {
}
