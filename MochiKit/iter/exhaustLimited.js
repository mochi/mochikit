import isIterable from "./isIterable";

export default function exhaustLimited(iter, limit) {
    let index = 0, done = isIterable(iter) ? iter.done : true;

    while(done && index < limit) {
        iter.next();
        ++index;
        done = iter.done;
    }

    return iter;
}