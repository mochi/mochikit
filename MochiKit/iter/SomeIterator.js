export default class SomeIterator {
    constructor(array, predicate) {
        this.index = 0;
        this.array = array;
        this.done = false;
        this.predicate = predicate;
    }

    next() {
        if(!this.done) {
            if(this.index >= this.array.length) {
                //Done.
                this.done = true;
            } else {
                let {array, index, predicate} = this,
                item = array[index];

                this.value = predicate(item, index, array, this);
            }
        }

        return this;
    }

    __repr__() {
        return `SomeIterator(done = ${this.done}, index = ${this.index})`;
    }
}