import ArrayIterator from "./ArrayIterator"; 

export default class ValueIterator extends ArrayIterator {
    constructor(object) {
        //TODO: make this lazy
        super(Object.keys(object).map((a) => object[a]));
    }

    __repr__() {
        return `ValueIterator(size = ${this.array.length}, done = ${this.done}, index = ${this.index})`;
    }
}