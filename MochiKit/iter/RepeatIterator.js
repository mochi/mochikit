import IteratorValue from "./IteratorValue";

export default class RepeatIterator {
    constructor(value) {
        this.iterValue = value;
        this.iterDone = false;
    }

    next() {
        //No-op, value is already set.
        return new IteratorValue(this.iterDone, this.iterValue);
    }

    __repr__() {
        return `RepeatIterator(done = ${this.done})`;
    }
}