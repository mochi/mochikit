export default function isArrayLike(obj) {
    return obj && isFinite(obj.length);
}