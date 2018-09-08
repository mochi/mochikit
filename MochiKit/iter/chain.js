import CycleIterator from "./CycleIterator";

export default function chain(...items) {
    return new CycleIterator(...items);
}