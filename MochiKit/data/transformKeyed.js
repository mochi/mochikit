export default function transformKeyed(keyed, KeyedCollection) {
    let collection = new KeyedCollection();

    for(let [key, set] of keyed.entries()) {
        collection.set(key, set);
    }

    return collection;
}