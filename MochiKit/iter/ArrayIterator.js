export default class ArrayIterator {
    constructor(array) {
        this.array = array;
        this.done = false;
        this.index = 0;
    }

    next() {
        if(!this.done) {
            let {array, index} = this;
            //Could be an empty array,
            //or iteration is done:
            if(index >= array.length) {
                this.done = true;
            } else {
                this.value = array[index];
                ++this.index;
            }
        }

        return this;
    }

    __repr__() {
        return `ArrayIterator(index = ${this.index}, done = ${this.done}, length = ${this.array.length})`;
    }
}