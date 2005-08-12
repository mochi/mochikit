/***

MochiKit.Visual 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito and others.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Visual');
    dojo.require('MochiKit.Base');
    dojo.require('MochiKit.DOM');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
    JSAN.use("MochiKit.DOM", []);
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
MochiKit.Visual.VERSION = "0.80";

MochiKit.Visual.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.Visual.toString = function () {
    return this.__repr__();
};


MochiKit.Visual.clampColorComponent = function (v, scale) {
    v *= scale;
    if (v < 0) {
        return 0;
    } else if (v > scale) {
        return scale;
    } else {
        return v;
    }
};

MochiKit.Visual.Color = function (red, green, blue, alpha) {
    if (typeof(alpha) == 'undefined' || alpha == null) {
        alpha = 1.0;
    }
    this.rgb = {
        "r": red,
        "g": green,
        "b": blue,
        "a": alpha
    };
};


MochiKit.Visual.Color.prototype = {

    "__class__": MochiKit.Visual.Color,

    "colorWithAlpha": function (alpha) {
        var rgb = this.rgb;
        var m = MochiKit.Visual;
        return m.Color.fromRGB(rgb.r, rgb.g, rgb.b, alpha);
    },

    "colorWithHue": function (hue) {
        // get an HSL model, and set the new hue...
        var hsl = this.asHSL();
        hsl.h = hue;
        var m = MochiKit.Visual;
        // convert back to RGB...
        return m.Color.fromHSL(hsl);
    },

    "colorWithSaturation": function (saturation) {
        // get an HSL model, and set the new hue...
        var hsl = this.asHSL();
        hsl.s = saturation;
        var m = MochiKit.Visual;
        // convert back to RGB...
        return m.Color.fromHSL(hsl);
    },

    "colorWithLightness": function (lightness) {
        // get an HSL model, and set the new hue...
        var hsl = this.asHSL();
        hsl.l = lightness;
        var m = MochiKit.Visual;
        // convert back to RGB...
        return m.Color.fromHSL(hsl);
    },

    "darkerColorWithLevel": function (level) {
        var hsl  = this.asHSL();
        hsl.l = Math.max(hsl.l - level, 0);
        var m = MochiKit.Visual;
        return m.Color.fromHSL(hsl);
    },

    "lighterColorWithLevel": function (level) {
        var hsl  = this.asHSL();
        Math.min(hsl.l + level, 1);
        var m = MochiKit.Visual;
        return m.Color.fromHSL(hsl);
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
            (s.r * sf) + (d.r * df),
            (s.g * sf) + (d.g * df),
            (s.b * sf) + (d.b * df),
            (s.a * sf) + (d.a * df)
        );
    },

    "compareRGB": function (other) {
        var a = this.asRGB();
        var b = other.asRGB();
        return MochiKit.Base.compare(
            [a.r, a.g, a.b, a.a],
            [b.r, b.g, b.b, b.a]
        );
    },
        
    "isLight": function () {
        return this.asHSL().b > 0.5;
    },

    "isDark": function () {
        return (!this.isLight());
    },

    "toHSLString": function () {
        var c = this.asHSL();
        var ccc = MochiKit.Visual.clampColorComponent;
        var rval = this._hslString;
        if (!rval) {
            var mid = (
                ccc(c.h, 360).toFixed(0)
                + "," + ccc(c.s, 100).toPrecision(4) + "%" 
                + "," + ccc(c.l, 100).toPrecision(4) + "%"
            );
            var a = c.a;
            if (a >= 1) {
                a = 1;
                rval = "hsl(" + mid + ")";
            } else {
                if (a <= 0) {
                    a = 0;
                }
                rval = "hsla(" + mid + "," + a + ")";
            }
            this._hslString = rval;
        }
        return rval;
    },

    "toRGBString": function () {
        var c = this.rgb;
        var ccc = MochiKit.Visual.clampColorComponent;
        var rval = this._rgbString;
        if (!rval) {
            var mid = (
                ccc(c.r, 255).toFixed(0)
                + "," + ccc(c.g, 255).toFixed(0)
                + "," + ccc(c.b, 255).toFixed(0)
            );
            if (c.a != 1) {
                rval = "rgba(" + mid + "," + c.a + ")";
            } else {
                rval = "rgb(" + mid + ")";
            }
            this._rgbString = rval;
        }
        return rval;
    },

    "asRGB": function () {
        return MochiKit.Base.clone(this.rgb);
    },

    "toHexString": function () {
        var m = MochiKit.Visual;
        var c = this.rgb;
        var ccc = MochiKit.Visual.clampColorComponent;
        var rval = this._hexString;
        if (!rval) {
            rval = ("#" + 
                m.toColorPart(ccc(c.r, 255)) +
                m.toColorPart(ccc(c.g, 255)) +
                m.toColorPart(ccc(c.b, 255))
            );
            this._hexString = rval;
        }
        return rval;
    },

    "asHSV": function () {
        var hsv = this.hsv;
        var c = this.rgb;
        if (typeof(hsv) == 'undefined' || hsv == null) {
            hsv = MochiKit.Visual.rgbToHSV(this.rgb);
            this.hsv = hsv;
        }
        return MochiKit.Base.clone(hsv);
    },

    "asHSL": function () {
        var hsl = this.hsl;
        var c = this.rgb;
        if (typeof(hsl) == 'undefined' || hsl == null) {
            hsl = MochiKit.Visual.rgbToHSL(this.rgb);
            this.hsl = hsl;
        }
        return MochiKit.Base.clone(hsl);
    },

    "toString": function () {
        return this.toRGBString();
    },

    "repr": function () {
        var c = this.rgb;
        var col = [c.r, c.g, c.b, c.a];
        return this.__class__.NAME + "(" + col.join(", ") + ")";
    }

};

MochiKit.Visual.Color.fromRGB = function (red, green, blue, alpha) {
    // designated initializer
    var Color = MochiKit.Visual.Color;
    if (arguments.length == 1) {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        alpha = rgb.a;
    }
    return new Color(red, green, blue, alpha);
};

MochiKit.Visual.Color.fromHSL = function (hue, saturation, lightness, alpha) {
    var m = MochiKit.Visual;
    return m.Color.fromRGB(m.hslToRGB.apply(m, arguments));
};

MochiKit.Visual.Color.fromHSV = function (hue, saturation, value, alpha) {
    var m = MochiKit.Visual;
    return m.Color.fromRGB(m.hsvToRGB.apply(m, arguments));
};

MochiKit.Visual.Color.fromName = function (name) {
    var Color = MochiKit.Visual.Color;
    var htmlColor = Color._namedColors[name.toLowerCase()];
    if (typeof(htmlColor) == 'string') {
        return Color.fromHexString(htmlColor);
    } else if (name == "transparent") {
        return Color.transparentColor();
    }
    return null;
};

MochiKit.Visual.Color.fromString = function (colorString) {
    // TODO: support RGBA
    var self = MochiKit.Visual.Color;
    var three = colorString.substr(0, 3);
    if (three == "rgb") {
        return self.fromRGBString(colorString);
    } else if (three == "hsl") {
        return self.fromHSLString(colorString);
    } else if (colorString.charAt(0) == "#") {
        return self.fromHexString(colorString);
    }
    return self.fromName(colorString);
};


MochiKit.Visual.Color.fromHexString = function (hexCode) {
    if (hexCode.charAt(0) == '#') {
        hexCode = hexCode.substring(1);
    }
    var components = [];
    if (hexCode.length == 3) {
        for (var i = 0; i < 3; i++) {
            var hex = hexCode.substr(i, 1);
            components.push(parseInt(hex + hex, 16) / 255.0);
        }
    } else {
        for (var i = 0; i < 6; i += 2) {
            var hex = hexCode.substr(i, 2);
            components.push(parseInt(hex, 16) / 255.0);
        }
    }
    var Color = MochiKit.Visual.Color;
    return Color.fromRGB.apply(Color, components);
};
        

MochiKit.Visual.Color._fromColorString = function (pre, method, scales, colorCode) {
    // parses either HSL or RGB
    if (colorCode.indexOf(pre) == 0) {
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
};
    
MochiKit.Visual.Color.fromBackground = function (elem) {
    var m = MochiKit.Visual;
    for (elem = MochiKit.DOM.getElement(elem); elem; elem = elem.parentNode) {
        var actualColor = m.getElementsComputedStyle(
            elem,
            "backgroundColor",
            "background-color"
        );
        if (!actualColor) {
            continue;
        }
        var color = m.Color.fromString(actualColor);
        if (!color) {
            break;
        }
        if (color.asRGB().a > 0) {
            return color;
        }
    }
    return m.Color.whiteColor();
};

MochiKit.Visual._hslValue = function (n1, n2, hue) {
    if (hue > 6.0) {
        hue -= 6.0;
    } else if (hue < 0.0) {
        hue += 6.0;
    }
    var val;
    if (hue < 1.0) {
        val = n1 + (n2 - n1) * hue;
    } else if (hue < 3.0) {
        val = n2;
    } else if (hue < 4.0) {
        val = n1 + (n2 - n1) * (4.0 - hue);
    } else {
        val = n1;
    }
    return val;
};
    
MochiKit.Visual.hsvToRGB = function (hue, saturation, value, alpha) {
    if (arguments.length == 1) {
        var hsv = hue;
        hue = hsv.h;
        saturation = hsv.s;
        value = hsv.v;
        alpha = hsv.a;
    }
    var red;
    var green;
    var blue;
    if (saturation == 0.0) {
        red = 0;
        green = 0;
        blue = 0;
    } else {
        var i = Math.floor(hue * 6);
        var f = (hue * 6) - i;
        var p = value * (1 - saturation);
        var q = value * (1 - (saturation * f));
        var t = value * (1 - (saturation * (1 - f)));
        switch (i) {
            case 1: red = q; green = value; blue = p; break;
            case 2: red = p; green = value; blue = t; break;
            case 3: red = p; green = q; blue = value; break;
            case 4: red = t; green = p; blue = value; break;
            case 5: red = value; green = p; blue = q; break;
            case 6: // fall through
            case 0: red = value; green = t; blue = p; break;
        }
    }
    return {
        "r": red,
        "g": green,
        "b": blue,
        "a": alpha
    };
}

MochiKit.Visual.hslToRGB = function (hue, saturation, lightness, alpha) {
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
    if (saturation == 0) {
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
        var f = MochiKit.Visual._hslValue;
        var h6 = hue * 6.0;
        red = f(m1, m2, h6 + 2);
        green = f(m1, m2, h6);
        blue = f(m1, m2, h6 - 2);
    }
    return {
        "r": red,
        "g": green,
        "b": blue,
        "a": alpha
    };
};

MochiKit.Visual.rgbToHSV = function (red, green, blue, alpha) {
    if (arguments.length == 1) {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        alpha = rgb.a;
    }
    var max = Math.max(Math.max(red, green), blue);
    var min = Math.min(Math.min(red, green), blue);
    var hue;
    var saturation;
    var value = max;
    if (min == max) {
        hue = 0;
        saturation = 0;
    } else {
        var delta = (max - min);
        saturation = delta / max;

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
        "h": hue,
        "s": saturation,
        "v": value,
        "a": alpha
    };
};
        
    
MochiKit.Visual.rgbToHSL = function (red, green, blue, alpha) {
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
    if (delta == 0) {
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
        "h": hue,
        "s": saturation,
        "l": lightness,
        "a": alpha
    };
};

MochiKit.Visual.toColorPart = function (num) {
    var digits = Math.round(num).toString(16);
    if (num < 16) {
        return '0' + digits;
    }
    return digits;
};

MochiKit.Visual.roundElement = function (e, options) {
    new MochiKit.Visual._RoundCorners(e, options);
};

/*
    The following section is partially adapted from
    Rico <http://www.openrico.org>
*/

