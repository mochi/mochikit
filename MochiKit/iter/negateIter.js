import PipedIterator from "./PipedIterator";

export default function negateIter(iter) {
    return new PipedIterator(iter, (value) => -value);
}