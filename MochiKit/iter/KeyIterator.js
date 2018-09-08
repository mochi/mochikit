import ArrayIterator from "./ArrayIterator";

export default class KeyIterator extends ArrayIterator {
    constructor(object) {
        super(Object.keys(object));
    } 

    __repr__() {
        return `KeyIterator(size = ${this.array.length}, done = ${this.done}, index = ${this.index})`;
    }
}