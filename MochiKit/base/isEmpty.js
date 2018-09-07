import isArrayLike from './isArrayLike';

export default function isEmpty(arrayLike) {
    return isArrayLike(arrayLike) && arrayLike.length === 0;
}