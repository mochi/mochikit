import RangeIterator from "./RangeIterator";

export default function range(start, end) {
    return new RangeIterator(start, end);
}