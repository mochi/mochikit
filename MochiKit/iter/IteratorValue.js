export default class IteratorValue {
    constructor(done, value, iterator) {
        this.done = done;
        this.value = value;
        this.src = iterator;
    }

    __repr__() {
        return `IteratorValue(done = ${this.done})`;
    }
}