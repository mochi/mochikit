export default function isHidden(element) {
    return element.style.display !== 'none' &&
    element.style.opacity != 0 &&
    element.style.visibility !== 'hidden'; 
}