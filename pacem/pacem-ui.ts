/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
import { QueryList, Pipe, PipeTransform, Directive, Component, Input, Output, OnChanges, Renderer,
    SimpleChanges, SimpleChange, ElementRef, ViewContainerRef, NgModule,
    EventEmitter, AfterContentInit, AfterViewInit, Injectable, Compiler, ChangeDetectionStrategy,
    OnInit, OnDestroy, ViewChild, ContentChildren, KeyValueDiffers, KeyValueDiffer, DoCheck, ChangeDetectorRef } from '@angular/core';
import {DomSanitizer, SafeHtml, SafeStyle} from '@angular/platform-browser';
import { Location, CommonModule } from '@angular/common';
import { PacemUtils, PacemPromise, pacem } from './pacem-core'
import { Subscription, Subject, ReplaySubject, Observable} from 'rxjs/Rx';
import { Pacem3DObject, Pacem3D } from './pacem-3d';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/merge';

function supportsSVGTransforms() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    return 'transform' in svg;
}

export declare type pacemBindAnchors = 'auto' | 'left' | 'top' | 'right' | 'bottom' | 'center';

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
export class PacemInfiniteScroll implements OnInit, OnDestroy {

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
        this.$container = this.$viewport = this.$scroller = <HTMLElement>this.element.nativeElement;
    }

    ngOnInit() {
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
            var threshold = innerHeight - (scrollTop + viewportHeight);
            if (threshold < this.$bottomGap /* pixels */
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

@Directive({
    selector: '[pacemResize]'
})
export class PacemResize implements OnInit, OnDestroy {

    constructor(private elementRef: ElementRef) {
    }

    private _enabled: boolean = true;
    private _timer: number;
    @Input('pacemResizeEnabled') set enabled(v: boolean) {
        if (this._enabled != v) {
            this._enabled = v;
            this.start();
        }
    }
    get enabled() {
        return this._enabled;
    }

    @Output('pacemResize') onresize = new EventEmitter();

    private resizer = new Subject();
    private subscription: Subscription;
    private previousHeight: number;
    private previousWidth: number;

    private start() {
        let el = <HTMLElement>this.elementRef.nativeElement;
        let v = this._enabled;
        if (v) {
            this.previousHeight = el.offsetHeight;
            this.previousWidth = el.offsetWidth;
            this._timer = window.requestAnimationFrame(this.check);
        } else
            window.cancelAnimationFrame(this._timer);
    }

    private check = (_?) => {
        let el = <HTMLElement>this.elementRef.nativeElement;
        let height = el.offsetHeight;
        let width = el.offsetWidth;
        if (height != this.previousHeight
            || width != this.previousWidth) {
            this.previousHeight = height;
            this.previousWidth = width;
            this.resizer.next({});
        }
        this._timer = window.requestAnimationFrame(this.check);
    }

    ngOnInit() {
        this.subscription = this.resizer.asObservable()
            .debounceTime(50)
            .subscribe(_ => {
                this.onresize.emit(_);
            });
        this.start();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        window.cancelAnimationFrame(this._timer);
    }

}

/**
 * PacemLightbox Component
 */
@Component({
    selector: 'pacem-lightbox',
    template: `<div class="pacem-lightbox-wrapper" [hidden]="hide" [pacemHidden]="hide" #wrapper>
<div class="pacem-lightbox" (pacemResize)="resize($event)" [pacemResizeEnabled]="!hide"><ng-content></ng-content></div>
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
        if (!this.content) return;
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
        //
        var container = this.content;
        container.style.top = '0';
        container.style.margin = '0 auto';
        let fnPos = () => {
            var containerHeight = container.offsetHeight;
            var top = (viewportHeight - containerHeight) * .5;
            container.style.transform = `translateY(${top}px)`;// top + 'px auto 0 auto';
        };
        window.requestAnimationFrame(fnPos);
        fnPos();
    }
}

@Injectable()
export class PacemCarouselAdapter<TItem>{

    private _items: QueryList<TItem>;
    private _index: number = -1;
    private subscription: Subscription = null;

    onIndexChange = new EventEmitter<{ previous: number, current: number }>();

    set index(v: number) {
        if (v == this._index) return;
        let prev = this._index;
        this._index = v;
        this.onIndexChange.emit({ current: this._index, previous: prev });
    }
    get index(): number {
        return this._index;
    }

    set items(v: QueryList<TItem>) {
        if (this._items != null) throw `Items have already been set for this ${PacemCarouselAdapter.name}.`;
        let items = this._items = v;
        this.subscription = items.changes.subscribe(() => this.adjustFocusIndex());
        this.adjustFocusIndex();
    }

    destroy() {
        this.subscription.unsubscribe();
        this._items = null;
    }

    private adjustFocusIndex() {
        let items = this._items;
        const index = this.index;
        const length = items && items.length;
        this.index = length ? Math.max(0, Math.min(length - 1, index)) : -1;
    }

    /**
     * Returns whether the provided index is close (adjacent or equal) to the current one in focus.
     * @param ndx index to be checked
     */
    isClose(ndx: number): boolean {
        var _this = this;
        let items = _this._items;
        const index = _this.index;
        const length = items && items.length;
        if (!length) return false;
        return ndx == index
            || (ndx + 1) % length == index
            || (ndx - 1 + length) % length == index;
    }

    /**
     * Returns whether the provided index is adjacent (previous on the list) to the current one in focus.
     * @param ndx index to be checked
     */
    isPrevious(ndx: number): boolean {
        var _this = this;
        let items = _this._items;
        const index = _this.index;
        const length = items && items.length;
        if (!length) return false;
        return ((ndx + 1) % length) == index;
    }

    /**
     * Returns whether the provided index is adjacent (next on the list) to the current one in focus.
     * @param ndx index to be checked
     */
    isNext(ndx: number): boolean {
        var _this = this;
        let items = _this._items;
        const index = _this.index;
        const length = items && items.length;
        if (!length) return false;
        return ((ndx - 1 + length) % length) == index;
    }

    previous() {
        var _this = this;
        let items = _this._items;
        const index = _this.index;
        const length = items && items.length;
        if (!length) return;
        _this.index = (index - 1 + length) % length;
    }

    next() {
        var _this = this;
        let items = _this._items;
        const index = _this.index;
        const length = items && items.length;
        if (!length) return;
        _this.index = (index + 1) % length;
    }

}

export abstract class PacemCarouselBase<TItem> implements AfterContentInit, OnDestroy {

    @Output('indexChange') onindex = new EventEmitter<number>();
    @Output('indexChanged') onindexchanged = new EventEmitter<{ previous: number, current: number }>();

    private _subscription: Subscription;

    constructor(protected adapter: PacemCarouselAdapter<TItem>) {
    }

    set index(v: number) {
        this.adapter.index = v;
    }

    get index() {
        return this.adapter.index;
    }

    protected abstract getItems(): QueryList<TItem>;

    ngAfterContentInit() {
        this._subscription = this.adapter.onIndexChange
            .subscribe((ndx: { previous: number, current: number }) => {
                this.onindex.emit(ndx.current);
                this.onindexchanged.emit(ndx);
            });
        this.adapter.items = this.getItems();
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        this.adapter.destroy();
    }

    previous() {
        this.adapter.previous();
    }
    next() {
        this.adapter.next();
    }
}

/**
 * PacemCarouselItem Directive
 */
@Directive({
    selector: '[pacemCarouselItem]',
    exportAs: 'pacemCarouselItem'
})
export class PacemCarouselItem implements OnInit, OnDestroy {

    constructor(private elementRef: ElementRef) { }

    private _isCloseToActive: boolean = false;
    private _isPrevious: boolean = false;
    private _isNext: boolean = false;
    private _isActive: boolean = false;

    /** @internal */
    set active(v: boolean) {
        if (v != this._isActive) {
            this._isActive = v;
            if (v) PacemUtils.addClass(this.elementRef.nativeElement, "pacem-carousel-active");
            else PacemUtils.removeClass(this.elementRef.nativeElement, "pacem-carousel-active");
        }
    }
    /**
     * Gets whether the current item is the active one.
     */
    get active() {
        return this._isActive;
    }

    /** @internal */
    set near(v: boolean) {
        if (v == this._isCloseToActive) return;
        this._isCloseToActive = v;
        if (v) PacemUtils.addClass(this.elementRef.nativeElement, "pacem-carousel-item-near");
        else PacemUtils.removeClass(this.elementRef.nativeElement, "pacem-carousel-item-near");
    }
    /**
     * Gets whether the current item is adjacent (or equal) to the active one.
     */
    get near() {
        return this._isCloseToActive;
    }

    /** @internal */
    set previous(v: boolean) {
        if (v == this._isPrevious) return;
        this._isPrevious = v;
        if (v) PacemUtils.addClass(this.elementRef.nativeElement, "pacem-carousel-item-previous");
        else PacemUtils.removeClass(this.elementRef.nativeElement, "pacem-carousel-item-previous");
    }
    /**
     * Gets whether the current item is adjacent to the active one on the left.
     */
    get previous() {
        return this._isPrevious;
    }

    /** @internal */
    set next(v: boolean) {
        if (v == this._isNext) return;
        this._isNext = v;
        if (v) PacemUtils.addClass(this.elementRef.nativeElement, "pacem-carousel-item-next");
        else PacemUtils.removeClass(this.elementRef.nativeElement, "pacem-carousel-item-next");
    }
    /**
     * Gets whether the current item is adjacent to the active one on the right.
     */
    get next() {
        return this._isNext;
    }

    ngOnInit() {
        PacemUtils.addClass(this.elementRef.nativeElement, "pacem-carousel-item");
    }

    ngOnDestroy() {
        PacemUtils.removeClass(this.elementRef.nativeElement, "pacem-carousel-item pacem-carousel-item-previous pacem-carousel-item-next pacem-carousel-item-near");
    }

}

export declare type pacemCarouselConfiguration = {
    interval?: number,
    interactive?: boolean
}

/**
 * PacemCarousel Directive
 */
@Directive({
    selector: '[pacemCarousel]',
    providers: [PacemCarouselAdapter],
    exportAs: 'pacemCarousel'
})
export class PacemCarousel extends PacemCarouselBase<PacemCarouselItem> implements OnInit, OnDestroy, DoCheck {

    @ContentChildren(PacemCarouselItem) items: QueryList<PacemCarouselItem>;
    private subscription: Subscription;
    private subscription2: Subscription;
    private timer: number;
    private timeout: number;
    private dashboard: PacemCarouselDashboard;
    private differer: KeyValueDiffer;

    constructor(
        private compiler: Compiler,
        adapter: PacemCarouselAdapter<PacemCarouselItem>,
        private viewContainerRef: ViewContainerRef,
        private differs: KeyValueDiffers) {
        super(adapter);
    }

    private static defaults: pacemCarouselConfiguration = { interactive: false, interval: 5000 };
    @Input('pacemCarousel') configuration: pacemCarouselConfiguration = {}

    get element(): HTMLElement {
        return this.viewContainerRef.element.nativeElement;
    }

    protected getItems() {
        return this.items;
    }

    ngDoCheck() {
        var changes = this.differer.diff(this.configuration)
        //console.log(`changes detected (balloon): ${changes}`);
        if (changes) this.reset();
        else if (this.items && !this.subscription2 || this.subscription2.closed)
            this.subscription2 = this.items.changes
                .subscribe((c) => {
                    if (this.dashboard)
                        this.dashboard.refresh();
                });
    }

    ngOnInit() {
        this.differer = this.differs.find({}).create(null);
        PacemUtils.addClass(this.viewContainerRef.element.nativeElement, "pacem-carousel");
        this.subscription = this.onindex
            .asObservable()
            .debounceTime(20)
            .subscribe(ndx => {
                this.items.forEach((item, k) => {
                    item.active = k === ndx;
                    item.previous = this.adapter.isPrevious(k);
                    item.next = this.adapter.isNext(k);
                    item.near = item.active || item.previous || item.next /*this.adapter.isClose(k)*/;
                });
            });
        //this.reset();
    }

    /** @internal */ setIndex(v: number) {
        clearTimeout(this.timer);
        this.index = v;
        this.timer = window.setTimeout(() => { this.next(); }, this.timeout);
    }

    next() {
        clearTimeout(this.timer);
        super.next();
        this.timer = window.setTimeout(() => { this.next(); }, this.timeout);
    }

    previous() {
        clearTimeout(this.timer);
        super.previous();
        this.timer = window.setTimeout(() => { this.next(); }, this.timeout);
    }

    private reset() {
        this.dispose();
        //
        const config = <pacemCarouselConfiguration>PacemUtils.extend({}, PacemUtils.clone(PacemCarousel.defaults), this.configuration || {});
        this.timeout = config.interval;
        //
        this.timer = window.setTimeout(() => {
            this.next();
        }, this.timeout);
        //
        if (config.interactive) {
            let factory = this.compiler.compileModuleAndAllComponentsSync(PacemUIModule)
            let cmp = this.viewContainerRef.createComponent(factory.componentFactories.find((cmp) => cmp.componentType == PacemCarouselDashboard), 0);
            let dashboard = <PacemCarouselDashboard>cmp.instance;
            dashboard.carousel = this;
            this.dashboard = dashboard;
        }
    }

    private dispose() {
        clearInterval(this.timer);
        this.viewContainerRef.clear();
    }

    ngOnDestroy() {
        this.dispose();
        this.differer.onDestroy();
        if (this.subscription2)
            this.subscription2.unsubscribe();
        this.subscription.unsubscribe();
        PacemUtils.removeClass(this.viewContainerRef.element.nativeElement, "pacem-carousel");
        super.ngOnDestroy();
    }
}

/**
 * PacemCarouselDashboard Component
 */
@Component({
    selector: 'pacem-carousel-dashboard',
    template: `
    <div class="pacem-carousel-previous" (click)="previous($event)" *ngIf="_carousel?.items?.length > 1">&lt;</div>
    <div class="pacem-carousel-next" (click)="next($event)" *ngIf="_carousel?.items?.length > 1">&gt;</div>
    <ol class="pacem-carousel-dashboard" *ngIf="_carousel?.items?.length > 1">
        <li *ngFor="let item of _carousel?.items, let ndx = index">
            <div (click)="page(ndx, $event)" class="pacem-carousel-page" [ngClass]="{ 'pacem-carousel-active': ndx === _carousel?.index }">{{ ndx+1 }}</div>
        </li>
    <ol>`, changeDetection: ChangeDetectionStrategy.Default
})
class PacemCarouselDashboard implements OnInit, OnDestroy {

    constructor(private changer: ChangeDetectorRef, private elementRef: ElementRef) { }

    private _carousel: PacemCarousel;
    private _carouselSubject = new ReplaySubject<PacemCarousel>(1);
    private _subscription: Subscription;

    set carousel(v: PacemCarousel) {
        if (this._carousel != v) {
            this._carouselSubject.next(v);
        }
    }

    ngOnInit() {
        this._subscription =
            this._carouselSubject.asObservable()
            .debounceTime(20)
            .subscribe(_ => {
                this._carousel = _;
                this.refresh();
            });
        window.addEventListener('resize', this.resize, false);
    }

    ngOnDestroy() {
        this._subscription.unsubscribe();
        window.removeEventListener('resize', this.resize, false);
    }

    refresh() {
        this.changer.detectChanges();
        this.resize();
    }

    resize = (evt?: Event) => {
        requestAnimationFrame(() => {
            let carousel = this._carousel;
            if (!carousel) return;
            let offset = PacemUtils.offset(carousel.element);
            let element = <HTMLElement>this.elementRef.nativeElement;
            // delegate to CSS:
            //element.style.position = 'absolute';
            //element.style.pointerEvents = 'none';
            element.style.top = carousel.element.offsetTop + 'px';
            element.style.left = carousel.element.offsetLeft + 'px';
            element.style.width = carousel.element.offsetWidth + 'px';
            element.style.height = carousel.element.offsetHeight + 'px';
        });
    }

    private previous(evt: Event) {
        evt.preventDefault();
        let c = this._carousel;
        if (c)
            c.previous();
    }
    private next(evt: Event) {
        evt.preventDefault();
        let c = this._carousel;
        if (c)
            c.next();
    }
    private page(ndx: number, evt: Event) {
        evt.preventDefault();
        let c = this._carousel;
        if (c)
            c.setIndex(ndx);
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
        [ngClass]="{ 'pacem-gallery-active': ndx === index }" 
        [ngStyle]="{ 'background-image': 'url('+pic.url+')' }">
            <div class="pacem-gallery-caption" [innerHTML]="pic.caption"></div>
        </li></template>
    </ol>
    <div class="pacem-gallery-close" (click)="close($event)">X</div>
    <div class="pacem-gallery-previous" (click)="previous($event)" *ngIf="items.length > 1">&lt;</div>
    <div class="pacem-gallery-next" (click)="next($event)" *ngIf="items.length > 1">&gt;</div>
</pacem-lightbox>`,
    entryComponents: [PacemLightbox],
    providers: [PacemCarouselAdapter]
})
export class PacemGallery extends PacemCarouselBase<PacemGalleryItem> {

    @ContentChildren(PacemGalleryItem) items: QueryList<PacemGalleryItem>;

    constructor(adapter: PacemCarouselAdapter<PacemGalleryItem>) {
        super(adapter)
    }

    protected getItems() {
        return this.items;
    }

    @Output('close') onclose = new EventEmitter();

    private isNear(ndx) {
        return this.adapter.isClose(ndx);
    }

    private hide: boolean = true;
    @Input() set show(v: boolean) {
        this.hide = !v;
    }

    @Input() set startIndex(v: number) {
        this.adapter.index = v;
    }

    private close(_) {
        this.hide = true;
        this.onclose.emit(_);
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
        var thisel = <HTMLElement>this.element.nativeElement;
        PacemUtils.addClass(thisel, 'pacem-viewport-aware');
        var el = thisel.parentElement;
        this.addEventListeners(window);
        while (el) {
            this.addEventListeners(el);
            el = el.parentElement;
        }
        this._scrollHandler();
    }

    ngOnDestroy() {
        var thisel = <HTMLElement>this.element.nativeElement;
        PacemUtils.removeClass(thisel, 'pacem-viewport-aware');
        var el = thisel.parentElement;
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
                if (visible) PacemUtils.addClass(el, 'pacem-in-viewport');
                else PacemUtils.removeClass(el, 'pacem-in-viewport');
            }
        }, 100);
    }
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
        PacemUtils.cropImageOntoCanvas(el, ctx, srcW, srcH);
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
    template: `<div class="pacem-snapshot" [ngClass]="{ 'pacem-ongoing': status != 'start', 'pacem-custom-size': (w || h) }"  #root>
    
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
    @Output('select') onselect = new EventEmitter<string>();

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
            'data:image/jpeg;base64,' + this.buffer
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
        cnv.width = /*this.width ||*/ cnv.clientWidth;
        cnv.height = /*this.height ||*/ cnv.clientHeight;
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
                            cnv.width = /*this.width ||*/ video.clientWidth;
                            cnv.height = /*this.height ||*/ video.clientHeight;
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
    <circle cx="50" cy="50" r="50" [attr.mask]="'url('+ href +'#inner-mask)'" class="pacem-pie-chart-background" />
    <g>
        <svg:path *ngFor="let slice of slices" 
                [attr.mask]="'url('+ href +'#slices-mask)'"
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

    private href: string;

    private normalizePath = (path?: {url: string}) => {
        let href = (path && path.url) || this.location.path();
        if (('#' + href) === window.location.hash) href = '';
        this.href = href;
    }
    
    ngAfterContentInit() {
        this.location.subscribe(this.normalizePath);
        this.normalizePath();

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

    /**
     * Refreshes the bindings for a provided target key.
     * @param key target
     */
    refresh(key?: string) {
        // TODO: make the argument `key` required and be sure to trigger with a target
        this.onset.emit(key);
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
    }

    refresh() {
        this.debounceBindersBuild();
    }

    @Input('pacemBindTargets') targetKeys: pacemBindTargetRef[] | string[] = [];

    ngOnInit() {
        const me = this;
        let bindings = me.bindings;
        me.subscription = bindings.onset.asObservable()
            .merge(bindings.onremove.asObservable())
            .subscribe((key:string) => {
                // TODO: rebuild only if the argument `key` is relevant
                me.debounceBindersBuild();
            });
        //
        let uiElement = <SVGSVGElement>document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        uiElement.style.position = 'absolute';
        uiElement.classList.add('pacem-bind');
        uiElement.style.top = '0';
        uiElement.style.left = '0';
        uiElement.style.maxWidth = '100vw';
        uiElement.style.maxHeight = '100vh';
        uiElement.style.overflow = 'hidden';
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

    private computeTargetRect(target: pacemBindTarget): { top: { x: number, y: number }, bottom: { x: number, y: number }, left: { x: number, y: number }, right: { x: number, y: number }, center: { x: number, y: number } } {
        let targetPoint = { top: { x: 0, y: 0 }, bottom: { x: 0, y: 0 }, left: { x: 0, y: 0 }, right: { x: 0, y: 0 }, center: { x: 0, y: 0 } };
        let p3d = target instanceof Pacem3DObject && target as Pacem3DObject;
        if (p3d) {
            let box = p3d.projectionBox;
            if (box) {
                targetPoint.center = { x: box.offset.left + box.center.x, y: box.offset.top + box.center.y };

                let left = { x: Number.MAX_VALUE, y: 0 };
                let right = { x: Number.MIN_VALUE, y: 0 };
                let top = { y: Number.MAX_VALUE, x: 0 };
                let bottom = { y: Number.MIN_VALUE, x: 0};
                box.faces.forEach(f => {
                    if (f.x < left.x) left = f;
                    else if (f.x > right.x) right = f;
                    if (f.y < top.y) top = f;
                    else if (f.y > bottom.y) bottom = f;
                });

                bottom.x += box.offset.left;
                top.x += box.offset.left;
                right.x += box.offset.left;
                left.x += box.offset.left;
                bottom.y += box.offset.top;
                top.y += box.offset.top;
                right.y += box.offset.top;
                left.y += box.offset.top;

                targetPoint.bottom = bottom;
                targetPoint.top = top;
                targetPoint.left = left;
                targetPoint.right = right;
            }
        } else {
            let el = target as HTMLElement | SVGElement;
            let offset = PacemUtils.offset(el);
            let w = el.clientWidth, h = el.clientHeight, w2 = w * .5, h2 = h * .5;
            targetPoint.top = { x: offset.left + w2, y: offset.top };
            targetPoint.bottom = { x: offset.left + w2, y: offset.top + h };
            targetPoint.center = { x: offset.left + w2, y: offset.top + h2 };
            targetPoint.left = { x: offset.left, y: offset.top + h2 };
            targetPoint.right = { x: offset.left + w, y: offset.top + h2 };
        }
        return targetPoint;
    }

    /**
     * Computes the closest edge of `to` from the center of `from` and returns that edge's middle point (middle of the bounding box' edge).
     * @param from
     * @param to
     */
    private computeAnchor(
        from: { top: { x: number, y: number }, bottom: { x: number, y: number }, left: { x: number, y: number }, right: { x: number, y: number }, center: { x: number, y: number } },
        to: { top: { x: number, y: number }, bottom: { x: number, y: number }, left: { x: number, y: number }, right: { x: number, y: number }, center: { x: number, y: number } },
        anchor: pacemBindAnchors = 'auto') {
        const center = from.center;
        const centerTo = to.center;

        let ptTop = to.top;
        let ptBottom = to.bottom;
        let ptLeft = to.left;
        let ptRight = to.right;
        
        let padBottom = { x: 2 * ptBottom.x - ptTop.x, y: 2 * ptBottom.y - ptTop.y };
        let padLeft = { x: 2 * ptLeft.x - ptRight.x, y: 2 * ptLeft.y - ptRight.y };
        let padRight = { x: 2 * ptRight.x - ptLeft.x, y: 2 * ptRight.y - ptLeft.y };
        let padTop = { x: 2 * ptTop.x - ptBottom.x, y: 2 * ptTop.y - ptBottom.y };
        let padCenter = { x: centerTo.x - .5 * (centerTo.x - center.x), y: centerTo.y - .5 * (centerTo.y - center.y) };

        let retCenter = [centerTo, padCenter];
        let retTop = [ptTop, padTop];
        let retBottom = [ptBottom, padBottom];
        let retLeft = [ptLeft, padLeft];
        let retRight = [ptRight, padRight];

        switch (anchor.toLowerCase()) {
            case 'center':
                return retCenter;
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
        this.bindings.refresh(this.key);
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
    declarations: [PacemResize, PacemHidden, PacemHighlight, PacemBalloon, PacemBindTarget, PacemBindTargets, PacemGallery, PacemGalleryItem, PacemHamburgerMenu,
        PacemInfiniteScroll, PacemInViewport, PacemLightbox, PacemPieChart, PacemPieChartSlice, PacemRingChart, PacemRingChartItem, PacemSnapshot,
        PacemToast, PacemUploader, PacemCarousel, PacemCarouselItem, PacemCarouselDashboard],
    exports: [PacemResize, PacemHidden, PacemHighlight, PacemBalloon, PacemBindTarget, PacemBindTargets, PacemGallery, PacemGalleryItem, PacemHamburgerMenu,
        PacemInfiniteScroll, PacemInViewport, PacemLightbox, PacemPieChart, PacemPieChartSlice, PacemRingChart, PacemRingChartItem, PacemSnapshot,
        PacemToast, PacemUploader, PacemCarousel, PacemCarouselItem],
    providers: [PacemBindService] //<- defining the provider here, makes it a singleton at application-level
})
export class PacemUIModule { }