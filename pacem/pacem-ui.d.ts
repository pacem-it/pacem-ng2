import { QueryList, PipeTransform, OnChanges, Renderer, SimpleChanges, ElementRef, ViewContainerRef, EventEmitter, AfterContentInit, AfterViewInit, Compiler, OnInit, OnDestroy, KeyValueDiffers, DoCheck, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Pacem3DObject } from './pacem-3d';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/merge';
export declare type pacemBindAnchors = 'auto' | 'left' | 'top' | 'right' | 'bottom';
export declare class PacemHidden {
    private elRef;
    hidden: boolean;
    constructor(elRef: ElementRef);
}
/**
 * PacemHighlight Pipe
 */
export declare class PacemHighlight implements PipeTransform {
    private sce;
    constructor(sce: DomSanitizer);
    transform(src: string, query: string, css: string): SafeHtml;
}
/**
 * PacemInfiniteScroll Directive
 */
export declare class PacemInfiniteScroll implements OnDestroy {
    private element;
    pacemInfiniteScrollContainer: string | HTMLElement;
    pacemInfiniteScrollEnabled: boolean;
    pacemInfiniteScrollBottomGap: number;
    pacemInfiniteScroll: EventEmitter<{}>;
    constructor(element: ElementRef);
    ngOnDestroy(): void;
    private $scrollDelegate;
    private $enabled;
    private viewportHeight;
    private innerHeight;
    private is$document;
    private $container;
    private $viewport;
    private $scroller;
    private throttler;
    private $bottomGap;
    private scroll();
    private doScroll();
    private computeHeight();
}
/**
 * PacemLightbox Component
 */
export declare class PacemLightbox implements OnInit, OnChanges, OnDestroy {
    private hide;
    private resizeDelegate;
    show: boolean;
    onclose: EventEmitter<{}>;
    wrapperElement: ElementRef;
    private content;
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private reset();
    private resize(evt?);
}
export declare class PacemCarouselAdapter<TItem> {
    private _items;
    private _index;
    private subscription;
    onIndexChange: EventEmitter<{
        previous: number;
        current: number;
    }>;
    index: number;
    items: QueryList<TItem>;
    destroy(): void;
    private adjustFocusIndex();
    /**
     * Returns whether the provided index is close (adjacent or equal) to the current one in focus.
     * @param ndx index to be checked
     */
    isClose(ndx: number): boolean;
    /**
     * Returns whether the provided index is adjacent (previous on the list) to the current one in focus.
     * @param ndx index to be checked
     */
    isPrevious(ndx: number): boolean;
    /**
     * Returns whether the provided index is adjacent (next on the list) to the current one in focus.
     * @param ndx index to be checked
     */
    isNext(ndx: number): boolean;
    previous(): void;
    next(): void;
}
export declare abstract class PacemCarouselBase<TItem> implements AfterContentInit, OnDestroy {
    protected adapter: PacemCarouselAdapter<TItem>;
    onindex: EventEmitter<number>;
    onindexchanged: EventEmitter<{
        previous: number;
        current: number;
    }>;
    private _subscription;
    constructor(adapter: PacemCarouselAdapter<TItem>);
    index: number;
    protected abstract getItems(): QueryList<TItem>;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    previous(): void;
    next(): void;
}
/**
 * PacemCarouselItem Directive
 */
export declare class PacemCarouselItem implements OnInit, OnDestroy {
    private elementRef;
    constructor(elementRef: ElementRef);
    private _isCloseToActive;
    private _isPrevious;
    private _isNext;
    private _isActive;
    /**
     * Gets whether the current item is the active one.
     */
    /** @internal */
    active: boolean;
    /**
     * Gets whether the current item is adjacent (or equal) to the active one.
     */
    /** @internal */
    near: boolean;
    /**
     * Gets whether the current item is adjacent to the active one on the left.
     */
    /** @internal */
    previous: boolean;
    /**
     * Gets whether the current item is adjacent to the active one on the right.
     */
    /** @internal */
    next: boolean;
    ngOnInit(): void;
    ngOnDestroy(): void;
}
export declare type pacemCarouselConfiguration = {
    interval?: number;
    interactive?: boolean;
};
/**
 * PacemCarousel Directive
 */
