export default function wrap(value, func) {
    return function (...args) {
        return func.call(this, value, ...args);
    }
}