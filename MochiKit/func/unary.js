export default function unary(func) {
    return function (val) {
        return func.call(this, val);
    }
}