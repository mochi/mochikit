export default function forwardCall(func) {
    return function () {
        return this[func].apply(this, arguments);
    };
}