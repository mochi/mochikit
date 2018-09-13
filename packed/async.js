this.mochikit=this.mochikit||{},this.mochikit.async=function(t){"use strict";function n(t,n){return function(...e){return t.call(this,...e).catch(n)}}function e(t,n){return function(...e){return t.call(this,...e).then(n)}}function i(t,n){if("function"!=typeof t)throw new Error("Evaluating strings and bogus functions are not supported.");setTimeout(t,n)}function r(t){t.catch(()=>{})}function s(t,n){t.then(e=>{let i=e;for(let r of n)i=r(i,t,e,n);return i})}function o(t){setTimeout(t,0)}function u(t,n,e,i){t.then(r=>n(r,t)?e(r,t):i(r,t))}function c(t,n){return new Promise((t,e)=>setTimeout(e,n))}function f(t,n){fetch(t,n).then(t=>t.arrayBuffer())}function h(t,n){fetch(t,n).then(t=>t.blob())}function a(t,n){fetch(t,n).then(t=>t.formData())}function l(t,n){fetch(t,n).then(t=>t.json())}function d(t,n){fetch(t,n).then(t=>t.text())}function m(t){return"[object Promise]"===Object.prototype.toString.call(t)}function g(t){return"object"==typeof t&&"function"==typeof t.then}function p(t){return m(t)||g(t)}function y(t){return new Promise((n,e)=>{t.then(t=>{n(t);return t})})}function v(t,n,{async:async=!0,user:user,password:password},{done:done,error:error,progress:progress,orsc:orsc}){let e=new XMLHttpRequest;return e.open(t,n,async,user,password),done&&e.addEventListener("load",done),error&&e.addEventListener("error",error),progress&&e.addEventListener("progress",progress),orsc&&e.addEventListener("readystatechange",orsc),e.send(),e}function w(t){return new Promise((n,e)=>setTimeout(n,t))}function M(t,n){return t.then(e=>{n(e,t);return e})}function b(t,n){return t.finally(e=>{n(e,t);return e})}function E(t){return new Promise(n=>{t.finally(n)})}class P{constructor(t,n){this.time=Date.now(),this.event=t,this.emitter=n}}class T{constructor(){this.messages=[],this.handlers=[],this.collecting=!0,this.onerror=null}on(t,n){return this.handlers.push([t,n]),this}off(t,n){return this.handlers=this.handlers.filter(([e,i])=>i!==n&&e!==t),this}has(t){for(let[n]of this.handlers)if(n===t)return!0;return!1}emitWithGuard(t,n){for(let[e,i]of this.handlers)if(t===e)try{i(this.createMessage(t))}catch(e){n(e),this.onerror&&this.onerror(e,t,i)}return this}emit(t){return this.emitWithGuard(t,t=>{throw t})}createMessage(t){let n=new P(t,this);return this.addMessage(n),this}addMessage(t){return this.collecting&&this.messages.push(t),this}hasHandler(t){for(let[,n]of this.handlers)if(n===t)return!0;return!1}whenEmitted(t){let n=this;return new Promise((e,i)=>{n.on(t,e)})}whenFailed(t){let n=this;return new Promise((e,i)=>{let r=!1;n.emitWithGuard(t,t=>{r=!0,i(t)})})}emitDisposing(t,n){return n?this.emitWithGuard(t,n):this.emit(t),this.dispose(t),this}dispose(t){let n=this.handlers;return this.handlers.forEach(([e],i)=>{e===t&&n.splice(i,1)}),this}removeMessages(t){return this.messages=this.messages.filter(({event:event})=>event!==t),this}anyMessages(){return 0!==this.messages.length}clearMessages(){return this.messages=[],this}isCollecting(){return this.collecting}clearHandlers(){return this.handlers=[],this}anyHandlers(){return 0!==this.handlers.length}pop(){return this.handlers.pop(),this}concat(...t){return this.handlers.concat(...t),this}conjoin(t){let n;for(let e of Object.keys(t))n=t[e],this.on(e,n);return this}conjoinMap(t){let n;for(let e of t.keys())n=t.get(e),this.on(e,n);return this}onArray(t,n){for(let e of n)this.on(t,e);return this}keys(){return this.mapIndex(0)}values(){return this.mapIndex(1)}pairs(){return this.handlers}mapIndex(t){return t=+t,this.handlers.map(n=>n[t])}once(t,n){let e=this;return this.on(t,i=>{e.off(t,n);n(i)})}toObject(){let t={};for(let[n,e]of this.handlers)t[n]=e;return t}emitAfter(t,n){let e=this;return setTimeout(()=>{e.emit(t)},n),this}emitTimes(t,n){for(let e=0;e<n;++e)this.emit(t);return this}emitUntil(t,n,e){for(let i=0;i<e&&n(t,i,e);++i)this.emit(t);return this}messagesAt(t){return this.filterMessages(n=>n.time===t)}messagesBefore(t){return this.filterMessages(n=>n.time<t)}messagesAfter(t){return this.filterMessages(n=>n.time>t)}messagesFor(t){return this.filterMessages(n=>n.event===t)}messagesNotFor(t){return this.filterMessages(n=>n.event!==t)}messagesMatching(t){return this.filterMessages(n=>t.event===n.event&&t.time===n.time)}messagesNotMatching(t){return this.filterMessages(n=>t.event!==n.event&&n.time!==t.time)}messagesMap(){let t,n=new Map;for(let e of this.messages)(t=n.get(e.event))?t.add(e):(n.set(e.event,new WeakSet),n.get(e.event).add(e));return n}pipe(t){for(let[n,e]of this.handlers)t.on(n,e);return t.messages=this.messages,t}filterMessages(t){let n=[];for(let e of this.messages)t(e,n,this)&&n.push(e);return n}}return t.__repr__="[MochiKit.Async]",t.asyncCatch=n,t.asyncThen=e,t.callLater=i,t.catchSilent=r,t.chain=s,t.defer=o,t.double=u,t.failAfter=c,t.getArrayBuffer=f,t.getBlob=h,t.getForm=a,t.getJSON=l,t.getText=d,t.isAsync=p,t.isPromise=m,t.isThenable=g,t.Message=P,t.MessageEmitter=T,t.prevent=y,t.simpleXHR=v,t.succeedAfter=w,t.tap=M,t.tapFinally=b,t.whenSettled=E,t}({});
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
        return new Promise((resolve, a) => setTimeout(resolve, timeout));
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
    exports.Message = Message;
    exports.MessageEmitter = MessageEmitter;
    exports.prevent = prevent;
    exports.simpleXHR = simpleXHR;
    exports.succeedAfter = succeedAfter;
    exports.tap = tap;
    exports.tapFinally = tapFinally;
    exports.whenSettled = whenSettled;

    return exports;

}({}));
