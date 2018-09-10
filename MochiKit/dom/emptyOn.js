import on from "./on";

export default function emptyOn(element, event) {
    on(element, event, () => element.innerHTML = '');
    return element;
}