MochiKit.Visual.getElementsComputedStyle = function (htmlElement, cssProperty, mozillaEquivalentCSS) {
    if (arguments.length == 2) {
        mozillaEquivalentCSS = cssProperty;
    }
    var el = MochiKit.DOM.getElement(htmlElement);
    if (el.currentStyle) {
        return el.currentStyle[cssProperty];
    } else {
        var style = document.defaultView.getComputedStyle(el, null);
        if (!style) {
            return undefined;
        }
        return style.getPropertyValue(mozillaEquivalentCSS);
    }
};

MochiKit.Visual._RoundCorners = function (e, options) {
    var e = MochiKit.DOM.getElement(e);
    this._setOptions(options);

    var color = this.options.color;
    var m = MochiKit.Visual;
    if (this.options.color == "fromElement") {
        color = m.Color.fromBackground(e);
    } else if (!(color instanceof m.Color)) {
        color = m.Color.fromString(color);
    }
    this.isTransparent = (color.asRGB().a <= 0);

    var bgColor = this.options.bgColor;
    if (this.options.bgColor == "fromParent") {
        bgColor = m.Color.fromBackground(e.offsetParent);
    } else if (!(bgColor instanceof m.Color)) {
        bgColor = m.Color.fromString(bgColor);
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
        corner.style.backgroundColor = bgColor.toString();
        return corner;
    },

    "_createCornerSlice": function (color, bgColor, n, position) {
        var slice = document.createElement("span");

        var inStyle = slice.style;
        inStyle.backgroundColor = color.toString();
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
            inStyle.borderColor = borderColor.toString();
        } else if (borderColor) {
            inStyle.borderColor = borderColor.toString();
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
            return bgColor.blendedColor(color);
        }
        return "";
    },


    "_setMargin": function (el, n, corners) {
        var marginSize = this._marginSize(n) + "px";
        var whichSide = (
            corners == "top" ? this._whichSideTop() : this._whichSideBottom()
        );
        var style = el.style;

        if (whichSide == "left") {
            style.marginLeft = marginSize;
            style.marginRight = "0px";
        } else if (whichSide == "right") {
            style.marginRight = marginSize;
            style.marginLeft  = "0px";
        } else {
            style.marginLeft = marginSize;
            style.marginRight = marginSize;
        }
    },

    "_setBorder": function (el, n, corners) {
        var borderSize = this._borderSize(n) + "px";
        var whichSide = (
            corners == "top" ? this._whichSideTop() : this._whichSideBottom()
        );

        var style = el.style;
        if (whichSide == "left") {
            style.borderLeftWidth = borderSize;
            style.borderRightWidth = "0px";
        } else if (whichSide == "right") {
            style.borderRightWidth = borderSize;
            style.borderLeftWidth  = "0px";
        } else {
            style.borderLeftWidth = borderSize;
            style.borderRightWidth = borderSize;
        }
    },

    "_marginSize": function (n) {
        if (this.isTransparent) {
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
        var borderSizes;
        if (o.compact && (o.blend || this.isTransparent)) {
            return 1;
        } else if (o.compact) {
            borderSizes = [1, 0];
        } else if (o.blend) {
            borderSizes = [2, 1, 1, 1];
        } else if (o.border) {
            borderSizes = [0, 2, 0, 0];
        } else if (this.isTransparent) {
            borderSizes = [5, 3, 2, 1];
        } else {
            return 0;
        }
        return borderSizes[n];
    },

    "_hasString": function (str) {
        for (var i = 1; i< arguments.length; i++) {
            if (str.indexOf(arguments[i]) != -1) {
                return true;
            }
        }
        return false;
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
    var bind = MochiKit.Base.bind;
    var map = MochiKit.Base.map;
    var concat = MochiKit.Base.concat;
    this.Color.fromRGBString = bind(
        this.Color._fromColorString, this.Color, "rgb", "fromRGB",
        [1.0/255.0, 1.0/255.0, 1.0/255.0, 1]
    );
    this.Color.fromHSLString = bind(
        this.Color._fromColorString, this.Color, "hsl", "fromHSL",
        [1.0/360.0, 0.01, 0.01, 1]
    );
    
    var third = 1.0 / 3.0;
    var colors = {
        // NSColor colors plus transparent
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
        transparent: [0, 0, 0, 0],
        white: [1, 1, 1],
        yellow: [1, 1, 0]
    };

    var makeColor = function (name, r, g, b, a) {
        var rval = this.fromRGB(r, g, b, a);
        this[name] = function () { return rval; };
        return rval;
    }

    for (var k in colors) {
        var name = k + "Color";
        var bindArgs = concat(
            [makeColor, this.Color, name],
            colors[k]
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

    MochiKit.Base.registerComparator(this.Color.NAME, isColor, compareColor);
        
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": MochiKit.Base.concat(this.EXPORT, this.EXPORT_OK)
    };

    MochiKit.Base.nameFunctions(this);

};

MochiKit.Visual.EXPORT = [
    "Color",
    "roundElement",
    "roundClass"
];

MochiKit.Visual.EXPORT_OK = [
    "clampColorComponent",
    "rgbToHSL",
    "hslToRGB",
    "rgbToHSV",
    "hsvToRGB",
    "toColorPart"
];

MochiKit.Visual.__new__();

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.Visual);
}

// Full table of css3 X11 colors <http://www.w3.org/TR/css3-color/#X11COLORS>
MochiKit.Visual.Color.namedColors = function () {
    return MochiKit.Base.clone(MochiKit.Visual.Color._namedColors);
}

MochiKit.Visual.Color._namedColors = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkgrey: "#a9a9a9",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkslategrey: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    grey: "#808080",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};
