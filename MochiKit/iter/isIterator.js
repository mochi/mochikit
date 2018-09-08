export default function isIterator(object) {
    return object && typeof object.next === 'function';
}