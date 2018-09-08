export default class RangeIterator {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.done = false;
        this.index = start;
    }

    next() {
        if(!this.done) {
            //Check if we hit the end index.
            if(this.index >= this.end) {
                this.done = true;
            } else {
                this.value = ++this.index;
            }
        }

        return this;
    }

    __repr__() {
        return `RangeIterator(start = ${this.start}, end = ${this.end}, done = ${this.done})`;
    }
}