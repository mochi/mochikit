import isIterable from './isIterable';

export default function forEach(iter, predicate) {
    let value, cachedValue, index = 0, done = isIterable(iter) ? iter.done : true;

    while(!done) {
        //Add support for older iterators that return the value.
        value = (cachedValue = iter.next()) === iter ? cachedValue : iter.value;
        predicate(value, index);
        done = iter.done;
        ++index;
    }

    return iter; 
}