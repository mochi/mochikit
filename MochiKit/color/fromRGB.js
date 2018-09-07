import Color from "./Color";

export default function fromRGB(red, green, blue, alpha) {
    if (arguments.length == 1) {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        if (typeof(rgb.a) == 'undefined') {
            alpha = undefined;
        } else {
            alpha = rgb.a;
        }
    }
    return new Color(red, green, blue, alpha);
}