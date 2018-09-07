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