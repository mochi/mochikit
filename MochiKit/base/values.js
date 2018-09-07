export default function values(obj) {
    var rval = [];
    for (var prop in obj) {
        rval.push(obj[prop]);
    }
    return rval;
}