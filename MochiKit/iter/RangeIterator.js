import IteratorValue from "./IteratorValue";

export default class RangeIterator {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.iterDone = false;
        this.index = start;
    }

    next() {
        if(!this.iterDone) {
            //Check if we hit the end index.
            if(this.index >= this.end) {
                return new IteratorValue(true);
            } else {
                return new IteratorValue(false, ++this.index);
            }
        }

        return this;
    }

    __repr__() {
        return `RangeIterator(start = ${this.start}, end = ${this.end}, done = ${this.done})`;
    }
}