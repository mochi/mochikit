import transformList from "./transformList";

export default function setToWeakSet(set) {
    return transformList(set, WeakSet);
}