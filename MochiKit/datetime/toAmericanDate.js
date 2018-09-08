export default function toAmericanDate(d) {
    if (typeof(d) == "undefined" || d === null) {
        return null;
    }
    return [d.getMonth() + 1, d.getDate(), d.getFullYear()].join('/');
};