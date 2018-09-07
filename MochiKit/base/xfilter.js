export default function xfilter(fn, ...args) {
    return args.filter(fn);
}