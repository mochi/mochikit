export default function failAfter(deferred, timeout) {
    setTimeout((t) => deferred.reject(t), timeout);
    return deferred;
}