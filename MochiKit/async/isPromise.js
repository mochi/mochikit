export default function isPromise(promise) {
    return Object.prototype.toString.call(promise) === '[object Promise]';
}