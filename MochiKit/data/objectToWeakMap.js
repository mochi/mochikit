import objectToKeyed from "./objectToKeyed";

export default function objectToWeakMap(object) {
    return objectToKeyed(object, WeakMap);
}