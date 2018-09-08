export default class GenIterator {
    constructor(generator) {
        this.generator = generator;
        this.done = generator.done;
        this.value = generator.value;
    }

    __repr__() {
        return `GenIterator(done = ${this.done})`;
    }

    next() {
        this.generator.next();
        this.done = this.generator.done;
        this.value = this.generator.value;
        return this;
    }    
}