/*Bundled with Rollup at "Thu Aug 30 2018 22:00:56 GMT+0100 (British Summer Time)".*/
var mochikit = (function () {
    'use strict';

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
        whenSettled: whenSettled,
        PENDING: PENDING,
        REJECTED: REJECTED,
        RESOLVED: RESOLVED,
        SETTLED: SETTLED
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

    function isObject(a) {
        return getType(a) === '[object Object]';
    }

    function isNumber(a) {
        return getType(a) === '[object Number]';
    }

    function isNode(node) {
        return typeof node === 'object' && isNumber(node.nodeType) && !isObject(node);
    }

    function isDocument(doc) {
        return isNode(doc) && doc.nodeType === 9; 
    }

    function isEmpty(node) {
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

    function counter(n/* = 1 */) {
        if (n == null) {
            n = 1;
        }
        return function () {
            return n++;
        };
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

    const __repr__$1 = '[MochiKit.DOM]';

    var dom = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$1,
        clearRoot: clearRoot,
        cloneTree: cloneTree,
        empty: empty,
        getBody: getBody,
        isDocument: isDocument,
        isEmpty: isEmpty,
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

    function getRepr(object) {
        let repr = object && object.__repr__;
        return repr && typeof repr === 'function' && repr.call(object);
    }

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



    var repr = /*#__PURE__*/Object.freeze({
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
                throw MochiKit.Base.NotFound;
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

    function forwardCall(func) {
        return function () {
            return this[func].apply(this, arguments);
        };
    }

    function identity(a) {
        return a;
    }

    function isArrayLike(obj) {
        return obj && isFinite
    }

    function isBoolean(a) {
        return getType(a) === '[object Boolean]';
    }

    function isDateLike(obj) {
        return typeof obj === 'object' && typeof obj.getTime === 'function';
    }

    function isEmpty$1(arrayLike) {
        return isArrayLike(arrayLike) && arrayLike.length === 0;
    }

    function isNotEmpty(arrayLike) {
        return !isEmpty$1(arrayLike);
    }

    function isNull(...args) {
        return args.every((a) => a === null);
    }

    function isString(a) {
        return getType(a) === '[object String]';
    }

    function isUndefined(...args) {
        return args.every((a) => a === undefined);
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

        var m = MochiKit.Base;
        var count = args.length;

        while (args.length) {
            var o = args.shift();
            if (o && typeof o == 'object' && typeof o.length == 'number') {
                count += o.length - 1;
                for (var i = o.length - 1; i >= 0; i--) {
                    sum += o[i];
                }
            } else {
                sum += o;
            }
        }

        if (count <= 0) {
            throw new TypeError('mean() requires at least one argument');
        }

        return sum / count;
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

    const __repr__$2 = '[MochiKit.Base]';

    var base = /*#__PURE__*/Object.freeze({
        __repr__: __repr__$2,
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
        forwardCall: forwardCall,
        identity: identity,
        isArrayLike: isArrayLike,
        isBoolean: isBoolean,
        isDateLike: isDateLike,
        isEmpty: isEmpty$1,
        isNotEmpty: isNotEmpty,
        isNull: isNull,
        isNumber: isNumber,
        isObject: isObject,
        isString: isString,
        isUndefined: isUndefined,
        itemgetter: itemgetter,
        keys: keys,
        limit: limit,
        mean: mean,
        nodeWalk: nodeWalk,
        noop: noop,
        once: once,
        parseQueryString: parseQueryString,
        partial: partial,
        partialRight: partialRight,
        provide: provide,
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

    /***

    MochiKit.MochiKit 1.5

    See <http://mochikit.com/> for documentation, downloads, license, etc.

    (c) 2005 Bob Ippolito.  All rights Reserved.

    ***/

    //Collect the variables in MochiKit.
    let MochiKit$1 = { async, dom, repr, base };
    MochiKit$1.version = {
        /*major:x, minor:x, patch:x*/
    };

    //Full build meaning all packages have been imported:
    MochiKit$1.name = '[MochiKit full-build]';

    if (typeof console.log === 'function') {
        let {
            version: { major, minor, patch }
        } = MochiKit$1;
        console.log(`MochiKit version ${major}.${minor}.${patch} loaded!`);
    }

    //Alias

    return MochiKit$1;

}());
