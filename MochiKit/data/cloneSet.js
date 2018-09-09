import transformList from "./transformList";

export default function cloneSet(set) {
    return transformList(set, Set);
}