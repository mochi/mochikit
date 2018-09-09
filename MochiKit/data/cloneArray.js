import extendWithArray from "./extendWithArray";

export default function cloneArray(array) {
    return extendWithArray(array, []);
}