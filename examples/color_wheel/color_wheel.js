var radius = 250;
var twoPI = Math.PI * 2;
var amplification = 10;

var calcAlpha = function (target, lightness) {
    return Math.max(1.0 - (Math.abs(lightness - target) * amplification), 0);
};

var makeColorDiv = function (name) {
    var c = Color.fromName(name);
    var hsl = c.asHSL();
    var r = hsl.s * radius;
    var e = DIV(null, name);
    // hsl.a = 0;
    update(e.style, {
        "color": Color.fromHSL(hsl).toString(),
        "width": "100px",
        "height": "30px",
        "position": "absolute",
        "verticalAlign": "middle",
        "textAlign": "center",
        "left": Math.floor((Math.cos(hsl.h * twoPI) * r) - 50) + "px",
        "top": Math.floor((Math.sin(hsl.h * twoPI) * r)) + "px"
    });
    return [c, e];
};

var colorWheelOnLoad = function () {
    var seenColors = {};
    var colors = Color.namedColors();
    var colorDivs = [];
    for (var k in colors) {
        var val = colors[k];
        if (val in seenColors) {
            continue;
        }
        colorDivs.push(makeColorDiv(k));
    }
    swapDOM(
        "color_wheel",
        DIV(null, map(itemgetter(1), colorDivs))
    );
    var intervalFunc = function (cycle, timeout) {
        var target = 0.5 + (0.5 * Math.sin(Math.PI * (cycle / 180)));
        for (var i = 0; i < colorDivs.length; i++) {
            var cd = colorDivs[i];
            var color = cd[0];
            var alpha = calcAlpha(target, color.asHSL().l);
            var style = cd[1].style;
            if (alpha == 0) {
                style.display = "none";
            } else {
                style.display ="";
                style.color = color.colorWithAlpha(alpha);
            }
        }
        setTimeout(partial(intervalFunc, cycle + 2, timeout), timeout);
    }
    intervalFunc(0, 200);
};