export declare class PacemCarousel extends PacemCarouselBase<PacemCarouselItem> implements OnInit, OnDestroy, DoCheck {
    private compiler;
    private viewContainerRef;
    private differs;
    items: QueryList<PacemCarouselItem>;
    private subscription;
    private subscription2;
    private timer;
    private timeout;
    private dashboard;
    private differer;
    constructor(compiler: Compiler, adapter: PacemCarouselAdapter<PacemCarouselItem>, viewContainerRef: ViewContainerRef, differs: KeyValueDiffers);
    private static defaults;
    configuration: pacemCarouselConfiguration;
    element: HTMLElement;
    protected getItems(): QueryList<PacemCarouselItem>;
    ngDoCheck(): void;
    ngOnInit(): void;
    /** @internal */ setIndex(v: number): void;
    next(): void;
    previous(): void;
    private reset();
    private dispose();
    ngOnDestroy(): void;
}
/**
 * PacemGalleryItem Directive
 */
export declare class PacemGalleryItem {
    url: string;
    caption: string;
}
/**
 * PacemGallery Component
 */
export declare class PacemGallery extends PacemCarouselBase<PacemGalleryItem> {
    items: QueryList<PacemGalleryItem>;
    constructor(adapter: PacemCarouselAdapter<PacemGalleryItem>);
    protected getItems(): QueryList<PacemGalleryItem>;
    onclose: EventEmitter<{}>;
    private isNear(ndx);
    private hide;
    show: boolean;
    startIndex: number;
    private close(_);
}
/**
 * PacemBalloon Directive
 */
export declare class PacemBalloon implements OnChanges, OnDestroy, DoCheck, AfterContentInit {
    private element;
    private keyValueDiffers;
    private renderer;
    constructor(element: ElementRef, keyValueDiffers: KeyValueDiffers, renderer: Renderer);
    private differer;
    private balloonConsts;
    private opts;
    private uid;
    private timer;
    pacemBalloon: string | HTMLElement;
    pacemBalloonOptions: Object;
    ngOnDestroy(): void;
    ngAfterContentInit(): void;
    ngDoCheck(): void;
    ngOnChanges(changes: SimpleChanges): void;
    onpopup: EventEmitter<{}>;
    onpopout: EventEmitter<{}>;
    private ensurePopup(v?);
    private stopPropagationDelegate;
    private destroyPopup(popup);
    private registerEvents();
    private unregisterEvents(popup?);
    private popupDelegate;
    private popup();
    private popoutDelegate;
    private popout(popup?);
    private hoverDelegate;
    private outConditionalDelegate;
    private outDelegate;
    private toggleDelegate;
    private removeHandlers();
    private resetBalloon();
}
/**
 * PacemInViewport Directive
 */
export declare class PacemInViewport implements OnDestroy, OnInit {
    private element;
    pacemInViewport: EventEmitter<{}>;
    pacemInViewportIgnoreHorizontal: boolean;
    constructor(element: ElementRef);
    private addEventListeners(what);
    private removeEventListeners(what);
    ngOnInit(): void;
    ngOnDestroy(): void;
    private static _events;
    private _throttler;
    private _visible;
    private _isElementVisible(el);
    private _scrollHandler;
}
/**
 * PacemUploader Component
 */
export declare class PacemUploader implements AfterViewInit, OnDestroy {
    fileupload: ElementRef;
    undoCaption: string;
    retryCaption: string;
    pattern: string;
    startUploadUrl: string;
    doUploadUrl: string;
    undoUploadUrl: string;
    parallelism: number;
    oncomplete: EventEmitter<{}>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    private changeDelegate;
    private fields;
    uploading: boolean;
    size: number;
    percentage: number;
    complete: boolean;
    failed: boolean;
    invalidFile: boolean;
    upload(file: File, filename?: string): void;
    private doUpload(blob, skip);
    private manage();
    private change(e);
    private undo(e);
    private retry(e);
}
/**
 * PacemSnapshot Component
 */
