export default class PipedIterator {
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
