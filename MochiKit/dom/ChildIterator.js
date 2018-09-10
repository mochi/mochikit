import ArrayIterator from "../iter/ArrayIterator";

export default class ChildIterator extends ArrayIterator {
    constructor(el) {
        super(el.children);
    }

    __repr__() {
        return `ChildIterator(...)`;
    }
}