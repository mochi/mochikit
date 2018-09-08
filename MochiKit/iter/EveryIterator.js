export default class EveryIterator {
    constructor(array, predicate) {
        this.array = array;
        this.predicate = predicate;
        this.index = 0;
    }

    next() {
        if(!this.done) {
            let {array, index, predicate} = this,
            item = array[index];
            
            this.done = predicate(item, index, array);
        }

        return this;
    }

    __repr__() {
        return `EveryIterator(...)`;
    }
}