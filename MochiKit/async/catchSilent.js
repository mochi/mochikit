export default function catchSilent(promise) {
    promise.catch(() => {});
}