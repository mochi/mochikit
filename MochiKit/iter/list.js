import isIterable from "./isIterable";

//Like .exhaust but collects results:
export default function list(iter) {
    let accumulator = [],
    value,
    cachedValue,
    done = isIterable(iter) ? iter.done : true;

    while(!done) {
        value = (cachedValue = iter.next()) === iter ? iter.value : cachedValue;
        accumulator.push(value);
        done = iter.done;
    }

    return accumulator;
}