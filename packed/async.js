/**
        * @license
        * MochiKit <https://mochi.github.io/mochikit> 
        * Making JavaScript better and easier with a consistent, clean API.
        * Built at "Sat Sep 15 2018 22:54:07 GMT+0100 (British Summer Time)".
        * Command line options: "MochiKit async base color data datetime dom func iter logging repr"
       */
this.mochikit = this.mochikit || {};
this.mochikit.async = (function (exports) {
    'use strict';

    //Useful for catching async callbacks:
    function asyncCatch(asyncFunction, onerror) {
        return function(...nargs) {
            return asyncFunction.call(this, ...nargs).catch(onerror);
        }
    }

    //Useful for piping async callbacks:
    function asyncThen(asyncFunction, pipefunc) {
        return function(...nargs) {
            return asyncFunction.call(this, ...nargs).then(pipefunc);
        }
    }

    function callLater(func, timeout) {
        if(typeof func !== 'function') {
            throw new Error('Evaluating strings and bogus functions are not supported.');
        }

        setTimeout(func, timeout);
    }

    function catchSilent(promise) {
        promise.catch(() => {});
    }

    function chain(promise, functions) {
        return promise.then((value) => {
            //Allow the original value to be referenced:
            let chainValue = value;

            for(let func of functions) {
                chainValue = func(chainValue, promise, value, functions);
            }

            return chainValue;
        })
    }

    function defer(func) {
        setTimeout(func, 0);
    }

    function double(promise, condition, yes, no) {
        return promise.then((value) => {
            return condition(value, promise) ? yes(value, promise) : no(value, promise); 
        });
    }

    function failAfter(timeout) {
        return new Promise((a, reject) => setTimeout(reject, timeout));
    }

    //For now:
    var fetch$1 = typeof window === 'object' ? fetch : (url, options) => {
        throw new Error('get* functions not supported in node environments yet.');
    };

    function getArrayBuffer(url, options) {
        fetch$1(url, options).then((r) => r.arrayBuffer());
    }

    function getBlob(url, options) {
        fetch$1(url, options).then((r) => r.blob());
    }

    function getForm(url, options) {
        fetch$1(url, options).then((r) => r.formData());
    }

    function getJSON(url, options) {
        fetch$1(url, options).then((r) => r.json());
    }

    function getText(url, options) {
        fetch$1(url, options).then((r) => r.text());
    }

    function isPromise(promise) {
        return Object.prototype.toString.call(promise) === '[object Promise]';
    }

    function isThenable(promise) {
        return typeof promise === 'object' && typeof promise.then === 'function';
    }

    function isAsync(object) {
        return object && (isThenable(object) || isPromise(object));
    }

    function prevent(promise) {
        return new Promise((resolve) => {
            //Some Promise impls. might not have #then(done, error) compat.
            promise.catch((err) => {
                resolve(err);
                throw err;
            });
            
            promise.then((value) => {
                resolve(value);
                return value;
            });
        });
    }

    function simpleXHR(
        url,
        method,
        { async = true, user, password },
        { done, error, progress, orsc }
    ) {
        let xhr = new XMLHttpRequest();
        xhr.open(url, method, async, user, password);

        if (done) {
            xhr.addEventListener('load', done);
        }

        if (error) {
            xhr.addEventListener('error', error);
        }

        if (progress) {
            xhr.addEventListener('progress', progress);
        }

        if (orsc) {
            xhr.addEventListener('readystatechange', orsc);
        }

        xhr.send();
        return xhr;
    }

    function succeedAfter(timeout) {
        return new Promise((resolve) => setTimeout(resolve, timeout));
    }

    function tap(promise, func) {
        return promise.then((value) => {
            func(value, promise);
            return value;
        });
    }

    function tapFinally(promise, func) {
        return promise.finally((value) => {
            func(value, promise);
            return value;
        });
    }

    /**
     * This file is basically a "folder module",
     * meaning all the files in the folder
     * are being exported from this module,
     * so you can do:
     * @example
     * import { all, chain, Deferred } from 'mochikit/async';
     *
     * This should work with modern-day module bundlers
     * like Rollup, because it uses a technique called
     * 'tree shaking' which basically means only the needed
     * modules are included in the bundles.
     */

    const __repr__ = '[MochiKit.Async]';

    exports.__repr__ = __repr__;
    exports.asyncCatch = asyncCatch;
    exports.asyncThen = asyncThen;
    exports.callLater = callLater;
    exports.catchSilent = catchSilent;
    exports.chain = chain;
    exports.defer = defer;
    exports.double = double;
    exports.failAfter = failAfter;
    exports.getArrayBuffer = getArrayBuffer;
    exports.getBlob = getBlob;
    exports.getForm = getForm;
    exports.getJSON = getJSON;
    exports.getText = getText;
    exports.isAsync = isAsync;
    exports.isPromise = isPromise;
    exports.isThenable = isThenable;
    exports.prevent = prevent;
    exports.simpleXHR = simpleXHR;
    exports.succeedAfter = succeedAfter;
    exports.tap = tap;
    exports.tapFinally = tapFinally;

    return exports;

}({}));
