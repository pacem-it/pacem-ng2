/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
import { QueryList, Pipe, PipeTransform, Directive, Component, Input, Output, OnChanges, Renderer,
    SimpleChanges, SimpleChange, ElementRef, ViewContainerRef, NgModule,
    EventEmitter, AfterContentInit, AfterViewInit, Injectable,
    OnInit, OnDestroy, ViewChild, ContentChildren, KeyValueDiffers, KeyValueDiffer, DoCheck, ChangeDetectorRef } from '@angular/core';
import {DomSanitizer, SafeHtml, SafeStyle} from '@angular/platform-browser';
import { Location, CommonModule } from '@angular/common';
import { PacemUtils, PacemPromise, pacem } from './pacem-core'
import { Subscription, Subject, Observable} from 'rxjs/Rx';
import { Pacem3DObject, Pacem3D } from './pacem-3d';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/merge';

function supportsSVGTransforms() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return 'transform' in svg;
}

export declare type pacemBindAnchors = 'auto' | 'left' | 'top' | 'right' | 'bottom';

@Directive({
    selector: '[pacemHidden]'
})
export class PacemHidden {

    @Input('pacemHidden') set hidden(v: boolean) {
        (<HTMLElement>this.elRef.nativeElement).removeAttribute('hidden');
        if (v) {
            PacemUtils.removeClass(this.elRef.nativeElement, 'pacem-shown');
            PacemUtils.addClass(this.elRef.nativeElement, 'pacem-hidden');
        } else {
            PacemUtils.removeClass(this.elRef.nativeElement, 'pacem-hidden');
            PacemUtils.addClass(this.elRef.nativeElement, 'pacem-shown');
        }
    }

    constructor(private elRef: ElementRef) {
        (<HTMLElement>elRef.nativeElement).setAttribute('hidden', 'true');
    }
}

/**
 * PacemHighlight Pipe
 */
@Pipe({
    name: 'pacemHighlight'
})
export class PacemHighlight implements PipeTransform {

    constructor(private sce: DomSanitizer) {
    }

    transform(src: string, query: string, css: string): SafeHtml {
        if (!query || !src) return src;
        let source = src.substr(0);
        css = css || 'pacem-highlight';
        var trunks = query.substr(0).split(' ');
        for (var j = 0; j < trunks.length; j++) {
            var regex = new RegExp('(?![^<>]*>)' + trunks[j], 'gi');
            source = source.replace(regex, function (piece, index: number, whole: string) {
                var startTagNdx, endTagIndex;
                if ((startTagNdx = whole.indexOf('<', index)) != (endTagIndex = whole.indexOf('</', index)) || startTagNdx == -1)
                    return '<span class="' + css + '">' + piece + '</span>';
                return piece;
            });
        }
        return this.sce.bypassSecurityTrustHtml(source);
    }
}

/**
 * PacemInfiniteScroll Directive
 */
@Directive({
    selector: '[pacemInfiniteScroll]'
})
export class PacemInfiniteScroll implements OnDestroy {

    @Input() set pacemInfiniteScrollContainer(v: string | HTMLElement) {
        var $cont: HTMLElement | string = v;
        var isDoc = this.is$document = $cont === '$document';
        this.$container = isDoc ? (window.document.body || window.document.documentElement) : (
            (typeof this.pacemInfiniteScrollContainer === 'string') ?
                <HTMLElement>document.querySelector(<string>$cont)
                :
                <HTMLElement>$cont);
        this.$viewport = isDoc ? window : this.$container;
        if (this.$scroller)
            this.$scroller.removeEventListener('scroll', this.$scrollDelegate, false);
        this.$scroller = isDoc ? window.document : this.$container;
        this.$scroller.addEventListener('scroll', this.$scrollDelegate, false);
        if (this.$enabled)
            this.scroll();
    }
    @Input() set pacemInfiniteScrollEnabled(v: boolean) {
        this.$enabled = v;
        if (!!v) this.scroll();
    }
    @Input() set pacemInfiniteScrollBottomGap(v: number) {
        this.$bottomGap = v || 0;
    }
    @Output() pacemInfiniteScroll = new EventEmitter();

    constructor(private element: ElementRef) {
        this.$container = this.$viewport = this.$scroller = <HTMLElement>element.nativeElement;
        this.$scroller.addEventListener('scroll', this.$scrollDelegate, false);
    }

    ngOnDestroy() {
        if (this.$scroller)
            this.$scroller.removeEventListener('scroll', this.$scrollDelegate, false);
    }

    private $scrollDelegate = () => this.scroll();
    private $enabled: boolean = true;
    private viewportHeight: number = 0;
    private innerHeight: number = 0;
    private is$document: boolean = false;
    private $container: HTMLElement = null;
    private $viewport: HTMLElement | Window = null;
    private $scroller: HTMLElement | Document = null;
    private throttler: number;
    private $bottomGap: number = 10;

    //ngOnChanges(changes: SimpleChanges) {
    //}

    private scroll(): void {
        window.clearTimeout(this.throttler);
        this.throttler = window.setTimeout(() => this.doScroll(), 100);
    }

    private doScroll(): void {
        if (!this.$enabled) return;
        if (!this.computeHeight()) {
            var scrollTop = this.$scroller instanceof Document ? window.pageYOffset : (<HTMLElement>this.$scroller).scrollTop;
            var viewportHeight: number = this.viewportHeight, innerHeight = this.innerHeight;
            if ((innerHeight - (scrollTop + viewportHeight)) < this.$bottomGap /* pixels */
                || innerHeight <= viewportHeight) {

                this.pacemInfiniteScroll.emit({});
                window.requestAnimationFrame(() => {
                    if (this.$enabled) this.scroll();
                });

            } //else computeHeight();
        } else this.scroll();
    }

