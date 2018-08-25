export default function getBlob(url) {
    fetch(url).then((r) => r.blob());
}