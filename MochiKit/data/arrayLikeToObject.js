import extendWithArray from "./extendWithArray";

export default function arrayLikeToObject(arrayLike) {
    return extendWithArray(arrayLike, {});
}