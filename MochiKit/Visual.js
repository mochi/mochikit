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

/* The following section is adapted from Rico (http://www.openrico.org) */
MochiKit.Visual.Color = function (red, green, blue) {
    this.rgb = {
        "r": red,
        "g": green,
        "b": blue
    };
};

MochiKit.Visual.Color.prototype = {

    "setRed": function (r) {
        this.rgb.r = r;
    },

    "setGreen": function (g) {
        this.rgb.g = g;
    },

    "setBlue": function (b) {
        this.rgb.b = b;
    },

    "setHue": function (h) {
        // get an HSB model, and set the new hue...
        var hsb = this.asHSB();
        hsb.h = h;

        // convert back to RGB...
        this.rgb = MochiKit.Visual.HSBtoRGB(hsb.h, hsb.s, hsb.b);
    },

    "setSaturation": function (s) {
        // get an HSB model, and set the new hue...
        var hsb = this.asHSB();
        hsb.s = s;

        // convert back to RGB and set values...
        this.rgb = MochiKit.Visual.HSBtoRGB(hsb.h, hsb.s, hsb.b);
    },

    "setBrightness": function (b) {
        // get an HSB model, and set the new hue...
        var hsb = this.asHSB();
        hsb.b = b;

        // convert back to RGB and set values...
        this.rgb = MochiKit.Visual.HSBtoRGB(hsb.h, hsb.s, hsb.b);
    },

    "darken": function (percent) {
        var hsb  = this.asHSB();
        this.rgb = MochiKit.Visual.HSBtoRGB(
            hsb.h,
            hsb.s,
            Math.max(hsb.b - percent, 0)
        );
    },

    "brighten": function (percent) {
        var hsb  = this.asHSB();
        this.rgb = MochiKit.Visual.HSBtoRGB(
            hsb.h,
            hsb.s,
            Math.min(hsb.b + percent, 1)
        );
    },

    "blend": function (other) {
        this.rgb = {
            "r": Math.floor((this.rgb.r + other.rgb.r) / 2),
            "g": Math.floor((this.rgb.g + other.rgb.g) / 2),
            "b": Math.floor((this.rgb.b + other.rgb.b) / 2)
        };
    },

    "isBright": function () {
        var hsb = this.asHSB();
        return this.asHSB().b > 0.5;
    },

    "isDark": function () {
        return (!this.isBright());
    },

    "asRGB": function () {
        return "rgb(" + this.rgb.r + "," + this.rgb.g + "," + this.rgb.b + ")";
    },

    "asHex": function () {
        return ("#" + 
            MochiKit.Visual.toColorPart(this.rgb.r) +
            MochiKit.Visual.toColorPart(this.rgb.g) +
            MochiKit.Visual.toColorPart(this.rgb.b));
    },

    "asHSB": function () {
        return MochiKit.Visual.RGBtoHSB(this.rgb.r, this.rgb.g, this.rgb.b);
    },

    "toString": function () {
        return this.asHex();
    },

    "repr": function () {
        return this.asRGB();
    }

};

MochiKit.Visual.createFromHex = function (hexCode) {
    if (hexCode.indexOf('#') == 0) {
        hexCode = hexCode.substring(1);
    }
    var r = parseInt(hexCode.substring(0, 2), 16);
    var g = parseInt(hexCode.substring(2, 4), 16);
    var b = parseInt(hexCode.substring(4, 6), 16);
    return new MochiKit.Visual.Color(r, g, b);
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


/**
 * Factory method for creating a color from the background of
 * an HTML element.
 */
MochiKit.Visual.createColorFromBackground = function (elem) {

    var actualColor = MochiKit.Visual.getElementsComputedStyle(
        MochiKit.DOM.getElement(elem),
        "backgroundColor",
        "background-color"
    );

    if (actualColor == "transparent" && elem.parent) {
        return MochiKit.Visual.createColorFromBackground(elem.parent);
    }

    if (actualColor == null) {
        return new MochiKit.Visual.Color(255, 255, 255);
    }

    if (actualColor.indexOf("rgb(") == 0) {
        var colors = actualColor.substring(4, actualColor.length - 1);
        var colorArray = colors.split(",");
        return new MochiKit.Visual.Color(
            parseInt(colorArray[0]),
            parseInt(colorArray[1]),
            parseInt(colorArray[2])
        );
    }
    if (actualColor.indexOf("#") == 0) {
        var r = parseInt(actualColor.substring(1, 3), 16);
        var g = parseInt(actualColor.substring(3, 5), 16);
        var b = parseInt(actualColor.substring(5), 16);
        return new MochiKit.Visual.Color(r, g, b);
    }
    return new MochiKit.Visual.Color(255, 255, 255);
};

MochiKit.Visual.HSBtoRGB = function (hue, saturation, brightness) {

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

MochiKit.Visual.RGBtoHSB = function (r, g, b) {
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
        var redc   = (cmax - r)/(cmax - cmin);
        var greenc = (cmax - g)/(cmax - cmin);
        var bluec  = (cmax - b)/(cmax - cmin);

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

MochiKit.Visual.RoundCorners = function (e, options) {
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

MochiKit.Visual.RoundCorners.prototype = {
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
        inStyle.display  = "block";
        inStyle.height   = "1px";
        inStyle.overflow = "hidden";
        inStyle.fontSize = "1px";

        var borderColor = this._borderColor(color, bgColor);
        if (this.options.border && n == 0) {
            inStyle.borderTopStyle    = "solid";
            inStyle.borderTopWidth    = "1px";
            inStyle.borderLeftWidth   = "0px";
            inStyle.borderRightWidth  = "0px";
            inStyle.borderBottomWidth = "0px";
            // assumes css compliant box model
            inStyle.height            = "0px";
            inStyle.borderColor       = borderColor;
        } else if (borderColor) {
            inStyle.borderColor = borderColor.asHex();
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
            if (str.indexOf(arguments[i]) >= 0) return true;
        }
        return false;
    },

    "_blend": function (c1, c2) {
        var cc1 = MochiKit.Visual.createFromHex(c1);
        cc1.blend(MochiKit.Visual.createFromHex(c2));
        return cc1;
    },

    "_background": function (el) {
        try {
            return MochiKit.Visual.createColorFromBackground(el).asHex();
        } catch(err) {
            return "#ffffff";
        }
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
        new MochiKit.Visual.RoundCorners(elements[i], options);
    }
};

/* end of Rico adaptation */

MochiKit.Visual.__new__  = function () {
   this.EXPORT_TAGS = {
       ":common": this.EXPORT,
       ":all": this.EXPORT
   };

   MochiKit.Base.nameFunctions(this);

};

MochiKit.Visual.EXPORT = [
    "RoundCorners",
    "createColorFromBackground",
    "RGBtoHSB",
    "HSBtoRGB",
    "toColorPart",
    "Color",
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
