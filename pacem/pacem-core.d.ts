export declare var pacem: any;
export declare class PacemUtils {
    static core: any;
    static uniqueCode(): string;
    static parseDate(input: string | Date): Date;
    static blobToDataURL(blob: Blob): PacemPromise<Blob>;
    static dataURLToBlob(dataurl: string): Blob;
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
    static windowSize: {
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
    then(onCompleted: (v?: T) => void | PromiseLike<void>, onFailed?: (v?: any) => void | PromiseLike<void>): this;
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
