import empty from './empty';
import forEach from "../iter/forEach";
import appendE from "./appendEl";

export default function setChildrenE(el, children) {
    empty(el);
    forEach(children, (child) => appendE(e, child));
    return el;
}