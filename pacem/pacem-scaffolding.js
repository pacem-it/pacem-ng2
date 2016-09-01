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
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var pacem_core_1 = require('./pacem-core');
var platform_browser_1 = require('@angular/platform-browser');
var pacem_ui_1 = require('./pacem-ui');
var common_1 = require("@angular/common");
var http_1 = require('@angular/http');
var Subject_1 = require('rxjs/Subject');
// Observable class extensions
require('rxjs/add/observable/of');
require('rxjs/add/observable/throw');
// Observable operators
require('rxjs/add/operator/toPromise');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/distinctUntilChanged');
require('rxjs/add/operator/debounceTime');
require('rxjs/add/operator/map');
var resolvedPromise = Promise.resolve(null);
exports.formControlBinding = {
    provide: forms_1.NgControl,
    useExisting: core_1.forwardRef(function () { return forms_1.NgModel; })
};
var DatasourceFetcher = (function () {
    function DatasourceFetcher(http) {
        this.http = http;
        this.onFetched = new core_1.EventEmitter();
        this.onFetching = new core_1.EventEmitter();
    }
    DatasourceFetcher.prototype.fetch = function (data, entity) {
        var _this = this;
        var verb = (data.verb || 'get').toLowerCase();
        var isPost = verb === 'post';
        var url = data.sourceUrl;
        var body = data.params || {};
        var dependsOn = data.dependsOn;
        if (!isPost)
            for (var prop in body)
                url += (url.indexOf('?') == -1 ? '?' : '&') + prop + '=' + encodeURI(body[prop]);
        //
        if (dependsOn) {
            if (isPost)
                body[dependsOn.alias || dependsOn.prop] = entity[dependsOn.prop];
            else
                url += (url.indexOf('?') == -1 ? '?' : '&') + (dependsOn.alias || dependsOn.prop) + '=' + encodeURI(entity[dependsOn.prop]);
        }
        this.onFetching.emit({});
        var observable = verb === 'post' ? this.http.post(url, body) : this.http.get(url);
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
                var datasource = new Datasource(items.length);
                //datasource.textProperty = data.textProperty;
                datasource.valueProperty = data.valueProperty;
                Datasource.prototype.splice.apply(datasource, [0, datasource.length].concat(items));
                return datasource;
            }
        });
    };
    DatasourceFetcher = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], DatasourceFetcher);
    return DatasourceFetcher;
}());
var Datasource = (function (_super) {
    __extends(Datasource, _super);
    function Datasource() {
        _super.apply(this, arguments);
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
function MakeValueAccessorProvider(type) {
    return new core_1.Provider(common_1.NG_VALUE_ACCESSOR, {
        useExisting: core_1.forwardRef(function () { return type; }),
        multi: true
    });
}
function MakeValidatorProvider(type) {
    return {
        provide: forms_1.NG_VALIDATORS,
        useExisting: core_1.forwardRef(function () { return type; }),
        multi: true
    };
}
//#region VALIDATORS integration
var MinValidator = (function () {
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
    MinValidator = __decorate([
        core_1.Directive({
            selector: '[min][formControlName],[min][formControl],[min][ngModel]',
            providers: [MakeValidatorProvider(MinValidator)]
        }),
        __param(0, core_1.Attribute('min')), 
        __metadata('design:paramtypes', [Object])
    ], MinValidator);
    return MinValidator;
}());
var MaxValidator = (function () {
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
    MaxValidator = __decorate([
        core_1.Directive({
            selector: '[max][formControlName],[max][formControl],[max][ngModel]',
            providers: [MakeValidatorProvider(MaxValidator)]
        }),
        __param(0, core_1.Attribute('max')), 
        __metadata('design:paramtypes', [Object])
    ], MaxValidator);
    return MaxValidator;
}());
var CompareValidator = (function () {
    function CompareValidator(operator) {
        var _this = this;
        this._validator = function (control) {
            _this._ctrl = control;
            //if (Validators.required(control) /* != null && != undefined */) return null;
            var v = control.value, bm = _this._benchmark;
            if (v == null)
                v = '';
            if (bm == null)
                bm = '';
            //
            var result = ((v > bm && operator != 'greater' && operator != 'greaterOrEqual')
                || (v < bm && operator != 'less' && operator != 'lessOrEqual')
                || ((v == bm) && operator != 'equal' && operator != 'lessOrEqual' && operator != 'greaterOrEqual')
                || (v != bm && operator == 'equal'))
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
    __decorate([
        core_1.Input('compare'), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], CompareValidator.prototype, "compareToValue", null);
    CompareValidator = __decorate([
        core_1.Directive({
            selector: '[compare][formControlName],[compare][formControl],[compare][ngModel]',
            providers: [MakeValidatorProvider(CompareValidator)]
        }),
        __param(0, core_1.Attribute('operator')), 
        __metadata('design:paramtypes', [String])
    ], CompareValidator);
    return CompareValidator;
}());
//#endregion 
var PacemExecCommand = (function () {
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
        var knownCommands = PacemExecCommand.knownCommands;
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
    PacemExecCommand.knownCommands = { BOLD: 'bold', ITALIC: 'italic', UNDERLINE: 'underline', LINK: 'hyperlink', ORDEREDLIST: 'orderedList', UNORDEREDLIST: 'unorderedList' };
    PacemExecCommand = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PacemExecCommand);
    return PacemExecCommand;
}());
exports.PacemExecCommand = PacemExecCommand;
var keys = {
    UP: 38,
    DOWN: 40,
    TAB: 9,
    ENTER: 13
};
var PacemAutocomplete = (function (_super) {
    __extends(PacemAutocomplete, _super);
    function PacemAutocomplete(model, root) {
        var _this = this;
        _super.call(this, model);
        this.model = model;
        this.root = root;
        this.onquery = new core_1.EventEmitter();
        this.searchTermStream = new Subject_1.Subject();
        this.caption = '';
        this.focusIndex = -1;
        this.subscription1 = this.model.valueChanges
            .subscribe(function (_) { return _this.updateCaption(_); });
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
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Datasource)
    ], PacemAutocomplete.prototype, "datasource", void 0);
    __decorate([
        core_1.Output('query'), 
        __metadata('design:type', Object)
    ], PacemAutocomplete.prototype, "onquery", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], PacemAutocomplete.prototype, "placeholder", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], PacemAutocomplete.prototype, "textProperty", void 0);
    PacemAutocomplete = __decorate([
        core_1.Component({
            selector: 'pacem-autocomplete',
            directives: [pacem_ui_1.PacemBalloon],
            template: "<div class=\"pacem-autocomplete\">\n    <input  (keyup)=\"onKeyup($event);fetchTerm(search.value)\"\n            (search)=\"fetchTerm(search.value)\"\n            (keydown)=\"onKeydown($event)\"\n            (blur)=\"onBlur($event)\"\n            (focus)=\"onFocus($event);\"\n            [placeholder]=\"placeholder\"\n            type=\"search\" #search \n            [attr.id]=\"root.nativeElement.id +'_acq'\"\n            class=\"pacem-input\"\n            (popup)=\"resize(balloon, search)\"\n            [ngClass]=\"{ 'ng-invalid': model.invalid, 'ng-dirty': model.dirty, 'ng-valid': model.valid, 'ng-pristine': model.pristine }\"\n            [value]=\"caption\"\n            [pacemBalloon]=\"balloon\" [pacemBalloonOptions]=\"{ position: 'bottom', trigger: 'focus', behavior: 'menu' }\" />\n    <div #balloon hidden><ol [hidden]=\"!datasource?.length\">\n        <li *ngFor=\"let item of datasource; let ndx = index\" \n            (mousedown)=\"onClick($event, ndx)\"\n            [ngClass]=\"{ 'pacem-focused': focusIndex == ndx }\" [innerHTML]=\"item.caption | pacemHighlight:search.value\"></li>\n    </ol></div>\n</div>",
            pipes: [pacem_ui_1.PacemHighlight]
        }), 
        __metadata('design:paramtypes', [forms_1.NgModel, core_1.ElementRef])
    ], PacemAutocomplete);
    return PacemAutocomplete;
}(BaseValueAccessor));
var PacemContentEditable = (function (_super) {
    __extends(PacemContentEditable, _super);
    function PacemContentEditable(element, sce, execCommand, ctrl) {
        var _this = this;
        _super.call(this, ctrl);
        this.element = element;
        this.sce = sce;
        this.execCommand = execCommand;
        this.dashboard = [];
        this.exec = function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            var cmd = (ev.srcElement || ev.target).dataset['pacemCommand'];
            _this.execCommand.exec(cmd).then(function () { return _this.onTyped(); });
        };
        this.subscription = ctrl.valueChanges.subscribe(function (_) {
            if (_this.container && _ != _this.container.innerHTML)
                _this.setViewValue(_);
        });
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
        __metadata('design:paramtypes', [core_1.ElementRef, platform_browser_1.DomSanitizationService, PacemExecCommand, forms_1.NgControl])
    ], PacemContentEditable);
    return PacemContentEditable;
}(BaseValueAccessor));
var PacemSelectMany = (function (_super) {
    __extends(PacemSelectMany, _super);
    function PacemSelectMany(ref, ctrl) {
        var _this = this;
        _super.call(this, ctrl);
        this.ref = ref;
        this.ctrl = ctrl;
        this.uid = pacem_core_1.PacemUtils.uniqueCode();
        this.subscription = ctrl.valueChanges.subscribe(function (_) {
            return _this.checkValue();
        });
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
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Datasource)
    ], PacemSelectMany.prototype, "datasource", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], PacemSelectMany.prototype, "readonly", void 0);
    PacemSelectMany = __decorate([
        core_1.Component({
            selector: 'pacem-select-many[ngModel]',
            template: "<ul class=\"pacem-select-many\" *ngIf=\"!readonly\"><li *ngFor=\"let item of datasource; let ndx=index\">\n    <input type=\"checkbox\" [value]=\"item.value\" (change)=\"toggle($event, item)\" [checked]=\"item.selected\" [id]=\"uid+'_'+ndx\" />\n    <label [attr.for]=\"uid+'_'+ndx\">{{ item.caption }}</label>\n</li></ul>\n<ul class=\"pacem-select-many\" *ngIf=\"readonly\">\n    <li [hidden]=\"!item.selected\" *ngFor=\"let item of datasource\"><span class=\"pacem-readonly\">{{ item.caption }}</span></li>\n</ul>",
            changeDetection: core_1.ChangeDetectionStrategy.OnPush
        }), 
        __metadata('design:paramtypes', [core_1.ChangeDetectorRef, forms_1.NgModel])
    ], PacemSelectMany);
    return PacemSelectMany;
}(BaseValueAccessor));
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
    __decorate([
        core_1.Input('pacemDefaultSelectOption'), 
        __metadata('design:type', Array)
    ], PacemDefaultSelectOption.prototype, "defaultValues", void 0);
    PacemDefaultSelectOption = __decorate([
        core_1.Directive({
            selector: 'option[pacemDefaultSelectOption]'
        }), 
        __metadata('design:paramtypes', [forms_1.SelectControlValueAccessor, core_1.ElementRef])
    ], PacemDefaultSelectOption);
    return PacemDefaultSelectOption;
}());
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
                this.fetcher = fetcher;
                this.checkHasValue = function () {
                    var ctrl = _this.ctrl;
                    if (ctrl && ctrl.valueAccessor) {
                        var _ = ctrl.value;
                        _this.hasValue = (_ != null && _ != '');
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
            //ngDoCheck() {
            //    if (this.differer && this.differer.diff(this.fetchData))
            //        this.fetch();
            //}
            PacemFieldDynamicField.prototype.ngOnDestroy = function () {
                if (this.subscription)
                    this.subscription.unsubscribe();
                if (this.subv)
                    this.subv.unsubscribe();
                this.sub1.unsubscribe();
                this.sub2.unsubscribe();
            };
            __decorate([
                core_1.Input(), 
                __metadata('design:type', Object)
            ], PacemFieldDynamicField.prototype, "entity", void 0);
            __decorate([
                core_1.Input(), 
                __metadata('design:type', Boolean)
            ], PacemFieldDynamicField.prototype, "readonly", void 0);
            __decorate([
                core_1.Input(), 
                __metadata('design:type', Object)
            ], PacemFieldDynamicField.prototype, "fetchData", void 0);
            __decorate([
                core_1.ViewChild(ctrlRef), 
                __metadata('design:type', forms_1.NgModel)
            ], PacemFieldDynamicField.prototype, "ctrl", void 0);
            PacemFieldDynamicField = __decorate([
                core_1.Component({
                    selector: selector,
                    template: template,
                    directives: injectDirectives /*,
                    changeDetection: ChangeDetectionStrategy.OnPush*/
                }), 
                __metadata('design:paramtypes', [core_1.ChangeDetectorRef, DatasourceFetcher])
            ], PacemFieldDynamicField);
            return PacemFieldDynamicField;
        }());
        ;
        return PacemFieldDynamicField;
    };
    PacemFieldBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PacemFieldBuilder);
    return PacemFieldBuilder;
}());
var PacemField = (function () {
    function PacemField(compiler, builder) {
        this.compiler = compiler;
        this.builder = builder;
        this.uid = "_" + pacem_core_1.PacemUtils.uniqueCode();
    }
    PacemField.prototype.ngOnChanges = function (changes) {
        // only handle reference changes (for now)
        var c;
        if ((c = changes['field']) && !c.isFirstChange()) {
            this.rebuildInputField();
        }
        if (this.componentRef && this.componentRef.instance) {
            if ((c = changes['entity']) && !c.isFirstChange())
                this.componentRef.instance.entity = c.currentValue;
            if ((c = changes['readonly']) && !c.isFirstChange())
                this.componentRef.instance.readonly = c.currentValue;
        }
    };
    PacemField.prototype.ngAfterViewInit = function () {
        this.rebuildInputField();
    };
    PacemField.prototype.ngOnDestroy = function () {
        if (this.componentRef)
            this.componentRef.destroy();
    };
    PacemField.prototype.rebuildInputField = function () {
        var _this = this;
        if (this.componentRef)
            this.componentRef.destroy();
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
        var formReference = (field.prop + pacem_core_1.PacemUtils.uniqueCode()).toLowerCase();
        attrs['#' + formReference] = 'ngModel';
        switch (field.display && field.display.ui) {
            case 'contentEditable':
                tagName = 'div';
                attrs['contenteditable'] = 'true';
                attrs['class'] = 'pacem-contenteditable';
                detailTmpl = "<div class=\"pacem-readonly\" [innerHTML]=\"entity." + field.prop + "\"></div>";
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
                    innerHtml = ("<option value=\"\" [pacemDefaultSelectOption]=\"[null]\" class=\"pacem-watermark\">" + watermark + "</option>") + innerHtml;
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
                    case 'password':
                        attrs['type'] = 'password';
                        break;
                    case 'emailaddress':
                        attrs['type'] = 'email';
                        break;
                    case "time":
                        attrs['type'] = 'time';
                        break;
                    case "datetime":
                        attrs['type'] = 'datetime'; // TODO: add datePicker
                        detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + " | pacemDate | date:" + getDateFormats((field.display && field.display.format) || 'D') + " }}</span>";
                        break;
                    case "date":
                        attrs['type'] = 'date'; // TODO: add datePicker
                        detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + " | pacemDate | date:" + getDateFormats((field.display && field.display.format) || 'D') + " }}</span>";
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
                                detailTmpl = "<span class=\"pacem-check pacem-readonly\" [ngClass]=\"{ 'pacem-checked' : entity." + field.prop + " }\"></span>";
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
                        attrs['[compare]'] = "entity." + validator.params['to'];
                        attrs['operator'] = validator.params['operator'] || 'equal';
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
        pacem_core_1.PacemUtils.addClass(el, 'form-control');
        var elOuterHtml = el.outerHTML;
        var selfClosing = !(new RegExp("</" + tagName, 'i').test(elOuterHtml));
        if (selfClosing && !elOuterHtml.endsWith('/>'))
            elOuterHtml = elOuterHtml.replace('>', '/>');
        for (var prop in attrs)
            elOuterHtml = elOuterHtml.replace(selfClosing ? /\/>$/ : /></, " " + prop + "=\"" + attrs[prop] + "\"" + (selfClosing ? '/>' : '><'));
        if (innerHtml && !selfClosing)
            elOuterHtml = elOuterHtml.replace('><', ">" + innerHtml + "<");
        if (!detailTmpl)
            detailTmpl = "<span class=\"pacem-readonly\">{{ entity." + field.prop + " }}</span>";
        var labelOuterHtml = label.outerHTML;
        // tooltip?
        if (field.extra && !!field.extra.tooltip && field.display && field.display.description) {
            var toolTipID = "ttip" + this.uid;
            labelOuterHtml = labelOuterHtml.replace(/>/, " [ngClass]=\"{ 'pacem-tooltip': !readonly }\" pacemBalloon=\"#" + toolTipID + "\" [pacemBalloonOptions]=\"{ position: 'auto', behavior: 'tooltip', disabled: readonly, hoverDelay: 0, hoverTimeout: 0 }\">")
                + ("<div hidden id=\"" + toolTipID + "\">" + field.display.description + "</div>");
        }
        tmpl = ("<div class=\"pacem-field form-group\" [ngClass]=\"{ 'pacem-fetching': fetching, 'pacem-has-value': hasValue }\" " + fieldAttrs + ">")
            + labelOuterHtml
            + '<div class="pacem-input-container" *ngIf="!readonly">'
            + wrapperOpener + elOuterHtml + wrapperCloser
            + validatorsTmpl
            + '</div>' // *ngIf="!readonly"
            + detailTmpl.replace(/>/, ' *ngIf="readonly">')
            + '</div>';
        var input = this.builder.createComponent('pacem-input', tmpl, formReference);
        var cmpRef = input;
        this.compiler
            .compileComponentAsync(cmpRef)
            .then(function (factory) {
            // our component will be inserted after #dynamicContentPlaceHolder
            _this.componentRef = _this.dynamicComponentTarget.createComponent(factory, 0);
            // and here we have access to our dynamic component
            var component = _this.componentRef.instance;
            component.entity = _this.entity;
            component.readonly = _this.readonly;
            if (fetchData)
                component.fetchData = fetchData;
        });
    };
    __decorate([
        core_1.ViewChild('label'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemField.prototype, "labelElementRef", void 0);
    __decorate([
        core_1.ViewChild('placeholder', { read: core_1.ViewContainerRef }), 
        __metadata('design:type', core_1.ViewContainerRef)
    ], PacemField.prototype, "dynamicComponentTarget", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PacemField.prototype, "field", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PacemField.prototype, "entity", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], PacemField.prototype, "readonly", void 0);
    PacemField = __decorate([
        core_1.Component({
            selector: 'pacem-field',
            template: "\n    <div #placeholder hidden></div>\n    ",
            directives: [MinValidator, MaxValidator, CompareValidator, PacemContentEditable, PacemDefaultSelectOption, PacemSelectMany, PacemAutocomplete],
            providers: [PacemFieldBuilder, DatasourceFetcher, forms_1.NgControl],
            pipes: [pacem_core_1.PacemDate]
        }), 
        __metadata('design:paramtypes', [core_1.Compiler, PacemFieldBuilder])
    ], PacemField);
    return PacemField;
}());
exports.PacemField = PacemField;
