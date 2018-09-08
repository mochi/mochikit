import sumArrayLike from "./sumArrayLike";
import list from "./list";

export default function sumIter(iter) {
    return sumArrayLike(list(iter));
}