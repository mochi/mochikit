export default function copyFunction(func) {
    return function (...args) {
        return func.call(this, ...args);
    }
}