import arrayToList from "./arrayToList";

export default function arrayToSet(array) {
    return arrayToList(array, Set);
}