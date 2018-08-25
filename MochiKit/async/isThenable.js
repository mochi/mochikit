export default function isThenable(promise) {
    return typeof promise === 'object' && typeof promise.then === 'function';
}