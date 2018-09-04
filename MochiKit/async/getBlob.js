export default function getBlob(url, options) {
    fetch(url, options).then((r) => r.blob());
}