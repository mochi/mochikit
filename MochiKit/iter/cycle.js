import CycleIterator from "./CycleIterator";

export default function cycle(items) {
    return new CycleIterator(...items);
}