import ArrayIterator from "./ArrayIterator";

export default function sortedArrayLike(arrayLike, sortMethod) {
    //TODO: make sort function
    return Array.from(arrayLike).sort(sortMethod);
}