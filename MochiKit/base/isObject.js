import getType from "./getType";

export default function isObject(a) {
    return getType(a) === '[object Object]';
}