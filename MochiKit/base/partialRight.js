export default function partialRight(func, ...args) {
    return function (...nargs) {
        return func.call(this, ...nargs, ...args);
    }
}