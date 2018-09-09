export default function objectToKeyed(object, KeyedCollection) {
    let instance = new KeyedCollection(),
    keys = Object.keys(object);

    for(let key of keys) {
        instance.set(key, object[key]);
    }

    return instance;
}