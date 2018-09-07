export default function fromColorString(pre, method, scales, colorCode) {
    // parses either HSL or RGB
    if (colorCode.indexOf(pre) === 0) {
        colorCode = colorCode.substring(colorCode.indexOf("(", 3) + 1, colorCode.length - 1);
    }
    var colorChunks = colorCode.split(/\s*,\s*/);
    var colorFloats = [];
    for (var i = 0; i < colorChunks.length; i++) {
        var c = colorChunks[i];
        var val;
        var three = c.substring(c.length - 3);
        if (c.charAt(c.length - 1) == '%') {
            val = 0.01 * parseFloat(c.substring(0, c.length - 1));
        } else if (three == "deg") {
            val = parseFloat(c) / 360.0;
        } else if (three == "rad") {
            val = parseFloat(c) / (Math.PI * 2);
        } else {
            val = scales[i] * parseFloat(c);
        }
        colorFloats.push(val);
    }
    return this[method].apply(this, colorFloats);
}