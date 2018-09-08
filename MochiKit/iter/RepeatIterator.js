import Iterator from "./Iterator";

export default class RepeatIterator {
    constructor(value) {
        this.value = value;
        this.done = false;
    }

    next() {
        //No-op, value is already set.
        return this;
    }

    __repr__() {
        return `RepeatIterator(done = ${this.done})`;
    }
}