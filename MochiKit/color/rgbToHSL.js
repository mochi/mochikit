export default function rgbToHSL(red, green, blue, alpha) {
    if (arguments.length == 1) {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        alpha = rgb.a;
    }
    var max = Math.max(red, Math.max(green, blue));
    var min = Math.min(red, Math.min(green, blue));
    var hue;
    var saturation;
    var lightness = (max + min) / 2.0;
    var delta = max - min;
    if (delta === 0) {
        hue = 0;
        saturation = 0;
    } else {
        if (lightness <= 0.5) {
            saturation = delta / (max + min);
        } else {
            saturation = delta / (2 - max - min);
        }
        if (red == max) {
            hue = (green - blue) / delta;
        } else if (green == max) {
            hue = 2 + ((blue - red) / delta);
        } else {
            hue = 4 + ((red - green) / delta);
        }
        hue /= 6;
        if (hue < 0) {
            hue += 1;
        }
        if (hue > 1) {
            hue -= 1;
        }

    }
    return {
        h: hue,
        s: saturation,
        l: lightness,
        a: alpha
    };
}