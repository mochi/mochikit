import getType from "./getType";

export default function isObject(a) {
    return a && getType(a) === '[object Object]';
}