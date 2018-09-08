import ArrayIterator from "./ArrayIterator";

export default function sortedArrayLikeIter(arrayLike, sortMethod) {
    //TODO: make sort function
    return new ArrayIterator(Array.from(arrayLike).sort(sortMethod));
}