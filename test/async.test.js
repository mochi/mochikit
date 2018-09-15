import {
    asyncCatch,
    asyncThen,
    callLater,
    catchSilent,
    chain,
    defer,
    double,
    failAfter,
    getArrayBuffer,
    getBlob,
    getForm,
    getJSON,
    getText,
    isAsync,
    isPromise,
    isThenable,
    prevent,
    succeedAfter,
    simpleXHR,
    tap,
    tapFinally,
} from '../MochiKit/async/';
import { assert } from 'chai';
import fetch from '../MochiKit/async/fetch';
import FakePromise from './FakePromise';

//Monkey-patch Promise#finally, as it seems 
//to not be supported in Node.
Promise.prototype.finally = (callback) => {
    let cb, called = false;

    this.then(cb = (value) => {
        !called && callback(value);
    }, cb);
};

describe('async', () => {
    //Test globals:
    let stubPromise = Promise.resolve(2),
        noop = () => {},
        fakePromise = new FakePromise(),
        rstubPromise = Promise.reject(2);

    describe('#asyncCatch', () => {
        it('should catch a function that returns a promise', (done) => {
            function throwErr() {
                return Promise.reject(2);
            }

            asyncCatch(throwErr, () => done())();
        });
    });

    describe('#asyncThen', () => {
        it('should call .then on an async function', (done) => {
            async function noop() {}

            asyncThen(noop)().then(done);
        });

        it('should call .then on a function that returns a promise', (done) => {
            function noop() {
                return Promise.resolve(null);
            }

            asyncThen(noop)().then(done);
        });
    });

    describe('#callLater', () => {
        it('should defer a function', (done) => {
            callLater(done, 0);
        });
    });

    describe('#catchSilent', () => {
        it('should silently catch a promise', () => {
            catchSilent(
                new Promise(() => {
                    throw 1;
                })
            );
        });
    });

    describe('#chain', () => {
        it('should apply the function x times', () => {
            let promise = Promise.resolve(2),
                mapFn = (a) => a * 2,
                //length = 4
                //(n) => ((((n * 2) * 2) * 2) * 2)
                //n = 2, ends at 32
                array = [, , , ,].fill(mapFn);

            chain(promise, array);
            promise.then((value) => value == 32 && done());
        });
    });

    describe('#defer', () => {
        it('should defer the passed function', (done) => {
            defer(done);
        });
    });

    describe('#double', () => {
        it('should call "no" on false value', (done) => {
            double(
                stubPromise,
                () => false,
                () => {
                    throw 1;
                },
                () => done()
            );
        });

        it('should call "yes" on true value', (done) => {
            double(
                stubPromise,
                () => true,
                () => done(),
                () => {
                    throw 1;
                }
            );
        });

        //todo: start using chai assert.throws
        it('should not accept bad promises', (done) => {
            assert.throws(() => double([]), TypeError);
            done();
        });
    });

    describe('#failAfter', () => {
        it('should fail after x ms', () => {
            let now = Date.now();
            failAfter(100).catch((time) => time === now + 100 && done());
        });
    });

    describe('#fetch', () => {
        it('should throw when in node', () => {
            assert.throws(fetch, Error);
        });
    });

    describe('#getArrayBuffer', () => {
        it('should throw an error', () => {
            assert.throws(getArrayBuffer, Error);
        });
    });

    describe('#getBlob', () => {
        it('should throw an error', () => {
            assert.throws(getBlob, Error);
        });
    });


    describe('#getForm', () => {
        it('should throw an error', () => {
            assert.throws(getForm, Error);
        });
    });

    describe('#getJSON', () => {
        it('should throw an error', () => {
            assert.throws(getJSON, Error);
        });
    });

    describe('#getText', () => {
        it('should throw an error', () => {
            assert.throws(getText, Error);
        });
    });

    describe('#isAsync', () => {
        it('should pass thenables', () => {
            assert.equal(isAsync(fakePromise), true);
        });

        it('should not pass non-thenables', () => {
            assert.equal(isAsync({}), false);
        });

        it('should pass promises', () => {
            assert.equal(isAsync(stubPromise), true);
        });

        it('should not throw when passed null', () => {
            //Should check before checking .then
            assert.doesNotThrow(() => isAsync());
        });
    });

    describe('#isPromise', () => {
        it('should not pass other thenables', () => {
            assert.equal(isPromise(fakePromise), false);
        });

        it('should pass promises', () => {
            assert.equal(isPromise(stubPromise), true);
        });

        it('should not throw when passed null', () => {
            assert.doesNotThrow(() => isPromise());
        });
    });

    describe('#isThenable', () => {
        it('should pass a promise', () => {
            assert.equal(isThenable(stubPromise), true);
        });

        it('should not pass non-thenables', () => {
            assert.equal(isThenable({}), false); 
        });

        it('should pass a thenable', () => {
            assert.equal(isThenable(fakePromise), true);
        });

        it('should not throw when passed null', () => {
            assert.doesNotThrow(() => isThenable());
        });
    });

    describe('#prevent', () => {
        it('should resolve when promise arg is resolved', (done) => {
            prevent(Promise.resolve(2)).then(() => done());    
        });

        it('should resolve when promise arg is rejected', (done) => {
            prevent(Promise.reject(2).catch(noop)).then(() => done());
        });

        it('should reject promise on invalid promise arg', (done) => {
            prevent(null).catch(() => done());
        });

        it('should accept any thenable', () => {
            assert.doesNotThrow(() => prevent(fakePromise));
        });
        
        it('should resolve with the promise arg value', (done) => {
            let value = 2;
            //stub might be tainted by now with .then calls.
            prevent(Promise.resolve(2)).then((pvalue) => value === pvalue && done());
        });

        it('should not resolve until promise arg is resolved', (done) => {
            prevent(succeedAfter(10)).then(() => done());
        });

        it('should do nothing on unsettled promise', (done) => {
            let reject = () => done('Promise was settled undesirably.');
            prevent(new Promise(noop)).then(reject).catch(reject);
            done();
        });
    });

    describe('#simpleXHR', () => {
        it('should throw in node', () => {
            assert.throws(simpleXHR, TypeError);
        });
    });

    describe('#succeedAfter', () => {
        it('should resolve after x ms', (done) => {
            let now = Date.now();
            succeedAfter(10).then((ms) => ms === (now + 10) && done());
        });
    });

    describe('#tap', () => {
        let currStub = stubPromise = Promise.resolve(2);
        
        it('should attach the callback to promise.then', (done) => {
            tap(currStub, () => done());
        });
        
        it('should restore the promise value', (done) => {
            tap(currStub, noop);
            tap(currStub, (value) => value === 2 && done());
        });
    });

    describe('#tapFinally', () => {
        let currStub;

        it('should call handler on rejected promise', (done) => {
            currStub = Promise.reject(2).catch(noop);
            tapFinally(currStub, () => done());    
        });

        it('should call handler on resolved promise', (done) => {
            currStub = Promise.resolve(2);
            tapFinally(currStub, () => done());
        });

        it('should do nothing on unsettled promise', (done) => {
            currStub = new Promise(noop);
            tapFinally(currStub, () => done('Did not expect to be called.'));
        });
    });
});
