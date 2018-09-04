export default function getText(url, options) {
    fetch(url, options).then((r) => r.text());
}