export default function setdefault(src, target) {
    let keys = Object.keys(src);

    keys.forEach((key) => {
        if(!(key in target)) {
            target[key] = src[key];
        }
    });

    return target;
}