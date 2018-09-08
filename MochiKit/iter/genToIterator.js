import GenIterator from "./GenIterator";

export default function genToIter(generator) {
    return new GenIterator(generator);
}