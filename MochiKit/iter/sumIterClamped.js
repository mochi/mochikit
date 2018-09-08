import sumArrayLikeClamped from "./sumArrayLikeClamped";
import list from "./list";

export default function sumIterClamped(iter) {
    return sumArrayLikeClamped(list(iter));
}