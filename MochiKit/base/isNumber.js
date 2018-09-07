import getType from "./getType";

export default function isNumber(a) {
    return getType(a) === '[object Number]';
}