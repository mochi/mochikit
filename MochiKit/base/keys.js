export default function keys(obj) {
    var rval = [];
    for (var prop in obj) {
        rval.push(prop);
    }
    return rval;
}