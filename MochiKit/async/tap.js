export default function tap(promise, func) {
    return promise.then((value) => {
        func(value, promise);
        return value;
    });
}