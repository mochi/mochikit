import IteratorValue from "./IteratorValue";

export default class ArrayIterator {
    constructor(array) {
        this.array = array;
        this.index = 0;
    }

    next() {
        if(this.index < this.array.length) {
            ++this.index;
            return new IteratorValue(false, this.array[this.index]);
        } else {
            return new IteratorValue(true);
        }
    }

    __repr__() {
        return `ArrayIterator(index = ${this.index}, done = ${this.done}, length = ${this.array.length})`;
    }
}