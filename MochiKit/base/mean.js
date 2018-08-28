export default function mean(...args/* lst... */) {
    /* http://www.nist.gov/dads/HTML/mean.html */
    var sum = 0;

    var m = MochiKit.Base;
    var count = args.length;

    while (args.length) {
        var o = args.shift();
        if (o && typeof(o) == "object" && typeof(o.length) == "number") {
            count += o.length - 1;
            for (var i = o.length - 1; i >= 0; i--) {
                sum += o[i];
            }
        } else {
            sum += o;
        }
    }

    if (count <= 0) {
        throw new TypeError('mean() requires at least one argument');
    }

    return sum/count;
}