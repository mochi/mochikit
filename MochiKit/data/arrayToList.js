export default function arrayToList(array, List) {
    let list = new List();

    for(let item of array) {
        list.add(item);
    }

    return list;
}