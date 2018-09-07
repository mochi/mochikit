export default function bindRight(func, ctx, ...args) {
    return function (...nargs) {
        return func.call(ctx, ...nargs, ...args);
    }
}