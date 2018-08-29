import getType from "./getType";

export default function isBoolean(a) {
    return getType(a) === '[object Boolean]';
}