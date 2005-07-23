/*

MochiKit.Visual 0.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito and others.  All rights Reserved.

*/


if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base");
    JSAN.use("MochiKit.DOM");
}

try {
    if (typeof(MochiKit.Base) == 'undefined' ||
        typeof(MochiKit.DOM) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.Visual depends on MochiKit.Base and MochiKit.DOM!";
}

if (typeof(MochiKit.Visual) == "undefined") {
    MochiKit.Visual = {};
}

MochiKit.Visual.NAME = "MochiKit.Visual";
MochiKit.Visual.VERSION = "0.5";

MochiKit.Visual.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.Visual.toString = function () {
    return this.__repr__();
};

/*
    The following section is partially adapted from
    Rico <http://www.openrico.org>
*/

MochiKit.Visual.Color = function (red, green, blue, alpha) {
    // TODO: support alpha
    if (arguments.length == 1) {
        this.rgb = {
            "r": red.r,
            "g": red.g,
            "b": red.b,
            "a": red.a
        };
    } else {
        this.rgb = {
            "r": red,
            "g": green,
            "b": blue,
            "a": alpha
        };
    }
    if (typeof(this.rgb.a) == 'undefined' || this.rgb.a == null) {
        this.rgb.a = 1.0;
    }
};


MochiKit.Visual.Color.prototype = {

    "__class__": MochiKit.Visual.Color,

    "colorWithHue": function (hue) {
        // get an HSB model, and set the new hue...
        var hsb = this.asHSB();
        hsb.h = hue;
        var m = MochiKit.Visual;
        // convert back to RGB...
        return m.Color.fromHSB(hsb);
    },

    "colorWithSaturation": function (saturation) {
        // get an HSB model, and set the new hue...
        var hsb = this.asHSB();
        hsb.s = saturation;
        var m = MochiKit.Visual;
        // convert back to RGB...
        return m.Color.fromHSB(hsb);
    },

    "colorWithBrightness": function (brightness) {
        // get an HSB model, and set the new hue...
        var hsb = this.asHSB();
        hsb.b = brightness;
        var m = MochiKit.Visual;
        // convert back to RGB...
        return m.Color.fromHSB(hsb);
    },

    "darkerColorWithLevel": function (level) {
        var hsb  = this.asHSB();
        hsb.b = Math.max(hsb.b - level, 0);
        var m = MochiKit.Visual;
        return m.Color.fromHSB(hsb);
    },

    "brighterColorWithLevel": function (level) {
        var hsb  = this.asHSB();
        Math.min(hsb.b + level, 1);
        var m = MochiKit.Visual;
        return m.Color.fromHSB(hsb);
    },

    "blendedColor": function (other, /* optional */ fraction) {
        if (typeof(fraction) == 'undefined' || fraction == null) {
            fraction = 0.5;
        }
        var sf = 1.0 - fraction;
        var s = this.rgb;
        var d = other.rgb;
        var df = fraction;
        return MochiKit.Visual.Color.fromRGB(
            Math.floor((s.r * sf) + (d.r * df)),
            Math.floor((s.g * sf) + (d.g * df)),
            Math.floor((s.b * sf) + (d.b * df))
        );
    },

    "compareRGB": function (other) {
        var sc = this.rgb;
        var dc = other.rgb;
        return MochiKit.Base.compare(
            [sc.r, sc.g, sc.b, sc.a],
            [dc.r, dc.g, dc.b, dc.a]
        );
    },
        
    "isBright": function () {
        return this.asHSB().b > 0.5;
    },

    "isDark": function () {
        return (!this.isBright());
    },

    "toRGBString": function () {
        var c = this.rgb;
        return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
    },

    "asRGB": function () {
        var c = this.rgb;
        return {
            "r": c.r,
            "g": c.g,
            "b": c.b,
            "a": c.a
        };
    },

    "toHexString": function () {
        var m = MochiKit.Visual;
        var c = this.rgb;
        return ("#" + 
            m.toColorPart(c.r) +
            m.toColorPart(c.g) +
            m.toColorPart(c.b));
    },

    "asHSB": function () {
        var hsb = this.hsb;
        var c = this.rgb;
        if (typeof(hsb) == 'undefined' || hsb == null) {
            hsb = MochiKit.Visual.rgbToHSB(this.rgb);
            this.hsb = hsb;
        }
        return {
            "h": hsb.h,
            "s": hsb.s,
            "b": hsb.b,
            "a": c.a
        };
    },

    "toString": function () {
        return this.toHexString();
    },

    "repr": function () {
        var c = this.rgb;
        var col = [c.r, c.g, c.b];
        return this.__class__.NAME + "(" + col.join(", ") + ")";
    }

};

MochiKit.Visual.Color.fromRGB = function (red, green, blue, alpha) {
    var Color = MochiKit.Visual.Color;
    if (arguments.length > 1) {
        return new Color(red, green, blue, alpha);
    }
    return new Color(red);
};

MochiKit.Visual.Color.fromHSB = function (hue, saturation, brightness, alpha) {
    var m = MochiKit.Visual;
    return m.Color.fromRGB(m.hsbToRGB.apply(m, arguments));
};

MochiKit.Visual.Color.fromHexString = function (hexCode) {
    if (hexCode.indexOf('#') == 0) {
        hexCode = hexCode.substring(1);
    }
    var r = parseInt(hexCode.substring(0, 2), 16);
    var g = parseInt(hexCode.substring(2, 4), 16);
    var b = parseInt(hexCode.substring(4, 6), 16);
    return MochiKit.Visual.Color.fromRGB(r, g, b);
};

MochiKit.Visual.Color.fromRGBString = function (rgbCode) {
    if (rgbCode.indexOf("rgb") == 0) {
        rgbCode = rgbCode.substring(rgbCode.indexOf("(", 3) + 1, rgbCode.length - 1);
    } 
    var colorArray = rgbCode.split(",");
    return MochiKit.Visual.Color.fromRGB(
        parseInt(colorArray[0]),
        parseInt(colorArray[1]),
        parseInt(colorArray[2])
    );
};

MochiKit.Visual.Color.fromString = function (colorString) {
    // TODO: support RGBA
    var self = MochiKit.Visual.Color;
    if (colorString.indexOf("rgb(") == 0) {
        return self.fromRGBString(colorString);
    } else if (colorString.indexOf("#") == 0) {
        return self.fromHexString(colorString);
    }
    return null;
};

/**
 * Factory method for creating a color from the background of
 * an HTML element.
 */
MochiKit.Visual.Color.fromBackground = function (elem) {

    var m = MochiKit.Visual;
    var actualColor;
    while (true) {
        actualColor = m.getElementsComputedStyle(
            MochiKit.DOM.getElement(elem),
            "backgroundColor",
            "background-color"
        );
        if (actualColor == "transparent" && elem.parent) {
            elem = elem.parent;
        } else {
            break;
        }
    }

    var color = null;
    if (actualColor) {
        color = m.Color.fromString(actualColor);
    }
    if (color == null) {
        color = m.Color.whiteColor();
    }
    return color;
};


MochiKit.Visual.getElementsComputedStyle = function (htmlElement, cssProperty, mozillaEquivalentCSS) {
    if (arguments.length == 2) {
        mozillaEquivalentCSS = cssProperty;
    }
    var el = MochiKit.DOM.getElement(htmlElement);
    if (el.currentStyle) {
        return el.currentStyle[cssProperty];
    } else {
        var style = document.defaultView.getComputedStyle(el, null);
        return style.getPropertyValue(mozillaEquivalentCSS);
    }
};


MochiKit.Visual.hsbToRGB = function (hue, saturation, brightness) {
    if (arguments.length == 1) {
        var hsb = hue;
        hue = hsb.h;
        saturation = hue.s;
        brightness = hue.b;
    }

    var red   = 0;
    var green = 0;
    var blue  = 0;

    if (saturation == 0) {
        red = parseInt(brightness * 255.0 + 0.5);
        green = red;
        blue = red;
    }
    else {
        var h = (hue - Math.floor(hue)) * 6.0;
        var f = h - Math.floor(h);
        var p = brightness * (1.0 - saturation);
        var q = brightness * (1.0 - saturation * f);
        var t = brightness * (1.0 - (saturation * (1.0 - f)));

        switch (parseInt(h)) {
            case 0:
                red   = (brightness * 255.0 + 0.5);
                green = (t * 255.0 + 0.5);
                blue  = (p * 255.0 + 0.5);
                break;
            case 1:
                red   = (q * 255.0 + 0.5);
                green = (brightness * 255.0 + 0.5);
                blue  = (p * 255.0 + 0.5);
                break;
            case 2:
                red   = (p * 255.0 + 0.5);
                green = (brightness * 255.0 + 0.5);
                blue  = (t * 255.0 + 0.5);
                break;
            case 3:
                red   = (p * 255.0 + 0.5);
                green = (q * 255.0 + 0.5);
                blue  = (brightness * 255.0 + 0.5);
                break;
            case 4:
                red   = (t * 255.0 + 0.5);
                green = (p * 255.0 + 0.5);
                blue  = (brightness * 255.0 + 0.5);
                break;
            case 5:
                red   = (brightness * 255.0 + 0.5);
                green = (p * 255.0 + 0.5);
                blue  = (q * 255.0 + 0.5);
                break;
	    }
	}

    return {
        "r": parseInt(red),
        "g": parseInt(green),
        "b": parseInt(blue)
    };
}

MochiKit.Visual.rgbToHSB = function (r, g, b) {
    if (arguments.length == 1) {
        var rgb = r;
        r = rgb.r;
        g = rgb.g;
        b = rgb.b;
    }
    var hue;
    var saturaton;
    var brightness;

    var cmax = (r > g) ? r : g;
    if (b > cmax) {
        cmax = b;
    }

    var cmin = (r < g) ? r : g;
    if (b < cmin) {
        cmin = b;
    }

    brightness = cmax / 255.0;
    if (cmax != 0) {
        saturation = (cmax - cmin) / cmax;
    } else {
        saturation = 0;
    }

    if (saturation == 0) {
        hue = 0;
    } else {
        var redc   = (cmax - r) / (cmax - cmin);
        var greenc = (cmax - g) / (cmax - cmin);
        var bluec  = (cmax - b) / (cmax - cmin);

        if (r == cmax) {
            hue = bluec - greenc;
        } else if (g == cmax) {
            hue = 2.0 + redc - bluec;
        } else {
            hue = 4.0 + greenc - redc;
        }

        hue = hue / 6.0;
        if (hue < 0) {
            hue = hue + 1.0;
        }
    }

    return {
        "h": hue,
        "s": saturation,
        "b": brightness
    };
};

MochiKit.Visual.toColorPart = function (num) {
    var digits = num.toString(16);
    if (num < 16) {
        return '0' + digits;
    }
    return digits;
};

MochiKit.Visual.roundElement = function (e, options) {
    new MochiKit.Visual._RoundCorners(e, options);
};

MochiKit.Visual._RoundCorners = function (e, options) {
    var e = MochiKit.DOM.getElement(e);
    this._setOptions(options);

    var color = this.options.color;
    if (this.options.color == "fromElement") {
        color = this._background(e);
    }

    var bgColor = this.options.bgColor;
    if (this.options.bgColor == "fromParent") {
        bgColor = this._background(e.offsetParent);
    }

    this._roundCornersImpl(e, color, bgColor);
};

MochiKit.Visual._RoundCorners.prototype = {
    "_roundCornersImpl": function (e, color, bgColor) {
        if (this.options.border) {
            this._renderBorder(e, bgColor);
        }
        if (this._isTopRounded()) {
            this._roundTopCorners(e, color, bgColor);
        }
        if (this._isBottomRounded()) {
            this._roundBottomCorners(e, color, bgColor);
        }
    },

    "_renderBorder": function (el, bgColor) {
        var borderValue = "1px solid " + this._borderColor(bgColor);
        var borderL = "border-left: "  + borderValue;
        var borderR = "border-right: " + borderValue;
        var style   = "style='" + borderL + ";" + borderR +  "'";
        el.innerHTML = "<div " + style + ">" + el.innerHTML + "</div>";
    },

    "_roundTopCorners": function (el, color, bgColor) {
        var corner = this._createCorner(bgColor);
        for (var i = 0; i < this.options.numSlices; i++) {
            corner.appendChild(
                this._createCornerSlice(color, bgColor, i, "top")
            );
        }
        el.style.paddingTop = 0;
        el.insertBefore(corner, el.firstChild);
    },

    "_roundBottomCorners": function (el, color, bgColor) {
        var corner = this._createCorner(bgColor);
        for (var i = (this.options.numSlices - 1); i >= 0; i--) {
            corner.appendChild(
                this._createCornerSlice(color, bgColor, i, "bottom")
            );
        }
        el.style.paddingBottom = 0;
        el.appendChild(corner);
    },

    "_createCorner": function (bgColor) {
        var corner = document.createElement("div");
        corner.style.backgroundColor = (
            this._isTransparent() ?  "transparent" : bgColor
        );
        return corner;
    },

    "_createCornerSlice": function (color, bgColor, n, position) {
        var slice = document.createElement("span");

        var inStyle = slice.style;
        inStyle.backgroundColor = color;
        inStyle.display = "block";
        inStyle.height = "1px";
        inStyle.overflow = "hidden";
        inStyle.fontSize = "1px";

        var borderColor = this._borderColor(color, bgColor);
        if (this.options.border && n == 0) {
            inStyle.borderTopStyle = "solid";
            inStyle.borderTopWidth = "1px";
            inStyle.borderLeftWidth = "0px";
            inStyle.borderRightWidth = "0px";
            inStyle.borderBottomWidth = "0px";
            // assumes css compliant box model
            inStyle.height = "0px";
            inStyle.borderColor = borderColor;
        } else if (borderColor) {
            inStyle.borderColor = borderColor.toHexString();
            inStyle.borderStyle = "solid";
            inStyle.borderWidth = "0px 1px";
        }

        if (!this.options.compact && (n == (this.options.numSlices - 1))) {
            inStyle.height = "2px";
        }

        this._setMargin(slice, n, position);
        this._setBorder(slice, n, position);

        return slice;
    },

    "_setOptions": function (options) {
        this.options = {
            corners : "all",
            color   : "fromElement",
            bgColor : "fromParent",
            blend   : true,
            border  : false,
            compact : false
        };
        MochiKit.Base.update(this.options, options);

        this.options.numSlices = (this.options.compact ? 2 : 4);
        if (this._isTransparent()) {
            this.options.blend = false;
        }
    },

    "_whichSideTop": function () {
        var corners = this.options.corners;
        if (this._hasString(corners, "all", "top")) {
            return "";
        }

        var has_tl = (corners.indexOf("tl") != -1);
        var has_tr = (corners.indexOf("tr") != -1);
        if (has_tl && has_tr) {
            return "";
        }
        if (has_tl) {
            return "left";
        }
        if (has_tr) {
            return "right";
        }
        return "";
    },

    "_whichSideBottom": function () {
        var corners = this.options.corners;
        if (this._hasString(corners, "all", "bottom")) {
            return "";
        }

        var has_bl = (corners.indexOf('bl') != -1);
        var has_br = (corners.indexOf('br') != -1);
        if (has_bl && has_br) {
            return "";
        }
        if (has_bl) {
            return "left";
        }
        if (has_br) {
            return "right";
        }
        return "";
    },

    "_borderColor": function (color, bgColor) {
        if (color == "transparent") {
            return bgColor;
        } else if (this.options.border) {
            return this.options.border;
        } else if (this.options.blend) {
            return this._blend(bgColor, color);
        }
        return "";
    },


    "_setMargin": function (el, n, corners) {
        var marginSize = this._marginSize(n);
        var whichSide = (
            corners == "top" ? this._whichSideTop() : this._whichSideBottom()
        );
        var style = el.style;

        if (whichSide == "left") {
            style.marginLeft = marginSize + "px";
            style.marginRight = "0px";
        } else if (whichSide == "right") {
            style.marginRight = marginSize + "px";
            style.marginLeft  = "0px";
        } else {
            style.marginLeft = marginSize + "px";
            style.marginRight = marginSize + "px";
        }
    },

    "_setBorder": function (el, n, corners) {
        var borderSize = this._borderSize(n);
        var whichSide = (
            corners == "top" ? this._whichSideTop() : this._whichSideBottom()
        );

        var style = el.style;
        if (whichSide == "left") {
            style.borderLeftWidth = borderSize + "px";
            style.borderRightWidth = "0px";
        } else if (whichSide == "right") {
            style.borderRightWidth = borderSize + "px";
            style.borderLeftWidth  = "0px";
        } else {
            style.borderLeftWidth = borderSize + "px";
            style.borderRightWidth = borderSize + "px";
        }
    },

    "_marginSize": function (n) {
        if (this._isTransparent()) {
            return 0;
        }

        var o = this.options;
        if (o.compact && o.blend) {
            var smBlendedMarginSizes = [1, 0];
            return smBlendedMarginSizes[n];
        } else if (o.compact) {
            var compactMarginSizes = [2, 1];
            return compactMarginSizes[n];
        } else if (o.blend) {
            var blendedMarginSizes = [3, 2, 1, 0];
            return blendedMarginSizes[n];
        } else {
            var marginSizes = [5, 3, 2, 1];
            return marginSizes[n];
        }
    },

    "_borderSize": function (n) {
        var o = this.options;
        if (o.compact && (o.blend || this._isTransparent())) {
            return 1;
        } else if (o.compact) {
            var compactBorderSizes = [1, 0];
            return compactBorderSizes[n];
        } else if (o.blend) {
            var blendedBorderSizes = [2, 1, 1, 1];
            return blendedBorderSizes[n];
        } else if (o.border) {
            var actualBorderSizes = [0, 2, 0, 0];
            return actualBorderSizes[n];
        } else if (this._isTransparent()) {
            var transparentBorderSizes = [5, 3, 2, 1];
            return transparentBorderSizes[n];
        }
        return 0;
    },

    "_hasString": function (str) {
        for (var i = 1; i< arguments.length; i++) {
            if (str.indexOf(arguments[i]) != -1) {
                return true;
            }
        }
        return false;
    },

    "_blend": function (c1, c2) {
        var c = MochiKit.Visual.Color;
        return c.fromHexString(c1).blendedColor(c.fromHexString(c2));
    },

    "_background": function (el) {
        return MochiKit.Visual.Color.fromBackground(el).toHexString();
    },

    "_isTransparent": function () {
        return this.options.color == "transparent";
    },

    "_isTopRounded": function () {
        return this._hasString(this.options.corners,
            "all", "top", "tl", "tr"
        );
    },

    "_isBottomRounded": function () {
        return this._hasString(this.options.corners,
            "all", "bottom", "bl", "br"
        );
    },

    "_hasSingleTextChild": function (el) {
        return (el.childNodes.length == 1 && el.childNodes[0].nodeType == 3);
    }
};

MochiKit.Visual.roundClass = function (tagName, className, options) {
    var elements = MochiKit.DOM.getElementsByTagAndClassName(
        tagName, className
    );
    for (var i = 0; i < elements.length; i++) {
        roundElement(elements[i], options);
    }
};

/* end of Rico adaptation */

MochiKit.Visual.__new__  = function () {
    var third = 1.0 / 3.0;
    var colors = {
        black: [0, 0, 0],
        blue: [0, 0, 1],
        brown: [0.6, 0.4, 0.2],
        cyan: [0, 1, 1],
        darkGray: [third, third, third],
        gray: [0.5, 0.5, 0.5],
        green: [0, 1, 0],
        lightGray: [2 * third, 2 * third, 2 * third],
        magenta: [1, 0, 1],
        orange: [1, 0.5, 0],
        purple: [0.5, 0, 0.5],
        red: [1, 0, 0],
        white: [1, 1, 1],
        yellow: [1, 1, 0]
    }

    var makeColor = function (name, r, g, b) {
        var rval = this.fromRGB(r, g, b);
        this.name = function () { return rval; };
        return rval;
    }

    var bind = MochiKit.Base.bind;
    var map = MochiKit.Base.map;
    var concat = MochiKit.Base.concat;
    for (var k in colors) {
        var name = k + "Color";
        var bindArgs = concat(
            [makeColor, this.Color, name],
            map(function (x) { return Math.floor(x * 255); }, colors[k])
        );
        this.Color[name] = bind.apply(null, bindArgs);
    }

    var isColor = function () {
        for (var i = 0; i < arguments.length; i++) {
            if (!(arguments[i] instanceof Color)) {
                return false;
            }
        }
        return true;
    }

    var compareColor = function (a, b) {
        return a.compareRGB(b);
    }

    registerComparator(this.Color.NAME, isColor, compareColor);
        
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": this.EXPORT
    };

    MochiKit.Base.nameFunctions(this);

};

MochiKit.Visual.EXPORT = [
    "rgbToHSB",
    "hsbToRGB",
    "toColorPart",
    "Color",
    "roundElement",
    "roundClass"
];
MochiKit.Visual.EXPORT_OK = [];

MochiKit.Visual.__new__();

if (typeof(JSAN) == 'undefined'
    || (typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Visual);
}
