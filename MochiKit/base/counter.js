export default function counter(n/* = 1 */) {
    if (n == null) {
        n = 1;
    }
    return function () {
        return n++;
    };
};