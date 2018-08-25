export default function getText(url) {
    fetch(url).then((r) => r.text());
}