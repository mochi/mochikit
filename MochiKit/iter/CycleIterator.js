import IteratorValue from "./IteratorValue";

export default class CycleIterator {
    constructor(...items) {
        this.items = items;
        this.index = 0;
    }

    next() {
        let {index} = this;
        if(index >= this.items.length) {
            //Reset index.
            this.index = 0;
        }
        
        let val = new IteratorValue(false, index);
        ++this.index;
        return val;
    }

    __repr__() {
        return `CycleIterator(index = ${this.index}, length = ${this.items.length})`;
    }
}