export default function getForm(url) {
    fetch(url).then((r) => r.formData());
}