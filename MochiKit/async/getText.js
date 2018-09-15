import fetch from "./fetch";

export default function getText(url, options) {
    fetch(url, options).then((r) => r.text());
}