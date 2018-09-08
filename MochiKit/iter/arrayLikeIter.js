import ArrayIterator from "./ArrayIterator";

export default function arrayLikeIter(arrayLike) {
    return new ArrayIterator(arrayLike);
}