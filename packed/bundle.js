/*Bundled with Rollup at "Sun Sep 09 2018 10:01:10 GMT+0100 (British Summer Time)".*/
var mochikit = (function () {
    'use strict';

    let undefined;

    const PENDING = 0,
        REJECTED = 1,
        RESOLVED = 2,
        SETTLED = 3;

    let id = 0;

    class Deferred {
        constructor (callback, canceller) {
            this.id = ++id;
            this.chain = [];
        
            //Allow the Deferred to be 'tapped',
            //meaning a .catch handler can be added,
            //but if no error catching handlers were
            //added using .catch, an error will still
            //be thrown.
            this.__error_handlers__ = [];
            this.silentlyCancelled = false;
            this.value = undefined;
            this.canceller = canceller;
            this.state = PENDING;
        
            //Add support for shorthand Deferred creation.
            if (typeof callback === 'function') {
                this.fire(callback);
            }
        }

        fire (callback) {
            let self = this;
        
            //Make bound functions for 'this':
            function boundReject(value) {
                self.reject(value);
            }
        
            function boundResolve(value) {
                self.resolve(value);
            }
        
            try {
                callback(boundResolve, boundReject);
            } catch (error) {
                boundReject(error);
            }
        
            return this;
        }

        cancel () {
            if (this.isSettled()) {
                //Might add custom AsyncError class:
                throw new Error('Cannot cancel a settled promise.');
            }
        
            if (this.canceller) {
                this.canceller(this, this.value);
            } else {
                this.silentlyCancelled = true;
            }
        
            return this;
        }

        clearChain () {
            this.chain = [];
            return this;
        }

        isEmpty () {
            return this.chain.length === 0;
        }

        isResolved () {
            return this.state === RESOLVED;
        }

        isRejected () {
            return this.state === REJECTED;
        }

        isSettled () {
            return this.isRejected() || this.isResolved();
        }

        reject (value) {
            this.value = value;
            this.state = REJECTED;
        
            //Stimulate a value map without disrupting
            //the chain value.
            let chainValue = value;
        
            for (let errfunc of this.__error_handlers__) {
                chainValue = errfunc(chainValue);
            }
        
            if (!this.anyFor(REJECTED)) {
                if (value instanceof Error) {
                    //Interpolate the error message to
                    //provide context.
                    value.message = `Uncaught Deferred: ${value.message}`;
                } else {
                    value = new Error(value);
                }
        
                throw value;
            }
        
            this.fireCallbacks();
        }

        anyFor(state) {
            for (let [, $state] of this.chain) {
                if ($state === state) {
                    return true;
                }
            }
        
            return false;
        }

        then(func, errfunc) {
            if (typeof func === 'function') {
                this.addCallback(func, RESOLVED);
            }
        
            if (typeof errfunc === 'function') {
                this.addCallback(func, REJECTED);
            }
        
            return this;
        }

        catch(errfunc) {
            return this.then(null, errfunc);
        }

        finally(func) {
            if (typeof func === 'function') {
                this.addCallback(func, SETTLED);
            }

            return this;
        }

        flip() {
            let newChain = [];
            for (let [callback, state] of this.chain) {
                if (state === REJECTED) {
                    newChain.push([callback, RESOLVED]);
                } else if (state === RESOLVED) {
                    newChain.push([callback, REJECTED]);
                } else {
                    //We have a SETTLED state here,
                    //just keep it as that.
                    newChain.push([callback, state]);
                }
            }

            this.chain = newChain;
            return this;
        }

        addCallback(callback, state) {
            if (state !== RESOLVED && state !== REJECTED && state !== SETTLED) {
                throw new Error('The provided state is not a valid state.');
            }

            if (this.state === state) {
                //The state matches.
                //Fire the callback.
                this.fireCallback(callback);
            } else {
                this.chain.push([callback, state]);
            }

            return this;
        }

        fireCallbacks() {
            for (let [callback, state] of this.chain) {
                if (this.correctState(state)) {
                    this.fireCallback(callback);
                }
            }

            return this;
        }

        correctState(state) {
            return (
                (state === REJECTED && this.isRejected()) ||
                (state === RESOLVED && this.isResolved()) ||
                (state === SETTLED && this.isSettled())
            );
        }

        fireCallback(callback) {
            this.value = callback(this.value);
            return this;
        }

        resolve(value) {
            this.value = value;
            this.state = RESOLVED;
            this.fireCallbacks();
        }

        rejectAfter(timeout, value) {
            return this.actionAfter('reject', timeout, value);
        }

        resolveAfter(timeout, value) {
            return this.actionAfter('resolve', timeout, value);
        }

        actionAfter(action, timeout, value) {
            let self = this,
                method = action === REJECTED ? 'reject' : 'resolve';

            setTimeout(function(timestamp) {
                self[method](value === undefined ? timestamp : value);
            }, timeout);
        }

        forEach(func) {
            this.then(function(array) {
                let len;
                //Determine if the value is an array-like object.
                if (
                    array &&
                    typeof (len = array.length) === 'number' &&
                    isFinite(len)
                ) {
                    //Use a classic for-each loop, as if it is an array-like object,
                    //it might not have implemented Symbol.iterator.

                    for (let index = 0; index < len; ++index) {
                        func(array[index], index, array);
                    }
                }

                return array;
            });
        }

        callbacksFor(state) {
            if (state !== RESOLVED && state !== REJECTED && state !== SETTLED) {
                throw new Error('The provided state is not a valid state.');
            }

            let list = [];

            for (let [func, $state] of this.chain) {
                if ($state === state) {
                    list.push(func);
                }
            }

            return list;
        }

        clone() {
            let deferred = new Deferred(null, this.canceller);
            deferred.chain = this.chain;
            deferred.state = this.state;
            deferred.__error_handlers__ = this.__error_handlers__;
            deferred.id = this.id;
            deferred.silentlyCancelled = this.silentlyCancelled;
            return deferred;
        }

        toPromise() {
            let self = this;

            return new Promise(function(resolve, reject) {
                self.tap(resolve).tapCatch(reject);
            });
        }

        tapFinally(func) {
            return this.finally(function(value) {
                func(value);
                return value;
            });
        }

        tap(func) {
            return this.then(function(value) {
                //Prevent the value from being changed
                //by the callback, as it is a lazy function
                //meaning it performs operations without
                //returning a value.
                func(value);
                return value;
            });
        }

        tapCatch(errfunc) {
            if (this.state === REJECTED) {
                errfunc(this.value);
            } else {
                this.__error_handlers__.push(errfunc);
            }

            return this;
        }

        catchSilent(errfunc) {
            return this.catch(function() {});
        }
    }

    //promises = Deferred
    function all(promises) {
        return new Deferred((resolve, reject) => {
            let unresolved = promises.length - 1,
            values = [];

            for(let deferred of promises) {
                deferred.tap((value) => {
                    --unresolved;
                    values.push(value);
                    if(unresolved === 0) {
                        resolve(values);
                    }
                }),tapCatch(reject);
                //Reject at the first broken Deferred.
            }
        });
    }

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
        promise.then((value) => {
            //Allow the original value to be referenced:
            let chainValue = value;

            for(let func of functions) {
                chainValue = func(chainValue, promise, value, functions);
            }

            return chainValue;
        });
    }

    function defer(func) {
        setTimeout(func, 0);
    }

    function double(promise, condition, yes, no) {
        promise.then((value) => {
            return condition(value, promise) ? yes(value, promise) : no(value, promise); 
        });
    }

    function failAfter(deferred, timeout) {
        setTimeout((t) => deferred.reject(t), timeout);
        return deferred;
    }

    function getArrayBuffer(url, options) {
        fetch(url, options).then((r) => r.arrayBuffer());
    }

    function getBlob(url, options) {
        fetch(url, options).then((r) => r.blob());
    }

    function getForm(url, options) {
        fetch(url, options).then((r) => r.formData());
    }

    function getJSON(url, options) {
        fetch(url, options).then((r) => r.json());
    }

    function getText(url, options) {
        fetch(url, options).then((r) => r.text());
    }

    function isPromise(promise) {
        return Object.prototype.toString.call(promise) === '[object Promise]';
    }

    function isThenable(promise) {
        return typeof promise === 'object' && typeof promise.then === 'function';
    }

    function isAsync(object) {
        return isPromise(object) || isThenable(object);
    }

    class Message {
        constructor(event, emitter) {
            this.time = Date.now();
            this.event = event;
            this.emitter = emitter;
        }
    }

    class MessageEmitter {
        constructor() {
            this.messages = [];
            this.handlers = [];
            this.collecting = true;
            this.onerror = null;
        }

        on(event, func) {
            this.handlers.push([event, func]);
            return this;
        }

        off(event, func) {
            this.handlers = this.handlers.filter(
                ([$event, $func]) => $func !== func && $event !== event
            );
            return this;
        }

        has(event) {
            for (let [$event] of this.handlers) {
                if ($event === event) {
                    return true;
                }
            }

            return false;
        }

        emitWithGuard(event, onerror) {
            for (let [$event, func] of this.handlers) {
                if (event === $event) {
                    try {
                        func(this.createMessage(event));
                    } catch (error) {
                        onerror(error);

                        if (this.onerror) {
                            this.onerror(error, event, func);
                        }
                    }
                }
            }

            return this;
        }

        emit(event) {
            return this.emitWithGuard(event, (e) => {
                throw e;
            });
        }

        createMessage(event) {
            let msg = new Message(event, this);
            this.addMessage(msg);
            return this;
        }

        addMessage(msg) {
            if (this.collecting) {
                this.messages.push(msg);
            }

            return this;
        }

        hasHandler(func) {
            for (let [, $func] of this.handlers) {
                if ($func === func) {
                    return true;
                }
            }

            return false;
        }

        whenEmitted(event) {
            let self = this;

            return new Promise((resolve, reject) => {
                self.on(event, resolve);
            });
        }

        whenFailed(event) {
            let self = this;

            return new Promise((resolve, reject) => {
                let rejected = false;
                self.emitWithGuard(event, (e) => {
                    rejected = true, reject(e);
                });

                if(!rejected) {
                    resolve(event);
                }
            });
        }

        emitDisposing(event, onerror) {
            if(onerror) {
                this.emitWithGuard(event, onerror);
            } else {
                this.emit(event);
            }

            this.dispose(event);
            return this;
        }

        dispose(event) {
            let handlers = this.handlers;
            this.handlers.forEach(([el], index) => {
                if(el === event) {
                    handlers.splice(index, 1);
                }
            });
            return this;
        }

        removeMessages($event) {
            this.messages = this.messages.filter(({ event }) => event !== $event);
            return this;
        }

        anyMessages() {
            return this.messages.length !== 0;
        }

        clearMessages() {
            this.messages = [];
            return this;
        }

        isCollecting() {
            return this.collecting;
        }

        clearHandlers() {
            this.handlers = [];
            return this;
        }

        anyHandlers() {
            return this.handlers.length !== 0;
        }

        pop() {
            this.handlers.pop();
            return this;
        }

        concat(...items) {
            this.handlers.concat(...items);
            return this;
        }

        conjoin(map) {
            let val;
            for(let key of Object.keys(map)) {
                val = map[key];
                this.on(key, val);
            }
            
            return this;
        }

        /**
         * 
         * @param {!Map} map 
         */
        conjoinMap(map) {
            let val;
            for(let key of map.keys()) {
                val = map.get(key);
                this.on(key, val);
            }

            return this;
        }

        onArray(event, array) {
            for(let func of array) {
                this.on(event, func);
            }

            return this;
        }

        keys() {
            return this.mapIndex(0);
        }

        values() {
            return this.mapIndex(1);
        }

        pairs() {
            return this.handlers;
        }

        mapIndex(index) {
            index = +index;
            return this.handlers.map((arr) => arr[index]);
        }

        once(event, func) {
            let self = this;
            return this.on(event, (msg) => {
                self.off(event, func);
                func(msg);
            });
        }

        toObject() {
            let object = {};
            for(let [event, func] of this.handlers) {
                object[event] = func;
            }
            return object;
        }

        emitAfter(event, timeout) {
            let self = this;
            setTimeout(() => {
                self.emit(event);
            }, timeout);
            return this;
        }

        emitTimes(event, times) {
            for(let i = 0; i < times; ++i) {
                this.emit(event);
            }
            return this;
        }

        emitUntil(event, func, limit) {
            for(let i = 0; i < limit && func(event, i, limit); ++i) {
                this.emit(event);
            }

            return this;
        }

        messagesAt(time) {
            return this.filterMessages((msg) => msg.time === time);
        }

        messagesBefore(time) {
            return this.filterMessages((msg) => msg.time < time);
        }

        messagesAfter(time) {
            return this.filterMessages((msg) => msg.time > time);
        }

        messagesFor(event) {
            return this.filterMessages((msg) => msg.event === event);
        }

        messagesNotFor(event) {
            return this.filterMessages((msg) => msg.event !== event);
        }

        messagesMatching(msg) {
            return this.filterMessages(($msg) => msg.event === $msg.event && msg.time === $msg.time);
        }

        messagesNotMatching(msg) {
            return this.filterMessages(($msg) => msg.event !== $msg.event && $msg.time !== msg.time);
        }

        messagesMap() {
            let map = new Map(),
            set;

            for(let msg of this.messages) {
                if(set = map.get(msg.event)) {
                    set.add(msg);
                } else {
                    map.set(msg.event, new WeakSet());
                    map.get(msg.event).add(msg);
                }
            }

            return map;
        }

        pipe(msge) {
            for(let [event, func] of this.handlers) {
                msge.on(event, func);
            }

            msge.messages = this.messages;
            return msge;
        }

        filterMessages(func) {
            let map = [];
            for(let msg of this.messages) {
                if(func(msg, map, this)) {
                    map.push(msg);
                }
            }
            return map;
        }
    }

    function prevent(promise) {
        return new Promise((resolve, reject) => {
            promise.then((value) => {
                resolve(value);
                return value;
            });
        });
    }

    function reject(value) {
        return new Deferred().reject(value);
    }

    function resolve(value) {
        return new Deferred().resolve(value);
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

    function succeedAfter(deferred, timeout) {
        setTimeout((t) => deferred.resolve(t), timeout);
        return deferred;
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

    function whenSettled(promise) {
        return new Promise((resolve) => {
            promise.finally(resolve);
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

    var async = /*#__PURE__*/Object.freeze({
        __repr__: __repr__,
        all: all,
        asyncCatch: asyncCatch,
        asyncThen: asyncThen,
        callLater: callLater,
        catchSilent: catchSilent,
        chain: chain,
        defer: defer,
        Deferred: Deferred,
        double: double,
        failAfter: failAfter,
        getArrayBuffer: getArrayBuffer,
        getBlob: getBlob,
        getForm: getForm,
        getJSON: getJSON,
        getText: getText,
        isAsync: isAsync,
        isPromise: isPromise,
        isThenable: isThenable,
        Message: Message,
        MessageEmitter: MessageEmitter,
        prevent: prevent,
        reject: reject,
        resolve: resolve,
        simpleXHR: simpleXHR,
        succeedAfter: succeedAfter,
        tap: tap,
        tapFinally: tapFinally,
        whenSettled: whenSettled,
        PENDING: PENDING,
        REJECTED: REJECTED,
        RESOLVED: RESOLVED,
        SETTLED: SETTLED
    });

    class NotFoundError extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'NotFoundError';
        }
    }

    class AdapterRegistry {
        constructor() {
            this.pairs = [];
        }

        /** @id MochiKit.Base.AdapterRegistry.prototype.register */
        register(name, check, wrap, override) {
            if (override) {
                this.pairs.unshift([name, check, wrap]);
            } else {
                this.pairs.push([name, check, wrap]);
            }
        }

        /** @id MochiKit.Base.AdapterRegistry.prototype.match */
        match(/* ... */) {
            for (var i = 0; i < this.pairs.length; i++) {
                var pair = this.pairs[i];
                if (pair[1].apply(this, arguments)) {
                    return pair[2].apply(this, arguments);
                }
            }
            throw new NotFoundError();
        }

        /** @id MochiKit.Base.AdapterRegistry.prototype.unregister */
        unregister(name) {
            for (var i = 0; i < this.pairs.length; i++) {
                var pair = this.pairs[i];
                if (pair[0] == name) {
                    this.pairs.splice(i, 1);
                    return true;
                }
            }
            return false;
        }
    }

    function apply(func, args) {
        switch(args.length) {
            case 0: return func.call(this);
            case 1: return func.call(this, args[0]);
            case 2: return func.call(this, args[0], args[1]);
            case 3: return func.call(this, args[0], args[1], args[2]);
            case 4: return func.call(this, args[0], args[1], args[2], args[3]);
            case 5: return func.call(this, args[0], args[1], args[2], args[3], args[4]);
            case 6: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7: return func.call(this, args[0], arga[1], args[2], args[3], args[4], args[5], args[6]);
            case 8: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
            case 9: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
            case 10: return func.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
            //Probably still optimized in es6 compliant engines,
            //This will be transpiled to .apply call with Babel, tho:
            default: return func.call(this, ...args);
        }
    }

    function bind(func, ctx, ...args) {
        return function (...nargs) {
            return func.call(ctx, ...args, ...nargs);
        }
    }

    function bindAll(object, ctx) {
        let val, keys = Object.keys(object);
        ctx = ctx === undefined ? object : ctx;

        for(let key of keys) {
            val = object[key];

            if(typeof val === 'function') {
                object[key] = val.bind();
            }
        }

        return object;
    }

    function bindRight(func, ctx, ...args) {
        return function (...nargs) {
            return func.call(ctx, ...nargs, ...args);
        }
    }

    function camelize(selector) {
        /* from dojo.style.toCamelCase */
        var arr = selector.split('-');
        var cc = arr[0];
        for (var i = 1; i < arr.length; i++) {
            cc += arr[[i][0]].toUpperCase() + arr[i].substring(1);
        }
        return cc;
    }

    function compose(functions) {
        return function (val, ...args) {
            for(let func of functions) {
                val = func.call(this, val, ...args);
            }

            return val;
        }
    }

    function counter(n/* = 1 */) {
        if (n == null) {
            n = 1;
        }
        return function () {
            return n++;
        };
    }

    function keys(obj) {
        var rval = [];
        for (var prop in obj) {
            rval.push(prop);
        }
        return rval;
    }

    function entries(object) {
        return keys(object).map((key) => [key, object[key]]);
    }

    //This is a big boy, can't find any other way :(
    let specialRe = /(\'|\"|\\|\n|\r|\t|\\b|\f|\v|\0)/g;
    function escapeSpecial(str) {
        //This is ugly af:
        return (str + '').replace(specialRe, (match) => {
            switch(match) {
                case '\0':
                return '\\0';
                case '\'':
                return '\\\'';
                case '\"':
                return '\\"';
                case '\n':
                return '\\n';
                case '\r':
                return '\\r';
                case '\t':
                return '\\t';
                case '\b':
                return '\\b';
                case '\f':
                return '\\f';
                case '\v':
                return '\\v';
                case '\0':
                return '\\0';
            }
        });
    }

    //This might be removed.
    var evalJSON = JSON.parse;

    function extend(ar1, ar2) {
        for(let item of ar2) {
            ar1[ar1.length] = item;
            ++ar1.length;
        }

        return ar1
    }

    function flattenArray(array) {
        let flattened = [];

        for(let item of array) {
            Array.isArray(item) ? flattened.push(...item) : flattened.push(item);
        }

        return flattened;
    }

    function forwardCall(func) {
        return function () {
            return this[func].apply(this, arguments);
        };
    }

    const ostr = Object.prototype.toString;

    function getType(a) {
        switch(a) {
            case null:
            case undefined:
            return `[object ${a === null ? 'Null' : 'Undefined'}]`;
            //Allow faster results for booleans:
            case true:
            case false:
            return '[object Boolean]';
            case NaN:
            case Infinity:
            return '[object Number]';
        }

        if(a === '') {
            return '[object String]';
        }

        return ostr.call(a);
    }

    function identity(a) {
        return a;
    }

    function isArrayLike(obj) {
        return obj && isFinite(obj.length);
    }

    function isBoolean(a) {
        return getType(a) === '[object Boolean]';
    }

    function isDateLike(obj) {
        return typeof obj === 'object' && typeof obj.getTime === 'function';
    }

    function isEmpty(arrayLike) {
        return isArrayLike(arrayLike) && arrayLike.length === 0;
    }

    function isNotEmpty(arrayLike) {
        return !isEmpty(arrayLike);
    }

    function isNull(...args) {
        return args.every((a) => a === null);
    }

    function isNumber(a) {
        return getType(a) === '[object Number]';
    }

    function isObject(a) {
        return a && getType(a) === '[object Object]';
    }

    function isString(a) {
        return a === '' ? true : getType(a) === '[object String]';
    }

    function isUndefined(...args) {
        return args.every((a) => a === undefined);
    }

    function isValue(obj) {
        //Why check null for typeof?
        let type = obj == null ? null : typeof obj;
        return type === 'boolean' || type === 'number' || type === 'string';
    }

    function itemgetter(func) {
        return function (arg) {
            return arg[func];
        };
    }

    function limit(func, amount) {
        --i;
        let done, cache, i = 0;

        return function (...nargs) {
            if(done) {
                return cache;
            }

            if(i++ < amount) {
                //Keep going:
                return func.call(this, ...nargs);
            } else {
                //Hit the limit:
                done = true;
                cache = func.call(this, ...nargs);
            }
        }
    }

    function mean(...args /* lst... */) {
        /* http://www.nist.gov/dads/HTML/mean.html */
        var sum = 0;
        var count = args.length;

        while (args.length) {
            var o = args.shift();
            if (o.length !== 0) {
                count += o.length - 1;
                for (var i = o.length - 1; i >= 0; i--) {
                    sum += o[i];
                }
            } else {
                sum += o;
            }
        }

        if (count === 0) {
            throw new TypeError('mean() requires at least one argument');
        }

        return sum / count;
    }

    function median(/* lst... */) {
        /* http://www.nist.gov/dads/HTML/median.html */
        if (data.length === 0) {
            throw new TypeError('median() requires at least one argument');
        }
        data.sort((a, b) => a + b);
        if (data.length % 2 == 0) {
            var upper = data.length / 2;
            return (data[upper] + data[upper - 1]) / 2;
        } else {
            return data[(data.length - 1) / 2];
        }
    }

    function nodeWalk(node, visitor) {
        var nodes = [node];
        var extend = MochiKit.Base.extend;
        while (nodes.length) {
            var res = visitor(nodes.shift());
            if (res) {
                extend(nodes, res);
            }
        }
    }

    function noop () {}

    function once(func) {
        let done = false, val;

        return function (...nargs) {
            if(done) {
                return val;
            }

            done = true;
            val = func.call(this, ...nargs);
            return val;
        }
    }

    //Curriable operator methods:
    const truth = (a) => !!a,
    lognot = (a) => !a,
    identity$1 = (a) => a,
    not = (a) => ~a,
    neg = (a) => -a,
    add = (a, b) => a + b,
    sub = (a, b) => a - b,
    div = (a, b) => a / b,
    mod = (a, b) => a % b,
    mul = (a, b) => a * b,
    and = (a, b) => a && b,
    or = (a, b) => a || b,
    xor = (a, b) => a ^ b,
    lshift = (a, b) => a << b,
    rshift = (a, b) => a >> b,
    zrshift = (a, b)=> a >>> b,
    eq = (a, b) => a == b,
    ne = (a, b) => a != b,
    gt = (a, b) => a > b,
    ge = (a, b) => a >= b,
    lt = (a, b) => a < b,
    le = (a, b) => a <= b,
    seq = (a, b) => a === b,
    sne = (a, b) => a !== b,
    // ceq,
    // cne,
    // cgt,
    // cge,
    // clt,
    // cle
    //Think the docs got these wrong:
    logand = (a, b) => a & b,
    logor = (a, b) => a | b,

    //Useful for indexOf
    ioempty = (a) => a === -1,
    iofound = (a) => a !== -1;

    function parseQueryString(encodedString, useArrays) {
        // strip a leading '?' from the encoded string
        var qstr = (encodedString.charAt(0) == "?")
            ? encodedString.substring(1)
            : encodedString;
        var pairs = qstr.replace(/\+/g, "%20").split(/\&amp\;|\&\#38\;|\&#x26;|\&/);
        var o = {};
        var decode;
        if (typeof(decodeURIComponent) != "undefined") {
            decode = decodeURIComponent;
        } else {
            decode = unescape;
        }
        if (useArrays) {
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                var name = decode(pair.shift());
                if (!name) {
                    continue;
                }
                var arr = o[name];
                if (!(arr instanceof Array)) {
                    arr = [];
                    o[name] = arr;
                }
                arr.push(decode(pair.join("=")));
            }
        } else {
            for (var i = 0; i < pairs.length; i++) {
                pair = pairs[i].split("=");
                var name = pair.shift();
                if (!name) {
                    continue;
                }
                o[decode(name)] = decode(pair.join("="));
            }
        }
        return o;
    }

    function partial(func, ...args) {
        return function (...nargs) {
            return func.call(this, ...args, ...nargs);
        }
    }

    function partialRight(func, ...args) {
        return function (...nargs) {
            return func.call(this, ...nargs, ...args);
        }
    }

    var primitives = new Map().
    set('boolean', true)
    .set('number', true)
    .set('function', true)
    .set('symbol', true);

    function provide(namespace, root) {
        let split = (namespace + '').split(/\s+/g), val;

        if(segment.length <= 1) {
            throw new Error('Invalid namespace, . char probably asbsent');
        }

        for(let segment of split) {
            if(!root) {
                val = root[segment] = {};
            }
        }

        return val;
    }

    function setdefault(src, target) {
        let keys = Object.keys(src);

        keys.forEach((key) => {
            if(!(key in target)) {
                target[key] = src[key];
            }
        });

        return target;
    }

    function times(func, amount) {
        let isFunc = typeof func === 'function',
        accum = [];
        
        for(let i = 0; i < amount; ++i) {
            accum.push(isFunc ? func(i, amount, accum) : func);
        }

        return accum;
    }

    /** @id MochiKit.Base.update */
    function update(self, obj /*, ... */) {
        if (self === null || self === undefined) {
            self = {};
        }
        for (var i = 1; i < arguments.length; i++) {
            var o = arguments[i];
            if (typeof (o) != 'undefined' && o !== null) {
                for (var k in o) {
                    self[k] = o[k];
                }
            }
        }
        return self;
    }

    function values(obj) {
        var rval = [];
        for (var prop in obj) {
            rval.push(obj[prop]);
        }
        return rval;
    }

    function warnDeprecated(method, depfrom, altfunc, message, fallbackval) {
        //Compute the msg once for heavily used methods:
        let depmsg = `The "${method}" is deprecated ${depfrom ? `from ${depfrom} onwards` : ''}. ${altfunc ? `Instead use ${altfunc}` : ''}${message ? `\n${message}` : ''}`;
        return function () {
            console.error(depmsg);
            return fallbackval;
        }
    }

    function without(array, ...values) {
        return array.filter((item) => {
            for(let value of values) {
                if(value === item) {
                    return true;
                }
            }

            return false;
        });
    }

    const __repr__$1 = '[MochiKit.Base]';

    var base = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$1,
        AdapterRegistry: AdapterRegistry,
        apply: apply,
        bind: bind,
        bindAll: bindAll,
        bindRight: bindRight,
        camelize: camelize,
        compose: compose,
        counter: counter,
        entries: entries,
        escapeSpecial: escapeSpecial,
        evalJSON: evalJSON,
        extend: extend,
        flattenArray: flattenArray,
        forwardCall: forwardCall,
        getType: getType,
        identity: identity,
        isArrayLike: isArrayLike,
        isBoolean: isBoolean,
        isDateLike: isDateLike,
        isEmpty: isEmpty,
        isNotEmpty: isNotEmpty,
        isNull: isNull,
        isNumber: isNumber,
        isObject: isObject,
        isString: isString,
        isUndefined: isUndefined,
        isValue: isValue,
        itemgetter: itemgetter,
        keys: keys,
        limit: limit,
        mean: mean,
        median: median,
        nodeWalk: nodeWalk,
        noop: noop,
        NotFoundError: NotFoundError,
        once: once,
        parseQueryString: parseQueryString,
        partial: partial,
        partialRight: partialRight,
        primitives: primitives,
        provide: provide,
        setdefault: setdefault,
        times: times,
        update: update,
        values: values,
        warnDeprecated: warnDeprecated,
        without: without,
        truth: truth,
        lognot: lognot,
        not: not,
        neg: neg,
        add: add,
        sub: sub,
        div: div,
        mod: mod,
        mul: mul,
        and: and,
        or: or,
        xor: xor,
        lshift: lshift,
        rshift: rshift,
        zrshift: zrshift,
        eq: eq,
        ne: ne,
        gt: gt,
        ge: ge,
        lt: lt,
        le: le,
        seq: seq,
        sne: sne,
        logand: logand,
        logor: logor,
        ioempty: ioempty,
        iofound: iofound
    });

    function clampColorComponent(v, scale) {
        v *= scale;
        return v < 0 ? 0 : v > scale ? scale : v;
    }

    class Color {
        constructor(red, green, blue, alpha) {
            if (alpha == null) {
                alpha = 1.0;
            }
            this.rgb = {
                r: red,
                g: green,
                b: blue,
                a: alpha
            };
        }
    }

    const third = 1.0 / 3.0,
    third2 = third * 2;
    function createFactory(r, g, b) {
        return function (a) {
            return new Color(r, g, b, a);
        };
    }

    function createLockedFactory(r, g, b, a) {
        let factory = createFactory(r, g, b);
        
        return function () {
            return factory(a);
        };
    }

    const blackColor = createFactory(0, 0, 0),
    blueColor = createFactory(0, 0, 1),
    brownColor = createFactory(0.6, 0.4, 0.2),
    cyanColor = createFactory(0, 1, 1),
    darkGrayColor = createFactory(third, third, third),
    grayColor = createFactory(0.5, 0.5, 0.5),
    greenColor = createFactory(0, 1, 0),
    lightGrayColor = createFactory(third2, third2, third2),
    magentaColor = createFactory(1, 0, 1),
    orangeColor = createFactory(1, 0.5, 0),
    purpleColor = createFactory(0.5, 0, 0.5),
    redColor = createFactory(1, 0, 0),
    transparentColor = createLockedFactory(0, 0, 0, 0),
    whiteColor = createFactory(1, 1, 1),
    yellowColor = createFactory(1, 1, 0);

    var colors = /*#__PURE__*/Object.freeze({
        blackColor: blackColor,
        blueColor: blueColor,
        brownColor: brownColor,
        cyanColor: cyanColor,
        darkGrayColor: darkGrayColor,
        grayColor: grayColor,
        greenColor: greenColor,
        lightGrayColor: lightGrayColor,
        magentaColor: magentaColor,
        orangeColor: orangeColor,
        purpleColor: purpleColor,
        redColor: redColor,
        transparentColor: transparentColor,
        whiteColor: whiteColor,
        yellowColor: yellowColor
    });

    function fromColorString(pre, method, scales, colorCode) {
        // parses either HSL or RGB
        if (colorCode.indexOf(pre) === 0) {
            colorCode = colorCode.substring(colorCode.indexOf("(", 3) + 1, colorCode.length - 1);
        }
        var colorChunks = colorCode.split(/\s*,\s*/);
        var colorFloats = [];
        for (var i = 0; i < colorChunks.length; i++) {
            var c = colorChunks[i];
            var val;
            var three = c.substring(c.length - 3);
            if (c.charAt(c.length - 1) == '%') {
                val = 0.01 * parseFloat(c.substring(0, c.length - 1));
            } else if (three == "deg") {
                val = parseFloat(c) / 360.0;
            } else if (three == "rad") {
                val = parseFloat(c) / (Math.PI * 2);
            } else {
                val = scales[i] * parseFloat(c);
            }
            colorFloats.push(val);
        }
        return this[method].apply(this, colorFloats);
    }

    function fromHexString(hexCode) {
        if (hexCode[0] == '#') {
            hexCode = hexCode.substring(1);
        }
        var components = [];
        var i, hex;
        if (hexCode.length == 3) {
            for (i = 0; i < 3; i++) {
                hex = hexCode.substr(i, 1);
                components.push(parseInt(hex + hex, 16) / 255.0);
            }
        } else {
            for (i = 0; i < 6; i += 2) {
                hex = hexCode.substr(i, 2);
                components.push(parseInt(hex, 16) / 255.0);
            }
        }

        let [r, g, b, a] = components;
        return new Color(r, g, b, a);
    }

    function hslToRGB(hue, saturation, lightness, alpha) {
        if (arguments.length == 1) {
            var hsl = hue;
            hue = hsl.h;
            saturation = hsl.s;
            lightness = hsl.l;
            alpha = hsl.a;
        }
        var red;
        var green;
        var blue;
        if (saturation === 0) {
            red = lightness;
            green = lightness;
            blue = lightness;
        } else {
            var m2;
            if (lightness <= 0.5) {
                m2 = lightness * (1.0 + saturation);
            } else {
                m2 = lightness + saturation - (lightness * saturation);
            }
            var m1 = (2.0 * lightness) - m2;
            var f = MochiKit.Color._hslValue;
            var h6 = hue * 6.0;
            red = f(m1, m2, h6 + 2);
            green = f(m1, m2, h6);
            blue = f(m1, m2, h6 - 2);
        }
        return {
            r: red,
            g: green,
            b: blue,
            a: alpha
        };
    }

    function fromRGB(red, green, blue, alpha) {
        if (arguments.length == 1) {
            var rgb = red;
            red = rgb.r;
            green = rgb.g;
            blue = rgb.b;
            if (typeof(rgb.a) == 'undefined') {
                alpha = undefined;
            } else {
                alpha = rgb.a;
            }
        }
        return new Color(red, green, blue, alpha);
    }

    function fromHSL(...args/*hue, saturation, lightness, alpha*/) {
        return fromRGB(hslToRGB(...args));
    }

    var fromHSLString = partial(fromColorString, 'hsl', 'fromHSL', [1.0/360.0, 0.01, 0.01, 1]);

    function hsvToRGB(hue, saturation, value, alpha) {
        if (arguments.length == 1) {
            var hsv = hue;
            hue = hsv.h;
            saturation = hsv.s;
            value = hsv.v;
            alpha = hsv.a;
        }
        var red;
        var green;
        var blue;
        if (saturation === 0) {
            red = value;
            green = value;
            blue = value;
        } else {
            var i = Math.floor(hue * 6);
            var f = (hue * 6) - i;
            var p = value * (1 - saturation);
            var q = value * (1 - (saturation * f));
            var t = value * (1 - (saturation * (1 - f)));
            switch (i) {
                case 1: red = q; green = value; blue = p; break;
                case 2: red = p; green = value; blue = t; break;
                case 3: red = p; green = q; blue = value; break;
                case 4: red = t; green = p; blue = value; break;
                case 5: red = value; green = p; blue = q; break;
                case 6: // fall through
                case 0: red = value; green = t; blue = p; break;
            }
        }

        return new Color(red, green, blue, alpha);
    }

    function fromHSV(...args /* hue, saturation, value, alpha */) {
        return fromRGB(hsvToRGB(...args));
    }

    function fromName(name) {
        var htmlColor = colors[name.toLowerCase()];
        if (typeof(htmlColor) == 'string') {
            return fromHexString(htmlColor);
        } else if (name == "transparent") {
            return transparentColor();
        }
        return null;
    }

    const result = 1.0/255;
    var fromRGBString = partial(fromColorString, 'rgb', 'fromrgb', [result, result, result, 1]);

    function fromString(colorString) {
        var three = colorString.substr(0, 3);
        if (three == "rgb") {
            return fromRGBString(colorString);
        } else if (three == "hsl") {
            return fromHSLString(colorString);
        } else if (colorString.charAt(0) == "#") {
            return fromHexString(colorString);
        }
        return fromName(colorString);
    }

    function hslValue(n1, n2, hue) {
        if (hue > 6.0) {
            hue -= 6.0;
        } else if (hue < 0.0) {
            hue += 6.0;
        }
        var val;
        if (hue < 1.0) {
            val = n1 + (n2 - n1) * hue;
        } else if (hue < 3.0) {
            val = n2;
        } else if (hue < 4.0) {
            val = n1 + (n2 - n1) * (4.0 - hue);
        } else {
            val = n1;
        }
        return val;
    }

    function isColor(...args) {
        return args.every((a) => a && a instanceof Color);
    }

    const aliceblue = '#f0f8ff',
        antiquewhiteHex = '#faebd7',
        aquaHex = '#00ffff',
        aquamarineHex = '#7fffd4',
        azureHex = '#f0ffff',
        beigeHex = '#f5f5dc',
        bisqueHex = '#ffe4c4',
        blackHex = '#000000',
        blanchedalmondHex = '#ffebcd',
        blueHex = '#0000ff',
        bluevioletHex = '#8a2be2',
        brownHex = '#a52a2a',
        burlywoodHex = '#deb887',
        cadetblueHex = '#5f9ea0',
        chartreuseHex = '#7fff00',
        chocolateHex = '#d2691e',
        coralHex = '#ff7f50',
        cornflowerblueHex = '#6495ed',
        cornsilkHex = '#fff8dc',
        crimsonHex = '#dc143c',
        cyanHex = '#00ffff',
        darkblueHex = '#00008b',
        darkcyanHex = '#008b8b',
        darkgoldenrodHex = '#b8860b',
        darkgrayHex = '#a9a9a9',
        darkgreenHex = '#006400',
        darkgreyHex = '#a9a9a9',
        darkkhakiHex = '#bdb76b',
        darkmagentaHex = '#8b008b',
        darkolivegreenHex = '#556b2f',
        darkorangeHex = '#ff8c00',
        darkorchidHex = '#9932cc',
        darkredHex = '#8b0000',
        darksalmonHex = '#e9967a',
        darkseagreenHex = '#8fbc8f',
        darkslateblueHex = '#483d8b',
        darkslategrayHex = '#2f4f4f',
        darkslategreyHex = '#2f4f4f',
        darkturquoiseHex = '#00ced1',
        darkvioletHex = '#9400d3',
        deeppinkHex = '#ff1493',
        deepskyblueHex = '#00bfff',
        dimgrayHex = '#696969',
        dimgreyHex = '#696969',
        dodgerblueHex = '#1e90ff',
        firebrickHex = '#b22222',
        floralwhiteHex = '#fffaf0',
        forestgreenHex = '#228b22',
        fuchsiaHex = '#ff00ff',
        gainsboroHex = '#dcdcdc',
        ghostwhiteHex = '#f8f8ff',
        goldHex = '#ffd700',
        goldenrodHex = '#daa520',
        grayHex = '#808080',
        greenHex = '#008000',
        greenyellowHex = '#adff2f',
        greyHex = '#808080',
        honeydewHex = '#f0fff0',
        hotpinkHex = '#ff69b4',
        indianredHex = '#cd5c5c',
        indigoHex = '#4b0082',
        ivoryHex = '#fffff0',
        khakiHex = '#f0e68c',
        lavenderHex = '#e6e6fa',
        lavenderblushHex = '#fff0f5',
        lawngreenHex = '#7cfc00',
        lemonchiffonHex = '#fffacd',
        lightblueHex = '#add8e6',
        lightcoralHex = '#f08080',
        lightcyanHex = '#e0ffff',
        lightgoldenrodyellowHex = '#fafad2',
        lightgrayHex = '#d3d3d3',
        lightgreenHex = '#90ee90',
        lightgreyHex = '#d3d3d3',
        lightpinkHex = '#ffb6c1',
        lightsalmonHex = '#ffa07a',
        lightseagreenHex = '#20b2aa',
        lightskyblueHex = '#87cefa',
        lightslategrayHex = '#778899',
        lightslategreyHex = '#778899',
        lightsteelblueHex = '#b0c4de',
        lightyellowHex = '#ffffe0',
        limeHex = '#00ff00',
        limegreenHex = '#32cd32',
        linenHex = '#faf0e6',
        magentaHex = '#ff00ff',
        maroonHex = '#800000',
        mediumaquamarineHex = '#66cdaa',
        mediumblueHex = '#0000cd',
        mediumorchidHex = '#ba55d3',
        mediumpurpleHex = '#9370db',
        mediumseagreenHex = '#3cb371',
        mediumslateblueHex = '#7b68ee',
        mediumspringgreenHex = '#00fa9a',
        mediumturquoiseHex = '#48d1cc',
        mediumvioletredHex = '#c71585',
        midnightblueHex = '#191970',
        mintcreamHex = '#f5fffa',
        mistyroseHex = '#ffe4e1',
        moccasinHex = '#ffe4b5',
        navajowhiteHex = '#ffdead',
        navyHex = '#000080',
        oldlaceHex = '#fdf5e6',
        oliveHex = '#808000',
        olivedrabHex = '#6b8e23',
        orangeHex = '#ffa500',
        orangeredHex = '#ff4500',
        orchidHex = '#da70d6',
        palegoldenrodHex = '#eee8aa',
        palegreenHex = '#98fb98',
        paleturquoiseHex = '#afeeee',
        palevioletredHex = '#db7093',
        papayawhipHex = '#ffefd5',
        peachpuffHex = '#ffdab9',
        peruHex = '#cd853f',
        pinkHex = '#ffc0cb',
        plumHex = '#dda0dd',
        powderblueHex = '#b0e0e6',
        purpleHex = '#800080',
        redHex = '#ff0000',
        rosybrownHex = '#bc8f8f',
        royalblueHex = '#4169e1',
        saddlebrownHex = '#8b4513',
        salmonHex = '#fa8072',
        sandybrownHex = '#f4a460',
        seagreenHex = '#2e8b57',
        seashellHex = '#fff5ee',
        siennaHex = '#a0522d',
        silverHex = '#c0c0c0',
        skyblueHex = '#87ceeb',
        slateblueHex = '#6a5acd',
        slategrayHex = '#708090',
        slategreyHex = '#708090',
        snowHex = '#fffafa',
        springgreenHex = '#00ff7f',
        steelblueHex = '#4682b4',
        tanHex = '#d2b48c',
        tealHex = '#008080',
        thistleHex = '#d8bfd8',
        tomatoHex = '#ff6347',
        turquoiseHex = '#40e0d0',
        violetHex = '#ee82ee',
        wheatHex = '#f5deb3',
        whiteHex = '#ffffff',
        whitesmokeHex = '#f5f5f5',
        yellowHex = '#ffff00',
        yellowgreenHex = '#9acd32';

    function rgbToHSL(red, green, blue, alpha) {
        if (arguments.length == 1) {
            var rgb = red;
            red = rgb.r;
            green = rgb.g;
            blue = rgb.b;
            alpha = rgb.a;
        }
        var max = Math.max(red, Math.max(green, blue));
        var min = Math.min(red, Math.min(green, blue));
        var hue;
        var saturation;
        var lightness = (max + min) / 2.0;
        var delta = max - min;
        if (delta === 0) {
            hue = 0;
            saturation = 0;
        } else {
            if (lightness <= 0.5) {
                saturation = delta / (max + min);
            } else {
                saturation = delta / (2 - max - min);
            }
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            if (hue < 0) {
                hue += 1;
            }
            if (hue > 1) {
                hue -= 1;
            }

        }
        return {
            h: hue,
            s: saturation,
            l: lightness,
            a: alpha
        };
    }

    function rgbToHSV(red, green, blue, alpha) {
            if (arguments.length == 1) {
                var rgb = red;
                red = rgb.r;
                green = rgb.g;
                blue = rgb.b;
                alpha = rgb.a;
            }
            var max = Math.max(Math.max(red, green), blue);
            var min = Math.min(Math.min(red, green), blue);
            var hue;
            var saturation;
            var value = max;
            if (min == max) {
                hue = 0;
                saturation = 0;
            } else {
                var delta = (max - min);
                saturation = delta / max;

                if (red == max) {
                    hue = (green - blue) / delta;
                } else if (green == max) {
                    hue = 2 + ((blue - red) / delta);
                } else {
                    hue = 4 + ((red - green) / delta);
                }
                hue /= 6;
                if (hue < 0) {
                    hue += 1;
                }
                if (hue > 1) {
                    hue -= 1;
                }
            }
            return {
                h: hue,
                s: saturation,
                v: value,
                a: alpha
            };
        }

    function toColorPart(num) {
        num = Math.round(num);
        var digits = num.toString(16);
        if (num < 16) {
            return '0' + digits;
        }
        return digits;
    }

    const __repr__$2 = '[MochiKit.Color]';

    var color = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$2,
        clampColorComponent: clampColorComponent,
        Color: Color,
        fromColorString: fromColorString,
        fromHexString: fromHexString,
        fromHSL: fromHSL,
        fromHSLString: fromHSLString,
        fromHSV: fromHSV,
        fromName: fromName,
        fromRGB: fromRGB,
        fromRGBString: fromRGBString,
        fromString: fromString,
        hslToRGB: hslToRGB,
        hslValue: hslValue,
        hsvToRGB: hsvToRGB,
        isColor: isColor,
        rgbToHSL: rgbToHSL,
        rgbToHSV: rgbToHSV,
        toColorPart: toColorPart,
        blackColor: blackColor,
        blueColor: blueColor,
        brownColor: brownColor,
        cyanColor: cyanColor,
        darkGrayColor: darkGrayColor,
        grayColor: grayColor,
        greenColor: greenColor,
        lightGrayColor: lightGrayColor,
        magentaColor: magentaColor,
        orangeColor: orangeColor,
        purpleColor: purpleColor,
        redColor: redColor,
        transparentColor: transparentColor,
        whiteColor: whiteColor,
        yellowColor: yellowColor,
        aliceblue: aliceblue,
        antiquewhiteHex: antiquewhiteHex,
        aquaHex: aquaHex,
        aquamarineHex: aquamarineHex,
        azureHex: azureHex,
        beigeHex: beigeHex,
        bisqueHex: bisqueHex,
        blackHex: blackHex,
        blanchedalmondHex: blanchedalmondHex,
        blueHex: blueHex,
        bluevioletHex: bluevioletHex,
        brownHex: brownHex,
        burlywoodHex: burlywoodHex,
        cadetblueHex: cadetblueHex,
        chartreuseHex: chartreuseHex,
        chocolateHex: chocolateHex,
        coralHex: coralHex,
        cornflowerblueHex: cornflowerblueHex,
        cornsilkHex: cornsilkHex,
        crimsonHex: crimsonHex,
        cyanHex: cyanHex,
        darkblueHex: darkblueHex,
        darkcyanHex: darkcyanHex,
        darkgoldenrodHex: darkgoldenrodHex,
        darkgrayHex: darkgrayHex,
        darkgreenHex: darkgreenHex,
        darkgreyHex: darkgreyHex,
        darkkhakiHex: darkkhakiHex,
        darkmagentaHex: darkmagentaHex,
        darkolivegreenHex: darkolivegreenHex,
        darkorangeHex: darkorangeHex,
        darkorchidHex: darkorchidHex,
        darkredHex: darkredHex,
        darksalmonHex: darksalmonHex,
        darkseagreenHex: darkseagreenHex,
        darkslateblueHex: darkslateblueHex,
        darkslategrayHex: darkslategrayHex,
        darkslategreyHex: darkslategreyHex,
        darkturquoiseHex: darkturquoiseHex,
        darkvioletHex: darkvioletHex,
        deeppinkHex: deeppinkHex,
        deepskyblueHex: deepskyblueHex,
        dimgrayHex: dimgrayHex,
        dimgreyHex: dimgreyHex,
        dodgerblueHex: dodgerblueHex,
        firebrickHex: firebrickHex,
        floralwhiteHex: floralwhiteHex,
        forestgreenHex: forestgreenHex,
        fuchsiaHex: fuchsiaHex,
        gainsboroHex: gainsboroHex,
        ghostwhiteHex: ghostwhiteHex,
        goldHex: goldHex,
        goldenrodHex: goldenrodHex,
        grayHex: grayHex,
        greenHex: greenHex,
        greenyellowHex: greenyellowHex,
        greyHex: greyHex,
        honeydewHex: honeydewHex,
        hotpinkHex: hotpinkHex,
        indianredHex: indianredHex,
        indigoHex: indigoHex,
        ivoryHex: ivoryHex,
        khakiHex: khakiHex,
        lavenderHex: lavenderHex,
        lavenderblushHex: lavenderblushHex,
        lawngreenHex: lawngreenHex,
        lemonchiffonHex: lemonchiffonHex,
        lightblueHex: lightblueHex,
        lightcoralHex: lightcoralHex,
        lightcyanHex: lightcyanHex,
        lightgoldenrodyellowHex: lightgoldenrodyellowHex,
        lightgrayHex: lightgrayHex,
        lightgreenHex: lightgreenHex,
        lightgreyHex: lightgreyHex,
        lightpinkHex: lightpinkHex,
        lightsalmonHex: lightsalmonHex,
        lightseagreenHex: lightseagreenHex,
        lightskyblueHex: lightskyblueHex,
        lightslategrayHex: lightslategrayHex,
        lightslategreyHex: lightslategreyHex,
        lightsteelblueHex: lightsteelblueHex,
        lightyellowHex: lightyellowHex,
        limeHex: limeHex,
        limegreenHex: limegreenHex,
        linenHex: linenHex,
        magentaHex: magentaHex,
        maroonHex: maroonHex,
        mediumaquamarineHex: mediumaquamarineHex,
        mediumblueHex: mediumblueHex,
        mediumorchidHex: mediumorchidHex,
        mediumpurpleHex: mediumpurpleHex,
        mediumseagreenHex: mediumseagreenHex,
        mediumslateblueHex: mediumslateblueHex,
        mediumspringgreenHex: mediumspringgreenHex,
        mediumturquoiseHex: mediumturquoiseHex,
        mediumvioletredHex: mediumvioletredHex,
        midnightblueHex: midnightblueHex,
        mintcreamHex: mintcreamHex,
        mistyroseHex: mistyroseHex,
        moccasinHex: moccasinHex,
        navajowhiteHex: navajowhiteHex,
        navyHex: navyHex,
        oldlaceHex: oldlaceHex,
        oliveHex: oliveHex,
        olivedrabHex: olivedrabHex,
        orangeHex: orangeHex,
        orangeredHex: orangeredHex,
        orchidHex: orchidHex,
        palegoldenrodHex: palegoldenrodHex,
        palegreenHex: palegreenHex,
        paleturquoiseHex: paleturquoiseHex,
        palevioletredHex: palevioletredHex,
        papayawhipHex: papayawhipHex,
        peachpuffHex: peachpuffHex,
        peruHex: peruHex,
        pinkHex: pinkHex,
        plumHex: plumHex,
        powderblueHex: powderblueHex,
        purpleHex: purpleHex,
        redHex: redHex,
        rosybrownHex: rosybrownHex,
        royalblueHex: royalblueHex,
        saddlebrownHex: saddlebrownHex,
        salmonHex: salmonHex,
        sandybrownHex: sandybrownHex,
        seagreenHex: seagreenHex,
        seashellHex: seashellHex,
        siennaHex: siennaHex,
        silverHex: silverHex,
        skyblueHex: skyblueHex,
        slateblueHex: slateblueHex,
        slategrayHex: slategrayHex,
        slategreyHex: slategreyHex,
        snowHex: snowHex,
        springgreenHex: springgreenHex,
        steelblueHex: steelblueHex,
        tanHex: tanHex,
        tealHex: tealHex,
        thistleHex: thistleHex,
        tomatoHex: tomatoHex,
        turquoiseHex: turquoiseHex,
        violetHex: violetHex,
        wheatHex: wheatHex,
        whiteHex: whiteHex,
        whitesmokeHex: whitesmokeHex,
        yellowHex: yellowHex,
        yellowgreenHex: yellowgreenHex
    });

    function americanDate(d) {
        d = d + "";
        if (typeof(d) !== "string" || d.length === 0) {
            return null;
        }
        var a = d.split('/');
        return new Date(a[2], a[0] - 1, a[1]);
    }

    function isoDate(str) {
        str = str + "";
        if (typeof(str) != "string" || str.length === 0) {
            return null;
        }
        var iso = str.split('-');
        if (iso.length === 0) {
            return null;
        }
        var date = new Date(parseInt(iso[0], 10), parseInt(iso[1], 10) - 1, parseInt(iso[2], 10));
        date.setFullYear(iso[0]);
        date.setMonth(iso[1] - 1);
        date.setDate(iso[2]);
        return date;
    }

    //This is a big boy...
    //TODO: trim this down
    const re = /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/;

    //can someone fix that horrible isoTimestamp function?
    //Not gonna include it until it looks clean and understandable.
    function isoTimestamp () {}
    // export default function isoTimestamp(str) {
    //     str = str + "";
    //     if (typeof(str) != "string" || str.length === 0) {
    //         return null;
    //     }
    //     var res = str.match(MochiKit.DateTime._isoRegexp);
    //     if (typeof(res) == "undefined" || res === null) {
    //         return null;
    //     }
    //     var year, month, day, hour, min, sec, msec;
    //     year = parseInt(res[1], 10);
    //     if (typeof(res[2]) == "undefined" || res[2] === '') {
    //         return new Date(year);
    //     }
    //     month = parseInt(res[2], 10) - 1;
    //     day = parseInt(res[3], 10);
    //     if (typeof(res[4]) == "undefined" || res[4] === '') {
    //         return new Date(year, month, day);
    //     }
    //     hour = parseInt(res[4], 10);
    //     min = parseInt(res[5], 10);
    //     sec = (typeof(res[6]) != "undefined" && res[6] !== '') ? parseInt(res[6], 10) : 0;
    //     if (typeof(res[7]) != "undefined" && res[7] !== '') {
    //         msec = Math.round(1000.0 * parseFloat("0." + res[7]));
    //     } else {
    //         msec = 0;
    //     }
    //     if ((typeof(res[8]) == "undefined" || res[8] === '') && (typeof(res[9]) == "undefined" || res[9] === '')) {
    //         return new Date(year, month, day, hour, min, sec, msec);
    //     }
    //     var ofs;
    //     if (typeof(res[9]) != "undefined" && res[9] !== '') {
    //         ofs = parseInt(res[10], 10) * 3600000;
    //         if (typeof(res[11]) != "undefined" && res[11] !== '') {
    //             ofs += parseInt(res[11], 10) * 60000;
    //         }
    //         if (res[9] == "-") {
    //             ofs = -ofs;
    //         }
    //     } else {
    //         ofs = 0;
    //     }
    //     return new Date(Date.UTC(year, month, day, hour, min, sec, msec) - ofs);
    // };

    function padFour(n) {
        switch(n.toString().length) {
            case 1: return "000" + n;
            case 2: return "00" + n;
            case 3: return "0" + n;
            default: return n;
        }
    }

    function padTwo(n) {
        return (n > 9) ? n : "0" + n;
    }

    function toAmericanDate(d) {
        if (typeof(d) == "undefined" || d === null) {
            return null;
        }
        return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
    }

    function toISODate(date) {
        if (typeof(date) == "undefined" || date === null) {
            return null;
        }
        return [
            padFour(date.getFullYear()),
            padTwo(date.getMonth() + 1),
            padTwo(date.getDate())
        ].join("-");
    }

    function toISOTime(date, realISO/* = false */) {
        if (date == null) {
            return null;
        }
        if (realISO) {
            // adjust date for UTC timezone
            date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        }
        var lst = [
            (realISO ? padTwo(date.getHours()) : date.getHours()),
            padTwo(date.getMinutes()),
            padTwo(date.getSeconds())
        ];
        return lst.join(":") + (realISO ? "Z" : "");
    }

    function toISOTimestamp(date, realISO/* = false*/) {
        if (date == null) {
            return null;
        }

        var time = toISOTime(date, realISO);
        var sep = realISO ? "T" : " ";
        if (realISO) {
            // adjust date for UTC timezone
            date = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
        }
        return toISODate(date) + sep + time;
    }

    function toPaddedAmericanDate(d) {
        if (d == null) {
            return null;
        }

        return [
            padTwo(d.getMonth() + 1),
            padTwo(d.getDate()),
            d.getFullYear()
        ].join('/');
    }

    const __repr__$3 = '[MochiKit.DateTime]';

    var datetime = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$3,
        americanDate: americanDate,
        isoDate: isoDate,
        isoRegExp: re,
        isoTimestamp: isoTimestamp,
        padFour: padFour,
        padTwo: padTwo,
        toAmericanDate: toAmericanDate,
        toISODate: toISODate,
        toISOTime: toISOTime,
        toISOTimestamp: toISOTimestamp,
        toPaddedAmericanDate: toPaddedAmericanDate
    });

    function ownerDocument(el) {
        if (!el) {
            return null;
        }

        let { ownerDocument, defaultView } = el;
        return ownerDocument || defaultView || el.nodeType === 9 && el || null;
    }

    function empty(node) {
        let first;
        switch(node.nodeType) {
            //Element:
            case 1:
            //fast track.
            node.innerHTML = '';
            
            default:
            //Cache the firstChild call.
            if(node.removeChild && (first = node.firstChild)) {
                while(first) {
                    node.removeChild(first);
                    //Recompute the value:
                    first = node.firstChild;
                }
            }
        }

        return node;
    }

    function clearRoot(node) {
        let doc = ownerDocument(node);
        return doc && empty(doc);
    }

    function cloneTree(node, deep) {
        //Get the tree from the node.
        let root = node.getRootNode();
        return root.cloneNode(deep);
    }

    function getBody (doc) {
        let val = ownerDocument(doc);
        return val && val.body || null;
    }

    function isNode(node) {
        return typeof node === 'object' && isNumber(node.nodeType) && !isObject(node);
    }

    function isDocument(doc) {
        return isNode(doc) && doc.nodeType === 9; 
    }

    function isEmpty$1(node) {
        return node.childNodes.length === 0;
    }

    function isFragment(doc) {
        return isNode(doc) && doc.nodeType === 11; 
    }

    var nodeTypeMap = {
        1: 'element',
        3: 'text',
        4: 'cdata_section',
        7: 'processing_instruction',
        8: 'comment',
        9: 'document',
        10: 'document_type',
        11: 'document_fragment'
    };

    function nodeType(node) {
        return nodeTypeMap[node.nodeType] || null;
    }

    let spaceRe = /\s+/;

    function off(node, event, func) {
        if(spaceRe.test(event)) {
            //Multiple events.
            for(let actualEvent of event) {
                node.removeEventListener(actualEvent, func);
            }
        } else {
            node.removeEventListener(event, func);
        }

        return node;
    }

    let spaceRe$1 = /\s+/;

    function on(node, event, func) {
        if(spaceRe$1.test(event)) {
            //Multiple events.
            for(let actualEvent of event) {
                node.addEventListener(actualEvent, func);
            }
        } else {
            node.addEventListener(event, func);
        }

        return node;
    }

    function removeMatching(selector, dom) {
        let el = dom.querySelectorAll(selector);

        //Classic iteration: some qSA impls might return a non-iterable.
        for(let parent, index = 0, len = el.length; index < len; ++index) {
            if(parent = el.parentNode) {
                parent.removeChild(el[index]);
            }
        }

        return el;
    }

    function purify(tree) {
        removeMatching('script', tree);
        removeMatching('style', tree);
        removeMatching('link', tree);
        //TODO: remove [style]
        return tree;
    }

    function removeScripts(node) {
        return removeMatching('script', node);
    }

    function rootChildren(node) {
        let val = ownerDocument(node);
        return val && val.childNodes || null;
    }

    const _counter = counter(0);

    class Visibility {
        constructor(el) {
            this.element = el;

            //Customize these:
            this.hiddenDisplay = 'hidden';
            this.visibleDisplay = 'block';
            this.hiddenVisibility = 'hidden';
            this.visibleVisibility = 'visible';

            this.modifiable = true;
            this.token = _counter();
        }

        show() {
            return this.setDisplay(this.visibleDisplay);
        }

        hide() {
            return this.setDisplay(this.hiddenDisplay);
        }

        isHiddenInAnyWay() {
            return this.isHidden() || this.isInvisible();
        }

        invisible() {
            return this.setVisibility(this.hiddenVisibility);
        }

        visible() {
            return this.setVisibility(this.visibleVisibility);
        }

        isInvisible() {
            return this.getVisibility() === this.hiddenVisibility;
        }

        isVisible() {
            return this.getVisibility() === this.visibleVisibility;
        }

        setVisibility(val) {
            if (!this.isLocked()) {
                this.element.style.visibility = val;
            }

            return this;
        }

        getVisibility() {
            return this.element.style.visibility;
        }

        isHidden() {
            return this.getDisplay() === this.hiddenDisplay;
        }

        isVisible() {
            return this.getDisplay() === this.visibleDisplay;
        }

        toggle() {
            this.isHidden() ? this.show() : this.hide();
            return this;
        }

        hideAfter(timeout) {
            return this.taskAfter('hide', timeout);
        }

        showAfter(timeout) {
            return this.taskAfter('show', timeout);
        }

        toggleAfter(timeout) {
            return this.taskAfter('toggle', timeout);
        }

        taskAfter(method, timeout) {
            let self = this;
            this.timeoutID = setTimeout(
                () => ((self.timeoutID = null), self[method]()),
                timeout
            );
            return this;
        }

        getDisplay() {
            return this.element.style.display;
        }

        setDisplay(val) {
            if (!this.isLocked()) {
                this.element.style.display = val;
            }

            return this;
        }

        cancelTimeout() {
            clearTimeout(this.timeoutID);
            return this;
        }

        timeoutActive() {
            return this.timeoutID != null;
        }

        lock() {
            this.modifiable = false;
            return this;
        }

        unlock() {
            this.modifiable = true;
            return this;
        }

        isLocked() {
            return !this.modifiable;
        }

        isModifiable() {
            return !this.isLocked();
        }

        clone() {
            let vis = new Visibility();
            vis.modifiable = this.modifiable;
            vis.timeoutID = this.timeoutID;
            vis.visibleDisplay = this.visibleDisplay;
            vis.element = this.element;
            vis.hiddenDisplay = this.hiddenDisplay;
            return vis;
        }

        fromParent() {
            return new Visibility(this.element.parentNode);
        }

        fromChildAt(index) {
            return new Visibility(this.element.childNodes[+index]);
        }

        fromFirstMatch(selector) {
            return new Visibility(this.element.querySelector(selector));
        }

        clearContent() {
            this.element.innerHTML = '';
            return this;
        }

        cloneWithEl(el) {
            let vis = this.clone();
            vis.element = el;
            return vis;
        }

        setShowStates(display, visibility) {
            this.visibleDisplay = display;
            this.visibleVisibility = visibility;
            return this;
        }

        getShowStates() {
            return [this.visibleDisplay, this.visibleVisibility];
        }

        setHiddenStates(display, visibility) {
            this.hiddenVisibility = visibility;
            this.hiddenDisplay = display;
            return this;
        }

        getHiddenStates() {
            return [this.visibleVisibility, this.hiddenVisibility];
        }
    }

    function createShortcut(tag) {
        return function(attrs, doc = document) {
            return doc.createElement(tag, attrs);
        };
    }

    const A = createShortcut('A'),
        ABBR = createShortcut('ABBR'),
        ADDRESS = createShortcut('ADDRESS'),
        AREA = createShortcut('AREA'),
        ARTICLE = createShortcut('ARTICLE'),
        ASIDE = createShortcut('ASIDE'),
        AUDIO = createShortcut('AUDIO'),
        B = createShortcut('B'),
        BASE = createShortcut('BASE'),
        BDI = createShortcut('BDI'),
        BDO = createShortcut('BDO'),
        BLOCKQUOTE = createShortcut('BLOCKQUOTE'),
        BODY = createShortcut('BODY'),
        BR = createShortcut('BR'),
        BUTTON = createShortcut('BUTTON'),
        CANVAS = createShortcut('CANVAS'),
        CAPTION = createShortcut('CAPTION'),
        CITE = createShortcut('CITE'),
        CODE = createShortcut('CODE'),
        COL = createShortcut('COL'),
        COLGROUP = createShortcut('COLGROUP'),
        DATA = createShortcut('DATA'),
        DATALIST = createShortcut('DATALIST'),
        DD = createShortcut('DD'),
        DEL = createShortcut('DEL'),
        DETAILS = createShortcut('DETAILS'),
        DFN = createShortcut('DFN'),
        DIALOG = createShortcut('DIALOG'),
        DIV = createShortcut('DIV'),
        DL = createShortcut('DL'),
        DT = createShortcut('DT'),
        EM = createShortcut('EM'),
        EMBED = createShortcut('EMBED'),
        FIELDSET = createShortcut('FIELDSET'),
        FIGCAPTION = createShortcut('FIGCAPTION'),
        FIGURE = createShortcut('FIGURE'),
        FOOTER = createShortcut('FOOTER'),
        FORM = createShortcut('FORM'),
        H1 = createShortcut('H1'),
        H2 = createShortcut('H2'),
        H3 = createShortcut('H3'),
        H4 = createShortcut('H4'),
        H5 = createShortcut('H5'),
        H6 = createShortcut('H6'),
        HEAD = createShortcut('HEAD'),
        HEADER = createShortcut('HEADER'),
        HR = createShortcut('HR'),
        HTML = createShortcut('HTML'),
        I = createShortcut('I'),
        IFRAME = createShortcut('IFRAME'),
        IMG = createShortcut('IMG'),
        INPUT = createShortcut('INPUT'),
        INS = createShortcut('INS'),
        KBD = createShortcut('KBD'),
        LABEL = createShortcut('LABEL'),
        LEGEND = createShortcut('LEGEND'),
        LI = createShortcut('LI'),
        LINK = createShortcut('LINK'),
        MAIN = createShortcut('MAIN'),
        MAP = createShortcut('MAP'),
        MARK = createShortcut('MARK'),
        META = createShortcut('META'),
        METER = createShortcut('METER'),
        NAV = createShortcut('NAV'),
        NOSCRIPT = createShortcut('NOSCRIPT'),
        OBJECT = createShortcut('OBJECT'),
        OL = createShortcut('OL'),
        OPTGROUP = createShortcut('OPTGROUP'),
        OPTION = createShortcut('OPTION'),
        OUTPUT = createShortcut('OUTPUT'),
        P = createShortcut('P'),
        PARAM = createShortcut('PARAM'),
        PICTURE = createShortcut('PICTURE'),
        PRE = createShortcut('PRE'),
        PROGRESS = createShortcut('PROGRESS'),
        Q = createShortcut('Q'),
        RP = createShortcut('RP'),
        RT = createShortcut('RT'),
        RUBY = createShortcut('RUBY'),
        S = createShortcut('S'),
        SAMP = createShortcut('SAMP'),
        SCRIPT = createShortcut('SCRIPT'),
        SECTION = createShortcut('SECTION'),
        SELECT = createShortcut('SELECT'),
        SMALL = createShortcut('SMALL'),
        SOURCE = createShortcut('SOURCE'),
        SPAN = createShortcut('SPAN'),
        STRONG = createShortcut('STRONG'),
        STYLE = createShortcut('STYLE'),
        SUB = createShortcut('SUB'),
        SUMMARY = createShortcut('SUMMARY'),
        SUP = createShortcut('SUP'),
        SVG = createShortcut('SVG'),
        TABLE = createShortcut('TABLE'),
        TBODY = createShortcut('TBODY'),
        TD = createShortcut('TD'),
        TEMPLATE = createShortcut('TEMPLATE'),
        TEXTAREA = createShortcut('TEXTAREA'),
        TFOOT = createShortcut('TFOOT'),
        TH = createShortcut('TH'),
        THEAD = createShortcut('THEAD'),
        TIME = createShortcut('TIME'),
        TITLE = createShortcut('TITLE'),
        TR = createShortcut('TR'),
        TRACK = createShortcut('TRACK'),
        U = createShortcut('U'),
        UL = createShortcut('UL'),
        VAR = createShortcut('VAR'),
        VIDEO = createShortcut('VIDEO'),
        WBR = createShortcut('WBR');

    //dom index.js

    const __repr__$4 = '[MochiKit.DOM]';

    var dom = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$4,
        clearRoot: clearRoot,
        cloneTree: cloneTree,
        empty: empty,
        getBody: getBody,
        isDocument: isDocument,
        isEmpty: isEmpty$1,
        isFragment: isFragment,
        isNode: isNode,
        nodeType: nodeType,
        nodeTypeMap: nodeTypeMap,
        off: off,
        on: on,
        ownerDocument: ownerDocument,
        purify: purify,
        removeMatching: removeMatching,
        removeScripts: removeScripts,
        rootChildren: rootChildren,
        Visibility: Visibility,
        A: A,
        ABBR: ABBR,
        ADDRESS: ADDRESS,
        AREA: AREA,
        ARTICLE: ARTICLE,
        ASIDE: ASIDE,
        AUDIO: AUDIO,
        B: B,
        BASE: BASE,
        BDI: BDI,
        BDO: BDO,
        BLOCKQUOTE: BLOCKQUOTE,
        BODY: BODY,
        BR: BR,
        BUTTON: BUTTON,
        CANVAS: CANVAS,
        CAPTION: CAPTION,
        CITE: CITE,
        CODE: CODE,
        COL: COL,
        COLGROUP: COLGROUP,
        DATA: DATA,
        DATALIST: DATALIST,
        DD: DD,
        DEL: DEL,
        DETAILS: DETAILS,
        DFN: DFN,
        DIALOG: DIALOG,
        DIV: DIV,
        DL: DL,
        DT: DT,
        EM: EM,
        EMBED: EMBED,
        FIELDSET: FIELDSET,
        FIGCAPTION: FIGCAPTION,
        FIGURE: FIGURE,
        FOOTER: FOOTER,
        FORM: FORM,
        H1: H1,
        H2: H2,
        H3: H3,
        H4: H4,
        H5: H5,
        H6: H6,
        HEAD: HEAD,
        HEADER: HEADER,
        HR: HR,
        HTML: HTML,
        I: I,
        IFRAME: IFRAME,
        IMG: IMG,
        INPUT: INPUT,
        INS: INS,
        KBD: KBD,
        LABEL: LABEL,
        LEGEND: LEGEND,
        LI: LI,
        LINK: LINK,
        MAIN: MAIN,
        MAP: MAP,
        MARK: MARK,
        META: META,
        METER: METER,
        NAV: NAV,
        NOSCRIPT: NOSCRIPT,
        OBJECT: OBJECT,
        OL: OL,
        OPTGROUP: OPTGROUP,
        OPTION: OPTION,
        OUTPUT: OUTPUT,
        P: P,
        PARAM: PARAM,
        PICTURE: PICTURE,
        PRE: PRE,
        PROGRESS: PROGRESS,
        Q: Q,
        RP: RP,
        RT: RT,
        RUBY: RUBY,
        S: S,
        SAMP: SAMP,
        SCRIPT: SCRIPT,
        SECTION: SECTION,
        SELECT: SELECT,
        SMALL: SMALL,
        SOURCE: SOURCE,
        SPAN: SPAN,
        STRONG: STRONG,
        STYLE: STYLE,
        SUB: SUB,
        SUMMARY: SUMMARY,
        SUP: SUP,
        SVG: SVG,
        TABLE: TABLE,
        TBODY: TBODY,
        TD: TD,
        TEMPLATE: TEMPLATE,
        TEXTAREA: TEXTAREA,
        TFOOT: TFOOT,
        TH: TH,
        THEAD: THEAD,
        TIME: TIME,
        TITLE: TITLE,
        TR: TR,
        TRACK: TRACK,
        U: U,
        UL: UL,
        VAR: VAR,
        VIDEO: VIDEO,
        WBR: WBR
    });

    function arity(func, amount) {
        switch (amount) {
            case 0:
                return function() {
                    return func.call(this);
                };
            case 1:
                return function($a) {
                    return func.call(this, $a);
                };
            case 2:
                return function($a, $b) {
                    return func.call(this, $a, $b);
                };
            case 3:
                return function($a, $b, $c) {
                    return func.call(this, $a, $b, $c);
                };
            case 4:
                return function($a, $b, $c, $d) {
                    return func.call(this, $a, $b, $c, $d);
                };
            case 5:
                return function($a, $b, $c, $d, $e) {
                    return func.call(this, $a, $b, $c, $d, $e);
                };
            case 6:
                return function($a, $b, $c, $d, $e, $f) {
                    return func.call(this, $a, $b, $c, $d, $e, $f);
                };
            case 7:
                return function($a, $b, $c, $d, $e, $f, $g) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g);
                };
            case 8:
                return function($a, $b, $c, $d, $e, $f, $g, $h) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h);
                };
            case 9:
                return function($a, $b, $c, $d, $e, $f, $g, $h, $i) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h, $i);
                };
            case 10:
                return function($a, $b, $c, $d, $e, $f, $g, $h, $i, $j) {
                    return func.call(this, $a, $b, $c, $d, $e, $f, $g, $h, $i, $j);
                };

            default:
                throw new Error('Out of range');
        }
    }

    function copyFunction(func) {
        return function (...args) {
            return func.call(this, ...args);
        }
    }

    function ctor (classFunc) {
        return new classFunc();
    }

    function everyArg(func) {
        return function (...args) {
            let cache, i = 0, len = args.length;

            for(; i < len; ++i) {
                if(!func.call(this, args, cache)) {
                    return false;
                }
            }

            //Prevent empty args from passing:
            return len !== 0;
        }
    }

    function flip(func) {
        return function (...args) {
            return func.call(this, ...args.reverse());
        }
    }

    function pipe(func, ...functions) {
        return function (val, ...args) {
            for(let func of functions) {
                val = func.call(this, val, ...args);
            }

            return val;
        }
    }

    function flow(functions) {
        return pipe(functions[0], ...functions.slice(1));
    }

    function invert(func) {
        return function (...args) {
            return !func.call(this, ...args);
        }
    }

    function mapCtors(...ctors) {
        return ctors.map(ctor);
    }

    function nodeCallback(func, onerror) {
        return function (err, ...data) {
            if(err) {
                onerror(err, data);
            } else {
                func(...data);
            }
        }
    }

    function passArgs(func) {
        return function (...args) {
            return func.call(this, args);
        }
    }

    function passTimes(func) {
        let times = -1; 
        return function (...args) {
            return func.call(this, times, args);
        }
    }

    function step(...functions) {
        let i = 0, cache, run = length === i, {length} = functions; 
        return function (...args) {
            if(!run || i >= length) {
                return cache;
            }

            cache = functions[i].call(this, args, cache);
            ++i;
            return cache;
        }
    }

    function stepRight(...functions) {
        return step(...functions.reverse());
    }

    function unary(func) {
        return function (val) {
            return func.call(this, val);
        }
    }

    function wrap(value, func) {
        return function (...args) {
            return func.call(this, value, ...args);
        }
    }

    const __repr__$5 = '[MochiKit.Func]';

    var func = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$5,
        arity: arity,
        copyFunction: copyFunction,
        ctor: ctor,
        everyArg: everyArg,
        flip: flip,
        flow: flow,
        invert: invert,
        mapCtor: mapCtors,
        nodeCallback: nodeCallback,
        passArgs: passArgs,
        passTimes: passTimes,
        pipe: pipe,
        step: step,
        stepRight: stepRight,
        unary: unary,
        wrap: wrap
    });

    function isIterator(object) {
        return object && typeof object.next === 'function';
    }

    function iextend(accumulator, iter) {
        let value,
        cachedValue,
        done = isIterator(iter) ? iter.done : true;

        while(!done) {
            value = (cachedValue = iter.next()) === iter ? iter.value : cachedValue;
            accumulator.push(value);
            done = iter.done;
        }

        return accumulator;
    }

    //Like .exhaust but collects results:
    function list(iter) {
        return iextend([], iter);
    }

    //The original Iter/some.
    function any(iter, predicate) {
        return list(iter).some(predicate);
    }

    function applyMap(func, items) {
        for(let item of items) {
            func.call(this, item);
        }
    }

    class ArrayIterator {
        constructor(array) {
            this.array = array;
            this.done = false;
            this.index = 0;
        }

        next() {
            if(!this.done) {
                let {array, index} = this;
                //Could be an empty array,
                //or iteration is done:
                if(index >= array.length) {
                    this.done = true;
                } else {
                    this.value = array[index];
                    ++this.index;
                }
            }

            return this;
        }

        __repr__() {
            return `ArrayIterator(index = ${this.index}, done = ${this.done}, length = ${this.array.length})`;
        }
    }

    function arrayLikeIter(arrayLike) {
        return new ArrayIterator(arrayLike);
    }

    //Not used by MochiKit, but might be used elsewhere (?).
    var StopIteration = new Error('StopIteration');

    function breakOldLoop() {
        throw StopIteration;
    }

    class CycleIterator {
        constructor(...items) {
            this.items = items;
            this.index = 0;
        }

        next() {
            let {index} = this;
            if(index >= this.items.length) {
                //Reset index.
                this.index = 0;
            }

            this.value = this.items[index];

            return this;
        }

        __repr__() {
            return `CycleIterator(index = ${this.index}, length = ${this.items.length})`;
        }
    }

    function chain$1(...items) {
        return new CycleIterator(...items);
    }

    class CountIterator {
        constructor(n = 0) {
            this.n = n;
            this.done = false;
        }
        
        next() {
            this.value = this.n;
            return this;
        }
        
        __repr__() {
            return `CountIterator(n = ${this.n}, done = ${this.done})`;
        }
    }

    function count(n /* = 0 */) {
        return new CountIterator(n);
    }

    function cycle(items) {
        return new CycleIterator(...items);
    }

    class EveryIterator {
        constructor(array, predicate) {
            this.array = array;
            this.predicate = predicate;
            this.index = 0;
        }

        next() {
            if(!this.done) {
                let {array, index, predicate} = this,
                item = array[index];
                
                this.done = predicate(item, index, array);
            }

            return this;
        }

        __repr__() {
            return `EveryIterator(...)`;
        }
    }

    function every(array, predicate) {
        return new EveryIterator(array, predicate);
    }

    function exhaust(iter) {
        let done = isIterator(iter) ? iter.done : true;

        while(!done) {
            iter.next();
            done = iter.done;
        }
    }

    function exhaustLimited(iter, limit) {
        let index = 0, done = isIterator(iter) ? iter.done : true;

        while(done && index < limit) {
            iter.next();
            ++index;
            done = iter.done;
        }

        return iter;
    }

    function forEach(iter, predicate) {
        let value, cachedValue, index = 0, done = isIterator(iter) ? iter.done : true;

        while(!done) {
            //Add support for generators that don't return the value.
            value = (cachedValue = iter.next()) === iter ? cachedValue : iter.value;
            predicate(value, index);
            done = iter.done;
            ++index;
        }

        return iter; 
    }

    class GenIterator {
        constructor(generator) {
            this.generator = generator;
            this.done = generator.done;
            this.value = generator.value;
        }

        __repr__() {
            return `GenIterator(done = ${this.done})`;
        }

        next() {
            this.generator.next();
            this.done = this.generator.done;
            this.value = this.generator.value;
            return this;
        }    
    }

    function genToIter(generator) {
        return new GenIterator(generator);
    }

    function guardIterator(itr, guard) {
        if(isIterator(itr)) {
            let oldNext = itr.next;
            //Add generator support:
            itr.next = function (...args) {
                oldNext.call(this, ...args);
                guard.call(this, ...args);
            };
        }

        //pass thru, isn't iterator
        return null;
    }

    function hasSymbolIterator(obj) {
        return obj && typeof obj[Symbol.iterator] === 'function';
    }

    function ifilter(iter, predicate) {
        let index = 0,
        filtered = [],
        array = list(iter);

        for(let item of array) {
            if(predicate(item, index, array) == true) {
                filtered.push(item);
            }

            ++index;
        }

        return arrayLikeIter(filtered);
    }

    function ifilter$1(iter, predicate) {
        let index = 0,
        filtered = [],
        array = list(iter);

        for(let item of array) {
            if(predicate(item, index, array) === false) {
                filtered.push(item);
            }

            ++index;
        }

        return arrayLikeIter(filtered);
    }

    class PipedIterator {
        constructor(iter, pipeFunction) {
            this.pipeFunction = pipeFunction;
            this.iter = iter;
            this.done = iter.done;

            //Try to use the iter's __repr__ if possible.
            if (typeof iter.__repr__ === 'function') {
                this.__repr__ = function() {
                    return this.iter.__repr__();
                };
            }
        }

        next() {
            if (!this.done) {
                this.value = this.pipeFunction(this.iter.next(), this.iter, this);
                this.done = this.iter.done;
            }
            return this;
        }

        __repr__() {
            return `PipedIterator(...)`;
        }
    }

    function pipeNext(iter, pipeFunction) {
        return new PipedIterator(iter, pipeFunction);
    }

    function pipe$1(func) {
        return function iterOperator(iter) {
            return pipeNext(iter, func);
        };
    }

    const iadd = pipe$1(add),
    iand = pipe$1(and),
    idiv = pipe$1(div),
    ieq = pipe$1(eq),
    ige = pipe$1(ge),
    igt = pipe$1(gt),
    //TODO: maybe change? this looks a bit weird
    iidentity = pipe$1(identity$1),
    iioempty = pipe$1(ioempty),
    iiofound = pipe$1(iofound),
    ile = pipe$1(le),
    ilogand = pipe$1(logand),
    ilognot = pipe$1(lognot),
    ilogor = pipe$1(logor),
    ilshift = pipe$1(lshift),
    ilt = pipe$1(lt),
    imod = pipe$1(mod),
    imul = pipe$1(mul),
    ine = pipe$1(ne),
    ineg = pipe$1(neg),
    inot = pipe$1(not),
    ior = pipe$1(or),
    irshift = pipe$1(rshift),
    iseq = pipe$1(seq),
    isne = pipe$1(sne),
    isub = pipe$1(sub),
    itruth = pipe$1(truth),
    ixor = pipe$1(xor),
    izrshift = pipe$1(zrshift);

    function islice(iter, start, stop) {
        return list(iter).slice(start, stop);
    }

    function getRepr(object) {
        let repr = object && object.__repr__;
        return repr && typeof repr === 'function' && repr.call(object);
    }

    function iter(iterable, /* optional */ sentinel) {
        if (arguments.length >= 2) {
            return self.takewhile(
                function (a) { return a != sentinel; },
                iterable
            );
        }
        if (typeof(iterable.next) == 'function') {
            return iterable;
        } else if (typeof(iterable.iter) == 'function') {
            return iterable.iter();
        }

        //TODO: make AdapterRegistry not throw on error.
        try {
            return iter.registry.match(iterable);
        } catch(err) {
            if(err instanceof NotFoundError) {
                throw new TypeError(`${getRepr(iterable)} is not iterable (not found in registry).`);
            }

            throw err;
        }
    }

    iter.registry = new AdapterRegistry();

    function itimes(iter, amount) {
        return pipeNext(iter, (value) => value * amount);
    }

    class KeyIterator extends ArrayIterator {
        constructor(object) {
            super(Object.keys(object));
        } 

        __repr__() {
            return `KeyIterator(size = ${this.array.length}, done = ${this.done}, index = ${this.index})`;
        }
    }

    function keyIterator(object) {
        return new KeyIterator(object);
    }

    class RangeIterator {
        constructor(start, end) {
            this.start = start;
            this.end = end;
            this.done = false;
            this.index = start;
        }

        next() {
            if(!this.done) {
                //Check if we hit the end index.
                if(this.index >= this.end) {
                    this.done = true;
                } else {
                    this.value = ++this.index;
                }
            }

            return this;
        }

        __repr__() {
            return `RangeIterator(start = ${this.start}, end = ${this.end}, done = ${this.done})`;
        }
    }

    function range(start, end) {
        return new RangeIterator(start, end);
    }

    function reduceArrayLike(array, predicate, accumulator) {

        if(accumulator === undefined) {
            accumulator = array[0];
        }

        for(let item of array) {
            accumulator = predicate(accumulator, item);
        }

        return accumulator;
    }

    function reduceIter(iter) {
        return reduceArrayLike(list(iter));
    }

    class RepeatIterator {
        constructor(value) {
            this.value = value;
            this.done = false;
        }

        next() {
            //No-op, value is already set.
            return this;
        }

        __repr__() {
            return `RepeatIterator(done = ${this.done})`;
        }
    }

    function repeat(value) {
        return new RepeatIterator(value);
    }

    function reversed(iter) {
        return list(iter).reverse();
    }

    class SomeIterator {
        constructor(array, predicate) {
            this.index = 0;
            this.array = array;
            this.done = false;
            this.predicate = predicate;
        }

        next() {
            if(!this.done) {
                if(this.index >= this.array.length) {
                    //Done.
                    this.done = true;
                } else {
                    let {array, index, predicate} = this,
                    item = array[index];

                    this.value = predicate(item, index, array, this);
                }
            }

            return this;
        }

        __repr__() {
            return `SomeIterator(done = ${this.done}, index = ${this.index})`;
        }
    }

    function some(array, predicate) {
        return new SomeIterator(array, predicate);
    }

    function sortedArrayLike(arrayLike, sortMethod) {
        //TODO: make sort function
        return Array.from(arrayLike).sort(sortMethod);
    }

    function sortedArrayLikeIter(arrayLike, comparator) {
        return new ArrayIterator(sortedArrayLike(arrayLike, comparator));
    }

    function sorted(iter, comparator) {
        return list(iter).sort(comparator);
    }

    function sumArrayLike(arrayLike) {
        let sum;

        for(let num of arrayLike) {
            if(sum !== sum) {
                //isNaN(sum). Break;
                return sum;
            }

            sum += num;
        }

        return sum;
    }

    function sumArrayLikeClamped(arr, min, max) {
        let result = sumArrayLike(arr);
        //TODO: make Base.clamp
        return result > max ? max : result < min ? min : result;
    }

    function sumIter(iter) {
        return sumArrayLike(list(iter));
    }

    function sumIterClamped(iter) {
        return sumArrayLikeClamped(list(iter));
    }

    class ValueIterator extends ArrayIterator {
        constructor(object) {
            //TODO: make Base.values function
            super(Object.keys(object).map((a) => object[a]));
        }

        __repr__() {
            return `ValueIterator(size = ${this.array.length}, done = ${this.done}, index = ${this.index})`;
        }
    }

    function valueIterator(object) {
        return new ValueIterator(object);
    }

    const __repr__$6 = '[MochiKit.Iter]';

    var iter$1 = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$6,
        any: any,
        applyMap: applyMap,
        ArrayIterator: ArrayIterator,
        arrayLikeIter: arrayLikeIter,
        breakOldLoop: breakOldLoop,
        chain: chain$1,
        count: count,
        CountIterator: CountIterator,
        cycle: cycle,
        CycleIterator: CycleIterator,
        every: every,
        EveryIterator: EveryIterator,
        exhaust: exhaust,
        exhaustLimited: exhaustLimited,
        forEach: forEach,
        GenIterator: GenIterator,
        genToIterator: genToIter,
        guardIterator: guardIterator,
        hasSymbolIterator: hasSymbolIterator,
        iextend: iextend,
        ifilter: ifilter,
        ifilterfalse: ifilter$1,
        isIterable: hasSymbolIterator,
        isIterator: isIterator,
        islice: islice,
        iter: iter,
        itimes: itimes,
        KeyIterator: KeyIterator,
        keyIterator: keyIterator,
        list: list,
        PipedIterator: PipedIterator,
        pipeNext: pipeNext,
        range: range,
        RangeIterator: RangeIterator,
        reduceArrayLike: reduceArrayLike,
        reduceIter: reduceIter,
        repeat: repeat,
        RepeatIterator: RepeatIterator,
        reversed: reversed,
        some: some,
        SomeIterator: SomeIterator,
        sortedArrayLike: sortedArrayLike,
        sortedArrayLikeIter: sortedArrayLikeIter,
        sortedIter: sorted,
        StopIteration: StopIteration,
        sumArrayLike: sumArrayLike,
        sumArrayLikeClamped: sumArrayLikeClamped,
        sumIter: sumIter,
        sumIterClamped: sumIterClamped,
        ValueIterator: ValueIterator,
        valueIterator: valueIterator,
        iadd: iadd,
        iand: iand,
        idiv: idiv,
        ieq: ieq,
        ige: ige,
        igt: igt,
        iidentity: iidentity,
        iioempty: iioempty,
        iiofound: iiofound,
        ile: ile,
        ilogand: ilogand,
        ilognot: ilognot,
        ilogor: ilogor,
        ilshift: ilshift,
        ilt: ilt,
        imod: imod,
        imul: imul,
        ine: ine,
        ineg: ineg,
        inot: inot,
        ior: ior,
        irshift: irshift,
        iseq: iseq,
        isne: isne,
        isub: isub,
        itruth: itruth,
        ixor: ixor,
        izrshift: izrshift
    });

    //Typescript rocks...
    function isStream(object) {
        return (
            object &&
            typeof object.write === 'function' &&
            typeof object.end === 'function' &&
            typeof object.on === 'function' &&
            typeof object.off === 'function'
        );
    }

    const OFF = 0,
        ERROR = 10,
        WARN = 20,
        INFO = 30,
        DEBUG = 40,
        TRACE = 50;

    var Level = /*#__PURE__*/Object.freeze({
        OFF: OFF,
        ERROR: ERROR,
        WARN: WARN,
        INFO: INFO,
        DEBUG: DEBUG,
        TRACE: TRACE
    });

    class HandlerList {
        constructor() {
            this.handlers = [];
        }

        addHandler(func) {
            if(typeof func !== 'function') {
                throw new Error('Not a function.');
            }

            this.handlers.push(func);
            return this;
        }

        fire(data) {
            this.handlers.forEach((a) => a(data));
        }

        isEmpty() {
            return this.handlers.length === 0;
        }

        isNotEmpty() {
            return !this.isEmpty();
        }

        clear() {
            this.handlers = [];
            return this;
        }
    }

    //This is just a barebones version of log.ts,

    class Logger {
        constructor(stream) {
            if(!isStream(stream)) {
                throw new Error('Expected a WritableStream');
            }

            this.stream = stream;
            this.messages = 0;
            this.level = OFF;
            this.handlers = new HandlerList();
        }

        addHandler(func) {
            this.handlers.addHandler(func);
            return this;
        }

        fireHandlers(func) {
            this.handlers.fire();
        }

        isHandlersEmpty() {
            return this.handlers.isEmpty();
        }

        isHandlersNotEmpty() {
            return !this.isHandlersEmpty();
        }

        clearHandlers() {
            this.handlers.clear();
            return this;
        }

        isLevelAvailable(level) {
            return this.level !== OFF && ~~level <= this.level;
        }

        isErrorAvailable() {
            return this.isLevelAvailable(ERROR);
        }

        isWarnAvailable() {
            return this.isLevelAvailable(WARN);
        }

        isInfoAvailable() {
            return this.isLevelAvailable(INFO);
        }

        isDebugAvailable() {
            return this.isLevelAvailable(DEBUG);
        }

        isTraceAvailable() {
            return this.isLevelAvailable(TRACE);
        }

        isOff() {
            return this.level === OFF;
        }

        isOn() {
            return !this.isOff();
        }

        log(level, data) {
            if(this.isLevelAvailable(level)) {
                this.stream.write(data);
                this.addMessage();
            }
            
            return this;
        }

        addMessage() {
            ++this.messages;
        }

        error(data) {
            return this.log(ERROR, data);
        }

        warn(data) {
            return this.log(WARN, data);
        }

        info(data) {
            return this.log(INFO, data);
        }

        debug(data) {
            return this.log(DEBUG, data);
        }

        trace(data) {
            return this.log(TRACE, data);
        }

        logError(data) {
            return this.log(ERROR, `ERROR: ${data}`); 
        }

        logWarn(data) {
            return this.log(WARN, `WARN: ${data}`);
        }

        logInfo(data) {
            return this.log(INFO, `INFO: ${data}`);
        }

        logTrace(data) {
            return this.log(TRACE, `TRACE: ${data}`);
        }

        logDebug(data) {
            return this.log(DEBUG, `DEBUG: ${data}`);
        }

        clone() {
            let lgr = new Logger(this.stream);
            lgr.level = this.level;
            return lgr;
        }

        __repr__() {
            return `Logger(${this.level}, ${this.messages})`;
        }

        reset() {
            this.level = OFF;
            this.messages = 0;
            return this;
        }

        equals(lgr) {
            return this.matchingLevel(lgr) && this.matchingMessages(lgr);
        }

        matchingLevel(lgr) {
            return lgr.level === this.level; 
        }

        matchingMessages(lgr) {
            return lgr.messages === this.messages;
        }
    }

    class LogMessage {
        constructor(level, data, logger) {
            this.level = level;
            this.data = data;
            this.logger = logger;
            this.timestamp = Date.now();
        }
    }

    function isLogMessage(...args) {
        return args.every((a) => a instanceof LogMessage);
    }

    function printMessage(msg) {
        console.log(`LEVEL: ${msg.level}\nHAS_LOGGER: ${!!msg.logger}\nDATA:\n${msg.data}`); 
    }

    const __repr__$7 = '[MochiKit.Logger]';
    let currentLogger = new Logger({
        write(data) {
            console.log(data);
        },

        on() {},
        off() {},
        end() {}
    }),
    logError = logMethod(ERROR),
    logWarn = logMethod(WARN),
    logInfo = logMethod(INFO),
    logDebug = logMethod(DEBUG),
    logTrace = logMethod(TRACE);


    function logMethod(level) {
        return function(data) {
            return consoleLogger.log(level, data);
        };
    }

    function setCurrentLogger(stream) {
        currentLogger.stream = stream;
    }

    function getCurrentLogger(stream) {
        return currentLogger;
    }

    var logging = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$7,
        logMethod: logMethod,
        logError: logError,
        logWarn: logWarn,
        logInfo: logInfo,
        logDebug: logDebug,
        logTrace: logTrace,
        Level: Level,
        Logger: Logger,
        setCurrentLogger: setCurrentLogger,
        getCurrentLogger: getCurrentLogger,
        isLogMessage: isLogMessage,
        isStream: isStream,
        LogMessage: LogMessage,
        printMessage: printMessage
    });

    function hasRepr(object) {
        let repr = object && object.__repr__;
        return repr && typeof repr === 'function';
    }

    function registerRepr(obj, val) {
        if(obj) {
            //val + '' = toString call
            return obj.__repr__ = val + '';
        }

        return null;
    }

    function reprArray(array) {
        if(!Array.isArray(array)) {
            throw new Error('Expected an array.');
        }

        return `array(${array.length}) [${array.join(', ')}]`;
    }

    function reprArrayLike(arrayLike) {
        if(!arrayLike || !isFinite(arrayLike.length)) {
            throw new Error('Expected a function');
        }

        return `array-like(${array.length}) [${array.join(', ')}]`;
    }

    function reprFunction(func) {
        if(typeof func !== 'function') {
            throw new Error('Expected a function');
        }

        //Don't allow bogus __repr__ methods pass thru.
        return `function "${func.name}"(${func.length}) ${typeof func.__repr__ === 'function' ? func.__repr__() : `function ${func.name} \{...\}`}`;
    }

    function reprGeneric(object) {
        let len = object && typeof object === 'number',
        type = getType(object).slice(8, -1);

        return object ? `${type}${len ? `(${object.length})` : '(void)'} generic-type(${typeof object})` : '(void)(void) generic-type(void)';
    }

    function reprKeys(object) {
        let keys = Object.keys(object);
        return `keys(${keys.length}) { ${keys.join(', ')} }`;
    }

    /**
     * 
     * @param {!Map} map 
     */
    function reprMap(map) {
        let items = '', val;

        for(let key of map.keys()) {
            val = map.get(key);
            items += `${key} => ${val} `;
        }
        return `Map(${map.size}) { ${items.replace(/\s$/, '')} }`;
    }

    /**
     * 
     * @param {!Set} set 
     */
    function reprSet(set) {
        return `Set(${set.size}) [ ${Array.from(set.values())} ]`;
    }

    function reprType(object) {
        let len, hasLen;
        return `${typeof object}${(hasLen = typeof (len = object.length) === 'number') ? `(${len})` : '(void)'}`;
    }

    function stringRepr () {
        return function () {
            return getRepr(this.toString());
        }
    }

    const __repr__$8 = '[MochiKit.Repr]';

    var repr = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$8,
        getRepr: getRepr,
        hasRepr: hasRepr,
        registerRepr: registerRepr,
        reprArray: reprArray,
        reprArrayLike: reprArrayLike,
        reprFunction: reprFunction,
        reprGeneric: reprGeneric,
        reprKeys: reprKeys,
        reprMap: reprMap,
        reprSet: reprSet,
        reprType: reprType,
        stringRepr: stringRepr
    });

    //Must be precise with Rollup. It doesn't understand /(index.js) shorthand afaik.

    //Collect the variables in MochiKit.
    let MochiKit$1 = { 
        async, 
        base, 
        color, 
        datetime,
        dom, 
        func, 
        iter: iter$1, 
        logging, 
        repr 
    };
    MochiKit$1.version = {
        /*major:x, minor:x, patch:x*/
    };

    //Full build meaning all packages have been imported:
    MochiKit$1.name = '[MochiKit full-build]';

    //Alias

    return MochiKit$1;

}());
