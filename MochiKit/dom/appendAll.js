import forEach from "../iter/forEach";
import appendE from "./appendEl";

export default function appendAllE(el, children) {
    forEach(children, (child) => appendE(el, child));
    return el;
}