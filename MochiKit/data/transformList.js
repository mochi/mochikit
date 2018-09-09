export default function transformList(list, List) {
    let newList = new List();

    for(let item of list) {
        newList.add(item);
    }

    return newList;
}