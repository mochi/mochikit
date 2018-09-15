export default function failAfter(timeout) {
    return new Promise((a, reject) => setTimeout(reject, timeout));
}