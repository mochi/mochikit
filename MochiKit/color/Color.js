import fromRGB from './fromRGB';

export default class Color {
    constructor(r, g, b, a = 1.0) {
        this.rgb = { r, g, b, a };
    }

    colorWithAlpha(alpha) {
        var rgb = this.rgb;
        return fromRGB(rgb.r, rgb.g, rgb.b, alpha);
    }
}

MochiKit.Color.Color.prototype = {
    __class__: MochiKit.Color.Color,

    /** @id MochiKit.Color.Color.prototype.colorWithHue */
    colorWithHue: function(hue) {
        // get an HSL model, and set the new hue...
        var hsl = this.asHSL();
        hsl.h = hue;
        var m = MochiKit.Color;
        // convert back to RGB...
        return m.Color.fromHSL(hsl);
    },

    /** @id MochiKit.Color.Color.prototype.colorWithSaturation */
    colorWithSaturation: function(saturation) {
        // get an HSL model, and set the new hue...
        var hsl = this.asHSL();
        hsl.s = saturation;
        var m = MochiKit.Color;
        // convert back to RGB...
        return m.Color.fromHSL(hsl);
    },

    /** @id MochiKit.Color.Color.prototype.colorWithLightness */
    colorWithLightness: function(lightness) {
        // get an HSL model, and set the new hue...
        var hsl = this.asHSL();
        hsl.l = lightness;
        var m = MochiKit.Color;
        // convert back to RGB...
        return m.Color.fromHSL(hsl);
    },

    /** @id MochiKit.Color.Color.prototype.darkerColorWithLevel */
    darkerColorWithLevel: function(level) {
        var hsl = this.asHSL();
        hsl.l = Math.max(hsl.l - level, 0);
        var m = MochiKit.Color;
        return m.Color.fromHSL(hsl);
    },

    /** @id MochiKit.Color.Color.prototype.lighterColorWithLevel */
    lighterColorWithLevel: function(level) {
        var hsl = this.asHSL();
        hsl.l = Math.min(hsl.l + level, 1);
        var m = MochiKit.Color;
        return m.Color.fromHSL(hsl);
    },

    /** @id MochiKit.Color.Color.prototype.blendedColor */
    blendedColor: function(other, /* optional */ fraction) {
        if (typeof fraction == 'undefined' || fraction === null) {
            fraction = 0.5;
        }
        var sf = 1.0 - fraction;
        var s = this.rgb;
        var d = other.rgb;
        var df = fraction;
        return MochiKit.Color.Color.fromRGB(
            s.r * sf + d.r * df,
            s.g * sf + d.g * df,
            s.b * sf + d.b * df,
            s.a * sf + d.a * df
        );
    },

    /** @id MochiKit.Color.Color.prototype.compareRGB */
    compareRGB: function(other) {
        var a = this.asRGB();
        var b = other.asRGB();
        return MochiKit.Base.compare(
            [a.r, a.g, a.b, a.a],
            [b.r, b.g, b.b, b.a]
        );
    },

    /** @id MochiKit.Color.Color.prototype.isLight */
    isLight: function() {
        return this.asHSL().l > 0.5;
    },

    /** @id MochiKit.Color.Color.prototype.isDark */
    isDark: function() {
        return !this.isLight();
    },

    /** @id MochiKit.Color.Color.prototype.toHSLString */
    toHSLString: function() {
        var c = this.asHSL();
        var ccc = MochiKit.Color.clampColorComponent;
        var rval = this._hslString;
        if (!rval) {
            var mid =
                ccc(c.h, 360).toFixed(0) +
                ',' +
                ccc(c.s, 100).toPrecision(4) +
                '%' +
                ',' +
                ccc(c.l, 100).toPrecision(4) +
                '%';
            var a = c.a;
            if (a >= 1) {
                a = 1;
                rval = 'hsl(' + mid + ')';
            } else {
                if (a <= 0) {
                    a = 0;
                }
                rval = 'hsla(' + mid + ',' + a + ')';
            }
            this._hslString = rval;
        }
        return rval;
    },

    /** @id MochiKit.Color.Color.prototype.toRGBString */
    toRGBString: function() {
        var c = this.rgb;
        var ccc = MochiKit.Color.clampColorComponent;
        var rval = this._rgbString;
        if (!rval) {
            var mid =
                ccc(c.r, 255).toFixed(0) +
                ',' +
                ccc(c.g, 255).toFixed(0) +
                ',' +
                ccc(c.b, 255).toFixed(0);
            if (c.a != 1) {
                rval = 'rgba(' + mid + ',' + c.a + ')';
            } else {
                rval = 'rgb(' + mid + ')';
            }
            this._rgbString = rval;
        }
        return rval;
    },

    /** @id MochiKit.Color.Color.prototype.asRGB */
    asRGB: function() {
        return MochiKit.Base.clone(this.rgb);
    },

    /** @id MochiKit.Color.Color.prototype.toHexString */
    toHexString: function() {
        var m = MochiKit.Color;
        var c = this.rgb;
        var ccc = MochiKit.Color.clampColorComponent;
        var rval = this._hexString;
        if (!rval) {
            rval =
                '#' +
                m.toColorPart(ccc(c.r, 255)) +
                m.toColorPart(ccc(c.g, 255)) +
                m.toColorPart(ccc(c.b, 255));
            this._hexString = rval;
        }
        return rval;
    },

    /** @id MochiKit.Color.Color.prototype.asHSV */
    asHSV: function() {
        var hsv = this.hsv;
        var c = this.rgb;
        if (typeof hsv == 'undefined' || hsv === null) {
            hsv = MochiKit.Color.rgbToHSV(this.rgb);
            this.hsv = hsv;
        }
        return MochiKit.Base.clone(hsv);
    },

    /** @id MochiKit.Color.Color.prototype.asHSL */
    asHSL: function() {
        var hsl = this.hsl;
        var c = this.rgb;
        if (typeof hsl == 'undefined' || hsl === null) {
            hsl = MochiKit.Color.rgbToHSL(this.rgb);
            this.hsl = hsl;
        }
        return MochiKit.Base.clone(hsl);
    },

    /** @id MochiKit.Color.Color.prototype.toString */
    toString: function() {
        return this.toRGBString();
    },

    /** @id MochiKit.Color.Color.prototype.repr */
    repr: function() {
        var c = this.rgb;
        var col = [c.r, c.g, c.b, c.a];
        return this.__class__.NAME + '(' + col.join(', ') + ')';
    }
};