    private computeHeight(): boolean {
        if (!this.$container) return;
        var $container = this.$container;
        var topOffset = Number.MAX_VALUE, bottomOffset = 0, totalHeight = 0, _innerHeight;
        if (this.is$document) {
            var d = $container;
            _innerHeight = Math.max(
                d.scrollHeight,
                d.offsetHeight,
                d.clientHeight
            );
        } else {
            for (var i = 0; i < $container.children.length; i++) {
                var e = <HTMLElement>$container.children.item(i);
                var eTopOffset = e.offsetTop,
                    eHeight = e.offsetHeight,
                    eBottomOffset = eTopOffset + eHeight;
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
        var _viewportHeight = this.$viewport instanceof Window ? PacemUtils.windowSize.height : (<HTMLElement>this.$viewport).offsetHeight;
        if (_innerHeight != this.innerHeight || _viewportHeight != this.viewportHeight) {
            this.innerHeight = _innerHeight;
            this.viewportHeight = _viewportHeight;
            return true;
        }
        return false;
    }

}

/**
 * PacemLightbox Component
 */
@Component({
    selector: 'pacem-lightbox',
    template: `<div class="pacem-lightbox-wrapper" [hidden]="hide" [pacemHidden]="hide" #wrapper>
<div class="pacem-lightbox"><ng-content></ng-content></div>
</div>`
})
export class PacemLightbox implements OnInit, OnChanges, OnDestroy {

    private hide: boolean = true;
    private resizeDelegate = _ => {
        if (!this.hide)
            this.resize(_);
    }

    @Input() set show(v: boolean) {
        this.hide = !v;
        if (!!v) this.resize();
        else
            this.reset();

    }

    @Output('close') onclose = new EventEmitter();

    @ViewChild('wrapper') wrapperElement: ElementRef;
    private content: HTMLElement = null;

    ngOnInit() {
        this.wrapperElement.nativeElement.addEventListener('mousedown', (evt: MouseEvent) => {
            this.hide = true;
            this.onclose.emit({});
        }, false);
        this.content = this.wrapperElement.nativeElement.firstElementChild;
        this.content.addEventListener('mousedown', (evt: MouseEvent) => {
            evt.stopPropagation();
        }, false);
        window.addEventListener('resize', this.resizeDelegate, false);
    }

    ngOnChanges(changes: SimpleChanges) {
        if ('show' in changes && !!changes['show'].currentValue)
            this.hide = false;
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.resizeDelegate, false);
    }

    private reset() {
        window.document.body.style.overflow = '';
    }

    private resize(evt?: any) {
        window.document.body.style.overflow = 'hidden';
        var win = window, element = <HTMLElement>this.wrapperElement.nativeElement;
        var viewportHeight = PacemUtils.windowSize.height;
        var scrollTop = win.pageYOffset;
        element.style.width = '100%'
        element.style.height = viewportHeight + 'px';
        element.style.position = 'absolute';
        //element.style.zIndex = '10000'; // set in css
        element.style.margin = '0';
        element.style.padding = '0';
        element.style.top = scrollTop + 'px';
        element.style.left = '0';
        var container = this.content;
        window.requestAnimationFrame(() => {
            var containerHeight = container.offsetHeight;
            var top = (viewportHeight - containerHeight) * .5;
            container.style.margin = top + 'px auto 0 auto';
        });
    }
}

/**
 * PacemGalleryItem Directive
 */
@Directive({
    selector: 'pacem-gallery-item'
})
export class PacemGalleryItem {
    @Input() url: string;
    @Input() caption: string;
}

/**
 * PacemGallery Component
 */
@Component({
    selector: 'pacem-gallery',
    template: `<pacem-lightbox class="pacem-gallery" [show]="!hide" (close)="close($event)">
    <ol class="pacem-gallery-list">
        <template ngFor 
            [ngForOf]="items" 
            let-pic="$implicit" 
            let-ndx="index">
        <li *ngIf="isNear(ndx)"
        [ngClass]="{ 'pacem-gallery-active': ndx === focusIndex }" 
        [ngStyle]="{ 'background-image': 'url('+pic.url+')' }">
            <div class="pacem-gallery-caption" [innerHTML]="pic.caption"></div>
        </li></template>
    </ol>
    <div class="pacem-gallery-close" (click)="close($event)">X</div>
    <div class="pacem-gallery-previous" (click)="previous($event)" *ngIf="items.length > 1">&lt;</div>
    <div class="pacem-gallery-next" (click)="next($event)" *ngIf="items.length > 1">&gt;</div>
</pacem-lightbox>`,
    entryComponents: [PacemLightbox]
})
export class PacemGallery implements AfterContentInit, OnDestroy {

    private subscription: Subscription = null;
    @ContentChildren(PacemGalleryItem) items: QueryList<PacemGalleryItem>;

    @Output('close') onclose = new EventEmitter();

    private hide: boolean = true;
    private focusIndex: number = -1;
    @Input() set show(v: boolean) {
        this.hide = !v;
    }

    @Input() set startIndex(v: number) {
        this.focusIndex = v;
    }

    private close(_) {
        this.hide = true;
        this.onclose.emit(_);
    }

    ngAfterContentInit() {
        this.subscription = this.items.changes.subscribe(() => this.adjustFocusIndex());
        this.adjustFocusIndex();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    private adjustFocusIndex() {
        this.focusIndex = this.items && this.items.length ? Math.max(0, Math.min(this.items.length - 1, this.focusIndex)) : -1;
    }

    private isNear(ndx) {
        var Gallery = this;
        if (!(Gallery.items && Gallery.items.length)) return false;
        return ndx == Gallery.focusIndex
            || (ndx + 1) % Gallery.items.length == Gallery.focusIndex
            || (ndx - 1 + Gallery.items.length) % Gallery.items.length == Gallery.focusIndex;
    }
    private previous() {
        var Gallery = this;
        if (!(Gallery.items && Gallery.items.length)) return;
        Gallery.focusIndex = (Gallery.focusIndex - 1 + Gallery.items.length) % Gallery.items.length;
    }
    private next() {
        var Gallery = this;
        if (!(Gallery.items && Gallery.items.length)) return;
        Gallery.focusIndex = (Gallery.focusIndex + 1) % Gallery.items.length;
    }
}

/**
 * PacemBalloon Directive
 */
@Directive({
    selector: '[pacemBalloon]'
})
export class PacemBalloon implements OnChanges, OnDestroy, DoCheck, AfterContentInit {

    constructor(private element: ElementRef, private keyValueDiffers: KeyValueDiffers, private renderer: Renderer) {
        var pacem = PacemUtils.core;
        pacem[this.uid] = this;
        //
        this.differer = keyValueDiffers.find({}).create(null);
    }

