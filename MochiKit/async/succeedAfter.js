export default function succeedAfter(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}