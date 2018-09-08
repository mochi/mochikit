import isIterable from "./isIterable";

export default function exhaust(iter) {
    let done = isIterable(iter) ? iter.done : true;

    while(!done) {
        iter.next();
        done = iter.done;
    }
}