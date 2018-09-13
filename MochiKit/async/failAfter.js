export default function failAfter(deferred, timeout) {
    return new Promise((a, reject) => setTimeout(reject, timeout));
}