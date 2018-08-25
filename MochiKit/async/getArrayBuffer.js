export default function getArrayBuffer(url) {
    fetch(url).then((r) => r.arrayBuffer());
}