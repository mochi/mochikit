export default function isIterable(object) {
    return object && typeof object.next === 'function';
}