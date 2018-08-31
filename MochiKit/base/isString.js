import getType from "./getType";

export default function isString(a) {
    return getType(a) === '[object String]';
}