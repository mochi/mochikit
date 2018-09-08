import CountIterator from "./CountIterator";

export default function count(n /* = 0 */) {
    return new CountIterator(n);
}