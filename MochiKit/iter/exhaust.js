import isIterator from "./isIterator";

export default function exhaust(iter) {
    let done = isIterator(iter) ? iter.done : true;

    while(!done) {
        iter.next();
        done = iter.done;
    }
}