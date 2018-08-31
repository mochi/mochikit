export default function invert(func) {
    return function (...args) {
        return !func.call(this, ...args);
    }
}