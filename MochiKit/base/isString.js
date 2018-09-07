import getType from "./getType";

export default function isString(a) {
    return a === '' ? true : getType(a) === '[object String]';
}