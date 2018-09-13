import IteratorValue from "./IteratorValue";

export default class CountIterator {
    constructor(n = 0) {
        this.n = n;
    }
    
    next() {
        return new IteratorValue(false, ++this.n);
    }
    
    __repr__() {
        return `CountIterator(n = ${this.n}, done = ${this.done})`;
    }
}