import isIterator from "./isIterator";
import list from "./list";
import arrayLikeIter from "./arrayLikeIter";

export default function ifilter(iter, predicate) {
    let index = 0,
    filtered = [],
    array = list(iter);

    for(let item of array) {
        if(predicate(item, array)) {
            filtered.push(item);
        }

        ++index;
    }

    return arrayLikeIter(filtered);
}