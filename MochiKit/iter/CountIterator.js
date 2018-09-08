export default class CountIterator {
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