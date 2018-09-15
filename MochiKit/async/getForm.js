import fetch from "./fetch";


export default function getForm(url, options) {
    fetch(url, options).then((r) => r.formData());
}