    private differer: KeyValueDiffer;
    private balloonConsts = {
        positions: { TOP: 'top', LEFT: 'left', BOTTOM: 'bottom', RIGHT: 'right', AUTO: 'auto' }
        , triggers: { HOVER: 'hover', CLICK: 'click', FOCUS: 'focus' }
        , behaviors: { MENULIKE: 'menu', TOOLTIP: 'tooltip' }
        , vars: { TRIGGER: 'pacemBalloonTrigger', HIDDEN: 'pacemBalloonHidden' }
        , defaults: {
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

    private opts = PacemUtils.extend({}, this.balloonConsts.defaults);
    private uid = 'PacemBalloon_' + PacemUtils.uniqueCode();
    private timer: number;

    @Input() pacemBalloon: string | HTMLElement;

    @Input() pacemBalloonOptions: Object = {};

    ngOnDestroy() {
        delete PacemUtils.core[this.uid];
        this.destroyPopup(this.pacemBalloon);
        this.removeHandlers();
    }

    ngAfterContentInit() {
        this.ngDoCheck();
    }

    ngDoCheck() {
        var changes = this.differer.diff(this.pacemBalloonOptions)
        //console.log(`changes detected (balloon): ${changes}`);
        if (changes) this.resetBalloon();
    }

    ngOnChanges(changes: SimpleChanges) {
        //var bc: SimpleChange;
        //if ((bc = changes['pacemBalloon']) && bc.currentValue != bc.previousValue) {
        if (changes) this.resetBalloon();
        //}
    }

    @Output('popup') onpopup = new EventEmitter();
    @Output('popout') onpopout = new EventEmitter();

    //#region METHODS

    private ensurePopup(v?: HTMLElement | string): HTMLElement {
        var popup = v || this.pacemBalloon;
        var $popup = popup instanceof HTMLElement ? popup : <HTMLElement>document.querySelector(popup);
        //
        if ($popup && !PacemUtils.hasClass($popup, 'pacem-balloon')) {
            PacemUtils.addClass($popup, 'pacem-balloon');
            $popup.style.position = 'absolute';
            if (!$popup.hasAttribute('hidden'))
                $popup.setAttribute('hidden', 'hidden');
            else
                $popup.dataset[this.balloonConsts.vars.HIDDEN] = 'true';
        }
        return $popup;
    }

    private stopPropagationDelegate = (evt: Event) => {
        evt.stopPropagation();
    }

    private destroyPopup(popup: string | HTMLElement) {
        var $popup = this.ensurePopup(popup);
        if (!$popup) return;
        PacemUtils.removeClass($popup, 'pacem-balloon pacem-balloon-right pacem-balloon-left pacem-balloon-bottom pacem-balloon-top');
        $popup.style.position = '';
        if ($popup.dataset[this.balloonConsts.vars.HIDDEN])
            $popup.setAttribute('hidden', 'hidden');
        else
            $popup.removeAttribute('hidden');
    }

    private registerEvents() {
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
    }

    private unregisterEvents(popup?) {

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
    }

    private popupDelegate = (_: Event) => {
        this.popup();
    }

    private popup() {
        var $popup = this.ensurePopup(), balloonConsts = this.balloonConsts;

        var sameTrigger = $popup.dataset[balloonConsts.vars.TRIGGER] == this.uid;
        var isVisible = PacemUtils.isVisible($popup);
        if (isVisible && sameTrigger) return;
        // attach closured behavior to popup
        //if (!sameTrigger) {
        this.registerEvents(); // $popup.on('mouseenter', obj.methods.hover).on('mouseleave', obj.methods.out).data(vars.TRIGGER, obj);
        //}
        var $el = <HTMLElement>this.element.nativeElement;
        // recompute coords, just in the case...
        var coords = PacemUtils.offset($el);
        //
        $popup.style.visibility = 'hidden';
        $popup.removeAttribute('hidden');
        window.requestAnimationFrame(() => {
            var opts = this.opts, pos = balloonConsts.positions;
            var chosenPosition = opts.position;
            if (chosenPosition != pos.TOP && chosenPosition != pos.BOTTOM && chosenPosition != pos.LEFT && chosenPosition != pos.RIGHT) {
                let viewportPosition = $el.getBoundingClientRect();
                const vieportSize = PacemUtils.windowSize;
                let viewportHeight = vieportSize.height;
                let viewportWidth = vieportSize.width;
                const offsetLeft = viewportPosition.left;
                const offsetTop = viewportPosition.top;
                const offsetBottom = viewportHeight - viewportPosition.bottom;
                const offsetRight = viewportWidth - viewportPosition.right;
                // exclude 'left' and 'right' when position is set to 'auto'
                let maxOffset = Math.max(/*offsetLeft, offsetRight,*/ offsetTop, offsetBottom);
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
                    PacemUtils.addClass($popup, 'pacem-balloon-top');
                    coords.top -= $popup.offsetHeight;
                    break;
                case pos.LEFT:
                    PacemUtils.addClass($popup, 'pacem-balloon-left');
                    coords.left -= $popup.offsetWidth;
                    break;
                case pos.RIGHT:
                    PacemUtils.addClass($popup, 'pacem-balloon-right');
                    coords.left += $el.offsetWidth;
                    break;
                default:
                    PacemUtils.addClass($popup, 'pacem-balloon-bottom');
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
            this.onpopup.emit({});
        });
    }

    private popoutDelegate = (_: Event) => {
        this.popout();
    }

    private popout(popup?) {
        var $popup = this.ensurePopup(popup);
        if (!PacemUtils.isVisible($popup)) return;
        // detach closured behavior from popup
        this.unregisterEvents($popup);
        //
        $popup.setAttribute('hidden', 'hidden');
        PacemUtils.removeClass($popup, 'pacem-balloon-top pacem-balloon-bottom pacem-balloon-right pacem-balloon-left');
        window.requestAnimationFrame(() => {
            this.onpopout.emit({});
        });
    }

    private hoverDelegate = (evt: Event) => {
        var $popup = this.ensurePopup();

        if (!$popup) return;
        var balloonConsts = this.balloonConsts, triguid = $popup.dataset[balloonConsts.vars.TRIGGER];
        if (triguid && triguid != this.uid /* diffrent trigger */) {
            var trigger = <PacemBalloon>PacemUtils.core[triguid];
            window.clearTimeout(trigger.timer);
            this.unregisterEvents();
            trigger.popout();
            this.popup();
        } else {
            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(this.popupDelegate, this.opts.hoverDelay);
        }
    }

    private outConditionalDelegate = (evt: Event) => {
        if ((evt.srcElement || evt.target) != this.element.nativeElement)
            this.outDelegate(evt);
    }

    private outDelegate = (evt: Event) => {
        var $popup = this.ensurePopup();

        if (!$popup) return;
        //                    var timer = $popup.data(vars.ATTACHED_TIMER);
        //                    if (timer) window.clearTimeout(timer);
        window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => this.popout(), this.opts.hoverTimeout);
    }

    private toggleDelegate = (evt) => {
        evt.preventDefault();

        var $popup = this.ensurePopup();

        if (!$popup) return;
        var //triguid = $popup.dataset[this.balloonConsts.vars.TRIGGER], diffrentGuid = (triguid && triguid != this.uid),
            isVisible = PacemUtils.isVisible($popup);
        if (isVisible /*|| diffrentGuid*/) this.outDelegate(evt);
        /*if (diffrentGuid)*/else this.hoverDelegate(evt);
    }

    //#endregion

    private removeHandlers() {
        var el = <HTMLElement>this.element.nativeElement;
        el.removeEventListener('mouseenter', this.hoverDelegate, false);
        el.removeEventListener('mouseleave', this.outDelegate, false);
        el.removeEventListener('mousedown', this.popoutDelegate, false);
        el.removeEventListener('click', this.toggleDelegate, false);
        el.removeEventListener('focus', this.hoverDelegate, false);
        el.removeEventListener('blur', this.outDelegate, false);
    }

    private resetBalloon() {
        var balloon: HTMLElement = this.ensurePopup(),
            balloonConsts = this.balloonConsts,
            el = <HTMLElement>this.element.nativeElement,
            oldBalloon;
        if (oldBalloon = this.opts.popup) {
            this.popout(oldBalloon);
            this.destroyPopup(oldBalloon);
        }
        if (balloon) {
            this.popout();
            // remove handlers before regenerating the `opts`
            this.removeHandlers();
            // regenerate opts popup
            var opts = PacemUtils.extend(this.opts, JSON.parse(JSON.stringify(balloonConsts.defaults)),
                { 'popup': balloon },
                this.pacemBalloonOptions);
            if (!!opts.disabled) return;
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
                    el.addEventListener('click', this.toggleDelegate, false)/*.blur(obj.methods.out)*/;
                    break;
            }
        }
    }

}

/**
 * PacemInViewport Directive
 */
@Directive({
    selector: '[pacemInViewport]'
})
export class PacemInViewport implements OnDestroy, OnInit {

