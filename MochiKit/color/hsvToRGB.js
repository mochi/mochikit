import Color from "./Color";

export default function hsvToRGB(hue, saturation, value, alpha) {
    if (arguments.length == 1) {
        var hsv = hue;
        hue = hsv.h;
        saturation = hsv.s;
        value = hsv.v;
        alpha = hsv.a;
    }
    var red;
    var green;
    var blue;
    if (saturation === 0) {
        red = value;
        green = value;
        blue = value;
    } else {
        var i = Math.floor(hue * 6);
        var f = (hue * 6) - i;
        var p = value * (1 - saturation);
        var q = value * (1 - (saturation * f));
        var t = value * (1 - (saturation * (1 - f)));
        switch (i) {
            case 1: red = q; green = value; blue = p; break;
            case 2: red = p; green = value; blue = t; break;
            case 3: red = p; green = q; blue = value; break;
            case 4: red = t; green = p; blue = value; break;
            case 5: red = value; green = p; blue = q; break;
            case 6: // fall through
            case 0: red = value; green = t; blue = p; break;
        }
    }

    return new Color(red, green, blue, alpha);
}