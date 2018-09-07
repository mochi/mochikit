export default function succeedAfter(deferred, timeout) {
    setTimeout((t) => deferred.resolve(t), timeout);
    return deferred;
}