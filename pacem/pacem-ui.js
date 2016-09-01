"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var common_1 = require('@angular/common');
var pacem_core_1 = require('./pacem-core');
var Rx_1 = require('rxjs/Rx');
var pacem_3d_1 = require('./pacem-3d');
require('rxjs/add/operator/debounceTime');
require('rxjs/add/operator/debounce');
require('rxjs/add/operator/merge');
function supportsSVGTransforms() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return 'transform' in svg;
}
var PacemHidden = (function () {
    function PacemHidden(elRef) {
        this.elRef = elRef;
        elRef.nativeElement.setAttribute('hidden', 'true');
    }
    Object.defineProperty(PacemHidden.prototype, "hidden", {
        set: function (v) {
            this.elRef.nativeElement.removeAttribute('hidden');
            if (v) {
                pacem_core_1.PacemUtils.removeClass(this.elRef.nativeElement, 'pacem-shown');
                pacem_core_1.PacemUtils.addClass(this.elRef.nativeElement, 'pacem-hidden');
            }
            else {
                pacem_core_1.PacemUtils.removeClass(this.elRef.nativeElement, 'pacem-hidden');
                pacem_core_1.PacemUtils.addClass(this.elRef.nativeElement, 'pacem-shown');
            }
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input('pacemHidden'), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PacemHidden.prototype, "hidden", null);
    PacemHidden = __decorate([
        core_1.Directive({
            selector: '[pacemHidden]'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], PacemHidden);
    return PacemHidden;
}());
exports.PacemHidden = PacemHidden;
/**
 * PacemHighlight Pipe
 */
var PacemHighlight = (function () {
    function PacemHighlight(sce) {
        this.sce = sce;
    }
    PacemHighlight.prototype.transform = function (src, query, css) {
        if (!query || !src)
            return src;
        var source = src.substr(0);
        css = css || 'pacem-highlight';
        var trunks = query.substr(0).split(' ');
        for (var j = 0; j < trunks.length; j++) {
            var regex = new RegExp('(?![^<>]*>)' + trunks[j], 'gi');
            source = source.replace(regex, function (piece, index, whole) {
                var startTagNdx, endTagIndex;
                if ((startTagNdx = whole.indexOf('<', index)) != (endTagIndex = whole.indexOf('</', index)) || startTagNdx == -1)
                    return '<span class="' + css + '">' + piece + '</span>';
                return piece;
            });
        }
        return this.sce.bypassSecurityTrustHtml(source);
    };
    PacemHighlight = __decorate([
        core_1.Pipe({
            name: 'pacemHighlight'
        }), 
        __metadata('design:paramtypes', [platform_browser_1.DomSanitizationService])
    ], PacemHighlight);
    return PacemHighlight;
}());
exports.PacemHighlight = PacemHighlight;
/**
 * PacemInfiniteScroll Directive
 */
var PacemInfiniteScroll = (function () {
    function PacemInfiniteScroll(element) {
        var _this = this;
        this.element = element;
        this.pacemInfiniteScroll = new core_1.EventEmitter();
        this.$scrollDelegate = function () { return _this.scroll(); };
        this.$enabled = true;
        this.viewportHeight = 0;
        this.innerHeight = 0;
        this.is$document = false;
        this.$container = null;
        this.$viewport = null;
        this.$scroller = null;
        this.$bottomGap = 10;
        this.$container = this.$viewport = this.$scroller = element.nativeElement;
        this.$scroller.addEventListener('scroll', this.$scrollDelegate, false);
    }
    Object.defineProperty(PacemInfiniteScroll.prototype, "pacemInfiniteScrollContainer", {
        set: function (v) {
            var $cont = v;
            var isDoc = this.is$document = $cont === '$document';
            this.$container = isDoc ? (window.document.body || window.document.documentElement) : ((typeof this.pacemInfiniteScrollContainer === 'string') ?
                document.querySelector($cont)
                :
                    $cont);
            this.$viewport = isDoc ? window : this.$container;
            if (this.$scroller)
                this.$scroller.removeEventListener('scroll', this.$scrollDelegate, false);
            this.$scroller = isDoc ? window.document : this.$container;
            this.$scroller.addEventListener('scroll', this.$scrollDelegate, false);
            if (this.$enabled)
                this.scroll();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemInfiniteScroll.prototype, "pacemInfiniteScrollEnabled", {
        set: function (v) {
            this.$enabled = v;
            if (!!v)
                this.scroll();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemInfiniteScroll.prototype, "pacemInfiniteScrollBottomGap", {
        set: function (v) {
            this.$bottomGap = v || 0;
        },
        enumerable: true,
        configurable: true
    });
    PacemInfiniteScroll.prototype.ngOnDestroy = function () {
        if (this.$scroller)
            this.$scroller.removeEventListener('scroll', this.$scrollDelegate, false);
    };
    //ngOnChanges(changes: SimpleChanges) {
    //}
    PacemInfiniteScroll.prototype.scroll = function () {
        var _this = this;
        window.clearTimeout(this.throttler);
        this.throttler = window.setTimeout(function () { return _this.doScroll(); }, 100);
    };
    PacemInfiniteScroll.prototype.doScroll = function () {
        var _this = this;
        if (!this.$enabled)
            return;
        if (!this.computeHeight()) {
            var scrollTop = this.$scroller instanceof Document ? window.pageYOffset : this.$scroller.scrollTop;
            var viewportHeight = this.viewportHeight, innerHeight = this.innerHeight;
            if ((innerHeight - (scrollTop + viewportHeight)) < this.$bottomGap /* pixels */
                || innerHeight <= viewportHeight) {
                this.pacemInfiniteScroll.emit({});
                window.requestAnimationFrame(function () {
                    if (_this.$enabled)
                        _this.scroll();
                });
            } //else computeHeight();
        }
        else
            this.scroll();
    };
    PacemInfiniteScroll.prototype.computeHeight = function () {
        if (!this.$container)
            return;
        var $container = this.$container;
        var topOffset = Number.MAX_VALUE, bottomOffset = 0, totalHeight = 0, _innerHeight;
        if (this.is$document) {
            var d = $container;
            _innerHeight = Math.max(d.scrollHeight, d.offsetHeight, d.clientHeight);
        }
        else {
            for (var i = 0; i < $container.children.length; i++) {
                var e = $container.children.item(i);
                var eTopOffset = e.offsetTop, eHeight = e.offsetHeight, eBottomOffset = eTopOffset + eHeight;
                totalHeight += eHeight;
                if (eTopOffset < topOffset) {
                    topOffset = eTopOffset;
                }
                if (eBottomOffset > bottomOffset) {
                    bottomOffset = eBottomOffset;
                }
            }
            _innerHeight = Math.round(bottomOffset - topOffset);
        }
        var _viewportHeight = this.$viewport instanceof Window ? pacem_core_1.PacemUtils.windowSize.height : this.$viewport.offsetHeight;
        if (_innerHeight != this.innerHeight || _viewportHeight != this.viewportHeight) {
            this.innerHeight = _innerHeight;
            this.viewportHeight = _viewportHeight;
            return true;
        }
        return false;
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object), 
        __metadata('design:paramtypes', [Object])
    ], PacemInfiniteScroll.prototype, "pacemInfiniteScrollContainer", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PacemInfiniteScroll.prototype, "pacemInfiniteScrollEnabled", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PacemInfiniteScroll.prototype, "pacemInfiniteScrollBottomGap", null);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], PacemInfiniteScroll.prototype, "pacemInfiniteScroll", void 0);
    PacemInfiniteScroll = __decorate([
        core_1.Directive({
            selector: '[pacemInfiniteScroll]'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], PacemInfiniteScroll);
    return PacemInfiniteScroll;
}());
exports.PacemInfiniteScroll = PacemInfiniteScroll;
/**
 * PacemLightbox Component
 */
var PacemLightbox = (function () {
    function PacemLightbox() {
        var _this = this;
        this.hide = true;
        this.resizeDelegate = function (_) {
            if (!_this.hide)
                _this.resize(_);
        };
        this.onclose = new core_1.EventEmitter();
        this.content = null;
    }
    Object.defineProperty(PacemLightbox.prototype, "show", {
        set: function (v) {
            this.hide = !v;
            if (!!v)
                this.resize();
            else
                this.reset();
        },
        enumerable: true,
        configurable: true
    });
    PacemLightbox.prototype.ngOnInit = function () {
        var _this = this;
        this.wrapperElement.nativeElement.addEventListener('mousedown', function (evt) {
            _this.hide = true;
            _this.onclose.emit({});
        }, false);
        this.content = this.wrapperElement.nativeElement.firstElementChild;
        this.content.addEventListener('mousedown', function (evt) {
            evt.stopPropagation();
        }, false);
        window.addEventListener('resize', this.resizeDelegate, false);
    };
    PacemLightbox.prototype.ngOnChanges = function (changes) {
        if ('show' in changes && !!changes['show'].currentValue)
            this.hide = false;
    };
    PacemLightbox.prototype.ngOnDestroy = function () {
        window.removeEventListener('resize', this.resizeDelegate, false);
    };
    PacemLightbox.prototype.reset = function () {
        window.document.body.style.overflow = '';
    };
    PacemLightbox.prototype.resize = function (evt) {
        window.document.body.style.overflow = 'hidden';
        var win = window, element = this.wrapperElement.nativeElement;
        var viewportHeight = pacem_core_1.PacemUtils.windowSize.height;
        var scrollTop = win.pageYOffset;
        element.style.width = '100%';
        element.style.height = viewportHeight + 'px';
        element.style.position = 'absolute';
        //element.style.zIndex = '10000'; // set in css
        element.style.margin = '0';
        element.style.padding = '0';
        element.style.top = scrollTop + 'px';
        element.style.left = '0';
        var container = this.content;
        window.requestAnimationFrame(function () {
            var containerHeight = container.offsetHeight;
            var top = (viewportHeight - containerHeight) * .5;
            container.style.margin = top + 'px auto 0 auto';
        });
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PacemLightbox.prototype, "show", null);
    __decorate([
        core_1.Output('close'), 
        __metadata('design:type', Object)
    ], PacemLightbox.prototype, "onclose", void 0);
    __decorate([
        core_1.ViewChild('wrapper'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemLightbox.prototype, "wrapperElement", void 0);
    PacemLightbox = __decorate([
        core_1.Component({
            selector: 'pacem-lightbox',
            template: "<div class=\"pacem-lightbox-wrapper\" [hidden]=\"hide\" [pacemHidden]=\"hide\" #wrapper>\n<div class=\"pacem-lightbox\"><ng-content></ng-content></div>\n</div>",
            directives: [PacemHidden]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemLightbox);
    return PacemLightbox;
}());
exports.PacemLightbox = PacemLightbox;
/**
 * PacemGalleryItem Directive
 */
var PacemGalleryItem = (function () {
    function PacemGalleryItem() {
    }
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], PacemGalleryItem.prototype, "url", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], PacemGalleryItem.prototype, "caption", void 0);
    PacemGalleryItem = __decorate([
        core_1.Directive({
            selector: 'pacem-gallery-item'
        }), 
        __metadata('design:paramtypes', [])
    ], PacemGalleryItem);
    return PacemGalleryItem;
}());
exports.PacemGalleryItem = PacemGalleryItem;
/**
 * PacemGallery Component
 */
var PacemGallery = (function () {
    function PacemGallery() {
        this.subscription = null;
        this.onclose = new core_1.EventEmitter();
        this.hide = true;
        this.focusIndex = -1;
    }
    Object.defineProperty(PacemGallery.prototype, "show", {
        set: function (v) {
            this.hide = !v;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemGallery.prototype, "startIndex", {
        set: function (v) {
            this.focusIndex = v;
        },
        enumerable: true,
        configurable: true
    });
    PacemGallery.prototype.close = function (_) {
        this.hide = true;
        this.onclose.emit(_);
    };
    PacemGallery.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.subscription = this.items.changes.subscribe(function () { return _this.adjustFocusIndex(); });
        this.adjustFocusIndex();
    };
    PacemGallery.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    PacemGallery.prototype.adjustFocusIndex = function () {
        this.focusIndex = this.items && this.items.length ? Math.max(0, Math.min(this.items.length - 1, this.focusIndex)) : -1;
    };
    PacemGallery.prototype.isNear = function (ndx) {
        var Gallery = this;
        if (!(Gallery.items && Gallery.items.length))
            return false;
        return ndx == Gallery.focusIndex
            || (ndx + 1) % Gallery.items.length == Gallery.focusIndex
            || (ndx - 1 + Gallery.items.length) % Gallery.items.length == Gallery.focusIndex;
    };
    PacemGallery.prototype.previous = function () {
        var Gallery = this;
        if (!(Gallery.items && Gallery.items.length))
            return;
        Gallery.focusIndex = (Gallery.focusIndex - 1 + Gallery.items.length) % Gallery.items.length;
    };
    PacemGallery.prototype.next = function () {
        var Gallery = this;
        if (!(Gallery.items && Gallery.items.length))
            return;
        Gallery.focusIndex = (Gallery.focusIndex + 1) % Gallery.items.length;
    };
    __decorate([
        core_1.ContentChildren(PacemGalleryItem), 
        __metadata('design:type', core_1.QueryList)
    ], PacemGallery.prototype, "items", void 0);
    __decorate([
        core_1.Output('close'), 
        __metadata('design:type', Object)
    ], PacemGallery.prototype, "onclose", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean), 
        __metadata('design:paramtypes', [Boolean])
    ], PacemGallery.prototype, "show", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PacemGallery.prototype, "startIndex", null);
    PacemGallery = __decorate([
        core_1.Component({
            selector: 'pacem-gallery',
            template: "<pacem-lightbox class=\"pacem-gallery\" [show]=\"!hide\" (onclose)=\"close($event)\">\n    <ol class=\"pacem-gallery-list\">\n        <template ngFor \n            [ngForOf]=\"items\" \n            let-pic=\"$implicit\" \n            let-ndx=\"index\">\n        <li *ngIf=\"isNear(ndx)\"\n        [ngClass]=\"{ 'pacem-gallery-active': ndx === focusIndex }\" \n        [ngStyle]=\"{ 'background-image': 'url('+pic.url+')' }\">\n            <div class=\"pacem-gallery-caption\" [innerHTML]=\"pic.caption\"></div>\n        </li></template>\n    </ol>\n    <div class=\"pacem-gallery-close\" (click)=\"close($event)\">X</div>\n    <div class=\"pacem-gallery-previous\" (click)=\"previous($event)\" *ngIf=\"items.length > 1\">&lt;</div>\n    <div class=\"pacem-gallery-next\" (click)=\"next($event)\" *ngIf=\"items.length > 1\">&gt;</div>\n</pacem-lightbox>",
            directives: [PacemLightbox, common_1.NgClass, common_1.NgStyle]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemGallery);
    return PacemGallery;
}());
exports.PacemGallery = PacemGallery;
/**
 * PacemBalloon Directive
 */
var PacemBalloon = (function () {
    function PacemBalloon(element, keyValueDiffers, renderer) {
        var _this = this;
        this.element = element;
        this.keyValueDiffers = keyValueDiffers;
        this.renderer = renderer;
        this.balloonConsts = {
            positions: { TOP: 'top', LEFT: 'left', BOTTOM: 'bottom', RIGHT: 'right', AUTO: 'auto' },
            triggers: { HOVER: 'hover', CLICK: 'click', FOCUS: 'focus' },
            behaviors: { MENULIKE: 'menu', TOOLTIP: 'tooltip' },
            vars: { TRIGGER: 'pacemBalloonTrigger', HIDDEN: 'pacemBalloonHidden' },
            defaults: {
                'trigger': 'hover',
                'position': 'bottom',
                'behavior': 'menu',
                'verticalOffset': 0,
                'horizontalOffset': 0,
                'hoverDelay': 250,
                'hoverTimeout': 500,
                'disabled': false
            }
        };
        this.opts = pacem_core_1.PacemUtils.extend({}, this.balloonConsts.defaults);
        this.uid = 'PacemBalloon_' + pacem_core_1.PacemUtils.uniqueCode();
        this.pacemBalloonOptions = {};
        this.onpopup = new core_1.EventEmitter();
        this.onpopout = new core_1.EventEmitter();
        this.stopPropagationDelegate = function (evt) {
            evt.stopPropagation();
        };
        this.popupDelegate = function (_) {
            _this.popup();
        };
        this.popoutDelegate = function (_) {
            _this.popout();
        };
        this.hoverDelegate = function (evt) {
            var $popup = _this.ensurePopup();
            if (!$popup)
                return;
            var balloonConsts = _this.balloonConsts, triguid = $popup.dataset[balloonConsts.vars.TRIGGER];
            if (triguid && triguid != _this.uid /* diffrent trigger */) {
                var trigger = pacem_core_1.PacemUtils.core[triguid];
                window.clearTimeout(trigger.timer);
                _this.unregisterEvents();
                trigger.popout();
                _this.popup();
            }
            else {
                window.clearTimeout(_this.timer);
                _this.timer = window.setTimeout(_this.popupDelegate, _this.opts.hoverDelay);
            }
        };
        this.outConditionalDelegate = function (evt) {
            if ((evt.srcElement || evt.target) != _this.element.nativeElement)
                _this.outDelegate(evt);
        };
        this.outDelegate = function (evt) {
            var $popup = _this.ensurePopup();
            if (!$popup)
                return;
            //                    var timer = $popup.data(vars.ATTACHED_TIMER);
            //                    if (timer) window.clearTimeout(timer);
            window.clearTimeout(_this.timer);
            _this.timer = window.setTimeout(function () { return _this.popout(); }, _this.opts.hoverTimeout);
        };
        this.toggleDelegate = function (evt) {
            evt.preventDefault();
            var $popup = _this.ensurePopup();
            if (!$popup)
                return;
            var //triguid = $popup.dataset[this.balloonConsts.vars.TRIGGER], diffrentGuid = (triguid && triguid != this.uid),
            isVisible = pacem_core_1.PacemUtils.isVisible($popup);
            if (isVisible /*|| diffrentGuid*/)
                _this.outDelegate(evt);
            else
                _this.hoverDelegate(evt);
        };
        var pacem = pacem_core_1.PacemUtils.core;
        pacem[this.uid] = this;
        //
        this.differer = keyValueDiffers.find({}).create(null);
    }
    PacemBalloon.prototype.ngOnDestroy = function () {
        delete pacem_core_1.PacemUtils.core[this.uid];
        this.destroyPopup(this.pacemBalloon);
        this.removeHandlers();
    };
    PacemBalloon.prototype.ngAfterContentInit = function () {
        this.ngDoCheck();
    };
    PacemBalloon.prototype.ngDoCheck = function () {
        var changes = this.differer.diff(this.pacemBalloonOptions);
        //console.log(`changes detected (balloon): ${changes}`);
        if (changes)
            this.resetBalloon();
    };
    PacemBalloon.prototype.ngOnChanges = function (changes) {
        //var bc: SimpleChange;
        //if ((bc = changes['pacemBalloon']) && bc.currentValue != bc.previousValue) {
        if (changes)
            this.resetBalloon();
        //}
    };
    //#region METHODS
    PacemBalloon.prototype.ensurePopup = function (v) {
        var popup = v || this.pacemBalloon;
        var $popup = popup instanceof HTMLElement ? popup : document.querySelector(popup);
        //
        if ($popup && !pacem_core_1.PacemUtils.hasClass($popup, 'pacem-balloon')) {
            pacem_core_1.PacemUtils.addClass($popup, 'pacem-balloon');
            $popup.style.position = 'absolute';
            if (!$popup.hasAttribute('hidden'))
                $popup.setAttribute('hidden', 'hidden');
            else
                $popup.dataset[this.balloonConsts.vars.HIDDEN] = 'true';
        }
        return $popup;
    };
    PacemBalloon.prototype.destroyPopup = function (popup) {
        var $popup = this.ensurePopup(popup);
        if (!$popup)
            return;
        pacem_core_1.PacemUtils.removeClass($popup, 'pacem-balloon pacem-balloon-right pacem-balloon-left pacem-balloon-bottom pacem-balloon-top');
        $popup.style.position = '';
        if ($popup.dataset[this.balloonConsts.vars.HIDDEN])
            $popup.setAttribute('hidden', 'hidden');
        else
            $popup.removeAttribute('hidden');
    };
    PacemBalloon.prototype.registerEvents = function () {
        var $popup = this.ensurePopup(), balloonConsts = this.balloonConsts;
        switch (this.opts.behavior) {
            case balloonConsts.behaviors.MENULIKE:
                switch (this.opts.trigger) {
                    case balloonConsts.triggers.FOCUS:
                        $popup.addEventListener('mousedown', this.stopPropagationDelegate, false);
                        // do nothing else: only the blur event will pop the balloon out
                        break;
                    case balloonConsts.triggers.CLICK:
                        $popup.addEventListener('mousedown', this.stopPropagationDelegate, false);
                        window.document.body.addEventListener('mousedown', this.outConditionalDelegate, false);
                        break;
                    default:
                        $popup.addEventListener('mouseenter', this.hoverDelegate, false);
                        $popup.addEventListener('mouseleave', this.outDelegate, false);
                        break;
                }
                $popup.dataset[balloonConsts.vars.TRIGGER] = this.uid;
                break;
            case balloonConsts.behaviors.TOOLTIP:
                switch (this.opts.trigger) {
                    case balloonConsts.triggers.FOCUS:
                    case balloonConsts.triggers.CLICK:
                        window.document.body.addEventListener('mousedown', this.outConditionalDelegate, false);
                        break;
                    default:
                        break;
                }
                $popup.dataset[balloonConsts.vars.TRIGGER] = this.uid;
                break;
        }
    };
    PacemBalloon.prototype.unregisterEvents = function (popup) {
        var $popup = this.ensurePopup(popup);
        var opts = this.opts, balloonConsts = this.balloonConsts;
        switch (opts.behavior) {
            case balloonConsts.behaviors.MENULIKE:
                switch (opts.trigger) {
                    case balloonConsts.triggers.CLICK:
                        $popup.removeEventListener('mousedown', this.stopPropagationDelegate, false);
                        window.document.body.removeEventListener('mousedown', this.outConditionalDelegate, false);
                        break;
                    default:
                        $popup.removeEventListener('mouseenter', this.hoverDelegate, false);
                        $popup.removeEventListener('mouseleave', this.outDelegate, false);
                        break;
                }
                break;
            case balloonConsts.behaviors.TOOLTIP:
                switch (opts.trigger) {
                    case balloonConsts.triggers.CLICK:
                        window.document.body.removeEventListener('mousedown', this.outConditionalDelegate, false);
                        break;
                }
                break;
        }
    };
    PacemBalloon.prototype.popup = function () {
        var _this = this;
        var $popup = this.ensurePopup(), balloonConsts = this.balloonConsts;
        var sameTrigger = $popup.dataset[balloonConsts.vars.TRIGGER] == this.uid;
        var isVisible = pacem_core_1.PacemUtils.isVisible($popup);
        if (isVisible && sameTrigger)
            return;
        // attach closured behavior to popup
        //if (!sameTrigger) {
        this.registerEvents(); // $popup.on('mouseenter', obj.methods.hover).on('mouseleave', obj.methods.out).data(vars.TRIGGER, obj);
        //}
        var $el = this.element.nativeElement;
        // recompute coords, just in the case...
        var coords = pacem_core_1.PacemUtils.offset($el);
        //
        $popup.style.visibility = 'hidden';
        $popup.removeAttribute('hidden');
        window.requestAnimationFrame(function () {
            var opts = _this.opts, pos = balloonConsts.positions;
            var chosenPosition = opts.position;
            if (chosenPosition != pos.TOP && chosenPosition != pos.BOTTOM && chosenPosition != pos.LEFT && chosenPosition != pos.RIGHT) {
                var viewportPosition = $el.getBoundingClientRect();
                var vieportSize = pacem_core_1.PacemUtils.windowSize;
                var viewportHeight = vieportSize.height;
                var viewportWidth = vieportSize.width;
                var offsetLeft = viewportPosition.left;
                var offsetTop = viewportPosition.top;
                var offsetBottom = viewportHeight - viewportPosition.bottom;
                var offsetRight = viewportWidth - viewportPosition.right;
                // exclude 'left' and 'right' when position is set to 'auto'
                var maxOffset = Math.max(/*offsetLeft, offsetRight,*/ offsetTop, offsetBottom);
                switch (maxOffset) {
                    case offsetTop:
                        chosenPosition = pos.TOP;
                        break;
                    case offsetBottom:
                        chosenPosition = pos.BOTTOM;
                        break;
                    // keep the LEFT and RIGHT here, so that 'auto' position will only pick among 'top' and 'bottom'
                    case offsetLeft:
                        chosenPosition = pos.LEFT;
                        break;
                    case offsetRight:
                        chosenPosition = pos.RIGHT;
                        break;
                }
            }
            switch (chosenPosition) {
                case pos.TOP:
                    pacem_core_1.PacemUtils.addClass($popup, 'pacem-balloon-top');
                    coords.top -= $popup.offsetHeight;
                    break;
                case pos.LEFT:
                    pacem_core_1.PacemUtils.addClass($popup, 'pacem-balloon-left');
                    coords.left -= $popup.offsetWidth;
                    break;
                case pos.RIGHT:
                    pacem_core_1.PacemUtils.addClass($popup, 'pacem-balloon-right');
                    coords.left += $el.offsetWidth;
                    break;
                default:
                    pacem_core_1.PacemUtils.addClass($popup, 'pacem-balloon-bottom');
                    coords.top += $el.offsetHeight;
                    break;
            }
            coords.top += opts.verticalOffset;
            coords.left += opts.horizontalOffset;
            //
            $popup.style.top = Math.round(coords.top) + 'px';
            $popup.style.left = Math.round(coords.left) + 'px';
            $popup.style.visibility = 'visible';
            //
            _this.onpopup.emit({});
        });
    };
    PacemBalloon.prototype.popout = function (popup) {
        var _this = this;
        var $popup = this.ensurePopup(popup);
        if (!pacem_core_1.PacemUtils.isVisible($popup))
            return;
        // detach closured behavior from popup
        this.unregisterEvents($popup);
        //
        $popup.setAttribute('hidden', 'hidden');
        pacem_core_1.PacemUtils.removeClass($popup, 'pacem-balloon-top pacem-balloon-bottom pacem-balloon-right pacem-balloon-left');
        window.requestAnimationFrame(function () {
            _this.onpopout.emit({});
        });
    };
    //#endregion
    PacemBalloon.prototype.removeHandlers = function () {
        var el = this.element.nativeElement;
        el.removeEventListener('mouseenter', this.hoverDelegate, false);
        el.removeEventListener('mouseleave', this.outDelegate, false);
        el.removeEventListener('mousedown', this.popoutDelegate, false);
        el.removeEventListener('click', this.toggleDelegate, false);
        el.removeEventListener('focus', this.hoverDelegate, false);
        el.removeEventListener('blur', this.outDelegate, false);
    };
    PacemBalloon.prototype.resetBalloon = function () {
        var balloon = this.ensurePopup(), balloonConsts = this.balloonConsts, el = this.element.nativeElement, oldBalloon;
        if (oldBalloon = this.opts.popup) {
            this.popout(oldBalloon);
            this.destroyPopup(oldBalloon);
        }
        if (balloon) {
            this.popout();
            // remove handlers before regenerating the `opts`
            this.removeHandlers();
            // regenerate opts popup
            var opts = pacem_core_1.PacemUtils.extend(this.opts, JSON.parse(JSON.stringify(balloonConsts.defaults)), { 'popup': balloon }, this.pacemBalloonOptions);
            if (!!opts.disabled)
                return;
            switch (opts.trigger) {
                case balloonConsts.triggers.HOVER:
                    el.addEventListener('mouseenter', this.hoverDelegate, false);
                    el.addEventListener('mouseleave', this.outDelegate, false);
                    el.addEventListener('mousedown', this.popoutDelegate, false);
                    break;
                case balloonConsts.triggers.FOCUS:
                    el.addEventListener('focus', this.hoverDelegate, false);
                    el.addEventListener('blur', this.outDelegate, false);
                    break;
                case balloonConsts.triggers.CLICK:
                    opts.hoverDelay = opts.hoverTimeout = 0;
                    el.addEventListener('click', this.toggleDelegate, false) /*.blur(obj.methods.out)*/;
                    break;
            }
        }
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PacemBalloon.prototype, "pacemBalloon", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], PacemBalloon.prototype, "pacemBalloonOptions", void 0);
    __decorate([
        core_1.Output('popup'), 
        __metadata('design:type', Object)
    ], PacemBalloon.prototype, "onpopup", void 0);
    __decorate([
        core_1.Output('popout'), 
        __metadata('design:type', Object)
    ], PacemBalloon.prototype, "onpopout", void 0);
    PacemBalloon = __decorate([
        core_1.Directive({
            selector: '[pacemBalloon]'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef, core_1.KeyValueDiffers, core_1.Renderer])
    ], PacemBalloon);
    return PacemBalloon;
}());
exports.PacemBalloon = PacemBalloon;
/**
 * PacemInViewport Directive
 */
var PacemInViewport = (function () {
    function PacemInViewport(element) {
        var _this = this;
        this.element = element;
        this.pacemInViewport = new core_1.EventEmitter();
        this._throttler = 0;
        this._visible = false;
        this._scrollHandler = function (_) {
            clearTimeout(_this._throttler);
            _this._throttler = window.setTimeout(function () {
                var el = _this.element.nativeElement, newviz = _this._isElementVisible(el);
                if (newviz !== _this._visible) {
                    var visible = _this._visible = newviz;
                    _this.pacemInViewport.emit({ visible: visible });
                    if (!!visible)
                        pacem_core_1.PacemUtils.addClass(el, 'pacem-in-viewport');
                    else
                        pacem_core_1.PacemUtils.removeClass(el, 'pacem-in-viewport');
                }
            }, 100);
        };
    }
    PacemInViewport.prototype.addEventListeners = function (what) {
        for (var _i = 0, _a = PacemInViewport._events; _i < _a.length; _i++) {
            var evt = _a[_i];
            what.addEventListener(evt, this._scrollHandler, false);
        }
    };
    PacemInViewport.prototype.removeEventListeners = function (what) {
        for (var _i = 0, _a = PacemInViewport._events; _i < _a.length; _i++) {
            var evt = _a[_i];
            what.removeEventListener(evt, this._scrollHandler, false);
        }
    };
    PacemInViewport.prototype.ngOnInit = function () {
        var el = this.element.nativeElement.parentElement;
        this.addEventListeners(window);
        while (el) {
            this.addEventListeners(el);
            el = el.parentElement;
        }
        this._scrollHandler();
    };
    PacemInViewport.prototype.ngOnDestroy = function () {
        var el = this.element.nativeElement.parentElement;
        this.removeEventListeners(window);
        while (el) {
            this.removeEventListeners(el);
            el = el.parentElement;
        }
    };
    PacemInViewport.prototype._isElementVisible = function (el) {
        var vportSize = pacem_core_1.PacemUtils.windowSize;
        var doc = window.document, rect = el.getBoundingClientRect(), vWidth = vportSize.width, vHeight = vportSize.height, efp = function (x, y) { return document.elementFromPoint(x, y); };
        return rect.bottom > 0 && rect.top < (0 + vHeight)
            && (this.pacemInViewportIgnoreHorizontal || (rect.left < (vWidth + 0) && rect.right > 0));
    };
    PacemInViewport._events = 'DOMContentLoaded load resize scroll'.split(' ');
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], PacemInViewport.prototype, "pacemInViewport", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], PacemInViewport.prototype, "pacemInViewportIgnoreHorizontal", void 0);
    PacemInViewport = __decorate([
        core_1.Directive({
            selector: '[pacemInViewport]'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], PacemInViewport);
    return PacemInViewport;
}());
exports.PacemInViewport = PacemInViewport;
function base64toBlob(b64Data, contentType, sliceSize) {
    if (sliceSize === void 0) { sliceSize = 512; }
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}
/**
 * PacemUploader Component
 */
var PacemUploader = (function () {
    function PacemUploader() {
        var _this = this;
        this.oncomplete = new core_1.EventEmitter();
        this.changeDelegate = function (_) { return _this.change(_); };
        this.fields = {
            'undo': 'undo',
            'retry': 'retry',
            'parallelism': 3,
            'uid': '',
            'ongoing': 0,
            'enqueuer': null,
            'blob': null,
            'retryFrom': 0,
            'undone': false
        };
        this.uploading = false;
        this.size = 0;
        this.percentage = .0;
        this.complete = false;
        this.failed = false;
        this.invalidFile = false;
    }
    Object.defineProperty(PacemUploader.prototype, "undoCaption", {
        set: function (v) {
            this.fields.undo = v || 'undo';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemUploader.prototype, "retryCaption", {
        set: function (v) {
            this.fields.retry = v || 'retry';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemUploader.prototype, "parallelism", {
        set: function (v) {
            this.fields.parallelism = v > 0 ? v : 3;
        },
        enumerable: true,
        configurable: true
    });
    PacemUploader.prototype.ngAfterViewInit = function () {
        this.fileupload.nativeElement.addEventListener('change', this.changeDelegate, false);
    };
    PacemUploader.prototype.ngOnDestroy = function () {
        this.fileupload.nativeElement.removeEventListener('change', this.changeDelegate, false);
    };
    PacemUploader.prototype.upload = function (file, filename) {
        var Uploader = this, fields = Uploader.fields;
        if (!file)
            return;
        if (!filename)
            filename = file.name;
        Uploader.failed = false;
        fields.undone = false;
        fields.ongoing = 0;
        var blob = file;
        filename = filename.substr(filename.lastIndexOf('\\') + 1);
        var pattern = Uploader['pattern'];
        if (pattern && !(new RegExp(pattern, 'i').test(filename))) {
            Uploader.invalidFile = true;
            return;
        }
        Uploader.invalidFile = false;
        var size = Uploader.size = blob.size;
        Uploader.percentage = .0;
        Uploader.complete = false;
        //
        var formData = new FormData();
        formData.append("filename", filename);
        formData.append("length", size);
        //
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Uploader['startUploadUrl'], true);
        xhr.onload = function (e) {
            if (this.status == 200) {
                var json = JSON.parse(this.responseText);
                if (!!json.success) {
                    fields.retryFrom = 0;
                    fields.blob = blob;
                    fields.uid = json.result.Uid;
                    Uploader.manage();
                }
            }
        };
        xhr.send(formData);
        Uploader.uploading = true;
    };
    PacemUploader.prototype.doUpload = function (blob, skip) {
        var Uploader = this, fields = Uploader.fields;
        fields.ongoing++;
        //
        var reader = new FileReader();
        reader.onloadend = function () {
            var formData = new FormData();
            formData.append("chunk", reader.result.substr(reader.result.indexOf('base64,') + 7));
            formData.append("position", skip);
            formData.append("uid", fields.uid);
            //
            var xhr = new XMLHttpRequest();
            xhr.open('POST', Uploader.doUploadUrl, true);
            xhr.onload = function (e) {
                fields.ongoing--;
                if (!!fields.undone)
                    return;
                if (this.status == 200) {
                    // Note: .response instead of .responseText
                    var json = JSON.parse(this.responseText);
                    if (!!json.success) {
                        Uploader.percentage = json.result.Percentage;
                        if (Uploader.complete != json.result.Complete) {
                            Uploader.complete = json.result.Complete;
                            var fn;
                            if (Uploader.complete === true) {
                                Uploader.uploading = false;
                                Uploader.oncomplete.emit(json.result);
                            }
                        }
                    }
                    else {
                        fields.retryFrom = skip;
                        Uploader.failed = true;
                        Uploader.uploading = false;
                        console.error(json.error);
                    }
                }
                else {
                    fields.retryFrom = skip;
                    Uploader.uploading = false;
                    Uploader.failed = true;
                }
            };
            xhr.send(formData);
        };
        reader.readAsDataURL(blob);
    };
    PacemUploader.prototype.manage = function () {
        var _this = this;
        var Uploader = this;
        var fields = Uploader.fields;
        var start = fields.retryFrom;
        var size = Uploader.size;
        var blob = fields.blob;
        var BYTES_PER_CHUNK = 1024 * 256; // 0.25MB chunk sizes.
        var end = start + BYTES_PER_CHUNK;
        //
        fields.enqueuer = setInterval(function () {
            if (start < size && !Uploader.failed) {
                if (fields.ongoing >= fields.parallelism)
                    return;
                _this.doUpload(blob.slice(start, end), start);
                start = end;
                end = start + BYTES_PER_CHUNK;
            }
            else {
                var input = Uploader.fileupload.nativeElement;
                input.value = '';
                window.clearInterval(fields.enqueuer);
            }
        }, 100);
    };
    PacemUploader.prototype.change = function (e) {
        var Uploader = this, 
        //    fields = Uploader.fields,
        input = Uploader.fileupload.nativeElement;
        //var filename = input.value;
        var blob = input.files[0];
        Uploader.upload(blob, input.value);
    };
    PacemUploader.prototype.undo = function (e) {
        e.preventDefault();
        e.stopPropagation();
        var Uploader = this, fields = Uploader.fields, input = Uploader.fileupload.nativeElement;
        clearInterval(fields.enqueuer);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', Uploader.undoUploadUrl, true);
        xhr.onload = function (e) {
            if (this.status == 200) {
                // Note: .response instead of .responseText
                var json = JSON.parse(this.responseText);
                if (!!json.success) {
                    input.value = '';
                    fields.undone = true;
                    Uploader.size = 0;
                    Uploader.percentage = .0;
                    Uploader.uploading = false;
                }
            }
        };
        var formData = new FormData();
        formData.append("uid", fields.uid);
        xhr.send(formData);
    };
    PacemUploader.prototype.retry = function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.failed = false;
        this.manage();
    };
    __decorate([
        core_1.ViewChild('fileupload'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemUploader.prototype, "fileupload", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], PacemUploader.prototype, "undoCaption", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String), 
        __metadata('design:paramtypes', [String])
    ], PacemUploader.prototype, "retryCaption", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], PacemUploader.prototype, "pattern", void 0);
    __decorate([
        core_1.Input('startUrl'), 
        __metadata('design:type', String)
    ], PacemUploader.prototype, "startUploadUrl", void 0);
    __decorate([
        core_1.Input('uploadUrl'), 
        __metadata('design:type', String)
    ], PacemUploader.prototype, "doUploadUrl", void 0);
    __decorate([
        core_1.Input('undoUrl'), 
        __metadata('design:type', String)
    ], PacemUploader.prototype, "undoUploadUrl", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PacemUploader.prototype, "parallelism", null);
    __decorate([
        core_1.Output('complete'), 
        __metadata('design:type', Object)
    ], PacemUploader.prototype, "oncomplete", void 0);
    PacemUploader = __decorate([
        core_1.Component({
            selector: 'pacem-uploader',
            template: "<div class=\"pacem-uploader\">\n    <div class=\"pacem-uploader-filewrapper\" \n         [hidden]=\"(uploading || failed)\"><input type=\"file\" #fileupload /></div>\n    <button class=\"pacem-uploader-retry\" \n            [title]=\"fields.retry\" \n            [hidden]=\"!failed\" \n            (click)=\"retry($event)\">{{ fields.retry }}</button>\n    <button class=\"pacem-uploader-undo\" \n            [title]=\"fields.undo\" \n            (click)=\"undo($event)\" \n            [hidden]=\"!uploading\">{{ fields.undo }}</button>\n</div>"
        }), 
        __metadata('design:paramtypes', [])
    ], PacemUploader);
    return PacemUploader;
}());
exports.PacemUploader = PacemUploader;
function stripBase64FromDataURL(dataURL) {
    return dataURL.replace(/^data:image\/[\w]+;base64,/i, '');
}
var _getUserMedia = null;
function hasUserMedia() {
    return uiAdapter.getUserMedia().length > 0;
}
var uiAdapter = {
    getUserMedia: function () {
        if (_getUserMedia == null) {
            var methods = [navigator['getUserMedia'], navigator['webkitGetUserMedia'], navigator['msGetUserMedia'], navigator['mozGetUserMedia']];
            var fns = methods.filter(function (fn, j) { return typeof fn == 'function'; });
            if (fns.length)
                _getUserMedia = fns;
            else
                _getUserMedia = [];
        }
        return _getUserMedia;
    },
    stripBase64FromDataURL: stripBase64FromDataURL,
    adaptElementToCanvas: function (el, ctx, srcW, srcH) {
        var tgetW = ctx.canvas.width;
        var tgetH = ctx.canvas.height;
        var cnvW = tgetW, cnvH = tgetH;
        var w = srcW || (1.0 * el.width), h = srcH || (1.0 * el.height);
        //console.log('img original size: ' + w + 'x' + h);
        var ratio = w / h;
        var tgetRatio = tgetW / tgetH;
        if (tgetRatio > ratio) {
            // crop vertically
            var f = tgetW / w;
            tgetH = f * h;
            ctx.drawImage(el, 0, .5 * (-tgetH + cnvH), cnvW, tgetH);
        }
        else {
            // crop horizontally
            var f = tgetH / h;
            tgetW = f * w;
            ctx.drawImage(el, -Math.abs(.5 * (-tgetW + cnvW)), 0, tgetW, cnvH);
        }
    },
    adaptImageToCanvas: function (buffer, canvas) {
        buffer = stripBase64FromDataURL(buffer);
        var cnv = canvas;
        var ctx = cnv.getContext('2d');
        var deferred = pacem_core_1.PacemPromise.defer();
        var img = new Image();
        img.onload = function () {
            uiAdapter.adaptElementToCanvas(img, ctx);
            deferred.resolve(stripBase64FromDataURL(cnv.toDataURL()));
        };
        img.src = 'data:image/png;base64,' + buffer;
        return deferred.promise;
    }
};
/**
 * PacemSnapshot Component
 */
var PacemSnapshot = (function () {
    function PacemSnapshot(cref) {
        this.cref = cref;
        this.onselect = new core_1.EventEmitter();
        this._status = 'start';
        this.previousStatuses = [];
        this.webcamInitialized = false;
        this.countdown = 0;
        this.processing = false;
        this.canUseWebcam = hasUserMedia();
    }
    Object.defineProperty(PacemSnapshot.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (v) {
            if (v != this._status) {
                this.previousStatuses.push(this._status);
                this._status = v;
            }
        },
        enumerable: true,
        configurable: true
    });
    PacemSnapshot.prototype.pick = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.branch = 'pick';
        this.grabber.nativeElement.click();
    };
    PacemSnapshot.prototype.take = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.ensureWebcamRunning();
        this.branch = 'take';
        this.status = 'taking';
    };
    PacemSnapshot.prototype.confirm = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        this.onselect.emit(base64toBlob(this.buffer, 'image/jpeg'));
        this.previousStatuses.splice(0);
        this._status = 'start';
        this.cref.detectChanges();
        this.buffer = '';
    };
    PacemSnapshot.prototype.back = function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.previousStatuses.length <= 0)
            return;
        var prev = this.previousStatuses.pop();
        this._status = prev;
        this.cref.detectChanges();
    };
    PacemSnapshot.prototype.handleFiles = function (_) {
        var me = this;
        var files = me.grabber.nativeElement.files;
        if (files.length) {
            var file = files[0];
            var type = file.type.toLowerCase();
            var pattern = /^image\/(png|[p]?jpeg|bmp|gif)/i;
            if (pattern.test(type)) {
                var reader = new FileReader();
                me.processing = true;
                reader.onload = function (evt) {
                    var dataURL = evt.target['result'];
                    me.refreshBuffer(dataURL).success(function (b) {
                        me.processing = false;
                        me.grabber.nativeElement.value = '';
                        me.setToBeConfirmed(b);
                    });
                };
                reader.readAsDataURL(file);
            }
        }
    };
    PacemSnapshot.prototype.setToBeConfirmed = function (buffer) {
        this.status = 'confirm';
        this.buffer = buffer;
        this.cref.detectChanges();
        //this.onselect.emit(b);
    };
    PacemSnapshot.prototype.refreshBuffer = function (buffer) {
        var cnv = this.canvas.nativeElement;
        cnv.width = cnv.clientWidth;
        cnv.height = cnv.clientHeight;
        return uiAdapter.adaptImageToCanvas(buffer, cnv);
    };
    PacemSnapshot.prototype.ensureWebcamRunning = function () {
        if (this.canUseWebcam && !this.webcamInitialized) {
            var me = this;
            me.webcamInitialized = true;
            _getUserMedia[0].apply(navigator, [{ video: true /*, audio: false*/ },
                /* success */ function (localMediaStream) {
                    var video = me.video.nativeElement;
                    video.src = window.URL.createObjectURL(localMediaStream);
                    function timeout() {
                        me.cref.detectChanges();
                        if (me.countdown <= 0) {
                            var cnv = document.createElement('canvas');
                            cnv.width = video.clientWidth;
                            cnv.height = video.clientHeight;
                            var ctx = cnv.getContext('2d');
                            uiAdapter.adaptElementToCanvas(video, ctx, video.videoWidth, video.videoHeight);
                            cnv.style.position = 'absolute';
                            var root_1 = me.root.nativeElement;
                            root_1.insertBefore(cnv, video);
                            cnv.className = 'pacem-brightout pacem-preview';
                            setTimeout(function () {
                                root_1.removeChild(cnv);
                            }, 2000);
                            me.refreshBuffer(cnv.toDataURL()).success(function (b) { return me.setToBeConfirmed(b); });
                        }
                        else
                            setTimeout(function () { me.countdown--; timeout(); }, 1000);
                    }
                    video.addEventListener('click', function (evt) {
                        me.countdown = 3;
                        timeout();
                    }, false);
                }, function (e) {
                    alert((e || e.message).toString());
                }]);
        }
    };
    __decorate([
        core_1.ViewChild('grabber'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemSnapshot.prototype, "grabber", void 0);
    __decorate([
        core_1.ViewChild('stage'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemSnapshot.prototype, "canvas", void 0);
    __decorate([
        core_1.ViewChild('player'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemSnapshot.prototype, "video", void 0);
    __decorate([
        core_1.ViewChild('root'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemSnapshot.prototype, "root", void 0);
    __decorate([
        core_1.Output('select'), 
        __metadata('design:type', Object)
    ], PacemSnapshot.prototype, "onselect", void 0);
    PacemSnapshot = __decorate([
        core_1.Component({
            selector: 'pacem-snapshot',
            template: "<div class=\"pacem-snapshot\" [ngClass]=\"{ 'pacem-ongoing': status != 'start' }\"  #root>\n    \n    <button (click)=\"$event.preventDefault(); $event.stopPropagation(); pick($event)\" class=\"pacem-browse\" [pacemHidden]=\"status != 'start'\"></button>\n    <button (click)=\"$event.preventDefault(); $event.stopPropagation(); take($event)\" class=\"pacem-camera\" [pacemHidden]=\"status != 'start'\"></button>\n    \n    <canvas class=\"pacem-preview\" \n            [ngClass]=\"{ 'pacem-taking': branch == 'take' && status != 'start' }\" \n            #stage [pacemHidden]=\"status != 'confirm'\"></canvas>\n    <!--<div class=\"pacem-snapshot-progress\" [hidden]=\"!processing\"></div>-->\n    <input type=\"file\" #grabber accept=\"image/*\" capture=\"camera\" (change)=\"handleFiles($event)\" hidden />\n    <video *ngIf=\"canUseWebcam\"\n            [ngClass]=\"{ 'pacem-taking': branch == 'take' && status != 'start' }\" \n            [pacemHidden]=\"status != 'taking'\"\n            autoplay=\"autoplay\"\n            #player></video>\n    <button class=\"pacem-countdown\" \n            [pacemHidden]=\"countdown <= 0\">{{ countdown }}</button>\n    <button class=\"pacem-undo\" [pacemHidden]=\"status == 'start' || countdown > 0\" (click)=\"back($event)\"></button>\n    <button class=\"pacem-confirm\" [pacemHidden]=\"status != 'confirm'\" (click)=\"confirm($event)\"></button>\n    <span [hidden]=\"canUseWebcam\"><ng-content></ng-content></span>\n</div>"
        }), 
        __metadata('design:paramtypes', [core_1.ChangeDetectorRef])
    ], PacemSnapshot);
    return PacemSnapshot;
}());
exports.PacemSnapshot = PacemSnapshot;
/**
 * PacemRingChartItem Component
 */
var PacemRingChartItem = (function () {
    function PacemRingChartItem(renderer) {
        this.renderer = renderer;
        this.stroke = '#fff';
        this.thickness = 10;
        this.value = .0;
        this.valuechange = new core_1.EventEmitter();
        this.max = 100.0;
        this._round = 0;
        this.pointerStream = new Rx_1.Subject();
    }
    PacemRingChartItem.prototype.ngAfterViewInit = function () {
        this.canvas = this.element.nativeElement;
        this.context2D = this.canvas.getContext('2d');
        this.draw();
    };
    PacemRingChartItem.prototype.ngOnChanges = function () {
        this.draw();
    };
    Object.defineProperty(PacemRingChartItem.prototype, "round", {
        set: function (v) {
            if (Math.round(v) != v || v < 0)
                throw this.constructor.name + ": round value must be an integer greater or equal to zero.";
            this._round = v;
        },
        enumerable: true,
        configurable: true
    });
    PacemRingChartItem.prototype.startDrag = function (evt) {
        var _this = this;
        if (!this.interactive)
            return;
        evt.stopPropagation();
        var offset = pacem_core_1.PacemUtils.offset(this.canvas);
        this.pivotPoint = {
            x: offset.left + this.canvas.clientWidth * .5,
            y: offset.top + this.canvas.clientHeight * .5
        };
        this.subscription = this.pointerStream
            .asObservable()
            .subscribe(function (pt) {
            var roundAngle = 2 * Math.PI;
            var angle = Math.atan2(pt.x - _this.pivotPoint.x, -pt.y + _this.pivotPoint.y);
            var round = Math.pow(10, _this._round);
            var value = Math.round(round * ((roundAngle + angle) % roundAngle) * _this.max / roundAngle) / round;
            _this.value = value;
            _this.valuechange.emit(value);
        });
    };
    PacemRingChartItem.prototype.drag = function (evt) {
        if (!this.interactive || !this.pivotPoint)
            return;
        evt.preventDefault();
        evt.stopPropagation();
        var rect = this.canvas.getBoundingClientRect();
        /*let pt = {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
        }*/
        var pt = { x: evt.pageX, y: evt.pageY };
        this.pointerStream.next(pt);
    };
    PacemRingChartItem.prototype.drop = function (evt) {
        if (!this.interactive || !this.pivotPoint)
            return;
        evt.preventDefault();
        evt.stopPropagation();
        this.subscription.unsubscribe();
        this.pivotPoint = null;
    };
    //#endregion
    PacemRingChartItem.prototype.draw = function () {
        if (!this.canvas)
            return;
        var v = this.value / this.max, cnv = this.canvas, ctx = this.context2D, thickness = this.thickness || 10;
        var maxDim = Math.min(this.canvas.offsetHeight, this.canvas.offsetHeight);
        var dim = maxDim;
        if (dim <= 0)
            return;
        // sweep the stage
        cnv.width =
            cnv.height = dim; //element.height();
        var color = getComputedStyle(cnv).color;
        var bgcolor = getComputedStyle(cnv).borderColor || 'rgba(255,255,255,.1)';
        ctx.beginPath();
        var x = cnv.width * .5;
        var y = cnv.height * .5;
        var r = Math.min(x, y) - thickness * .5;
        var mathPI2 = Math.PI * .5;
        var to = -mathPI2 + 2 * Math.PI * v;
        ctx.arc(x, y, r, -mathPI2, to, false);
        ctx.lineWidth = thickness;
        // line color
        ctx.strokeStyle = color;
        ctx.stroke();
        // filler
        ctx.beginPath();
        ctx.arc(x, y, r, to + Math.PI / 60.0, 1.5 * Math.PI, false);
        ctx.lineWidth = thickness;
        // line color
        ctx.strokeStyle = bgcolor;
        ctx.stroke();
    };
    __decorate([
        core_1.ViewChild('canvas'), 
        __metadata('design:type', core_1.ElementRef)
    ], PacemRingChartItem.prototype, "element", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], PacemRingChartItem.prototype, "stroke", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PacemRingChartItem.prototype, "thickness", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PacemRingChartItem.prototype, "value", void 0);
    __decorate([
        core_1.Output('valueChange'), 
        __metadata('design:type', Object)
    ], PacemRingChartItem.prototype, "valuechange", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PacemRingChartItem.prototype, "max", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], PacemRingChartItem.prototype, "interactive", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PacemRingChartItem.prototype, "round", null);
    PacemRingChartItem = __decorate([
        core_1.Component({
            selector: 'pacem-ring-chart-item',
            template: "<canvas class=\"pacem-ring-chart-item\" #canvas \n[ngClass]=\"{ 'pacem-interactive': interactive }\"\n(mousedown)=\"startDrag($event)\" (window:mousemove)=\"drag($event)\" (window:mouseup)=\"drop($event)\"></canvas>"
        }), 
        __metadata('design:paramtypes', [core_1.Renderer])
    ], PacemRingChartItem);
    return PacemRingChartItem;
}());
exports.PacemRingChartItem = PacemRingChartItem;
/**
 * PacemRingChart Component
 */
var PacemRingChart = (function () {
    function PacemRingChart() {
        var _this = this;
        this.subscription = null;
        this.throttler = 0;
        this.resizeHandler = function (_) {
            clearTimeout(_this.throttler);
            _this.throttler = window.setTimeout(function () { return _this.redraw(); }, 20);
        };
    }
    PacemRingChart.prototype.ngAfterContentInit = function () {
        var _this = this;
        this.subscription = this.items.changes.subscribe(function () { return _this.redraw(); });
        window.addEventListener('resize', this.resizeHandler, false);
        this.redraw();
    };
    PacemRingChart.prototype.ngOnDestroy = function () {
        window.removeEventListener('resize', this.resizeHandler, false);
        this.subscription.unsubscribe();
    };
    PacemRingChart.prototype.redraw = function () {
        this.items.forEach(function (item) { return item.draw(); });
    };
    __decorate([
        core_1.ContentChildren(PacemRingChartItem), 
        __metadata('design:type', core_1.QueryList)
    ], PacemRingChart.prototype, "items", void 0);
    PacemRingChart = __decorate([
        core_1.Component({
            selector: 'pacem-ring-chart',
            template: "<div class=\"pacem-ring-chart\"><ng-content></ng-content></div>"
        }), 
        __metadata('design:paramtypes', [])
    ], PacemRingChart);
    return PacemRingChart;
}());
exports.PacemRingChart = PacemRingChart;
/**
 * PacemPieChartSlice Directive
 */
var PacemPieChartSlice = (function () {
    function PacemPieChartSlice(ref) {
        this.ref = ref;
        this._value = .0;
    }
    Object.defineProperty(PacemPieChartSlice.prototype, "value", {
        get: function () { return this._value; },
        set: function (v) {
            if (v === this._value)
                return;
            this._value = v || .0;
            if (this.chart)
                this.chart.ping();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PacemPieChartSlice.prototype, "color", {
        get: function () {
            return getComputedStyle(this.ref.nativeElement).color || 'aqua';
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number), 
        __metadata('design:paramtypes', [Number])
    ], PacemPieChartSlice.prototype, "value", null);
    PacemPieChartSlice = __decorate([
        core_1.Directive({
            selector: 'pacem-pie-chart-slice'
        }), 
        __metadata('design:paramtypes', [core_1.ElementRef])
    ], PacemPieChartSlice);
    return PacemPieChartSlice;
}());
exports.PacemPieChartSlice = PacemPieChartSlice;
/**
 * PacemPieChart Component
 */
var PacemPieChart = (function () {
    function PacemPieChart(sce, location) {
        this.sce = sce;
        this.location = location;
        this.supportsSVGTransforms = false;
        this.subj = new Rx_1.Subject();
        this.sum = .0;
        this.supportsSVGTransforms = supportsSVGTransforms();
    }
    PacemPieChart.prototype.ngAfterContentInit = function () {
        var _this = this;
        var render = function () {
            _this.normalize();
            _this.draw();
        };
        var fps = 50;
        this.subscription = this.slices.changes
            .merge(this.subj.asObservable())
            .debounceTime(fps)
            .subscribe(render);
        render();
    };
    /**
     * @internal
     */
    PacemPieChart.prototype.ping = function () {
        this.subj.next({});
    };
    PacemPieChart.prototype.ngOnDestroy = function () {
        if (this.subscription)
            this.subscription.unsubscribe();
    };
    PacemPieChart.prototype.normalize = function () {
        var sum = .0, me = this;
        this.slices.forEach(function (slice) {
            if (slice.chart != me)
                slice.chart = me;
            slice.offset = sum;
            sum += slice.value;
        });
        this.sum = sum;
    };
    PacemPieChart.prototype.draw = function () {
        var _this = this;
        var me = this;
        var sum = me.sum;
        this.slices.forEach(function (item) {
            var slice = item;
            if (sum <= .0 || !slice.value)
                return;
            var value = slice.value / sum, offset = slice.offset / sum;
            //
            var radius = 50;
            var center = { x: radius, y: radius };
            var separator = ' '; //','
            var d = "M" + radius + separator + radius + " m -" + radius + separator + "0 " +
                "a" + radius + separator + radius + " 0 1" + separator + "0 " + (2 * radius) + separator + "0 " +
                "a" + radius + separator + radius + " 0 1" + separator + "0 -" + (2 * radius) + separator + "0 Z";
            // transform
            var theta = 2.0 * Math.PI * offset, phi = 2.0 * Math.PI * value;
            if (value < 1.0) {
                var x0 = 2 * radius;
                var y0 = radius;
                //calculate x,y coordinates of the point on the circle to draw the arc to. 
                var x1 = radius * (1.0 + Math.cos(phi));
                var y1 = radius * (1.0 - Math.sin(phi));
                if (!_this.supportsSVGTransforms) {
                    x0 = radius * (1.0 + Math.cos(theta));
                    y0 = radius * (1.0 - Math.sin(theta));
                    x1 = radius * (1.0 + Math.cos(phi + theta));
                    y1 = radius * (1.0 - Math.sin(phi + theta));
                }
                //should the arc go the long way round?
                var longArc = (value <= .5) ? 0 : 1;
                //d is a string that describes the path of the slice.
                d = "M" + radius + separator + radius + " L" + x0 + separator + y0 + " A" + radius + separator + radius + " 0 " + longArc + separator + "0 " + x1 + separator + y1 + " Z";
            }
            slice.path = d;
            var displacement = 0; //2.5;
            var displaceX = displacement * Math.cos(theta + phi * .5), displaceY = -displacement * Math.sin(theta + phi * .5);
            if (_this.supportsSVGTransforms) {
                var style = 'transform: translateX(' + displaceX + 'px) translateY(' + displaceY + 'px) rotate(' + (-theta) + 'rad);';
                style += 'transform-origin: 50px 50px;';
                style += 'transition: transform 0.2s ease-in-out;';
                slice.style = me.sce.bypassSecurityTrustStyle(style);
            }
        });
    };
    __decorate([
        core_1.ContentChildren(PacemPieChartSlice), 
        __metadata('design:type', core_1.QueryList)
    ], PacemPieChart.prototype, "slices", void 0);
    PacemPieChart = __decorate([
        core_1.Component({
            selector: 'pacem-pie-chart',
            template: "<div class=\"pacem-pie-chart\">\n<ng-content></ng-content>\n    <svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"0,0,100,100\" width=\"100%\" height=\"100%\">\n    <defs>\n    <mask id=\"slices-mask\">\n        <circle cx=\"50\" cy=\"50\" r=\"45\" fill=\"#fff\" />\n        <circle cx=\"50\" cy=\"50\" r=\"15\" fill=\"#000\" />\n    </mask>\n    <mask id=\"inner-mask\">\n        <circle cx=\"50\" cy=\"50\" r=\"50\" fill=\"#fff\" />\n        <circle cx=\"50\" cy=\"50\" r=\"10\" fill=\"#000\" />\n    </mask>\n    </defs>\n    <circle cx=\"50\" cy=\"50\" r=\"50\" [attr.mask]=\"'url('+ location.path() +'#inner-mask)'\" class=\"pacem-pie-chart-background\" />\n    <g>\n        <svg:path *ngFor=\"let slice of slices\" \n                [attr.mask]=\"'url('+ location.path() +'#slices-mask)'\"\n                [attr.fill]=\"slice.color\" \n                [attr.d]=\"slice.path\"\n                [attr.style]=\"slice.style\"></svg:path>\n    </g>\n</svg></div>"
        }), 
        __metadata('design:paramtypes', [platform_browser_1.DomSanitizationService, common_1.Location])
    ], PacemPieChart);
    return PacemPieChart;
}());
exports.PacemPieChart = PacemPieChart;
/**
 * PacemToast Component
 */
var PacemToast = (function () {
    function PacemToast() {
        this.autohide = true;
        this.timeout = 4000;
        this.onclose = new core_1.EventEmitter();
        this._hide = true;
    }
    Object.defineProperty(PacemToast.prototype, "hidden", {
        get: function () {
            return this._hide;
        },
        set: function (v) {
            if (v != this._hide) {
                this._hide = v;
                if (this._hide)
                    this.onclose.emit({});
            }
        },
        enumerable: true,
        configurable: true
    });
    PacemToast.prototype.doHide = function (evt) {
        window.clearTimeout(this._timeout);
        this.hidden = true;
    };
    PacemToast.prototype.hide = function () {
        this.doHide();
    };
    PacemToast.prototype.show = function () {
        var _this = this;
        window.clearTimeout(this._timeout);
        this.hidden = false;
        if (this.autohide)
            this._timeout = window.setTimeout(function () { _this.hidden = true; }, this.timeout);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Boolean)
    ], PacemToast.prototype, "autohide", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], PacemToast.prototype, "timeout", void 0);
    __decorate([
        core_1.Output('close'), 
        __metadata('design:type', Object)
    ], PacemToast.prototype, "onclose", void 0);
    PacemToast = __decorate([
        core_1.Component({
            selector: 'pacem-toast',
            template: "<div class=\"pacem-toast\" [pacemHidden]=\"hidden\" (click)=\"doHide($event)\"><ng-content></ng-content></div>",
            directives: [PacemHidden]
        }), 
        __metadata('design:paramtypes', [])
    ], PacemToast);
    return PacemToast;
}());
exports.PacemToast = PacemToast;
var PacemBindService = (function () {
    function PacemBindService() {
        this.onset = new core_1.EventEmitter();
        this.onremove = new core_1.EventEmitter();
    }
    /**
     * Sets a target object with a provided unique key.
     * @param key
     * @param target
     */
    PacemBindService.prototype.setTarget = function (key, target) {
        var dict = PacemBindService.targetMappings;
        if (dict.has(key) && dict.get(key) != target)
            throw pacem_core_1.pacem.localization.default.errors.KEY_DUPLICATE.replace(/%s/gi, key);
        dict.set(key, target);
        this.onset.emit(key);
    };
    /**
     * Removes the target object mapped to the provided key, if any.
     * @param key
     */
    PacemBindService.prototype.removeTarget = function (key) {
        var retval = PacemBindService.targetMappings.delete(key);
        this.onremove.emit(key);
        return retval;
    };
    /**
     * Gets the target object corresponding to the provided key.
     * @param key
     */
    PacemBindService.prototype.getTarget = function (key) {
        return PacemBindService.targetMappings.has(key) && PacemBindService.targetMappings.get(key);
    };
    PacemBindService.targetMappings = new Map();
    PacemBindService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], PacemBindService);
    return PacemBindService;
}());
exports.PacemBindService = PacemBindService;
var PacemBindTargets = (function () {
    function PacemBindTargets(bindings, elementRef) {
        this.bindings = bindings;
        this.elementRef = elementRef;
        this.targetKeys = [];
        this.initialized = false;
        this.isBuildingFlag = false;
        this.mappings = new Map();
        var me = this;
        me.subscription = bindings.onset.asObservable().merge(bindings.onremove.asObservable())
            .subscribe(function (_) {
            me.debounceBindersBuild();
        });
    }
    PacemBindTargets.prototype.refresh = function () {
        this.debounceBindersBuild();
    };
    PacemBindTargets.prototype.ngOnInit = function () {
        var uiElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        uiElement.style.position = 'absolute';
        uiElement.classList.add('pacem-bind');
        uiElement.style.top = '0';
        uiElement.style.left = '0';
        uiElement.style.pointerEvents = 'none';
        document.body.appendChild(uiElement);
        this.uiElement = uiElement;
        this.initialized = true;
        this.buildBinders();
    };
    PacemBindTargets.prototype.ngOnChanges = function () {
        this.debounceBindersBuild();
    };
    PacemBindTargets.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
        this.uiElement.remove();
    };
    PacemBindTargets.prototype.debounceBindersBuild = function () {
        var _this = this;
        if (this.isBuildingFlag) {
            console.log('waiting for computations to be completed');
            requestAnimationFrame(function () { return _this.debounceBindersBuild(); });
        }
        else
            this.buildBinders();
    };
    PacemBindTargets.prototype.buildBinders = function () {
        if (!this.initialized || !this.targetKeys)
            return;
        this.isBuildingFlag = true;
        // manage
        var w = 0, h = 0;
        for (var _i = 0, _a = this.targetKeys; _i < _a.length; _i++) {
            var item = _a[_i];
            var key = item['key'] || item;
            var from = item['from'] || 'auto';
            var to = item['to'] || 'auto';
            var css = item['css'];
            var size = this.buildBinder(key, from, to, css);
            if (size) {
                w = Math.max(w, size.x);
                h = Math.max(h, size.y);
            }
        }
        var padding = 10; // safety padding, TODO: compute it from path css style.
        this.uiElement.setAttribute("width", (w + padding).toString());
        this.uiElement.setAttribute("height", (h + padding).toString());
        this.isBuildingFlag = false;
    };
    PacemBindTargets.prototype.computeTargetRect = function (target) {
        var targetPoint = { left: 0, top: 0, width: 0, height: 0 };
        var p3d = target instanceof pacem_3d_1.Pacem3DObject && target;
        if (p3d) {
            var circ = p3d.projectionCircle;
            targetPoint.left = circ.center.left - circ.radius;
            targetPoint.top = circ.center.top - circ.radius;
            targetPoint.width = targetPoint.height = 2 * circ.radius;
        }
        else {
            var el = target;
            var offset = pacem_core_1.PacemUtils.offset(el);
            targetPoint.left = offset.left;
            targetPoint.top = offset.top;
            targetPoint.width = el.clientWidth;
            targetPoint.height = el.clientHeight;
        }
        return targetPoint;
    };
    /**
     * Computes the closest edge of `to` from the center of `from` and returns that edge's middle point (middle of the bounding box' edge).
     * @param from
     * @param to
     */
    PacemBindTargets.prototype.computeAnchor = function (from, to, anchor) {
        if (anchor === void 0) { anchor = 'auto'; }
        var center = {
            x: Math.round(from.left + from.width / 2),
            y: Math.round(from.top + from.height / 2)
        };
        var centerTo = {
            x: Math.round(to.left + to.width / 2),
            y: Math.round(to.top + to.height / 2)
        };
        var ptTop = { x: centerTo.x, y: Math.round(centerTo.y - to.height / 2) };
        var ptBottom = { x: centerTo.x, y: Math.round(centerTo.y + to.height / 2) };
        var ptLeft = { x: Math.round(centerTo.x - to.width / 2), y: centerTo.y };
        var ptRight = { x: Math.round(centerTo.x + to.width / 2), y: centerTo.y };
        var padBottom = { x: ptBottom.x, y: ptBottom.y + to.height };
        var padLeft = { x: ptLeft.x - to.width, y: ptLeft.y };
        var padRight = { x: ptRight.x + to.width, y: ptRight.y };
        var padTop = { x: ptTop.x, y: ptTop.y - to.height };
        var retTop = [ptTop, padTop];
        var retBottom = [ptBottom, padBottom];
        var retLeft = [ptLeft, padLeft];
        var retRight = [ptRight, padRight];
        switch (anchor.toLowerCase()) {
            case 'top':
                return retTop;
            case 'left':
                return retLeft;
            case 'right':
                return retRight;
            case 'bottom':
                return retBottom;
            default:
                var dtop = pacem_core_1.PacemUtils.distance(center, ptTop);
                var dbottom = pacem_core_1.PacemUtils.distance(center, ptBottom);
                var dleft = pacem_core_1.PacemUtils.distance(center, ptLeft);
                var dright = pacem_core_1.PacemUtils.distance(center, ptRight);
                //let dmin = [dtop, dbottom, dleft, dright].sort()[1];
                var dmin = Math.min(dtop, dbottom, dleft, dright);
                switch (dmin) {
                    case dbottom:
                        return retBottom;
                    case dleft:
                        return retLeft;
                    case dright:
                        return retRight;
                    default:
                        return retTop;
                }
        }
    };
    PacemBindTargets.prototype.buildBinder = function (key, from, to, css) {
        if (from === void 0) { from = 'auto'; }
        if (to === void 0) { to = 'auto'; }
        var path = this.mappings.has(key) && this.mappings.get(key);
        var target = this.bindings.getTarget(key);
        //
        if (!target) {
            if (path)
                path.remove();
            this.mappings.delete(key);
            return;
        }
        //
        if (!path) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', 'none');
            this.mappings.set(key, path);
            var appendor = this.uiElement;
            appendor.appendChild(path);
        }
        // here I have both target and path
        var targetPoint = this.computeTargetRect(target);
        // draw
        //path.style.top = '0';   //Math.round(targetPoint.top + targetPoint.height/2) + 'px';
        //path.style.left = '0';  //Math.round(targetPoint.left + targetPoint.width/2) + 'px';
        var source = this.elementRef.nativeElement;
        var sourcePoint = this.computeTargetRect(source);
        var p0 = this.computeAnchor(targetPoint, sourcePoint, from);
        var p1 = this.computeAnchor(sourcePoint, targetPoint, to);
        var x0 = p0[0].x;
        var y0 = p0[0].y;
        var cx0 = p0[1].x;
        var cy0 = p0[1].y;
        var x1 = p1[0].x;
        var y1 = p1[0].y;
        var cx1 = p1[1].x;
        var cy1 = p1[1].y;
        var dStart = "M" + (x0 - 2) + "," + (y0 - 2) + " h4 v4 h-4 z";
        var dEnd = "M" + (x1 - 2) + "," + (y1 - 2) + " h4 v4 h-4 z";
        path.setAttribute('d', dStart + ("M" + x0 + "," + y0 + " C" + cx0 + "," + cy0 + " " + cx1 + "," + cy1 + " " + x1 + "," + y1) + dEnd);
        if (!css)
            path.removeAttribute('class');
        else
            path.setAttribute('class', css);
        return { x: Math.max(x0, x1, cx0, cx1), y: Math.max(y0, y1, cy0, cy1) };
    };
    __decorate([
        core_1.Input('pacemBindTargets'), 
        __metadata('design:type', Object)
    ], PacemBindTargets.prototype, "targetKeys", void 0);
    PacemBindTargets = __decorate([
        core_1.Directive({
            selector: '[pacemBindTargets]',
            exportAs: 'pacemBindTargets'
        }), 
        __metadata('design:paramtypes', [PacemBindService, core_1.ElementRef])
    ], PacemBindTargets);
    return PacemBindTargets;
}());
exports.PacemBindTargets = PacemBindTargets;
var PacemBindTarget = (function () {
    function PacemBindTarget(bindings, ref) {
        this.bindings = bindings;
        this.ref = ref;
    }
    PacemBindTarget.prototype.refresh = function () {
        this.bindings.onset.emit();
    };
    PacemBindTarget.prototype.ngOnChanges = function (changes) {
        var c = changes['key'];
        if (c) {
            this.remove(c.previousValue);
            this.set(c.currentValue);
        }
    };
    PacemBindTarget.prototype.ngOnDestroy = function () {
        this.remove(this.key);
    };
    PacemBindTarget.prototype.remove = function (k) {
        if (k)
            this.bindings.removeTarget(k);
    };
    PacemBindTarget.prototype.set = function (k) {
        if (k) {
            var el = this.ref.nativeElement;
            this.bindings.setTarget(k, el[pacem_3d_1.Pacem3DObject.datasetKey] || el);
        }
    };
    __decorate([
        core_1.Input('pacemBindTarget'), 
        __metadata('design:type', String)
    ], PacemBindTarget.prototype, "key", void 0);
    PacemBindTarget = __decorate([
        core_1.Directive({
            selector: '[pacemBindTarget]',
            exportAs: 'pacemBindTarget'
        }), 
        __metadata('design:paramtypes', [PacemBindService, core_1.ElementRef])
    ], PacemBindTarget);
    return PacemBindTarget;
}());
exports.PacemBindTarget = PacemBindTarget;
// #endregion
