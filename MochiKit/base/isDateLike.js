export default function isDateLike(obj) {
    return typeof obj === 'object' && typeof obj.getTime === 'function';
}