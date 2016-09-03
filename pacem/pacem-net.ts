/*! pacem-ng2 | (c) 2016 Pacem sas | https://github.com/pacem-it/pacem-ng2/blob/master/LICENSE */
import { Injectable, NgModule } from '@angular/core';
import { Response } from '@angular/http';
import { PacemUtils, PacemPromise, pacem } from './pacem-core';

const noop = () => { };

/**
 * Vanilla implementation for http requests.
 */
@Injectable()
export class PacemHttp {

    constructor() {
        if (typeof window['XMLHttpRequest'] != 'function') throw pacem.localization.default.errors.NOT_EXPLOITABLE.replace(/%s/gi, 'XMLHttpRequest');
    }

    /**
     * Executes an asynchronous XMLHttpRequest over the net.
     * @param {String} url - Base url to be requested.
     * @param {Object} [options] - Options for the request.
     * @param {Object} [options.data] - Data to be sent along.
     * @param {String} [options.method=CORS] - HTTP Verb to be used.
     * @param {Function} [options.progress] - Callback on retrieval progress.
     */
    request(url, options) {
        var _this = this;
        let deferred = PacemPromise.defer<string>();
        options = options || {};
        var method = options.method || 'CORS';
        var data = options.data || {};
        var progress = options.progress || noop;

        var req = new XMLHttpRequest();

        req.addEventListener("progress", (evt) => {
            if (evt.lengthComputable) {
                var pct = evt.loaded / evt.total;
                // callback
                if (typeof progress === 'function') progress.apply(_this, [pct]);
            }
        }, false);
        req.addEventListener("error", () => {
            // Network error occurred
            deferred.reject(Error(pacem.localization.default.errors.NETWORK));
        }, false);
        //req.addEventListener("abort", transferCanceled, false);

        req.addEventListener('load', () => {
            if (req.status == 200) {
                // Resolve the promise with the response
                var response = req.responseText;
                deferred.resolve(response);
            } else
                deferred.reject(Error(req.statusText));
        }, false);

        var params = data ? (typeof data == 'string' ? data : Object.keys(data).map(
            function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
        ).join('&')) : undefined;
        switch (method.toLowerCase()) {
            case 'get':
                url += (/\?/.test(url) ? '&' : '?') + params;
                break;
        }
        //
        req.open(/^cors$/i.test(method) ? 'GET' : method, url, true);
        switch (method.toLowerCase()) {
            case 'get':
                req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                break;
            case 'post':
                req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                break;
        }
        //
        req.send(params);
        return deferred.promise;
    }

    /**
     * Short-hand for 'GET' request.
     */
    get(url, data?) {
        return this.request(url, { 'method': 'GET', 'data': data });
    }

    /**
     * Short-hand for 'CORS' request.
     */
    cors(url, data?) {
        return this.request(url, { 'data': data });
    }

    /**
     * Short-hand for 'POST' request.
     */
    post(url, data?) {
        return this.request(url, { 'method': 'POST', 'data': data });
    }

}

/**
 * SignalR wrapper for angular (needs jQuery >= 1.64).
 */
@Injectable()
export class PacemHub {

    private proxy: SignalR.Hub.Proxy;
    private connection: SignalR.Hub.Connection;
    private _disconnectCallbacks = [];

    /**
     * Starts a new connection with a SignalR hub.
     * @param url hub url
     * @param hubName hub name
     * @param options connection options
     */
    start(url:string, hubName:string, options?) {
        var _me = this;
        _me.connection = $.hubConnection();
        _me.connection.url = url;
        _me.proxy = _me.connection.createHubProxy(hubName);
        var _me = this;
        var deferred = PacemPromise.defer();
        _me.connection.start(options).done(function (conn) {
            console.info('connected to ' + hubName + ' (id: ' + _me.connection.id + ').');
            _me.connection.disconnected(function () {
                var args = arguments;
                _me._disconnectCallbacks.forEach((fn) => {
                    fn.apply(_me, args);
                });
            });
            deferred.resolve(arguments);
        }).fail(function () {

            var err = 'Could not connect to ' + hubName + '.';
            for (var child in arguments)
                err += '\n' + child + ': ' + arguments[child];
            console.error(err);
            deferred.reject(arguments);

        });

        return deferred.promise;
    }

    /**
     * Stops the listening connection.
     */
    stop() {
        var _me = this;
        _me.connection.stop(true, true);
        _me.connection = null;
        _me.proxy = null;
    }

    /**
     * Invokes a server hub method with the given arguments.
     * @param methodName method name
     */
    invoke(methodName, ...args:any[]) {
        var _me = this;
        var deferred = PacemPromise.defer();
        _me.proxy.invoke.apply(_me.proxy, $.makeArray(arguments))
            .done(function () {
                deferred.resolve.apply(_me, arguments);
            }).fail(function () {
                deferred.reject.apply(_me, arguments);
            });

        return deferred.promise;
    }

    /**
     * Sets the handler for a given event name.
     * @param eventName message identifier
     * @param callback handler
     */
    on(eventName, callback?) {
        var proxy = this.proxy;
        proxy.on(eventName, function () {
            var args = arguments;
            if (callback) {
                callback.apply(window, args);
            }
        });
    }

    /**
     * Removes the handler for a given event name.
     * @param eventName message identifier
     * @param callback handler
     */
    off(eventName, callback?) {
        var proxy = this.proxy;
        proxy.off(eventName, function () {
            var args = arguments;
            if (callback) {
                callback.apply(window, args);
            }
        });
    }

    /**
     * Adds a disconnection callback.
     * @param callback
     */
    addDisconnected(callback: () => void) {
        if (typeof callback !== 'function') throw 'Not a function.';
        if (this._disconnectCallbacks.indexOf(callback) == -1)
            this._disconnectCallbacks.push(callback);
    }

    /**
     * Removes a previously added disconnection callback.
     * @param callback
     */
    removeDisconnected(callback: () => void) {
        let ndx = -1;
        if (callback && (ndx = this._disconnectCallbacks.indexOf(callback)) > -1)
            this._disconnectCallbacks.splice(ndx, 1);
    }
}

@NgModule({
    providers: [PacemHttp, PacemHub]
})
export class PacemNetModule { }