import list from "./list";

export default function islice(iter, start, stop) {
    return list(iter).slice(start, stop);
}