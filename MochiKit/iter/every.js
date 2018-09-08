import EveryIterator from "./EveryIterator";

export default function every(array, predicate) {
    return new EveryIterator(array, predicate);
}