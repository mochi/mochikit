export default function hslValue(n1, n2, hue) {
    if (hue > 6.0) {
        hue -= 6.0;
    } else if (hue < 0.0) {
        hue += 6.0;
    }
    var val;
    if (hue < 1.0) {
        val = n1 + (n2 - n1) * hue;
    } else if (hue < 3.0) {
        val = n2;
    } else if (hue < 4.0) {
        val = n1 + (n2 - n1) * (4.0 - hue);
    } else {
        val = n1;
    }
    return val;
}