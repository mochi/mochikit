export default function flip(func) {
    return function (...args) {
        return func.call(this, ...args.reverse());
    }
}