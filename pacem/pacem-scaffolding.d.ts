import { Compiler, ViewContainerRef, ElementRef, OnDestroy, OnChanges, AfterViewInit, SimpleChanges } from '@angular/core';
import { NgControl, ControlValueAccessor } from '@angular/forms';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
export declare const formControlBinding: any;
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
export declare class PacemFieldBuilder {
    createComponent(selector: string, template: string, ctrlRef: string, injectDirectives?: any[]): any;
}
export declare class PacemField implements OnChanges, AfterViewInit, OnDestroy {
    private compiler;
    private builder;
    labelElementRef: ElementRef;
    protected dynamicComponentTarget: ViewContainerRef;
    private componentRef;
    field: pacemFieldMetadata;
    entity: any;
    readonly: boolean;
    constructor(compiler: Compiler, builder: PacemFieldBuilder);
    ngOnChanges(changes: SimpleChanges): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private uid;
    private rebuildInputField();
}
export declare class PacemScaffoldingModule {
}
