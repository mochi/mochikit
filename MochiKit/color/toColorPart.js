export default function toColorPart(num) {
    num = Math.round(num);
    var digits = num.toString(16);
    if (num < 16) {
        return '0' + digits;
    }
    return digits;
}