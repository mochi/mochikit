import fetch from "./fetch";

export default function getJSON(url, options) {
    fetch(url, options).then((r) => r.json());
}