export default function isoDate(str) {
    str = str + "";
    if (typeof(str) != "string" || str.length === 0) {
        return null;
    }
    var iso = str.split('-');
    if (iso.length === 0) {
        return null;
    }
    var date = new Date(parseInt(iso[0], 10), parseInt(iso[1], 10) - 1, parseInt(iso[2], 10));
    date.setFullYear(iso[0]);
    date.setMonth(iso[1] - 1);
    date.setDate(iso[2]);
    return date;
}