export default function partial(func, ...args) {
    return function (...nargs) {
        return func.call(this, ...args, ...nargs);
    }
}