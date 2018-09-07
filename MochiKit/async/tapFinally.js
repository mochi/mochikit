export default function tapFinally(promise, func) {
    return promise.finally((value) => {
        func(value, promise);
        return value;
    });
}