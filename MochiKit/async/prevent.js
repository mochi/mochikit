export default function prevent(promise) {
    return new Promise((resolve, reject) => {
        promise.then((value) => {
            resolve(value);
            return value;
        });
    });
}