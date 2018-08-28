export default function isUndefined(...args) {
    return args.every((a) => a === undefined);
}