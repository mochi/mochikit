export default function bind(func, ctx, ...args) {
    return function (...nargs) {
        return func.call(ctx, ...args, ...nargs);
    }
}