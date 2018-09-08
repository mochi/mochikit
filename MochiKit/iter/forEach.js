import isIterator from './isIterator';

export default function forEach(iter, predicate) {
    let value, cachedValue, index = 0, done = isIterator(iter) ? iter.done : true;

    while(!done) {
        //Add support for generators that don't return the value.
        value = (cachedValue = iter.next()) === iter ? cachedValue : iter.value;
        predicate(value, index);
        done = iter.done;
        ++index;
    }

    return iter; 
}