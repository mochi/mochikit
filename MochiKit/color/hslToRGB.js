export default function hslToRGB(hue, saturation, lightness, alpha) {
    if (arguments.length == 1) {
        var hsl = hue;
        hue = hsl.h;
        saturation = hsl.s;
        lightness = hsl.l;
        alpha = hsl.a;
    }
    var red;
    var green;
    var blue;
    if (saturation === 0) {
        red = lightness;
        green = lightness;
        blue = lightness;
    } else {
        var m2;
        if (lightness <= 0.5) {
            m2 = lightness * (1.0 + saturation);
        } else {
            m2 = lightness + saturation - (lightness * saturation);
        }
        var m1 = (2.0 * lightness) - m2;
        var f = MochiKit.Color._hslValue;
        var h6 = hue * 6.0;
        red = f(m1, m2, h6 + 2);
        green = f(m1, m2, h6);
        blue = f(m1, m2, h6 - 2);
    }
    return {
        r: red,
        g: green,
        b: blue,
        a: alpha
    };
}