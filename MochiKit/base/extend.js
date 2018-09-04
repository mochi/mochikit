export default function extend(ar1, ar2) {
    for(let item of ar2) {
        ar1[ar1.length] = item;
        ++ar1.length;
    }

    return ar1
}