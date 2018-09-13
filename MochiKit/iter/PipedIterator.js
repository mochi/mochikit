export default class PipedIterator {
    constructor(iter, pipe) {
        this.pipe = pipe;
        this.iter = iter;
    }

    next() {
        return this.pipe(this.iter.next());
    }

    __repr__() {
        return `PipedIterator(...)`;
    }
}