export default function isNull(...args) {
    return args.every((a) => a === null);
}