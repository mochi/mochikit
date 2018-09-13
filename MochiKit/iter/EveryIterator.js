import IteratorValue from "./IteratorValue";

export default class EveryIterator {
    constructor(array, predicate) {
        this.array = array;
        this.predicate = predicate;
        this.index = 0;
        this.returnedFalse = false;
    }

    next() {
        if(!this.returnedFalse) {
            let {array, index, predicate} = this,
            item = array[index];
            
            let val = this.returnedFalse = !predicate(item, index, array);
            return new IteratorValue(false, val);
        }

        return new IteratorValue(true);
    }

    __repr__() {
        return `EveryIterator(index = ${this.index})`;
    }
}