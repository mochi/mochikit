import ArrayIterator from "./ArrayIterator";
import sortedArrayLike from "./sortedArrayLike";

export default function sortedArrayLikeIter(arrayLike, comparator) {
    return new ArrayIterator(sortedArrayLike(arrayLike, comparator));
}