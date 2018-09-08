export default function americanDate(d) {
    d = d + "";
    if (typeof(d) !== "string" || d.length === 0) {
        return null;
    }
    var a = d.split('/');
    return new Date(a[2], a[0] - 1, a[1]);
};