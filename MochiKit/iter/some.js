import SomeIterator from "./SomeIterator";

export default function some(array, predicate) {
    return new SomeIterator(array, predicate);
}