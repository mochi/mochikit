import isIterator from "./isIterator";

export default function exhaustLimited(iter, limit) {
    let index = 0, done = isIterator(iter) ? iter.done : true;

    while(done && index < limit) {
        iter.next();
        ++index;
        done = iter.done;
    }

    return iter;
}