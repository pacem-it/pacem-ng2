import { PacemPromise } from './pacem-core';
export declare class PacemResponse {
    constructor(req: XMLHttpRequest, processTime: number);
    private _processTime;
    private _status;
    private _text;
    private _body;
    private _type;
    private _allHeadersRaw;
    private _headers;
    processTime: number;
    headers: {
        [key: string]: string;
    };
    size: number;
    mime: string;
    date: Date;
    private _parseHeaders();
    status: number;
    text: string;
    content: any;
    type: string;
    /**
     * Short-hand utility for getting or parsing json content (if any).
     */
    json: any;
}
/**
 * Vanilla implementation for http requests.
 */
export declare class PacemHttp {
    constructor();
    /**
     * Executes an asynchronous XMLHttpRequest over the net.
     * @param {String} url - Base url to be requested.
     * @param {Object} [options] - Options for the request.
     * @param {Object} [options.data] - Data to be sent along.
     * @param {String} [options.method=CORS] - HTTP Verb to be used.
     * @param {Object} [options.headers] - Key-value pairs of strings.
     * @param {Function} [options.progress] - Callback on retrieval progress.
     */
    request(url: any, options?: any): PacemPromise<PacemResponse>;
    /**
     * Short-hand for 'GET' request.
     */
    get(url: any, data?: any, headers?: {
        [key: string]: string;
    }): PacemPromise<PacemResponse>;
    /**
     * Short-hand for 'CORS' request.
     */
    cors(url: any, data?: any, headers?: {
        [key: string]: string;
    }): PacemPromise<PacemResponse>;
    /**
     * Short-hand for 'POST' request.
     */
    post(url: any, data?: any, headers?: {
        [key: string]: string;
    }): PacemPromise<PacemResponse>;
}
/**
 * SignalR wrapper for angular (needs jQuery >= 1.64).
 */
export declare class PacemHub {
    private proxy;
    private connection;
    private _disconnectCallbacks;
    private _url;
    private _name;
    url: string;
    name: string;
    private reset();
    /**
     * Starts a new connection with a SignalR hub.
     * @param url hub url
     * @param hubName hub name
     * @param options connection options
     */
    start(options?: any): PacemPromise<{}>;
    /**
     * Stops the listening connection.
     */
    stop(): void;
    /**
     * Invokes a server hub method with the given arguments.
     * @param methodName method name
     */
    invoke(methodName: string, ...args: any[]): PacemPromise<{}>;
    /**
     * Sets the handler for a given event name.
     * @param eventName message identifier
     * @param callback handler
     */
    on(eventName: any, callback?: any): void;
    /**
     * Removes the handler for a given event name.
     * @param eventName message identifier
     * @param callback handler
     */
    off(eventName: any, callback?: any): void;
    /**
     * Adds a disconnection callback.
     * @param callback
     */
    addDisconnected(callback: () => void): void;
    /**
     * Removes a previously added disconnection callback.
     * @param callback
     */
    removeDisconnected(callback: () => void): void;
}
export declare class PacemNetModule {
}
