import Color from './Color';

export default function fromRGB(red, green, blue, alpha) {
    if (green == null && blue == null && alpha == null) {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        alpha = rgb.a;
    }
    return new Color(red, green, blue, alpha);
}