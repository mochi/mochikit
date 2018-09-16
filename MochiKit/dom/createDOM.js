export default function createDOM(tag, attrs = {}, dom = document, ...children) {
    let el = document.createElement(tag, attrs);

    for(let child of children) {
        el.appendChild(child);
    }

    return el;
}