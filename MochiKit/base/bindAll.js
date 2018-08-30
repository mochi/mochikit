export default function bindAll(object, ctx) {
    let val, keys = Object.keys(object);
    ctx = ctx === undefined ? object : ctx;

    for(let key of keys) {
        val = object[key];

        if(typeof val === 'function') {
            object[key] = val.bind()
        }
    }

    return object;
}