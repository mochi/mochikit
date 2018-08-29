(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.mochikit = factory());
}(this, (function () { 'use strict';

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

    function getArrayBuffer(url) {
        fetch(url).then((r) => r.arrayBuffer());
    }

    function getBlob(url) {
        fetch(url).then((r) => r.blob());
    }

    function getForm(url) {
        fetch(url).then((r) => r.formData());
    }

    function getJSON(url) {
        fetch(url).then((r) => r.json());
    }

    function getText(url) {
        fetch(url).then((r) => r.text());
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
        whenSettled: whenSettled
    });

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

    var dom = /*#__PURE__*/Object.freeze({
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



    var repr = /*#__PURE__*/Object.freeze({
        reprArray: reprArray,
        reprArrayLike: reprArrayLike,
        reprFunction: reprFunction,
        reprKeys: reprKeys,
        reprMap: reprMap,
        reprSet: reprSet,
        reprType: reprType
    });

    /***

    MochiKit.MochiKit 1.5

    See <http://mochikit.com/> for documentation, downloads, license, etc.

    (c) 2005 Bob Ippolito.  All rights Reserved.

    ***/

    //Collect the variables in MochiKit.
    let MochiKit = { async, dom, repr };
    MochiKit.version = {
        /*major:x, minor:x, patch:x*/
    };

    //Full build meaning all packages have been imported:
    MochiKit.name = '[MochiKit full-build]';

    if (typeof console.log === 'function') {
        let {
            version: { major, minor, patch }
        } = MochiKit;
        console.log(`MochiKit version ${major}.${minor}.${patch} loaded!`);
    }

    //Alias

    return MochiKit;

})));
