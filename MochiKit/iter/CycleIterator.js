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

        this.value = this.items[index];

        return this;
    }

    __repr__() {
        return `CycleIterator(index = ${this.index}, length = ${this.items.length})`;
    }
}