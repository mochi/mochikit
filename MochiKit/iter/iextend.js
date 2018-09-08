import isIterator from "./isIterator";

export default function iextend(accumulator, iter) {
    let value,
    cachedValue,
    done = isIterator(iter) ? iter.done : true;

    while(!done) {
        value = (cachedValue = iter.next()) === iter ? iter.value : cachedValue;
        accumulator.push(value);
        done = iter.done;
    }

    return accumulator;
}