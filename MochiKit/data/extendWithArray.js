export default function extendWithArray(array, newArray) {
    for(let index = 0, len = array.length; index < len; ++index) {
        newArray.push(array[index]);
    }

    return newArray;
}