export declare var pacem: any;
export declare class PacemUtils {
    static readonly core: any;
    static uniqueCode(): string;
    static parseDate(input: string | Date): Date;
    static blobToDataURL(blob: Blob): PacemPromise<Blob>;
    static dataURLToBlob(dataurl: string): Blob;
    /**
     * Crops an image having the provided url (might be a dataURL) into another having the provided size
     * @param url
     * @param width
     * @param height
     * @param ctx
     */
    static cropImage(url: string, width?: number, height?: number): PromiseLike<string>;
    /**
     * Crops the snapshot of a drawable element onto a provided canvas context. It gets centered in the area anc cropped (`cover`-like behavior).
     * @param el drawable element
     * @param ctx canvas context
     * @param sourceWidth forced source width
     * @param sourceHeight forced source height
     */
    static cropImageOntoCanvas(el: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, ctx: CanvasRenderingContext2D, sourceWidth?: number, sourceHeight?: number): void;
    static is(el: any, selector: string): boolean;
    static hasClass(el: HTMLElement, className: string): boolean;
    static isVisible(el: HTMLElement): boolean;
    static addClass(el: HTMLElement, className: string): void;
    static removeClass(el: HTMLElement, className: string): void;
    static offset(el: Element): {
        top: number;
        left: number;
    };
    static distance(p1: {
        x: number;
        y: number;
    }, p2: {
        x: number;
        y: number;
    }): number;
    static readonly windowSize: {
        width: number;
        height: number;
    };
    static isEmpty(obj: any): boolean;
    static extend(target: any, ...sources: any[]): any;
    static clone(obj: any): any;
}
export declare class PacemDate {
    transform(d: any): Date;
}
export declare class PacemPromise<T> {
    private promise;
    private deferred;
    constructor();
    then(onfulfilled?: (v: T) => T | PromiseLike<T>, onrejected?: (v?: any) => T | PromiseLike<T>): this;
    /**
     * Occurs whenever the promise concludes (either after completion or error).
     * @param {Function } callback
     */
    finally(callback: (v?: T | any) => void | PromiseLike<void>): this;
    success(callback: (v?: T) => void | PromiseLike<void>): this;
    error(callback: (v?: any) => void | PromiseLike<void>): this;
    static defer<T>(): {
        'resolve': (v?: T) => void | PromiseLike<void>;
        'reject': (v?: any) => void | PromiseLike<void>;
        'promise': PacemPromise<T>;
    };
}
export declare class PacemProfile {
    private getStorage(persistent?);
    setPropertyValue(name: string, value: any, persistent?: boolean): void;
    getPropertyValue(name: string): any;
    clear(): void;
    removeProperty(name: string): void;
}
export declare class PacemLooper {
    /**
     * Creates a new instance of Looper.
     */
    constructor();
    private _startIndex;
    private _stopped;
    private _token;
    private deferred;
    /**
     * `loopCallback` callback.
     *
     * @callback loopCallback
     * @param {Object} item
     * @param {Number} index
     */
    /**
     * Starts to loop.
     * @param { Array } array - Set of elements to be looped.
     * @param { loopCallback } callback - Callback to be executed at each loop.
     * @param { Object } [options] - Optional parameters like `debounce` and `synchronous`.
     */
    loop(array: any[], callback: (item: any, index: number) => void, options?: any): this;
    /**
     * Stops the ongoing loop.
     */
    stop(): this;
    /**
     * `completeCallback` callback.
     *
     * @callback completeCallback
     * @param {Array} array - Original set of elements looped.
     * @param {Number} reachedIndex - Reached element index.
     * @param {Boolean} wasStopped - Whether the loop was stopped or not.
     */
    /**
     * Handles the completed (or stopped) loop
     * @param { completeCallback } callback - Callback to be executed at loop completion (or stop).
     */
    complete(callback: any): this;
}
export declare class PacemCoreModule {
}
