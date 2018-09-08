import list from "./list";

//The original Iter/some.
export default function any(iter, predicate) {
    return list(iter).some(predicate);
}