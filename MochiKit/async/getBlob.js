import fetch from "./fetch";

export default function getBlob(url, options) {
    fetch(url, options).then((r) => r.blob());
}