const { asyncCatch, asyncThen, callLater, catchSilent } = require("../MochiKit/async");

describe('async', () => {
    describe('#asyncCatch', () => {
        it('should catch a throwing async function', (done) => {
            async function throwErr() {
                throw 1;
            };

            asyncCatch(throwErr)().catch(done);
        });

        it('should catch a function that returns a promise', (done) => {
            function throwErr() {
                return Promise.reject(2);
            }

            asyncCatch(throwErr)().catch(done);
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
            catchSilent(new Promise(() => { throw 1; }));
        });
    });
});