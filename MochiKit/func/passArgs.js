export default function passArgs(func) {
    return function (...args) {
        return func.call(this, args);
    }
}