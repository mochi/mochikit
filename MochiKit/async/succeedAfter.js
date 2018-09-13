export default function succeedAfter(timeout) {
    return new Promise((resolve, a) => setTimeout(resolve, timeout));
}