    @Output() pacemInViewport = new EventEmitter();

    @Input() pacemInViewportIgnoreHorizontal: boolean;

    constructor(private element: ElementRef) {
    }

    private addEventListeners(what) {
        for (var evt of PacemInViewport._events)
            what.addEventListener(evt, this._scrollHandler, false);
    }

    private removeEventListeners(what) {
        for (var evt of PacemInViewport._events)
            what.removeEventListener(evt, this._scrollHandler, false);
    }

    ngOnInit() {
        var el = (<Element>this.element.nativeElement).parentElement;
        this.addEventListeners(window);
        while (el) {
            this.addEventListeners(el);
            el = el.parentElement;
        }
        this._scrollHandler();
    }

    ngOnDestroy() {
        var el = (<Element>this.element.nativeElement).parentElement;
        this.removeEventListeners(window);
        while (el) {
            this.removeEventListeners(el);
            el = el.parentElement;
        }
    }

    private static _events = 'DOMContentLoaded load resize scroll'.split(' ');

    private _throttler: number = 0;
    private _visible: boolean = false;
    private _isElementVisible(el: HTMLElement) {
        const vportSize = PacemUtils.windowSize;
        var doc = window.document, rect = el.getBoundingClientRect(),
            vWidth = vportSize.width,
            vHeight = vportSize.height,
            efp = function (x, y) { return document.elementFromPoint(x, y) };

        return rect.bottom > 0 && rect.top < (0 + vHeight)
            && (this.pacemInViewportIgnoreHorizontal || (rect.left < (vWidth + 0) && rect.right > 0));
    }
    private _scrollHandler = (_?: Event) => {
        clearTimeout(this._throttler);
        this._throttler = window.setTimeout(() => {
            var el = <HTMLElement>this.element.nativeElement, newviz = this._isElementVisible(el);
            if (newviz !== this._visible) {
                var visible = this._visible = newviz;
                this.pacemInViewport.emit({ visible: visible });
                if (!!visible) PacemUtils.addClass(el, 'pacem-in-viewport');
                else PacemUtils.removeClass(el, 'pacem-in-viewport');
            }
        }, 100);
    }
}

function base64toBlob(b64Data: string, contentType: string, sliceSize: number = 512): Blob {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

/**
 * PacemUploader Component
 */
@Component({
    selector: 'pacem-uploader'
    , template: `<div class="pacem-uploader">
    <div class="pacem-uploader-filewrapper" 
         [hidden]="(uploading || failed)"><input type="file" #fileupload /></div>
    <button class="pacem-uploader-retry" 
            [title]="fields.retry" 
            [hidden]="!failed" 
            (click)="retry($event)">{{ fields.retry }}</button>
    <button class="pacem-uploader-undo" 
            [title]="fields.undo" 
            (click)="undo($event)" 
            [hidden]="!uploading">{{ fields.undo }}</button>
</div>`
})
export class PacemUploader implements AfterViewInit, OnDestroy {

    @ViewChild('fileupload') fileupload: ElementRef;

    @Input() set undoCaption(v: string) {
        this.fields.undo = v || 'undo';
    }
    @Input() set retryCaption(v: string) {
        this.fields.retry = v || 'retry';
    }
    @Input() pattern: string;
    @Input('startUrl') startUploadUrl: string;
    @Input('uploadUrl') doUploadUrl: string;
    @Input('undoUrl') undoUploadUrl: string;
    @Input() set parallelism(v: number) {
        this.fields.parallelism = v > 0 ? v : 3;
    }
    @Output('complete') oncomplete = new EventEmitter();

    ngAfterViewInit() {
        (<HTMLInputElement>this.fileupload.nativeElement).addEventListener('change', this.changeDelegate, false);
    }

    ngOnDestroy() {
        (<HTMLInputElement>this.fileupload.nativeElement).removeEventListener('change', this.changeDelegate, false);
    }

    private changeDelegate = (_: Event) => this.change(_);

    private fields = {
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

    uploading: boolean = false;
    size: number = 0;
    percentage: number = .0;
    complete: boolean = false;
    failed: boolean = false;
    invalidFile = false;

    upload(file: File, filename?: string) {
        var Uploader = this,
            fields = Uploader.fields;
        if (!file) return;
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
    }

    private doUpload(blob, skip) {
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
                if (!!fields.undone) return;
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
                    } else {
                        fields.retryFrom = skip;
                        Uploader.failed = true;
                        Uploader.uploading = false;
                        console.error(json.error);
                    }
                } else {
                    fields.retryFrom = skip;
                    Uploader.uploading = false;
                    Uploader.failed = true;

                }
            };
            xhr.send(formData);
        }
        reader.readAsDataURL(blob);
    }

    private manage() {
        var Uploader = this;
        var fields = Uploader.fields;
        var start = fields.retryFrom;
        var size = Uploader.size;
        var blob = fields.blob;
        var BYTES_PER_CHUNK = 1024 * 256; // 0.25MB chunk sizes.
        var end = start + BYTES_PER_CHUNK;
        //
        fields.enqueuer = setInterval(() => {
            if (start < size && !Uploader.failed) {
                if (fields.ongoing >= fields.parallelism) return;
                this.doUpload(blob.slice(start, end), start);
                start = end;
                end = start + BYTES_PER_CHUNK;
            } else {
                var input = Uploader.fileupload.nativeElement;
                input.value = '';
                window.clearInterval(fields.enqueuer);
            }
        }, 100);
    }

    private change(e: Event) {
        let Uploader = this,
            //    fields = Uploader.fields,
            input = <HTMLInputElement>Uploader.fileupload.nativeElement;
        //var filename = input.value;
        var blob = input.files[0];
        Uploader.upload(blob, input.value);
    }

