export default function getJSON(url) {
    fetch(url).then((r) => r.json());
}