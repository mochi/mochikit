import fetch from "./fetch";

export default function getArrayBuffer(url, options) {
    fetch(url, options).then((r) => r.arrayBuffer());
}