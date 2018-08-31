export default function itemgetter(func) {
    return function (arg) {
        return arg[func];
    };
}