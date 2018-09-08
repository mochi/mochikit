export default function reduceArrayLike(array, predicate, accumulator) {
    let index = 0;

    if(accumulator === undefined) {
        index = 1;
        accumulator = array[0];
    }

    for(let item of array) {
        accumulator = predicate(accumulator, item);
    }

    return accumulator;
}