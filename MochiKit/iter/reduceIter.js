import reduceArrayLike from "./reduceArrayLike";
import list from "./list";

export default function reduceIter(iter) {
    return reduceArrayLike(list(iter));
}