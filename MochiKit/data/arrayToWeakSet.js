import arrayToList from "./arrayToList";

export default function arrayToWeakSet(array) {
    return arrayToList(array, WeakSet);
}