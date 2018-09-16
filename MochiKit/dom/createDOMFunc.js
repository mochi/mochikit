import createDOM from "./createDOM";

export default function createDOMFunc(...args) {
    return function (...nargs) {
        return createDOM(...args, ...nargs);
    }
}