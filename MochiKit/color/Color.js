import fromHSL from "./fromHSL";
import fromHSV from "./fromHSV";
import fromRGB from "./fromRGB";
import fromHexString from "./fromHexString";

export default class Color {
    constructor(red, green, blue, alpha) {
        if (alpha == null) {
            alpha = 1.0;
        }
        this.rgb = {
            r: red,
            g: green,
            b: blue,
            a: alpha
        };
    }
}

//Allow static methods for legacy purposes.
Color.fromHSL = fromHSL;
Color.fromHSV = fromHSV;
Color.fromRGB = fromRGB;
Color.fromHexString = fromHexString;