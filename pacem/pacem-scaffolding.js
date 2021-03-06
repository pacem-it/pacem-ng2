"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var pacem_core_1 = require("./pacem-core");
var platform_browser_1 = require("@angular/platform-browser");
var pacem_ui_1 = require("./pacem-ui");
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
var Subject_1 = require("rxjs/Subject");
// Observable class extensions
require("rxjs/add/observable/of");
require("rxjs/add/observable/throw");
require("rxjs/add/observable/fromPromise");
// Observable operators
require("rxjs/add/operator/catch");
require("rxjs/add/operator/distinctUntilChanged");
require("rxjs/add/operator/debounceTime");
require("rxjs/add/operator/map");
var DatasourceFetcher = (function () {
    function DatasourceFetcher(http) {
        this.http = http;
        this.onFetched = new core_1.EventEmitter();
        this.onFetching = new core_1.EventEmitter();
    }
    /**
     * Returns the url and the body dictionary necessary for the request.
     * @param verb
     * @param urlTmpl Url template (`{token}` placeholders accepted)
     * @param body
     */
    DatasourceFetcher.prototype.prepareRequest = function (verb, urlTmpl, params) {
        var isPost = verb === 'post';
        var body = {}, url = urlTmpl;
        var asyncs = [];
        var fnNject = function (prop, value) {
            var pattern = new RegExp("{" + prop + "}", 'ig');
            if (pattern.test(urlTmpl)) {
                url = url.replace(pattern, value);
            }
            else if (!isPost)
                url += (url.indexOf('?') == -1 ? '?' : '&') + prop + '=' + encodeURI(value);
            else
                body[prop] = value;
        };
        for (var prop in params) {
            var value = params[prop];
            fnNject(prop, value);
        }
        return { url: url, body: body };
    };
    DatasourceFetcher.prototype.createDatasource = function (items, valueProperty) {
        var datasource = new Datasource(items.length);
        //datasource.textProperty = data.textProperty;
        datasource.valueProperty = valueProperty;
        Datasource.prototype.splice.apply(datasource, [0, datasource.length].concat(items));
        return datasource;
    };
    DatasourceFetcher.prototype.fetch = function (data, entity) {
        var _this = this;
        var fn = data.fetch;
        if (fn) {
            this.onFetching.emit({});
            var obs = Observable_1.Observable
                .fromPromise(fn)
                .map(function (items) { return _this.createDatasource(items, data.valueProperty); });
            var subs_1 = obs.subscribe(function (_) {
                subs_1.unsubscribe();
                _this.onFetched.emit({});
            });
            return obs;
        }
        //
        var verb = (data.verb || 'get').toLowerCase();
        var isPost = verb === 'post';
        var url = data.sourceUrl;
        var params = data.params || {};
        var dependsOn = data.dependsOn;
        //
        if (dependsOn) {
            params[dependsOn.alias || dependsOn.prop] = entity[dependsOn.prop];
        }
        //
        this.onFetching.emit({});
        var request = this.prepareRequest(verb, url, params);
        var observable = verb === 'post' ? this.http.post(request.url, request.body) : this.http.get(request.url);
        return observable.map(function (r) {
            _this.onFetched.emit({});
            var json = r.json();
            if (!!json.success) {
                var items = json.result
                    .map(function (i) {
                    var value = i, caption = i, tp = data.textProperty, vp = data.valueProperty;
                    if (tp) {
                        caption = i[tp];
                        if (vp)
                            value = i[vp];
                    }
                    return { value: value, caption: caption, entity: i };
                });
                return _this.createDatasource(items, data.valueProperty);
            }
        });
    };
    return DatasourceFetcher;
}());
DatasourceFetcher = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], DatasourceFetcher);
var Datasource = (function (_super) {
    __extends(Datasource, _super);
    function Datasource() {
        return _super.apply(this, arguments) || this;
    }
    return Datasource;
}(Array));
function getDateFormats(dotNetFormat) {
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
function MakeValueAccessorProvider(type) {
    return {
        provide: forms_1.NG_VALUE_ACCESSOR,
        useExisting: core_1.forwardRef(function () { return type; }),
        multi: true
    };
}
var BaseValueAccessor = (function () {
    function BaseValueAccessor(ngControl) {
        this.ngControl = ngControl;
        this.onChange = function (_) { };
        this.onTouched = function () { };
        ngControl.valueAccessor = this;
    }
    Object.defineProperty(BaseValueAccessor.prototype, "value", {
        get: function () { return this._value; },
        set: function (v) {
            if (v !== this._value && !(v == null && this._value == null)) {
                console.log(this['constructor'].name + ": " + JSON.stringify(this._value) + " > " + JSON.stringify(v));
                this._value = v;
                this.onChange(v);
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    /**
     * Silently changes the model value.
     * @param value new value
     */
    BaseValueAccessor.prototype.writeValue = function (value) {
        if (this._value !== value)
            this._value = value;
    };
    BaseValueAccessor.prototype.forceWriteValue = function (value) {
        this._value = value;
        this.onChange(value);
    };
    BaseValueAccessor.prototype.registerOnChange = function (fn) { this.onChange = fn; };
    BaseValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    return BaseValueAccessor;
}());
exports.BaseValueAccessor = BaseValueAccessor;
var RadioControlListValueAccessor = (function (_super) {
    __extends(RadioControlListValueAccessor, _super);
    function RadioControlListValueAccessor(model) {
        return _super.call(this, model) || this;
    }
    return RadioControlListValueAccessor;
}(BaseValueAccessor));
RadioControlListValueAccessor = __decorate([
    core_1.Directive({
        selector: '.pacem-radio-list[ngModel]'
    }),
    __metadata("design:paramtypes", [forms_1.NgModel])
], RadioControlListValueAccessor);
var RadioControlValueAccessor = (function (_super) {
    __extends(RadioControlValueAccessor, _super);
    function RadioControlValueAccessor(_renderer, _elementRef, model, list) {
        var _this = _super.call(this, model) || this;
        _this._renderer = _renderer;
        _this._elementRef = _elementRef;
        _this.list = list;
        return _this;
    }
    RadioControlValueAccessor.prototype.writeValue = function (value) {
        _super.prototype.writeValue.call(this, value);
        this._renderer.setElementProperty(this._elementRef.nativeElement, 'checked', value == this._elementRef.nativeElement.value);
    };
    RadioControlValueAccessor.prototype.changeValue = function (v) {
        var list = this.list;
        if (list)
            list.value = v;
    };
    return RadioControlValueAccessor;
}(BaseValueAccessor));
RadioControlValueAccessor = __decorate([
    core_1.Directive({
        selector: 'input.pacem-radio[type=radio][ngModel]',
        host: { '(change)': 'onChange($event.target.value);changeValue($event.target.value)', '(blur)': 'onTouched()' }
    }),
    __metadata("design:paramtypes", [core_1.Renderer, core_1.ElementRef, forms_1.NgModel, RadioControlListValueAccessor])
], RadioControlValueAccessor);
function MakeValidatorProvider(type) {
    return {
        provide: forms_1.NG_VALIDATORS,
        useExisting: core_1.forwardRef(function () { return type; }),
        multi: true
    };
}
var emptyVal = '';
function isNullOrEmpty(v) {
    return v === null || v === undefined || v === '' || v === emptyVal;
}
//#region VALIDATORS integration
var MinValidator = MinValidator_1 = (function () {
    function MinValidator(min) {
        this._validator = function (control) {
            if (forms_1.Validators.required(control) /* != null && != undefined */)
                return null;
            var v = control.value;
            return v < min ?
                { 'min': { 'minValue': min, 'actualValue': v } } :
                null;
        };
    }
    MinValidator.prototype.validate = function (c) { return this._validator(c); };
    return MinValidator;
}());
MinValidator = MinValidator_1 = __decorate([
    core_1.Directive({
        selector: '[min][formControlName],[min][formControl],[min][ngModel]',
        providers: [MakeValidatorProvider(MinValidator_1)]
    }),
    __param(0, core_1.Attribute('min')),
    __metadata("design:paramtypes", [Object])
], MinValidator);
var MaxValidator = MaxValidator_1 = (function () {
    function MaxValidator(max) {
        this._validator = function (control) {
            if (forms_1.Validators.required(control) /* != null && != undefined */)
                return null;
            var v = control.value;
            return v > max ?
                { 'max': { 'maxValue': max, 'actualValue': v } } :
                null;
        };
    }
    MaxValidator.prototype.validate = function (c) { return this._validator(c); };
    return MaxValidator;
}());
MaxValidator = MaxValidator_1 = __decorate([
    core_1.Directive({
        selector: '[max][formControlName],[max][formControl],[max][ngModel]',
        providers: [MakeValidatorProvider(MaxValidator_1)]
    }),
    __param(0, core_1.Attribute('max')),
    __metadata("design:paramtypes", [Object])
], MaxValidator);
var CompareValidator = CompareValidator_1 = (function () {
    function CompareValidator(operator) {
        var _this = this;
        this._validator = function (control) {
            _this._ctrl = control;
            if (forms_1.Validators.required(control) /* != null && != undefined */)
                return null;
            var v = control.value, bm = _this._benchmark;
            if (v == null)
                v = '';
            if (bm == null)
                bm = '';
            //
            var result = !isNullOrEmpty(v) && (((v > bm && operator != 'greater' && operator != 'greaterOrEqual')
                || (v < bm && operator != 'less' && operator != 'lessOrEqual')
                || ((v == bm) && operator != 'equal' && operator != 'lessOrEqual' && operator != 'greaterOrEqual')
                || (v != bm && operator == 'equal')))
                ?
                    { 'compare': { 'compare': bm, 'actualValue': v } } :
                null;
            return result;
        };
    }
    Object.defineProperty(CompareValidator.prototype, "compareToValue", {
        set: function (v) {
            this._benchmark = v;
            if (this._ctrl)
                this._ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        },
        enumerable: true,
        configurable: true
    });
    CompareValidator.prototype.validate = function (c) { return this._validator(c); };
    return CompareValidator;
}());
__decorate([
    core_1.Input('compare'),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], CompareValidator.prototype, "compareToValue", null);
CompareValidator = CompareValidator_1 = __decorate([
    core_1.Directive({
        selector: '[compare][formControlName],[compare][formControl],[compare][ngModel]',
        providers: [MakeValidatorProvider(CompareValidator_1)]
    }),
    __param(0, core_1.Attribute('operator')),
    __metadata("design:paramtypes", [String])
], CompareValidator);
//#endregion 
var PacemExecCommand = PacemExecCommand_1 = (function () {
    function PacemExecCommand() {
    }
    PacemExecCommand.prototype.getSurroundingNode = function (selection, tagName) {
        var node = selection.anchorNode;
        while (node && node.nodeName.toUpperCase() !== tagName.toUpperCase()) {
            node = node.parentNode;
        }
        return node;
    };
    PacemExecCommand.prototype.exec = function (command, arg, target) {
        var _this = this;
        ///<param name="command" type="String" />
        ///<param name="arg" type="String" optional="true" />
        ///<param name="target" type="String" optional="true" />
        var knownCommands = PacemExecCommand_1.knownCommands;
        var promise = new Promise(function (resolve, reject) {
            switch (command) {
                case knownCommands.LINK:
                    var selection = document.getSelection();
                    var anchorNode = _this.getSurroundingNode(selection, 'A');
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
                        anchorNode = _this.getSurroundingNode(selection, 'A');
                        if (anchorNode)
                            anchorNode.setAttribute('target', target || '_blank');
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
    };
    return PacemExecCommand;
}());
PacemExecCommand.knownCommands = { BOLD: 'bold', ITALIC: 'italic', UNDERLINE: 'underline', LINK: 'hyperlink', ORDEREDLIST: 'orderedList', UNORDEREDLIST: 'unorderedList' };
PacemExecCommand = PacemExecCommand_1 = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PacemExecCommand);
exports.PacemExecCommand = PacemExecCommand;
var keys = {
    UP: 38,
    DOWN: 40,
    TAB: 9,
    ENTER: 13
};
/**
 * PacemDatetimePicker Component
   TODO: add timezone selection/set (local is currently assumed)
 */
var PacemDatetimePicker = (function (_super) {
    __extends(PacemDatetimePicker, _super);
    //#endregion
    function PacemDatetimePicker(model) {
        var _this = _super.call(this, model) || this;
        _this.model = model;
        _this.onchange = new core_1.EventEmitter();
        _this.precision = 'day';
        _this.months = [];
        _this.dates = [];
        _this.a24 = [];
        _this.a60 = [];
        _this.years = [];
        _this.datesAssembler = new Subject_1.Subject();
        _this._hours = 0;
        _this._minutes = 0;
        _this._seconds = 0;
        var today = new Date();
        var year = _this.year = today.getFullYear();
        _this.minDate = new Date(year - 100, 0, 1);
        _this.maxDate = new Date(year + 10, 11, 31);
        _this.month = today.getMonth();
        //
        var months = [], hours = [], minutes = [];
        // months
        for (var i = 0; i < 12; i++) {
            months.push({ value: i, date: new Date(year, i, 1) });
        }
        _this.months = months;
        // hours
        for (var i = 0; i < 24; i++) {
            hours.push(i);
        }
        _this.a24 = hours;
        // minutes/secs
        for (var i = 0; i < 60; i++) {
            minutes.push(i);
        }
        _this.a60 = minutes;
        return _this;
    }
    Object.defineProperty(PacemDatetimePicker.prototype, "dateValue", {
        get: function () {
            return this._dateValue;
        },
        set: function (v) {
            var date = pacem_core_1.PacemUtils.parseDate(v);
            var former = this._dateValue && this._dateValue.valueOf();
            var current = date && date.valueOf();
            if (former !== current) {
                this._dateValue = date;
                this.disassembleDate(date);
                if (date)
                    this.buildupDates();
                this.onchange.emit(date);
                this.value = v; // keep same type (Date or string equivalent)
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "minDate", {
        set: function (v) {
            if (!v)
                return;
            this._minDate = pacem_core_1.PacemUtils.parseDate(v);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "maxDate", {
        set: function (v) {
            if (!v)
                return;
            this._maxDate = pacem_core_1.PacemUtils.parseDate(v);
        },
        enumerable: true,
        configurable: true
    });
    PacemDatetimePicker.prototype.disassembleDate = function (v) {
        if (!v)
            return;
        this._year = v.getFullYear();
        this._month = v.getMonth();
        this._date = v.getDate();
        this._hours = v.getHours();
        this._minutes = v.getMinutes();
        this._seconds = v.getSeconds();
    };
    Object.defineProperty(PacemDatetimePicker.prototype, "year", {
        get: function () {
            return this._year;
        },
        set: function (v) {
            if (this._year != v) {
                this._year = isNullOrEmpty(v) ? emptyVal : +v;
                this.buildupDates();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "month", {
        get: function () {
            return this._month;
        },
        set: function (v) {
            if (this._month != v) {
                this._month = isNullOrEmpty(v) ? emptyVal : +v;
                this.buildupDates();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "date", {
        get: function () {
            return this._date;
        },
        set: function (v) {
            if (this._date != v) {
                this._date = isNullOrEmpty(v) ? emptyVal : +v;
                this.buildup();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "hours", {
        get: function () {
            return this._hours;
        },
        set: function (v) {
            if (this._hours != v) {
                this._hours = +v;
                this.buildup();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "minutes", {
        get: function () {
            return this._minutes;
        },
        set: function (v) {
            if (this._minutes != v) {
                this._minutes = +v;
                this.buildup();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemDatetimePicker.prototype, "seconds", {
        get: function () {
            return this._seconds;
        },
        set: function (v) {
            if (this._seconds != v) {
                this._seconds = +v;
                this.buildup();
            }
        },
        enumerable: true,
        configurable: true
    });
    PacemDatetimePicker.prototype.setupYears = function () {
        var years = [];
        for (var i = this._minDate.getFullYear(); i <= this._maxDate.getFullYear(); i++) {
            years.push(i);
        }
        this.years = years;
    };
    PacemDatetimePicker.prototype.ngOnInit = function () {
        var _this = this;
        this.setupYears();
        this.subscription = this.datesAssembler.asObservable()
            .debounceTime(20)
            .subscribe(function (dates) {
            _this.dates = dates;
            var adjusted = dates.length ? Math.min(_this.date, dates[dates.length - 1].value) : null;
            if (adjusted != _this.date)
                _this.date = adjusted;
            else
                _this.buildup();
        });
        this.subscription2 = this.model.valueChanges.subscribe(function (c) {
            _this.dateValue = c;
        });
    };
    PacemDatetimePicker.prototype.ngOnDestroy = function () {
        this.subscription2.unsubscribe();
        this.subscription.unsubscribe();
    };
    PacemDatetimePicker.prototype.ngOnChanges = function (changes) {
        if (changes['minDate'] || changes['maxDate'])
            this.setupYears();
    };
    PacemDatetimePicker.prototype.ngAfterViewInit = function () {
        this.buildupDates();
    };
    PacemDatetimePicker.prototype.buildupDates = function (evt) {
        if (evt)
            evt.stopPropagation();
        var v = this;
        if (!isNullOrEmpty(v.year) && !isNullOrEmpty(v.month)) {
            var day = 1, dates = [], isDate = function (k) {
                try {
                    var monthvalue = +v.month, parsed = new Date(+v.year, +v.month, k);
                    return parsed.getMonth() == monthvalue;
                }
                catch (e) {
                    return false;
                }
            };
            do {
                dates.push({ value: day, date: new Date(+v.year, +v.month, day) });
            } while (isDate(++day));
            this.datesAssembler.next(dates);
        }
        else
            this.datesAssembler.next([]);
    };
    PacemDatetimePicker.prototype.buildup = function (evt) {
        if (evt)
            evt.stopPropagation();
        //
        var v = this;
        var year = '', month = '', date = '';
        if (isNullOrEmpty(v.year) || isNullOrEmpty(v.month) || isNullOrEmpty(v.date))
            this.dateValue = null;
        else
            //
            try {
                var value = new Date();
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
            }
            catch (e) {
                this.dateValue = null;
            }
    };
    return PacemDatetimePicker;
}(BaseValueAccessor));
__decorate([
    core_1.Output('dateValueChange'),
    __metadata("design:type", Object)
], PacemDatetimePicker.prototype, "onchange", void 0);
__decorate([
    core_1.Input('min'),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PacemDatetimePicker.prototype, "minDate", null);
__decorate([
    core_1.Input('max'),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [Object])
], PacemDatetimePicker.prototype, "maxDate", null);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemDatetimePicker.prototype, "precision", void 0);
PacemDatetimePicker = __decorate([
    core_1.Component({
        selector: 'pacem-datetime-picker',
        template: "<div class=\"pacem-datetime-picker\">\n    <div class=\"pacem-datetime-picker-year\">\n    <select class=\"pacem-select\" [(ngModel)]=\"year\" #yearel>\n        <option value=\"\">...</option>\n        <option *ngFor=\"let yr of years\" [value]=\"yr\">{{ yr }}</option>\n    </select></div>\n    <div class=\"pacem-datetime-picker-month\">\n    <select class=\"pacem-select\" [(ngModel)]=\"month\" #monthel>\n        <option value=\"\">...</option>\n        <option *ngFor=\"let mth of months\" [value]=\"mth.value\">{{ mth.date | date: 'MMM' }}</option>\n    </select></div>\n    <div class=\"pacem-datetime-picker-date\">\n    <select class=\"pacem-select\" [(ngModel)]=\"date\" [disabled]=\"(yearel.value === '' || monthel.value === '')\">\n        <option value=\"\">...</option>\n        <option *ngFor=\"let dt of dates\" [value]=\"dt.value\" [disabled]=\"dt.date > _maxDate || dt.date < _minDate\">{{ dt.date | date: 'EEE dd' }}</option>\n    </select></div>\n    <div class=\"pacem-datetime-picker-hours\" *ngIf=\"precision != 'day'\">\n    <select class=\"pacem-select\" [(ngModel)]=\"hours\">\n        <option *ngFor=\"let hr of a24\" [value]=\"hr\">{{ hr | number:'2.0-0' }}</option>\n    </select></div>\n    <div class=\"pacem-datetime-picker-minutes\" *ngIf=\"precision != 'day'\">\n    <select class=\"pacem-select\" [(ngModel)]=\"minutes\">\n        <option *ngFor=\"let min of a60\" [value]=\"min\">{{ min | number:'2.0-0' }}</option>\n    </select></div>\n    <div class=\"pacem-datetime-picker-seconds\" *ngIf=\"precision == 'second'\">\n    <select class=\"pacem-select\" [(ngModel)]=\"seconds\">\n        <option *ngFor=\"let sec of a60\" [value]=\"sec\">{{ sec | number:'2.0-0' }}</option>\n    </select></div>\n    <dl class=\"pacem-datetime-picker-preview\" [pacemHidden]=\"!value\">\n        <dt>local:</dt><dd>{{ dateValue | date:'medium' }}</dd>\n        <dt>iso:</dt><dd>{{ dateValue?.toISOString() }}</dd>\n    </dl>\n</div>", providers: [forms_1.NgModel]
    }),
    __metadata("design:paramtypes", [forms_1.NgModel])
], PacemDatetimePicker);
exports.PacemDatetimePicker = PacemDatetimePicker;
var PacemAutocomplete = (function (_super) {
    __extends(PacemAutocomplete, _super);
    function PacemAutocomplete(model, root) {
        var _this = _super.call(this, model) || this;
        _this.model = model;
        _this.root = root;
        _this.onquery = new core_1.EventEmitter();
        _this.searchTermStream = new Subject_1.Subject();
        _this.caption = '';
        _this.focusIndex = -1;
        _this.subscription1 = _this.model.valueChanges
            .subscribe(function (_) { return _this.updateCaption(_); });
        return _this;
    }
    PacemAutocomplete.prototype.resize = function (popup, benchmark) {
        popup.style.minWidth = benchmark.offsetWidth + 'px';
    };
    PacemAutocomplete.prototype.fetchTerm = function (term) {
        this.searchTermStream.next(term);
    };
    PacemAutocomplete.prototype.updateCaption = function (value) {
        if (value == null)
            return;
        var caption = '';
        if (this.textProperty && this.textProperty in value)
            caption = value[this.textProperty];
        else
            caption = value;
        this.caption = caption;
    };
    PacemAutocomplete.prototype.selectValue = function (ndx) {
        if (!(this.datasource && this.datasource.length > ndx)) {
            this.focusIndex = -1;
            return;
        }
        this.focusIndex = ndx;
        var value = this.datasource[ndx].entity;
        this.value = value;
        this.searchTermStream.next(null);
        this.datasource.splice(0);
    };
    PacemAutocomplete.prototype.ngOnChanges = function (changes) {
        var c = changes["datasource"];
        if (c && c.currentValue)
            this.focusIndex = Math.min(0, c.currentValue.length - 1);
        else
            this.focusIndex = -1;
    };
    PacemAutocomplete.prototype.onFocus = function (evt) {
        var _this = this;
        this.subscription = this.searchTermStream
            .debounceTime(600)
            .distinctUntilChanged()
            .subscribe(function (_) {
            if (_ == null)
                return;
            if (_this.model.value)
                _this.value = null;
            _this.onquery.emit(_);
        });
    };
    PacemAutocomplete.prototype.onBlur = function (evt) {
        this.subscription.unsubscribe();
    };
    PacemAutocomplete.prototype.onClick = function (evt, ndx) {
        evt.preventDefault();
        //evt.stopPropagation();
        this.selectValue(ndx);
    };
    PacemAutocomplete.prototype.onKeyup = function (evt) {
        if (evt.keyCode == keys.ENTER) {
            evt.preventDefault();
            if (this.focusIndex >= 0)
                this.selectValue(this.focusIndex);
        }
    };
    PacemAutocomplete.prototype.onKeydown = function (evt) {
        switch (evt.keyCode) {
            case keys.TAB:
                if (this.focusIndex >= 0)
                    this.selectValue(this.focusIndex);
                break;
            case keys.UP:
            case keys.DOWN:
                evt.preventDefault();
                var ds = this.datasource;
                if (!(ds && ds.length))
                    this.focusIndex = -1;
                var ndx = this.focusIndex + (evt.keyCode == keys.UP ? -1 : 1);
                this.focusIndex = (ndx + ds.length) % ds.length;
                break;
        }
    };
    PacemAutocomplete.prototype.ngOnDestroy = function () {
        this.subscription1.unsubscribe();
    };
    return PacemAutocomplete;
}(BaseValueAccessor));
__decorate([
    core_1.Input(),
    __metadata("design:type", Datasource)
], PacemAutocomplete.prototype, "datasource", void 0);
__decorate([
    core_1.Output('query'),
    __metadata("design:type", Object)
], PacemAutocomplete.prototype, "onquery", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemAutocomplete.prototype, "placeholder", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemAutocomplete.prototype, "textProperty", void 0);
PacemAutocomplete = __decorate([
    core_1.Component({
        selector: 'pacem-autocomplete',
        template: "<div class=\"pacem-autocomplete\">\n    <input  (keyup)=\"onKeyup($event);fetchTerm(search.value)\"\n            (search)=\"fetchTerm(search.value)\"\n            (keydown)=\"onKeydown($event)\"\n            (blur)=\"onBlur($event)\"\n            (focus)=\"onFocus($event);\"\n            [placeholder]=\"placeholder\"\n            type=\"search\" #search \n            [attr.id]=\"root.nativeElement.id +'_acq'\"\n            class=\"pacem-input\"\n            (popup)=\"resize(balloon, search)\"\n            [ngClass]=\"{ 'ng-invalid': model.invalid, 'ng-dirty': model.dirty, 'ng-valid': model.valid, 'ng-pristine': model.pristine }\"\n            [value]=\"caption\"\n            [pacemBalloon]=\"balloon\" [pacemBalloonOptions]=\"{ position: 'bottom', trigger: 'focus', behavior: 'menu' }\" />\n    <div #balloon hidden><ol [hidden]=\"!datasource?.length\">\n        <li *ngFor=\"let item of datasource; let ndx = index\" \n            (mousedown)=\"onClick($event, ndx)\"\n            [ngClass]=\"{ 'pacem-focused': focusIndex == ndx }\" [innerHTML]=\"item.caption | pacemHighlight:search.value\"></li>\n    </ol></div>\n</div>"
    }),
    __metadata("design:paramtypes", [forms_1.NgModel, core_1.ElementRef])
], PacemAutocomplete);
var PacemContentEditable = (function (_super) {
    __extends(PacemContentEditable, _super);
    function PacemContentEditable(element, sce, execCommand, ctrl) {
        var _this = _super.call(this, ctrl) || this;
        _this.element = element;
        _this.sce = sce;
        _this.execCommand = execCommand;
        _this.dashboard = [];
        _this.exec = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var cmd = (ev.srcElement || ev.target).dataset['pacemCommand'];
            _this.execCommand.exec(cmd).then(function () { return _this.onTyped(); });
        };
        _this.subscription = ctrl.valueChanges.subscribe(function (_) {
            if (_this.container && _ != _this.container.innerHTML)
                _this.setViewValue(_);
        });
        return _this;
    }
    PacemContentEditable.prototype.ngOnInit = function () {
        this.container = this.element.nativeElement;
        var dashboard = document.createElement('div');
        this.container.parentElement.insertBefore(dashboard, this.container.nextSibling);
        // add specific buttons
        for (var cmdName in PacemExecCommand.knownCommands) {
            var cmd = PacemExecCommand.knownCommands[cmdName];
            var btn = document.createElement('button');
            btn.className = "pacem-command pacem-" + cmdName.toLowerCase();
            btn.dataset['pacemCommand'] = btn.innerText = cmd;
            btn.addEventListener('click', this.exec, false);
            dashboard.insertBefore(btn, null);
            this.dashboard.push(btn);
        }
    };
    PacemContentEditable.prototype.ngOnDestroy = function () {
        var _this = this;
        this.subscription.unsubscribe();
        this.dashboard.forEach(function (btn) {
            btn.removeEventListener('click', _this.exec, false);
        });
        this.dashboard.splice(0);
        this.container.nextElementSibling.remove();
    };
    PacemContentEditable.prototype.viewToModelUpdate = function (newValue) {
        var html = newValue || this.container.innerHTML;
        if (html == '<br>')
            html = '';
        if (html != this._value) {
            this.value = html;
        }
    };
    PacemContentEditable.prototype.onKeydown = function (evt) {
        var _this = this;
        var $execCommand = this.execCommand, commands = PacemExecCommand.knownCommands;
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
                    $execCommand.exec(commands.LINK).then(function () { return _this.onTyped(); });
                    break;
            }
        }
    };
    PacemContentEditable.prototype.onTyped = function () {
        this.viewToModelUpdate(this.container.innerHTML);
    };
    ;
    PacemContentEditable.prototype.setViewValue = function (v) {
        this.viewValue = this.sce.bypassSecurityTrustHtml(v || this.value);
    };
    return PacemContentEditable;
}(BaseValueAccessor));
PacemContentEditable = __decorate([
    core_1.Directive({
        selector: '[contenteditable]',
        providers: [PacemExecCommand],
        host: {
            '(blur)': "onTyped()",
            '(keyup)': "onTyped()",
            '(change)': "onTyped()",
            '(keydown)': "onKeydown($event)",
            '[innerHTML]': "viewValue"
        }
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, platform_browser_1.DomSanitizer, PacemExecCommand, forms_1.NgControl])
], PacemContentEditable);
var PacemThumbnail = (function (_super) {
    __extends(PacemThumbnail, _super);
    function PacemThumbnail(model) {
        var _this = _super.call(this, model) || this;
        _this.model = model;
        _this.mode = 'binary';
        return _this;
    }
    Object.defineProperty(PacemThumbnail.prototype, "source", {
        get: function () {
            switch (this.mode) {
                case 'url':
                    return this.value;
                case 'binary':
                    return 'data:image/png;base64,' + this.value;
            }
        },
        enumerable: true,
        configurable: true
    });
    PacemThumbnail.prototype.onchange = function (dataUrl) {
        var _this = this;
        this.changing = false;
        pacem_core_1.PacemUtils.cropImage(dataUrl, this.width, this.height)
            .then(function (resizedDataUrl) {
            switch (_this.mode) {
                case 'url':
                    _this.value = resizedDataUrl;
                    break;
                case 'binary':
                    _this.value = resizedDataUrl.substr(resizedDataUrl.indexOf(',') + 1);
                    break;
            }
        });
    };
    return PacemThumbnail;
}(BaseValueAccessor));
__decorate([
    core_1.ViewChild('lightbox'),
    __metadata("design:type", pacem_ui_1.PacemLightbox)
], PacemThumbnail.prototype, "lightbox", void 0);
__decorate([
    core_1.ViewChild('snapshot'),
    __metadata("design:type", pacem_ui_1.PacemSnapshot)
], PacemThumbnail.prototype, "snapshot", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], PacemThumbnail.prototype, "mode", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemThumbnail.prototype, "width", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PacemThumbnail.prototype, "height", void 0);
PacemThumbnail = __decorate([
    core_1.Component({
        selector: 'pacem-thumbnail[ngModel]',
        template: "<img [ngStyle]=\"{ 'width': width+'px', 'height': height+'px' }\" class=\"pacem-thumbnail\" [attr.src]=\"source\" (click)=\"changing=true\" />\n<pacem-lightbox #lightbox [show]=\"changing\" (close)=\"changing=false\">\n    <pacem-snapshot (select)=\"onchange($event)\" #snapshot>\n    Webcam access is <b>impossile</b> on this machine!\n    </pacem-snapshot>\n</pacem-lightbox>\n"
    }),
    __metadata("design:paramtypes", [forms_1.NgModel])
], PacemThumbnail);
var PacemSelectMany = (function (_super) {
    __extends(PacemSelectMany, _super);
    function PacemSelectMany(ref, ctrl) {
        var _this = _super.call(this, ctrl) || this;
        _this.ref = ref;
        _this.ctrl = ctrl;
        _this.uid = pacem_core_1.PacemUtils.uniqueCode();
        _this.subscription = ctrl.valueChanges.subscribe(function (_) {
            return _this.checkValue();
        });
        return _this;
    }
    PacemSelectMany.prototype.toggle = function (evt, item) {
        evt.preventDefault();
        evt.stopPropagation();
        item.selected = !item.selected;
        this.updateArrayOfValues();
    };
    PacemSelectMany.prototype.updateArrayOfValues = function () {
        if (this.datasource) {
            var value = [];
            Array.prototype.splice.apply(value, [0, value.length].concat(this.datasource.filter(function (_) { return _.selected === true; }).map(function (_) { return _.entity; })));
            this.value = (value.length ? value : null);
        }
    };
    PacemSelectMany.prototype.updateDatasource = function () {
        var _this = this;
        if (!this.datasource)
            return;
        var items = this.value;
        this.datasource.forEach(function (_) {
            var valueProp = _this.datasource.valueProperty;
            var value = _.value;
            var pred = function (i) { return i == value; };
            if (valueProp)
                pred = function (i) { return i[valueProp] == value; };
            _.selected = items ? (items.findIndex(pred) > -1) : false;
        });
        this.ref.markForCheck();
    };
    PacemSelectMany.prototype.checkValue = function () {
        this.updateDatasource();
    };
    PacemSelectMany.prototype.ngOnChanges = function (changes) {
        var c = changes['datasource'];
        if (c && c.currentValue)
            this.updateDatasource();
    };
    PacemSelectMany.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    return PacemSelectMany;
}(BaseValueAccessor));
__decorate([
    core_1.Input(),
    __metadata("design:type", Datasource)
], PacemSelectMany.prototype, "datasource", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemSelectMany.prototype, "readonly", void 0);
PacemSelectMany = __decorate([
    core_1.Component({
        selector: 'pacem-select-many[ngModel]',
        template: "<ul class=\"pacem-select-many\" *ngIf=\"!readonly\"><li *ngFor=\"let item of datasource; let ndx=index\">\n    <input type=\"checkbox\" [value]=\"item.value\" (change)=\"toggle($event, item)\" [checked]=\"item.selected\" [id]=\"uid+'_'+ndx\" />\n    <label [attr.for]=\"uid+'_'+ndx\">{{ item.caption }}</label>\n</li></ul>\n<ul class=\"pacem-select-many\" *ngIf=\"readonly\">\n    <li [hidden]=\"!item.selected\" *ngFor=\"let item of datasource\"><span class=\"pacem-readonly\">{{ item.caption }}</span></li>\n</ul>",
        changeDetection: core_1.ChangeDetectionStrategy.OnPush
    }),
    __metadata("design:paramtypes", [core_1.ChangeDetectorRef, forms_1.NgModel])
], PacemSelectMany);
var PacemDefaultSelectOption = (function () {
    function PacemDefaultSelectOption(select, optionRef) {
        this.select = select;
        this.optionRef = optionRef;
        this.defaultValues = [];
    }
    PacemDefaultSelectOption.prototype.ngDoCheck = function () {
        if (this.defaultValues.indexOf(this.select.value) >= 0 || this.select.value === undefined)
            this.select.writeValue(this.optionRef.nativeElement.value);
    };
    return PacemDefaultSelectOption;
}());
__decorate([
    core_1.Input('pacemDefaultSelectOption'),
    __metadata("design:type", Array)
], PacemDefaultSelectOption.prototype, "defaultValues", void 0);
PacemDefaultSelectOption = __decorate([
    core_1.Directive({
        selector: 'option[pacemDefaultSelectOption]'
    }),
    __metadata("design:paramtypes", [forms_1.SelectControlValueAccessor, core_1.ElementRef])
], PacemDefaultSelectOption);
var PacemScaffoldingInternalModule = (function () {
    function PacemScaffoldingInternalModule() {
    }
    return PacemScaffoldingInternalModule;
}());
PacemScaffoldingInternalModule = __decorate([
    core_1.NgModule({
        imports: [forms_1.FormsModule, common_1.CommonModule, pacem_ui_1.PacemUIModule, pacem_core_1.PacemCoreModule],
        declarations: [CompareValidator, MinValidator, MaxValidator, PacemDatetimePicker, RadioControlValueAccessor, RadioControlListValueAccessor,
            PacemSelectMany, PacemAutocomplete, PacemDefaultSelectOption, PacemContentEditable, PacemThumbnail],
        exports: [CompareValidator, MinValidator, MaxValidator, PacemDatetimePicker, RadioControlValueAccessor, RadioControlListValueAccessor,
            PacemSelectMany, PacemAutocomplete, PacemDefaultSelectOption, PacemContentEditable, PacemThumbnail],
        providers: [PacemExecCommand, DatasourceFetcher]
    }),
    __metadata("design:paramtypes", [])
], PacemScaffoldingInternalModule);
var PacemFieldBuilder = (function () {
    function PacemFieldBuilder() {
    }
    PacemFieldBuilder.prototype.createComponent = function (selector, template, ctrlRef, injectDirectives) {
        var PacemFieldDynamicField = (function () {
            //private differer: KeyValueDiffer;
            function PacemFieldDynamicField(ref, fetcher /*,
                private differs: KeyValueDiffers*/) {
                var _this = this;
                this.ref = ref;
                this.fetcher = fetcher; /*,
                private differs: KeyValueDiffers*/
                this.checkHasValue = function () {
                    var ctrl = _this.ctrl;
                    if (ctrl && ctrl.valueAccessor) {
                        var _ = ctrl.value;
                        _this.hasValue = (_ !== undefined && _ !== null && _ !== '');
                    }
                };
                this.sub1 = this.fetcher.onFetching.subscribe(function (_) {
                    _this.fetching = true;
                    //this.ref.detectChanges();
                });
                this.sub2 = this.fetcher.onFetched.subscribe(function (_) {
                    _this.fetching = false;
                    //this.ref.detectChanges();
                });
            }
            Object.defineProperty(PacemFieldDynamicField.prototype, "model", {
                get: function () {
                    return this.ctrl;
                },
                enumerable: true,
                configurable: true
            });
            PacemFieldDynamicField.prototype.ngAfterViewInit = function () {
                var ctrl = this.ctrl;
                if (ctrl && ctrl.valueAccessor) {
                    var fn = this.checkHasValue;
                    this.subv = ctrl.valueChanges.subscribe(fn);
                    fn();
                }
            };
            PacemFieldDynamicField.prototype.ngOnInit = function () {
                if (this.fetchData)
                    this.fetch();
            };
            PacemFieldDynamicField.prototype.ngOnChanges = function (changes) {
                var c = changes['fetchData'];
                if (c && c.currentValue)
                    this.fetch();
            };
            PacemFieldDynamicField.prototype.fetch = function (extend) {
                var _this = this;
                if (extend) {
                    this.fetchData.params = this.fetchData.params || {};
                    pacem_core_1.PacemUtils.extend(this.fetchData.params, extend);
                }
                //this.differer = this.differs.find(this.fetchData).create(null);
                if (this.subscription)
                    this.subscription.unsubscribe();
                this.subscription = this.fetcher
                    .fetch(this.fetchData, this.entity)
                    .subscribe(function (ds) {
                    _this.datasource = ds;
                    _this.ref.markForCheck();
                });
            };
            PacemFieldDynamicField.prototype.ngOnDestroy = function () {
                if (this.subscription)
                    this.subscription.unsubscribe();
                if (this.subv)
                    this.subv.unsubscribe();
                this.sub1.unsubscribe();
                this.sub2.unsubscribe();
            };
            return PacemFieldDynamicField;
        }());
        __decorate([
            core_1.Input(),
            __metadata("design:type", Object)
        ], PacemFieldDynamicField.prototype, "entity", void 0);
        __decorate([
            core_1.Input(),
            __metadata("design:type", Object)
        ], PacemFieldDynamicField.prototype, "fetchData", void 0);
        __decorate([
            core_1.ViewChild(ctrlRef),
            __metadata("design:type", forms_1.NgModel)
        ], PacemFieldDynamicField.prototype, "ctrl", void 0);
        PacemFieldDynamicField = __decorate([
            core_1.Component({
                selector: selector,
                template: template,
                providers: injectDirectives /*,
                changeDetection: ChangeDetectionStrategy.OnPush*/
            }),
            __metadata("design:paramtypes", [core_1.ChangeDetectorRef,
                DatasourceFetcher /*,
                private differs: KeyValueDiffers*/])
        ], PacemFieldDynamicField);
        ;
        var PacemFieldDynamicModule = (function () {
            function PacemFieldDynamicModule() {
            }
            return PacemFieldDynamicModule;
        }());
        PacemFieldDynamicModule = __decorate([
            core_1.NgModule({
                imports: [forms_1.FormsModule, common_1.CommonModule, pacem_ui_1.PacemUIModule, pacem_core_1.PacemCoreModule, PacemScaffoldingInternalModule],
                declarations: [PacemFieldDynamicField],
                exports: [PacemFieldDynamicField]
            }),
            __metadata("design:paramtypes", [])
        ], PacemFieldDynamicModule);
        return PacemFieldDynamicModule;
    };
    return PacemFieldBuilder;
}());
PacemFieldBuilder = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], PacemFieldBuilder);
exports.PacemFieldBuilder = PacemFieldBuilder;
var PacemField = (function () {
    function PacemField(compiler, builder) {
        this.compiler = compiler;
        this.builder = builder;
        this.parameters = [];
        this.uid = "_" + pacem_core_1.PacemUtils.uniqueCode();
    }
    Object.defineProperty(PacemField.prototype, "form", {
        set: function (v) {
            if (v == this._form)
                return;
            this._form = v;
            this.syncControl();
        },
        enumerable: true,
        configurable: true
    });
    PacemField.prototype.syncControl = function (v) {
        if (this.readonly)
            return;
        var model = (this.componentRef && this.componentRef.instance && this.componentRef.instance.model);
        if (model) {
            var frmCtrl = this._form && this._form.control, name_1 = this.field.prop;
            if (frmCtrl && !frmCtrl.contains(name_1))
                frmCtrl.addControl(name_1, model.control);
        }
    };
    PacemField.prototype.ngOnChanges = function (changes) {
        // only handle reference changes (for now)
        var c;
        if ((c = changes['field'] || changes['readonly']) && !c.isFirstChange()) {
            this.rebuildInputField();
        }
        if (this.componentRef && this.componentRef.instance) {
            if ((c = changes['entity']) && !c.isFirstChange())
                this.componentRef.instance.entity = c.currentValue;
        }
    };
    PacemField.prototype.ngAfterViewInit = function () {
        this.rebuildInputField();
    };
    PacemField.prototype.ngOnDestroy = function () {
        this.dispose();
    };
    PacemField.prototype.dispose = function () {
        if (this.componentRef) {
            var model = (this.componentRef.instance && this.componentRef.instance.model);
            if (model) {
                var frmCtrl = this._form && this._form.control, name_2 = this.field.prop;
                if (frmCtrl && frmCtrl.contains(name_2))
                    frmCtrl.removeControl(name_2);
            }
            this.componentRef.destroy();
        }
        if (this.subscription && !this.subscription.closed)
            this.subscription.unsubscribe();
    };
    PacemField.prototype.rebuildInputField = function () {
        var _this = this;
        this.dispose();
        if (!this.field || !this.entity)
            return;
        //
        var field = this.field;
        var caption = (field.display && field.display.name) || field.prop;
        //
        var tmpl, detailTmpl, tagName = 'input', innerHtml, wrapperOpener = '', wrapperCloser = '', fieldAttrs = '', fetchData;
        var attrs = {
            'placeholder': (field.display && field.display.watermark) || '',
            'name': field.prop,
            'id': this.uid,
            'class': 'pacem-input',
            '[(ngModel)]': "entity." + field.prop
        };
        // label
        var label = document.createElement('label');
        label.htmlFor = this.uid;
        label.innerText = caption;
        pacem_core_1.PacemUtils.addClass(label, 'pacem-label');
        // setting what will be the `#name => ngModel` template reference (for validation)
        var formReference = (field.prop + this.uid /*PacemUtils.uniqueCode()*/).toLowerCase();
        attrs['#' + formReference] = 'ngModel';
        //attrs['#' + field.prop] = 'ngForm';
        switch (field.display && field.display.ui) {
            // TODO: remove this (use dataType = 'HTML' instead).
            case 'contentEditable':
                console.warn('`contentEditable` ui hint is deprecated. Lean on `dataType` equal to \'HTML\' instead.');
                tagName = 'div';
                attrs['contenteditable'] = 'true';
                attrs['class'] = 'pacem-contenteditable';
                detailTmpl = "<div class=\"pacem-readonly\" [innerHTML]=\"entity." + field.prop + "\"></div>";
                break;
            case 'snapshot':
                tagName = 'pacem-thumbnail';
                var w = attrs['[width]'] = field.extra.width;
                var h = attrs['[height]'] = field.extra.height;
                var mode = attrs['mode'] = field.type.toLowerCase() === 'string' ? 'string' : 'binary';
                detailTmpl = "<img class=\"pacem-readonly\" width=\"" + w + "\" height=\"" + h + "\" [attr.src]=\"'" + (mode == "string" ? "" : "data:image/png;base64,") + "'+entity." + field.prop + "\" />";
                break;
            case 'oneToMany':
                // select
                tagName = 'select';
                attrs['(mousewheel)'] = '$event.preventDefault()';
                attrs['class'] = 'pacem-select';
                innerHtml = "<option *ngFor=\"let item of datasource\" [value]=\"item.value\">{{ item.caption }}</option>";
                var watermark = attrs['placeholder'];
                delete attrs['placeholder'];
                if (watermark)
                    innerHtml = "<option value=\"\" [pacemDefaultSelectOption]=\"[null]\" class=\"pacem-watermark\">" + watermark + "</option>" + innerHtml;
                fetchData = field.extra;
                var compareTo = field.prop;
                if (fetchData.valueProperty)
                    compareTo = field.prop + '.' + fetchData.valueProperty;
                detailTmpl = "<template ngFor \n            [ngForOf]=\"datasource\" \n            let-item=\"$implicit\" \n            let-ndx=\"index\"><span class=\"pacem-readonly\" *ngIf=\"item.value == entity." + compareTo + "\">{{ item.caption }}</span></template>";
                break;
            case 'manyToMany':
                // checkboxlist
                tagName = 'pacem-select-many';
                attrs['[datasource]'] = 'datasource';
                delete attrs['class'];
                delete attrs['placeholder'];
                fetchData = field.extra;
                detailTmpl = "<pacem-select-many [ngModel]=\"entity." + field.prop + "\" [datasource]=\"datasource\" [readonly]=\"true\"></pacem-select-many>";
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
                    detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + "?." + fetchData.textProperty + " }}</span>";
                }
                break;
            default:
                switch ((field.dataType || field.type).toLowerCase()) {
                    case 'html':
                        tagName = 'div';
                        attrs['contenteditable'] = 'true';
                        attrs['class'] = 'pacem-contenteditable';
                        detailTmpl = "<div class=\"pacem-readonly\" [innerHTML]=\"entity." + field.prop + "\"></div>";
                        break;
                    case 'enumeration':
                        // radiobutton list
                        tagName = 'ol';
                        attrs['class'] = 'pacem-radio-list';
                        innerHtml = '';
                        detailTmpl = '<span class="pacem-readonly">';
                        this.field.extra.enum.forEach(function (kvp, j) {
                            detailTmpl += "<span *ngIf=\"" + kvp.value + " == entity." + field.prop + "\">" + kvp.caption + "</span>";
                            innerHtml +=
                                "<li><input [(ngModel)]=\"" + attrs['[(ngModel)]'] + "\" type=\"radio\" class=\"pacem-radio\" name=\"" + attrs['name'] + "\" value=\"" + kvp.value + "\" id=\"" + attrs['id'] + "_" + j + "\" />\n<label for=\"" + attrs['id'] + "_" + j + "\">" + kvp.caption + "</label></li>";
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
                        detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + " | pacemDate | date:" + getDateFormats((field.display && field.display.format) || 'medium') + " }}</span>";
                        break;
                    case "date":
                        tagName = 'pacem-datetime-picker';
                        delete attrs['placeholder'];
                        delete attrs['class'];
                        detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + " | pacemDate | date:" + getDateFormats((field.display && field.display.format) || 'medium') + " }}</span>";
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
                                detailTmpl = "<span class=\"pacem-checkbox pacem-readonly\" [ngClass]=\"{ 'pacem-checked' : entity." + field.prop + " }\"></span>";
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
        var validatorsTmpl = '', validators = [];
        if (field.validators && field.validators.length) {
            validatorsTmpl += "<ol class=\"pacem-validators\" [hidden]=\"" + formReference + ".valid || " + formReference + ".pristine\">";
            field.validators.forEach(function (validator) {
                switch (validator.type) {
                    case 'required':
                        attrs['required'] = 'required';
                        if (!_this.readonly)
                            pacem_core_1.PacemUtils.addClass(label, 'pacem-required');
                        validatorsTmpl += "<li *ngIf=\"" + formReference + ".errors\" [hidden]=\"!" + formReference + ".errors.required\">" + validator.errorMessage + "</li>";
                        break;
                    case 'length':
                        var max = validator.params && validator.params['max'];
                        var min = validator.params && validator.params['min'];
                        if (max != null) {
                            attrs['maxlength'] = max;
                        }
                        if (min != null) {
                            attrs['minlength'] = min;
                        }
                        validatorsTmpl += "<li *ngIf=\"" + formReference + ".errors\" [hidden]=\"!" + formReference + ".errors.maxlength && !" + formReference + ".errors.minlength\">" + validator.errorMessage + "</li>";
                        break;
                    case 'range':
                        var maxNum = validator.params && validator.params['max'];
                        var minNum = validator.params && validator.params['min'];
                        if (maxNum != null) {
                            attrs['max'] = maxNum;
                        }
                        if (minNum != null) {
                            attrs['min'] = minNum;
                        }
                        validatorsTmpl += "<li *ngIf=\"" + formReference + ".errors\" [hidden]=\"!" + formReference + ".errors.max && !" + formReference + ".errors.min\">" + validator.errorMessage + "</li>";
                        break;
                    case 'email':
                        attrs['pattern'] = "[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z0-9]{2,6}";
                        validatorsTmpl += "<li *ngIf=\"" + formReference + ".errors\" [hidden]=\"!" + formReference + ".errors.pattern\">" + validator.errorMessage + "</li>";
                        break;
                    case 'regex':
                        attrs['pattern'] = validator.params['pattern'];
                        validatorsTmpl += "<li *ngIf=\"" + formReference + ".errors\" [hidden]=\"!" + formReference + ".errors.pattern\">" + validator.errorMessage + "</li>";
                        break;
                    case 'compare':
                        var comparedTo = attrs['[compare]'] = "entity." + validator.params['to'];
                        var operator = attrs['operator'] = validator.params['operator'] || 'equal';
                        // In case of `date(time)` try to add some interaction with `datetime-picker`'s min/max props.
                        if (tagName === 'pacem-datetime-picker') {
                            switch (operator) {
                                case 'lessOrEqual':
                                case 'less':
                                    attrs['[max]'] = comparedTo;
                                    break;
                                case 'greaterOrEqual':
                                case 'greater':
                                    attrs['[min]'] = comparedTo;
                                    break;
                            }
                        }
                        validatorsTmpl += "<li *ngIf=\"" + formReference + ".errors\" [hidden]=\"!" + formReference + ".errors.compare\">" + validator.errorMessage + "</li>";
                }
            });
            validatorsTmpl += '</ol>';
        }
        if (field.isReadOnly) {
            attrs['readonly'] = 'readonly';
            attrs['tabindex'] = '-1';
        }
        var el = document.createElement(tagName);
        var elOuterHtml = el.outerHTML;
        var selfClosing = !(new RegExp("</" + tagName, 'i').test(elOuterHtml));
        if (selfClosing && !elOuterHtml.endsWith('/>'))
            elOuterHtml = elOuterHtml.replace('>', '/>');
        //
        if (attrs['class'])
            attrs['class'] += ' form-control';
        else
            attrs['class'] = 'form-control';
        for (var prop in attrs)
            elOuterHtml = elOuterHtml.replace(selfClosing ? /\/>$/ : /></, " " + prop + "=\"" + attrs[prop] + "\"" + (selfClosing ? '/>' : '><'));
        if (innerHtml && !selfClosing)
            elOuterHtml = elOuterHtml.replace('><', ">" + innerHtml + "<");
        if (!detailTmpl)
            detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + " }}</span>";
        var labelOuterHtml = label.outerHTML;
        // tooltip?
        if (!this.readonly && field.extra && !!field.extra.tooltip && field.display && field.display.description) {
            var toolTipID = "ttip" + this.uid;
            labelOuterHtml = labelOuterHtml.replace(/>/, " [ngClass]=\"{ 'pacem-tooltip': !readonly }\" pacemBalloon=\"#" + toolTipID + "\" [pacemBalloonOptions]=\"{ position: 'auto', behavior: 'tooltip', disabled: readonly, hoverDelay: 0, hoverTimeout: 0 }\">")
                + ("<div hidden id=\"" + toolTipID + "\">" + field.display.description + "</div>");
        }
        tmpl = "<div class=\"pacem-field form-group\" [ngClass]=\"{ 'pacem-fetching': fetching, 'pacem-has-value': hasValue }\" " + fieldAttrs + ">"
            + labelOuterHtml
            + (!this.readonly ? ('<div class="pacem-input-container">' //*ngIf="!readonly"
                + wrapperOpener + elOuterHtml + wrapperCloser
                + validatorsTmpl
                + '</div>') // *ngIf="!readonly"
                : detailTmpl //.replace(/\/?>/, ' *ngIf="readonly">')
            ) + '</div>';
        var selector = 'pacem-input';
        var input = this.builder.createComponent(selector, tmpl, formReference);
        var cmpRef = input;
        this.compiler
            .compileModuleAndAllComponentsAsync(cmpRef)
            .then(function (factory) {
            // our component will be inserted after #dynamicContentPlaceHolder
            _this.componentRef = _this.dynamicComponentTarget.createComponent(factory.componentFactories.find(function (cmp) { return cmp.selector == selector; }), 0);
            // and here we have access to our dynamic component
            var component = _this.componentRef.instance;
            component.entity = _this.entity;
            if (fetchData)
                component.fetchData = pacem_core_1.PacemUtils.extend({ params: _this.parameters }, fetchData);
            _this.syncControl();
        });
    };
    return PacemField;
}());
__decorate([
    core_1.ViewChild('label'),
    __metadata("design:type", core_1.ElementRef)
], PacemField.prototype, "labelElementRef", void 0);
__decorate([
    core_1.ViewChild('placeholder', { read: core_1.ViewContainerRef }),
    __metadata("design:type", core_1.ViewContainerRef)
], PacemField.prototype, "dynamicComponentTarget", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], PacemField.prototype, "field", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], PacemField.prototype, "entity", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Boolean)
], PacemField.prototype, "readonly", void 0);
__decorate([
    core_1.Input('params'),
    __metadata("design:type", Object)
], PacemField.prototype, "parameters", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", forms_1.NgForm),
    __metadata("design:paramtypes", [forms_1.NgForm])
], PacemField.prototype, "form", null);
PacemField = __decorate([
    core_1.Component({
        selector: 'pacem-field',
        template: "\n    <div #placeholder hidden></div>\n    ",
        //entryComponents: [PacemSelectMany, PacemAutocomplete],
        providers: [/*PacemContentEditable, PacemDefaultSelectOption, DatasourceFetcher*/ , PacemFieldBuilder,
            pacem_core_1.PacemDate, MinValidator, MaxValidator, CompareValidator]
    }),
    __metadata("design:paramtypes", [core_1.Compiler, PacemFieldBuilder])
], PacemField);
exports.PacemField = PacemField;
var PacemScaffoldingModule = (function () {
    function PacemScaffoldingModule() {
    }
    return PacemScaffoldingModule;
}());
PacemScaffoldingModule = __decorate([
    core_1.NgModule({
        imports: [forms_1.FormsModule, forms_1.ReactiveFormsModule, common_1.CommonModule, pacem_ui_1.PacemUIModule, pacem_core_1.PacemCoreModule, PacemScaffoldingInternalModule],
        declarations: [PacemField],
        exports: [PacemField],
        providers: [PacemExecCommand]
    }),
    __metadata("design:paramtypes", [])
], PacemScaffoldingModule);
exports.PacemScaffoldingModule = PacemScaffoldingModule;
var MinValidator_1, MaxValidator_1, CompareValidator_1, PacemExecCommand_1;
