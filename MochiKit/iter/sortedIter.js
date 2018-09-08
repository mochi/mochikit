import list from "./list";

export default function sorted(iter, comparator) {
    return list(iter).sort(comparator);
}