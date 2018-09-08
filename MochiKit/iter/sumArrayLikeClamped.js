import sumArrayLike from "./sumArrayLike";

export default function sumArrayLikeClamped(arr, min, max) {
    let result = sumArrayLike(arr);
    //TODO: make Base.clamp
    return result > max ? max : result < min ? min : result;
}