export default function createE(tag, attributes, html, document) {
    html = html == null ? '' : html;
    attributes = attributes == null ? html : attributes;
    let el = document.createElement(tag, attributes);
    el.innerHTML = html;
    return el;
}