export declare class PacemSnapshot {
    private cref;
    grabber: ElementRef;
    canvas: ElementRef;
    video: ElementRef;
    root: ElementRef;
    onselect: EventEmitter<string>;
    private _status;
    private previousStatuses;
    private status;
    private canUseWebcam;
    private webcamInitialized;
    private buffer;
    private countdown;
    private branch;
    private processing;
    private pick(evt);
    private take(evt);
    private confirm(evt);
    private back(evt);
    constructor(cref: ChangeDetectorRef);
    private handleFiles(_);
    private setToBeConfirmed(buffer);
    private refreshBuffer(buffer);
    private ensureWebcamRunning();
}
/**
 * PacemRingChartItem Component
 */
export declare class PacemRingChartItem implements AfterViewInit, OnChanges {
    private renderer;
    constructor(renderer: Renderer);
    element: ElementRef;
    private canvas;
    private context2D;
    ngAfterViewInit(): void;
    ngOnChanges(): void;
    stroke: string;
    thickness: number;
    value: number;
    valuechange: EventEmitter<number>;
    max: number;
    interactive: boolean;
    private _round;
    round: number;
    private pivotPoint;
    private pointerStream;
    private subscription;
    private startDrag(evt);
    private drag(evt);
    private drop(evt);
    draw(): void;
}
/**
 * PacemRingChart Component
 */
export declare class PacemRingChart {
    private subscription;
    private throttler;
    items: QueryList<PacemRingChartItem>;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    private resizeHandler;
    private redraw();
}
/**
 * PacemPieChartSlice Directive
 */
export declare class PacemPieChartSlice {
    private ref;
    private _value;
    value: number;
    constructor(ref: ElementRef);
    color: string;
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
export declare class PacemPieChart implements OnDestroy, AfterContentInit {
    private sce;
    private location;
    constructor(sce: DomSanitizer, location: Location);
    private supportsSVGTransforms;
    ngAfterContentInit(): void;
    private subj;
    /**
     * @internal
     */
    ping(): void;
    slices: QueryList<PacemPieChartSlice>;
    ngOnDestroy(): void;
    private subscription;
    private sum;
    private normalize();
    private draw();
}
/**
 * PacemToast Component
 */
export declare class PacemToast {
    autohide: boolean;
    timeout: number;
    onclose: EventEmitter<{}>;
    private _timeout;
    private _hide;
    private hidden;
    private doHide(evt?);
    hide(): void;
    show(): void;
}
export declare type pacemBindTarget = HTMLElement | SVGElement | Pacem3DObject;
export declare class PacemBindService {
    private static targetMappings;
    onset: EventEmitter<string>;
    onremove: EventEmitter<string>;
    constructor();
    /**
     * Sets a target object with a provided unique key.
     * @param key
     * @param target
     */
    setTarget(key: string, target: pacemBindTarget): void;
    /**
     * Removes the target object mapped to the provided key, if any.
     * @param key
     */
    removeTarget(key: string): boolean;
    /**
     * Gets the target object corresponding to the provided key.
     * @param key
     */
    getTarget(key: string): pacemBindTarget;
}
export declare type pacemBindTargetRef = {
    key: string;
    from: pacemBindAnchors;
    to: pacemBindAnchors;
    css?: string;
};
export declare class PacemBindTargets implements OnChanges, OnDestroy, OnInit {
    private bindings;
    private elementRef;
    constructor(bindings: PacemBindService, elementRef: ElementRef);
    refresh(): void;
    targetKeys: pacemBindTargetRef[] | string[];
    ngOnInit(): void;
    ngOnChanges(): void;
    ngOnDestroy(): void;
    private initialized;
    private isBuildingFlag;
    private subscription;
    private uiElement;
    private mappings;
    private debounceBindersBuild();
    private buildBinders();
    private computeTargetRect(target);
    /**
     * Computes the closest edge of `to` from the center of `from` and returns that edge's middle point (middle of the bounding box' edge).
     * @param from
     * @param to
     */
    private computeAnchor(from, to, anchor?);
    private buildBinder(key, from?, to?, css?);
}
export declare class PacemBindTarget implements OnDestroy, OnChanges {
    private bindings;
    private ref;
    constructor(bindings: PacemBindService, ref: ElementRef);
    key: string;
    refresh(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    private remove(k);
    private set(k);
}
/**
 * PacemHamburgerMenu Component
 */
export declare class PacemHamburgerMenu {
    private open;
}
export declare class PacemUIModule {
}