    private undo(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        var Uploader = this, fields = Uploader.fields, input = <HTMLInputElement>Uploader.fileupload.nativeElement;
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
    }
    private retry(e: Event) {
        e.preventDefault();
        e.stopPropagation();
        this.failed = false;
        this.manage();
    }

}

function stripBase64FromDataURL(dataURL: string) {
    return dataURL.replace(/^data:image\/[\w]+;base64,/i, '');
}

let _getUserMedia: any[] = null;

function hasUserMedia() {
    return uiAdapter.getUserMedia().length > 0;
}

const uiAdapter = {
    getUserMedia: function () {
        if (_getUserMedia == null) {
            let methods = [navigator['getUserMedia'], navigator['webkitGetUserMedia'], navigator['msGetUserMedia'], navigator['mozGetUserMedia']];
            let fns = methods.filter(function (fn, j) { return typeof fn == 'function'; });
            if (fns.length) _getUserMedia = fns;
            else _getUserMedia = [];
        }
        return _getUserMedia;
    },
    stripBase64FromDataURL: stripBase64FromDataURL,
    adaptElementToCanvas: function (el: any, ctx: CanvasRenderingContext2D, srcW?: number, srcH?: number) {
        let tgetW = ctx.canvas.width /*= parseFloat(scope.thumbWidth)*/;
        let tgetH = ctx.canvas.height /*= parseFloat(scope.thumbHeight)*/;
        let cnvW = tgetW, cnvH = tgetH;
        let w = srcW || (1.0 * el.width), h = srcH || (1.0 * el.height);
        //console.log('img original size: ' + w + 'x' + h);
        var ratio = w / h;
        var tgetRatio = tgetW / tgetH;
        if (tgetRatio > ratio) {
            // crop vertically
            var f = tgetW / w;
            tgetH = f * h;
            ctx.drawImage(el, 0, .5 * (-tgetH + cnvH), cnvW, tgetH);
        } else {
            // crop horizontally
            var f = tgetH / h;
            tgetW = f * w;
            ctx.drawImage(el, -Math.abs(.5 * (-tgetW + cnvW)), 0, tgetW, cnvH);
        }
    },
    adaptImageToCanvas: function (buffer: string, canvas: HTMLCanvasElement) {
        buffer = stripBase64FromDataURL(buffer);
        let cnv = canvas;
        let ctx = cnv.getContext('2d');
        let deferred = PacemPromise.defer<string>();
        let img = new Image();
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
@Component({
    selector: 'pacem-snapshot',
    template: `<div class="pacem-snapshot" [ngClass]="{ 'pacem-ongoing': status != 'start' }"  #root>
    
    <button (click)="$event.preventDefault(); $event.stopPropagation(); pick($event)" class="pacem-browse" [pacemHidden]="status != 'start'"></button>
    <button (click)="$event.preventDefault(); $event.stopPropagation(); take($event)" class="pacem-camera" [pacemHidden]="status != 'start'"></button>
    
    <canvas class="pacem-preview" 
            [ngClass]="{ 'pacem-taking': branch == 'take' && status != 'start' }" 
            #stage [pacemHidden]="status != 'confirm'"></canvas>
    <!--<div class="pacem-snapshot-progress" [hidden]="!processing"></div>-->
    <input type="file" #grabber accept="image/*" capture="camera" (change)="handleFiles($event)" hidden />
    <video *ngIf="canUseWebcam"
            [ngClass]="{ 'pacem-taking': branch == 'take' && status != 'start' }" 
            [pacemHidden]="status != 'taking'"
            autoplay="autoplay"
            #player></video>
    <button class="pacem-countdown" 
            [pacemHidden]="countdown <= 0">{{ countdown }}</button>
    <button class="pacem-undo" [pacemHidden]="status == 'start' || countdown > 0" (click)="back($event)"></button>
    <button class="pacem-confirm" [pacemHidden]="status != 'confirm'" (click)="confirm($event)"></button>
    <span [hidden]="canUseWebcam"><ng-content></ng-content></span>
</div>`
})
export class PacemSnapshot {

    @ViewChild('grabber') grabber: ElementRef;
    @ViewChild('stage') canvas: ElementRef;
    @ViewChild('player') video: ElementRef;
    @ViewChild('root') root: ElementRef;
    @Output('select') onselect = new EventEmitter<Blob>();

    private _status: string = 'start';
    private previousStatuses: string[] = [];

    private get status() {
        return this._status;
    }
    private set status(v: string) {
        if (v != this._status) {
            this.previousStatuses.push(this._status);
            this._status = v;
        }
    }
    private canUseWebcam: boolean;
    private webcamInitialized: boolean = false;
    private buffer: string;
    private countdown: number = 0;
    private branch: string;

    private processing: boolean = false;

    private pick(evt: Event) {
        evt.preventDefault();
        evt.stopPropagation();
        this.branch = 'pick';
        this.grabber.nativeElement.click();
    }

    private take(evt: Event) {
        evt.preventDefault();
        evt.stopPropagation();
        this.ensureWebcamRunning();
        this.branch = 'take';
        this.status = 'taking';
    }

    private confirm(evt: Event) {
        evt.preventDefault();
        evt.stopPropagation();
        this.onselect.emit(
            base64toBlob(this.buffer, 'image/jpeg')
        );
        this.previousStatuses.splice(0);
        this._status = 'start';
        this.cref.detectChanges();
        this.buffer = '';
    }

    private back(evt: Event) {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.previousStatuses.length <= 0) return;
        var prev: string = this.previousStatuses.pop();
        this._status = prev;
        this.cref.detectChanges();
    }

    constructor(private cref: ChangeDetectorRef) {
        this.canUseWebcam = hasUserMedia();
    }

    private handleFiles(_: Event) {
        var me = this;
        var files = me.grabber.nativeElement.files;
        if (files.length) {
            var file = files[0];
            var type = file.type.toLowerCase();
            var pattern = /^image\/(png|[p]?jpeg|bmp|gif)/i;
            if (pattern.test(type)) {
                var reader = new FileReader();
                me.processing = true;
                reader.onload = function (evt: Event) {
                    var dataURL = evt.target['result'];
                    me.refreshBuffer(dataURL).success((b) => {
                        me.processing = false;
                        (<HTMLInputElement>me.grabber.nativeElement).value = '';
                        me.setToBeConfirmed(b);
                    });
                };
                reader.readAsDataURL(file);
            }
        }
    }

    private setToBeConfirmed(buffer: string) {
        this.status = 'confirm';
        this.buffer = buffer;
        this.cref.detectChanges();
        //this.onselect.emit(b);
    }

    private refreshBuffer(buffer): PacemPromise<string> {
        var cnv = <HTMLCanvasElement>this.canvas.nativeElement;
        cnv.width = cnv.clientWidth;
        cnv.height = cnv.clientHeight;
        return uiAdapter.adaptImageToCanvas(buffer, cnv);
    }

    private ensureWebcamRunning() {
        if (this.canUseWebcam && !this.webcamInitialized) {
            var me = this;
            me.webcamInitialized = true;
            _getUserMedia[0].apply(navigator, [{ video: true/*, audio: false*/ },
                                /* success */function (localMediaStream) {
                    var video = <HTMLVideoElement>me.video.nativeElement;
                    video.src = window.URL.createObjectURL(localMediaStream);
                    function timeout() {
                        me.cref.detectChanges();
                        if (me.countdown <= 0) {
                            var cnv = document.createElement('canvas');
                            cnv.width = video.clientWidth
                            cnv.height = video.clientHeight;
                            var ctx = cnv.getContext('2d');
                            uiAdapter.adaptElementToCanvas(video, ctx, video.videoWidth, video.videoHeight);
                            cnv.style.position = 'absolute';
                            let root = <HTMLElement>me.root.nativeElement;
                            root.insertBefore(cnv, video);
                            cnv.className = 'pacem-brightout pacem-preview';
                            setTimeout(function () {
                                root.removeChild(cnv);
                            }, 2000);
                            me.refreshBuffer(cnv.toDataURL()).success((b) => me.setToBeConfirmed(b));
                        }
                        else setTimeout(() => { me.countdown--; timeout(); }, 1000);
                    }

                    video.addEventListener('click', (evt) => {
                        me.countdown = 3;
                        timeout();
                    }, false);

                }, /* fail */function (e) {
                    alert((e || e.message).toString());
                }]);
        }
    }
}

/**
 * PacemRingChartItem Component
 */
@Component({
    selector: 'pacem-ring-chart-item',
    template: `<canvas class="pacem-ring-chart-item" #canvas 
[ngClass]="{ 'pacem-interactive': interactive }"
(mousedown)="startDrag($event)" (window:mousemove)="drag($event)" (window:mouseup)="drop($event)"></canvas>`
})
export class PacemRingChartItem implements AfterViewInit, OnChanges {

    constructor(private renderer: Renderer) {
    }

    @ViewChild('canvas') element: ElementRef;

    private canvas: HTMLCanvasElement;
    private context2D: CanvasRenderingContext2D;

    ngAfterViewInit() {
        this.canvas = <HTMLCanvasElement>this.element.nativeElement;
        this.context2D = this.canvas.getContext('2d');
        this.draw();
    }

    ngOnChanges() {
        this.draw();
    }

    @Input() stroke: string = '#fff';
    @Input() thickness: number = 10;
    @Input() value: number = .0;
    @Output('valueChange') valuechange = new EventEmitter<number>();
    @Input() max: number = 100.0;

    //#region INTERACTIVE
    @Input() interactive: boolean;
    private _round = 0;
    @Input() set round(v: number) {
        if (Math.round(v) != v || v < 0)
            throw `${this.constructor.name}: round value must be an integer greater or equal to zero.`;
        this._round = v;
    }
    private pivotPoint: { x: number, y: number };
    private pointerStream = new Subject<{ x: number, y: number }>();
    private subscription: Subscription;

    private startDrag(evt: PointerEvent) {
        if (!this.interactive) return;
        evt.stopPropagation();
        let offset = PacemUtils.offset(this.canvas);
        this.pivotPoint = {
            x: offset.left + this.canvas.clientWidth * .5,
            y: offset.top + this.canvas.clientHeight * .5
        };
        this.subscription = this.pointerStream
            .asObservable()
            //.debounceTime(10)
            .subscribe((pt) => {
                const roundAngle = 2 * Math.PI;
                let angle = Math.atan2(pt.x - this.pivotPoint.x, - pt.y + this.pivotPoint.y);
                let round = Math.pow(10, this._round);
                let value = Math.round(round * ((roundAngle + angle) % roundAngle) * this.max / roundAngle) / round;
                this.value = value
                this.valuechange.emit(value);

            });
    }

    private drag(evt: PointerEvent) {
        if (!this.interactive || !this.pivotPoint) return;
        evt.preventDefault();
        evt.stopPropagation();
        var rect = this.canvas.getBoundingClientRect();
        /*let pt = {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * this.canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * this.canvas.height
        }*/
        let pt = { x: evt.pageX, y: evt.pageY };
        this.pointerStream.next(pt);
    }

    private drop(evt: PointerEvent) {
        if (!this.interactive || !this.pivotPoint) return;
        evt.preventDefault();
        evt.stopPropagation();
        this.subscription.unsubscribe();
        this.pivotPoint = null;
    }

    //#endregion

    draw() {
        if (!this.canvas) return;
        let v = this.value / this.max, cnv = this.canvas, ctx = this.context2D, thickness = this.thickness || 10;
        let maxDim = Math.min(this.canvas.offsetHeight, this.canvas.offsetHeight);

        let dim = maxDim;
        if (dim <= 0) return;
        // sweep the stage
        cnv.width =     //dim; element.width();
            cnv.height = dim; //element.height();
        let color = getComputedStyle(cnv).color;
        let bgcolor = getComputedStyle(cnv).borderColor || 'rgba(255,255,255,.1)';
        ctx.beginPath();
        let x = cnv.width * .5;
        let y = cnv.height * .5;
        let r = Math.min(x, y) - thickness * .5;
        let mathPI2 = Math.PI * .5;
        let to = -mathPI2 + 2 * Math.PI * v;
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
    }
}

/**
 * PacemRingChart Component
 */
@Component({
    selector: 'pacem-ring-chart',
    template: `<div class="pacem-ring-chart"><ng-content></ng-content></div>`
})
export class PacemRingChart {

    private subscription: Subscription = null;
    private throttler: number = 0;
    @ContentChildren(PacemRingChartItem) items: QueryList<PacemRingChartItem>;


    ngAfterContentInit() {
        this.subscription = this.items.changes.subscribe(() => this.redraw());
        window.addEventListener('resize', this.resizeHandler, false);
        this.redraw();
    }

    ngOnDestroy() {
        window.removeEventListener('resize', this.resizeHandler, false);
        this.subscription.unsubscribe();
    }

    private resizeHandler = (_: Event) => {
        clearTimeout(this.throttler);
        this.throttler = window.setTimeout(() => this.redraw(), 20);
    };

    private redraw() {
        this.items.forEach(item => item.draw());
    }
}

/**
 * PacemPieChartSlice Directive
 */
@Directive({
    selector: 'pacem-pie-chart-slice'
})
export class PacemPieChartSlice {

    private _value = .0;
    @Input()
    set value(v: number) {
        if (v === this._value) return;
        this._value = v || .0;
        if (this.chart)
            this.chart.ping();
    }
    get value() { return this._value; }

    constructor(
        private ref: ElementRef) {
    }

    get color(): string {
        return getComputedStyle(this.ref.nativeElement).color || 'aqua';
    }

    /**
    * @internal
    */
    chart: PacemPieChart;
    /**
    * @internal
    */
    offset: number;
    /**
    * @internal
    */
    path: string;
    /**
    * @internal
    */
    style: SafeStyle;
}

/**
 * PacemPieChart Component
 */
@Component({
    selector: 'pacem-pie-chart',
    template: `<div class="pacem-pie-chart">
<ng-content></ng-content>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0,0,100,100" width="100%" height="100%">
    <defs>
    <mask id="slices-mask">
        <circle cx="50" cy="50" r="45" fill="#fff" />
        <circle cx="50" cy="50" r="15" fill="#000" />
    </mask>
    <mask id="inner-mask">
        <circle cx="50" cy="50" r="50" fill="#fff" />
        <circle cx="50" cy="50" r="10" fill="#000" />
    </mask>
    </defs>
    <circle cx="50" cy="50" r="50" [attr.mask]="'url('+ location.path() +'#inner-mask)'" class="pacem-pie-chart-background" />
    <g>
        <svg:path *ngFor="let slice of slices" 
                [attr.mask]="'url('+ location.path() +'#slices-mask)'"
                [attr.fill]="slice.color" 
                [attr.d]="slice.path"
                [attr.style]="slice.style"></svg:path>
    </g>
</svg></div>`
})
export class PacemPieChart implements OnDestroy, AfterContentInit {

    constructor(private sce: DomSanitizer, private location: Location) {
        this.supportsSVGTransforms = supportsSVGTransforms();
    }

    private supportsSVGTransforms: boolean = false;

    ngAfterContentInit() {
        let render = () => {
            this.normalize();
            this.draw();
        };

        const fps = 50;

        this.subscription = this.slices.changes
            .merge(this.subj.asObservable())
            .debounceTime(fps)
            .subscribe(render);

        render();
    }

    private subj = new Subject();
    /**
     * @internal
     */
    ping() {
        this.subj.next({});
    }

    @ContentChildren(PacemPieChartSlice) slices: QueryList<PacemPieChartSlice>;

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    private subscription: Subscription;
    private sum = .0;
    private normalize() {
        let sum = .0, me = this;
        this.slices.forEach((slice) => {
            if (slice.chart != me)
                slice.chart = me;
            slice.offset = sum;
            sum += slice.value;
        });
        this.sum = sum;
    }

    private draw() {
        const me = this;
        const sum = me.sum;
        this.slices.forEach((item) => {
            let slice = item as PacemPieChartSlice;
            if (sum <= .0 || !slice.value) return;
            var value = slice.value / sum,
                offset = slice.offset / sum;
            //
            const radius = 50;
            const center = { x: radius, y: radius };
            const separator = ' '; //','
            var d = "M" + radius + separator + radius + " m -" + radius + separator + "0 " +
                "a" + radius + separator + radius + " 0 1" + separator + "0 " + (2 * radius) + separator + "0 " +
                "a" + radius + separator + radius + " 0 1" + separator + "0 -" + (2 * radius) + separator + "0 Z";

            // transform
            var theta = 2.0 * Math.PI * offset,
                phi = 2.0 * Math.PI * value;
            if (value < 1.0) {
                let x0 = 2 * radius;
                let y0 = radius;
                //calculate x,y coordinates of the point on the circle to draw the arc to. 
                let x1 = radius * (1.0 + Math.cos(phi));
                let y1 = radius * (1.0 - Math.sin(phi));

                if (!this.supportsSVGTransforms) {
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
            var displaceX = displacement * Math.cos(theta + phi * .5),
                displaceY = -displacement * Math.sin(theta + phi * .5);
            if (this.supportsSVGTransforms) {
                let style = 'transform: translateX(' + displaceX + 'px) translateY(' + displaceY + 'px) rotate(' + (-theta) + 'rad);';
                style += 'transform-origin: 50px 50px;';
                style += 'transition: transform 0.2s ease-in-out;';
                slice.style = me.sce.bypassSecurityTrustStyle(style);
            }
        });
    }

}

/**
 * PacemToast Component
 */
@Component({
    selector: 'pacem-toast',
    template: `<div class="pacem-toast" [pacemHidden]="hidden" (click)="doHide($event)"><ng-content></ng-content></div>`
})
export class PacemToast {
    @Input() autohide: boolean = true;
    @Input() timeout: number = 3000;
    @Output('close') onclose = new EventEmitter();

    private _timeout: number;
    private _hide: boolean = true;
    private set hidden(v: boolean) {
        if (v != this._hide) {
            this._hide = v;
            if (this._hide)
                this.onclose.emit({});
        }
    }
    private get hidden() {
        return this._hide;
    }

    private doHide(evt?) {
        window.clearTimeout(this._timeout);
        this.hidden = true;
    }

    hide() {
        this.doHide();
    }

    show() {
        window.clearTimeout(this._timeout);
        this.hidden = false;
        if (this.autohide)
            this._timeout = window.setTimeout(() => { this.hidden = true; }, this.timeout);
    }
}

// #region PACEM BIND

export declare type pacemBindTarget = HTMLElement | SVGElement | Pacem3DObject;

@Injectable()
export class PacemBindService {

    private static targetMappings = new Map<string, pacemBindTarget>();
    onset = new EventEmitter<string>();
    onremove = new EventEmitter<string>();

    constructor() {
    }

    /**
     * Sets a target object with a provided unique key.
     * @param key
     * @param target
     */
    setTarget(key: string, target: pacemBindTarget) {
        let dict = PacemBindService.targetMappings;
        if (dict.has(key) && dict.get(key) != target)
            throw pacem.localization.default.errors.KEY_DUPLICATE.replace(/%s/gi, key);
        dict.set(key, target);
        this.onset.emit(key);
    }

    /**
     * Removes the target object mapped to the provided key, if any.
     * @param key
     */
    removeTarget(key: string) {
        const retval = PacemBindService.targetMappings.delete(key);
        this.onremove.emit(key);
        return retval;
    }

    /**
     * Gets the target object corresponding to the provided key.
     * @param key
     */
    getTarget(key: string): pacemBindTarget {
        return PacemBindService.targetMappings.has(key) && PacemBindService.targetMappings.get(key);
    }

}

export declare type pacemBindTargetRef = {
    key: string;
    from: pacemBindAnchors,
    to: pacemBindAnchors,
    css?: string
}

@Directive({
    selector: '[pacemBindTargets]', //providers: [PacemBindService],
    exportAs: 'pacemBindTargets'
})
export class PacemBindTargets implements OnChanges, OnDestroy, OnInit {

    constructor(private bindings: PacemBindService, private elementRef: ElementRef) {
        const me = this;
        me.subscription = bindings.onset.asObservable().merge(bindings.onremove.asObservable())
            .subscribe((_) => {
                me.debounceBindersBuild();
            });
    }

    refresh() {
        this.debounceBindersBuild();
    }

    @Input('pacemBindTargets') targetKeys: pacemBindTargetRef[] | string[] = [];

    ngOnInit() {
        let uiElement = <SVGSVGElement>document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        uiElement.style.position = 'absolute';
        uiElement.classList.add('pacem-bind');
        uiElement.style.top = '0';
        uiElement.style.left = '0';
        uiElement.style.pointerEvents = 'none';
        document.body.appendChild(uiElement);
        this.uiElement = uiElement;
        this.initialized = true;
        this.buildBinders();
    }

    ngOnChanges() {
        this.debounceBindersBuild();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.uiElement.remove();
    }

    private initialized: boolean = false;
    private isBuildingFlag: boolean = false;
    private subscription: Subscription;
    private uiElement: Element;
    private mappings = new Map<string, SVGPathElement>();

    private debounceBindersBuild() {
        if (this.isBuildingFlag) {
            console.log('waiting for computations to be completed');
            requestAnimationFrame(() => this.debounceBindersBuild());
        } else
            this.buildBinders();
    }

    private buildBinders() {
        if (!this.initialized || !this.targetKeys) return;
        this.isBuildingFlag = true;
        // manage
        let w = 0, h = 0;
        for (let item of this.targetKeys) {
            let key: string = item['key'] || item;
            let from: pacemBindAnchors = item['from'] || 'auto';
            let to: pacemBindAnchors = item['to'] || 'auto';
            let css: string = item['css'];
            let size = this.buildBinder(key, from, to, css);
            if (size) {
                w = Math.max(w, size.x);
                h = Math.max(h, size.y);
            }
        }
        let padding = 10; // safety padding, TODO: compute it from path css style.
        this.uiElement.setAttribute("width", (w + padding).toString());
        this.uiElement.setAttribute("height", (h + padding).toString());
        this.isBuildingFlag = false;
    }

    private computeTargetRect(target: pacemBindTarget) {
        let targetPoint = { left: 0, top: 0, width: 0, height: 0 };
        let p3d = target instanceof Pacem3DObject && target as Pacem3DObject;
        if (p3d) {
            let circ = p3d.projectionCircle;
            targetPoint.left = circ.center.left - circ.radius;
            targetPoint.top = circ.center.top - circ.radius;
            targetPoint.width = targetPoint.height = 2 * circ.radius;
        } else {
            let el = target as HTMLElement | SVGElement;
            let offset = PacemUtils.offset(el);
            targetPoint.left = offset.left;
            targetPoint.top = offset.top;
            targetPoint.width = el.clientWidth;
            targetPoint.height = el.clientHeight;
        }
        return targetPoint;
    }

    /**
     * Computes the closest edge of `to` from the center of `from` and returns that edge's middle point (middle of the bounding box' edge).
     * @param from
     * @param to
     */
    private computeAnchor(
        from: { left: number, top: number, width: number, height: number },
        to: { left: number, top: number, width: number, height: number },
        anchor: pacemBindAnchors = 'auto') {
        const center = {
            x: Math.round(from.left + from.width / 2),
            y: Math.round(from.top + from.height / 2)
        };
        const centerTo = {
            x: Math.round(to.left + to.width / 2),
            y: Math.round(to.top + to.height / 2)
        };
        let ptTop = { x: centerTo.x, y: Math.round(centerTo.y - to.height / 2) };
        let ptBottom = { x: centerTo.x, y: Math.round(centerTo.y + to.height / 2) };
        let ptLeft = { x: Math.round(centerTo.x - to.width / 2), y: centerTo.y };
        let ptRight = { x: Math.round(centerTo.x + to.width / 2), y: centerTo.y };

        let padBottom = { x: ptBottom.x, y: ptBottom.y + to.height };
        let padLeft = { x: ptLeft.x - to.width, y: ptLeft.y };
        let padRight = { x: ptRight.x + to.width, y: ptRight.y };
        let padTop = { x: ptTop.x, y: ptTop.y - to.height };

        let retTop = [ptTop, padTop];
        let retBottom = [ptBottom, padBottom];
        let retLeft = [ptLeft, padLeft];
        let retRight = [ptRight, padRight];

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
                let dtop = PacemUtils.distance(center, ptTop);
                let dbottom = PacemUtils.distance(center, ptBottom);
                let dleft = PacemUtils.distance(center, ptLeft);
                let dright = PacemUtils.distance(center, ptRight);

                //let dmin = [dtop, dbottom, dleft, dright].sort()[1];
                let dmin = Math.min(dtop, dbottom, dleft, dright);
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
    }

    private buildBinder(key: string, from: pacemBindAnchors = 'auto', to: pacemBindAnchors = 'auto', css?: string) {
        let path: SVGPathElement = this.mappings.has(key) && this.mappings.get(key);
        let target = this.bindings.getTarget(key);
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
            let appendor = this.uiElement;
            appendor.appendChild(path);
        }
        // here I have both target and path
        let targetPoint = this.computeTargetRect(target);
        // draw
        //path.style.top = '0';   //Math.round(targetPoint.top + targetPoint.height/2) + 'px';
        //path.style.left = '0';  //Math.round(targetPoint.left + targetPoint.width/2) + 'px';

        let source = <pacemBindTarget>this.elementRef.nativeElement;
        let sourcePoint = this.computeTargetRect(source);

        let p0 = this.computeAnchor(targetPoint, sourcePoint, from);
        let p1 = this.computeAnchor(sourcePoint, targetPoint, to);

        let x0 = p0[0].x;
        let y0 = p0[0].y;
        let cx0 = p0[1].x;
        let cy0 = p0[1].y;
        let x1 = p1[0].x;
        let y1 = p1[0].y;
        let cx1 = p1[1].x;
        let cy1 = p1[1].y;

        let dStart = `M${x0 - 2},${y0 - 2} h4 v4 h-4 z`;
        let dEnd = `M${x1 - 2},${y1 - 2} h4 v4 h-4 z`;
        path.setAttribute('d', dStart + `M${x0},${y0} C${cx0},${cy0} ${cx1},${cy1} ${x1},${y1}` + dEnd);
        if (!css)
            path.removeAttribute('class');
        else
            path.setAttribute('class', css);

        return { x: Math.max(x0, x1, cx0, cx1), y: Math.max(y0, y1, cy0, cy1) };
    }
}

@Directive({
    selector: '[pacemBindTarget]',
    exportAs: 'pacemBindTarget'
})
export class PacemBindTarget implements OnDestroy, OnChanges {

    constructor(private bindings: PacemBindService, private ref: ElementRef) { }

    @Input('pacemBindTarget') key: string;

    refresh() {
        this.bindings.onset.emit();
    }

    ngOnChanges(changes: SimpleChanges) {
        const c = changes['key'];
        if (c) {
            this.remove(c.previousValue);
            this.set(c.currentValue);
        }
    }

    ngOnDestroy() {
        this.remove(this.key);
    }

    private remove(k: string) {
        if (k)
            this.bindings.removeTarget(k);
    }

    private set(k: string) {
        if (k) {
            let el = this.ref.nativeElement;
            this.bindings.setTarget(k, el[Pacem3DObject.datasetKey] || el);
        }
    }
}

// #endregion

/**
 * PacemHamburgerMenu Component
 */
@Component({
    selector: 'pacem-hamburger-menu',
    template: `<div class="pacem-hamburger-menu" [pacemHidden]="!open" (click)="open=false">
    <nav>
        <ng-content></ng-content>
    </nav>
    <button class="pacem-back" (click)="$event.stopPropagation(); $event.preventDefault(); open = !open">BACK</button>
    <button class="pacem-hamburger" (click)="$event.stopPropagation(); $event.preventDefault(); open = !open">MENU</button>
</div>`
})
export class PacemHamburgerMenu {

    private open: boolean = false;

}

@NgModule({
    imports: [CommonModule],
    declarations: [PacemHidden, PacemHighlight, PacemBalloon, PacemBindTarget, PacemBindTargets, PacemGallery, PacemGalleryItem, PacemHamburgerMenu,
        PacemInfiniteScroll, PacemInViewport, PacemLightbox, PacemPieChart, PacemPieChartSlice, PacemRingChart, PacemRingChartItem, PacemSnapshot,
        PacemToast, PacemUploader],
    exports: [PacemHidden, PacemHighlight, PacemBalloon, PacemBindTarget, PacemBindTargets, PacemGallery, PacemGalleryItem, PacemHamburgerMenu,
        PacemInfiniteScroll, PacemInViewport, PacemLightbox, PacemPieChart, PacemPieChartSlice, PacemRingChart, PacemRingChartItem, PacemSnapshot,
        PacemToast, PacemUploader],
    providers: [PacemBindService] //<- defining the provider here, makes it a singleton at application-level
})
export class PacemUIModule { }