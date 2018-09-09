import Deferred from './Deferred';
import succeedAfter from './succeedAfter';
import failAfter from './failAfter';


export default class DeferredList {
    constructor() {
        /** @type {!Deferred[]} */
        this.promises = [];
    }

    add(...promises) {
        for(let promise of promises) {
            if(!(promise instanceof Deferred)) {
                throw new TypeError('Expected a Deferred.');
            }

            this.promises.push(promise);
        }

        return this;
    }

    fire(callback) {
        for(let promise of this.promises) {
            promise.fire(callback);
        }

        return this;
    }

    succeedAfter(timeout) {
        for(let promise of this.promises) {
            succeedAfter(promise, timeout);
        }

        return this;
    }

    failAfter(timeout) {
        for(let promise of this.promises) {
            failAfter(promise, timeout);
        }
    }

    allRejected() {
        return this.promises.every((promise) => promise.isRejected());
    }

    allResolved() {
        return this.promises.every((promise) => promise.isResolved());
    }

    allSettled() {
        return this.promises.every((promise) => promise.isSettled());
    }

    succeedAfterWith(timeout, value) {
        for(let promise of this.promises) {
            setTimeout(() => promise.resolve(value), timeout); //jshint ignore:line
        }

        return this;
    }

    failAfterWith(timeout, value) {
        for(let promise of this.promises) {
            setTimeout(() => promise.reject(value), timeout); //jshint ignore:line
        }

        return this;
    }

    [Symbol.iterator]() {
        return this.promises[Symbol.iterator]();
    }

    flip() {
        for(let promise of this.promises) {
            promise.flip();
        }

        return this;
    }

    first() {
        return this.promises[0] || null; 
    }

    last() {
        return this.promises[this.size() - 1] || null;
    }

    isEmpty() {
        return this.size() !== 0;
    }

    isNotEmpty() {
        return !this.isEmpty();
    }

    __repr__() {
        return `DeferredList(${this.size()})`;
    }

    size() {
        return this.promises.length;
    }
}