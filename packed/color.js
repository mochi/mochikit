/**
  * @license
  * MochiKit <https://mochi.github.io/mochikit> 
  * Making JavaScript better and easier with a consistent, clean API.
  * Built at "Mon Sep 10 2018 17:22:17 GMT+0100 (British Summer Time)".
  * Command line options: "async base color data datetime dom func iter logging repr"
 */
this.mochikit = this.mochikit || {};
this.mochikit.color = (function (exports) {
    'use strict';

    function clampColorComponent(v, scale) {
        v *= scale;
        return v < 0 ? 0 : v > scale ? scale : v;
    }

    class Color {
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

    const third = 1.0 / 3.0,
    third2 = third * 2;
    function createFactory(r, g, b) {
        return function (a) {
            return new Color(r, g, b, a);
        };
    }

    function createLockedFactory(r, g, b, a) {
        let factory = createFactory(r, g, b);
        
        return function () {
            return factory(a);
        };
    }

    const blackColor = createFactory(0, 0, 0),
    blueColor = createFactory(0, 0, 1),
    brownColor = createFactory(0.6, 0.4, 0.2),
    cyanColor = createFactory(0, 1, 1),
    darkGrayColor = createFactory(third, third, third),
    grayColor = createFactory(0.5, 0.5, 0.5),
    greenColor = createFactory(0, 1, 0),
    lightGrayColor = createFactory(third2, third2, third2),
    magentaColor = createFactory(1, 0, 1),
    orangeColor = createFactory(1, 0.5, 0),
    purpleColor = createFactory(0.5, 0, 0.5),
    redColor = createFactory(1, 0, 0),
    transparentColor = createLockedFactory(0, 0, 0, 0),
    whiteColor = createFactory(1, 1, 1),
    yellowColor = createFactory(1, 1, 0);

    var colors = /*#__PURE__*/Object.freeze({
        blackColor: blackColor,
        blueColor: blueColor,
        brownColor: brownColor,
        cyanColor: cyanColor,
        darkGrayColor: darkGrayColor,
        grayColor: grayColor,
        greenColor: greenColor,
        lightGrayColor: lightGrayColor,
        magentaColor: magentaColor,
        orangeColor: orangeColor,
        purpleColor: purpleColor,
        redColor: redColor,
        transparentColor: transparentColor,
        whiteColor: whiteColor,
        yellowColor: yellowColor
    });

    function fromColorString(pre, method, scales, colorCode) {
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

    function fromHexString(hexCode) {
        if (hexCode[0] == '#') {
            hexCode = hexCode.substring(1);
        }
        var components = [];
        var i, hex;
        if (hexCode.length == 3) {
            for (i = 0; i < 3; i++) {
                hex = hexCode.substr(i, 1);
                components.push(parseInt(hex + hex, 16) / 255.0);
            }
        } else {
            for (i = 0; i < 6; i += 2) {
                hex = hexCode.substr(i, 2);
                components.push(parseInt(hex, 16) / 255.0);
            }
        }

        let [r, g, b, a] = components;
        return new Color(r, g, b, a);
    }

    function hslToRGB(hue, saturation, lightness, alpha) {
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
        if (saturation === 0) {
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
            var f = MochiKit.Color._hslValue;
            var h6 = hue * 6.0;
            red = f(m1, m2, h6 + 2);
            green = f(m1, m2, h6);
            blue = f(m1, m2, h6 - 2);
        }
        return {
            r: red,
            g: green,
            b: blue,
            a: alpha
        };
    }

    function fromRGB(red, green, blue, alpha) {
        if (arguments.length == 1) {
            var rgb = red;
            red = rgb.r;
            green = rgb.g;
            blue = rgb.b;
            if (typeof(rgb.a) == 'undefined') {
                alpha = undefined;
            } else {
                alpha = rgb.a;
            }
        }
        return new Color(red, green, blue, alpha);
    }

    function fromHSL(...args/*hue, saturation, lightness, alpha*/) {
        return fromRGB(hslToRGB(...args));
    }

    function partial(func, ...args) {
        return function (...nargs) {
            return func.call(this, ...args, ...nargs);
        }
    }

    var fromHSLString = partial(fromColorString, 'hsl', 'fromHSL', [1.0/360.0, 0.01, 0.01, 1]);

    function hsvToRGB(hue, saturation, value, alpha) {
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
        if (saturation === 0) {
            red = value;
            green = value;
            blue = value;
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

        return new Color(red, green, blue, alpha);
    }

    function fromHSV(...args /* hue, saturation, value, alpha */) {
        return fromRGB(hsvToRGB(...args));
    }

    function fromName(name) {
        var htmlColor = colors[name.toLowerCase()];
        if (typeof(htmlColor) == 'string') {
            return fromHexString(htmlColor);
        } else if (name == "transparent") {
            return transparentColor();
        }
        return null;
    }

    const result = 1.0/255;
    var fromRGBString = partial(fromColorString, 'rgb', 'fromrgb', [result, result, result, 1]);

    function fromString(colorString) {
        var three = colorString.substr(0, 3);
        if (three == "rgb") {
            return fromRGBString(colorString);
        } else if (three == "hsl") {
            return fromHSLString(colorString);
        } else if (colorString.charAt(0) == "#") {
            return fromHexString(colorString);
        }
        return fromName(colorString);
    }

    class HSLColor {
        constructor(h, s, l, opacity = 1) {
            this.h = +h;
            this.s = +s;
            this.l = +l;
            this.opacity = opacity;
        }
    }

    function hslValue(n1, n2, hue) {
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
    }

    class HSVColor {
        constructor(h, s, v, opacity = 1) {
            this.h = +h;
            this.s = +s;
            this.v = +v;
            this.opacity = opacity;
        }
    }

    function isColor(...args) {
        return args.every((a) => a && a instanceof Color);
    }

    const aliceblue = '#f0f8ff',
        antiquewhiteHex = '#faebd7',
        aquaHex = '#00ffff',
        aquamarineHex = '#7fffd4',
        azureHex = '#f0ffff',
        beigeHex = '#f5f5dc',
        bisqueHex = '#ffe4c4',
        blackHex = '#000000',
        blanchedalmondHex = '#ffebcd',
        blueHex = '#0000ff',
        bluevioletHex = '#8a2be2',
        brownHex = '#a52a2a',
        burlywoodHex = '#deb887',
        cadetblueHex = '#5f9ea0',
        chartreuseHex = '#7fff00',
        chocolateHex = '#d2691e',
        coralHex = '#ff7f50',
        cornflowerblueHex = '#6495ed',
        cornsilkHex = '#fff8dc',
        crimsonHex = '#dc143c',
        cyanHex = '#00ffff',
        darkblueHex = '#00008b',
        darkcyanHex = '#008b8b',
        darkgoldenrodHex = '#b8860b',
        darkgrayHex = '#a9a9a9',
        darkgreenHex = '#006400',
        darkgreyHex = '#a9a9a9',
        darkkhakiHex = '#bdb76b',
        darkmagentaHex = '#8b008b',
        darkolivegreenHex = '#556b2f',
        darkorangeHex = '#ff8c00',
        darkorchidHex = '#9932cc',
        darkredHex = '#8b0000',
        darksalmonHex = '#e9967a',
        darkseagreenHex = '#8fbc8f',
        darkslateblueHex = '#483d8b',
        darkslategrayHex = '#2f4f4f',
        darkslategreyHex = '#2f4f4f',
        darkturquoiseHex = '#00ced1',
        darkvioletHex = '#9400d3',
        deeppinkHex = '#ff1493',
        deepskyblueHex = '#00bfff',
        dimgrayHex = '#696969',
        dimgreyHex = '#696969',
        dodgerblueHex = '#1e90ff',
        firebrickHex = '#b22222',
        floralwhiteHex = '#fffaf0',
        forestgreenHex = '#228b22',
        fuchsiaHex = '#ff00ff',
        gainsboroHex = '#dcdcdc',
        ghostwhiteHex = '#f8f8ff',
        goldHex = '#ffd700',
        goldenrodHex = '#daa520',
        grayHex = '#808080',
        greenHex = '#008000',
        greenyellowHex = '#adff2f',
        greyHex = '#808080',
        honeydewHex = '#f0fff0',
        hotpinkHex = '#ff69b4',
        indianredHex = '#cd5c5c',
        indigoHex = '#4b0082',
        ivoryHex = '#fffff0',
        khakiHex = '#f0e68c',
        lavenderHex = '#e6e6fa',
        lavenderblushHex = '#fff0f5',
        lawngreenHex = '#7cfc00',
        lemonchiffonHex = '#fffacd',
        lightblueHex = '#add8e6',
        lightcoralHex = '#f08080',
        lightcyanHex = '#e0ffff',
        lightgoldenrodyellowHex = '#fafad2',
        lightgrayHex = '#d3d3d3',
        lightgreenHex = '#90ee90',
        lightgreyHex = '#d3d3d3',
        lightpinkHex = '#ffb6c1',
        lightsalmonHex = '#ffa07a',
        lightseagreenHex = '#20b2aa',
        lightskyblueHex = '#87cefa',
        lightslategrayHex = '#778899',
        lightslategreyHex = '#778899',
        lightsteelblueHex = '#b0c4de',
        lightyellowHex = '#ffffe0',
        limeHex = '#00ff00',
        limegreenHex = '#32cd32',
        linenHex = '#faf0e6',
        magentaHex = '#ff00ff',
        maroonHex = '#800000',
        mediumaquamarineHex = '#66cdaa',
        mediumblueHex = '#0000cd',
        mediumorchidHex = '#ba55d3',
        mediumpurpleHex = '#9370db',
        mediumseagreenHex = '#3cb371',
        mediumslateblueHex = '#7b68ee',
        mediumspringgreenHex = '#00fa9a',
        mediumturquoiseHex = '#48d1cc',
        mediumvioletredHex = '#c71585',
        midnightblueHex = '#191970',
        mintcreamHex = '#f5fffa',
        mistyroseHex = '#ffe4e1',
        moccasinHex = '#ffe4b5',
        navajowhiteHex = '#ffdead',
        navyHex = '#000080',
        oldlaceHex = '#fdf5e6',
        oliveHex = '#808000',
        olivedrabHex = '#6b8e23',
        orangeHex = '#ffa500',
        orangeredHex = '#ff4500',
        orchidHex = '#da70d6',
        palegoldenrodHex = '#eee8aa',
        palegreenHex = '#98fb98',
        paleturquoiseHex = '#afeeee',
        palevioletredHex = '#db7093',
        papayawhipHex = '#ffefd5',
        peachpuffHex = '#ffdab9',
        peruHex = '#cd853f',
        pinkHex = '#ffc0cb',
        plumHex = '#dda0dd',
        powderblueHex = '#b0e0e6',
        purpleHex = '#800080',
        redHex = '#ff0000',
        rosybrownHex = '#bc8f8f',
        royalblueHex = '#4169e1',
        saddlebrownHex = '#8b4513',
        salmonHex = '#fa8072',
        sandybrownHex = '#f4a460',
        seagreenHex = '#2e8b57',
        seashellHex = '#fff5ee',
        siennaHex = '#a0522d',
        silverHex = '#c0c0c0',
        skyblueHex = '#87ceeb',
        slateblueHex = '#6a5acd',
        slategrayHex = '#708090',
        slategreyHex = '#708090',
        snowHex = '#fffafa',
        springgreenHex = '#00ff7f',
        steelblueHex = '#4682b4',
        tanHex = '#d2b48c',
        tealHex = '#008080',
        thistleHex = '#d8bfd8',
        tomatoHex = '#ff6347',
        turquoiseHex = '#40e0d0',
        violetHex = '#ee82ee',
        wheatHex = '#f5deb3',
        whiteHex = '#ffffff',
        whitesmokeHex = '#f5f5f5',
        yellowHex = '#ffff00',
        yellowgreenHex = '#9acd32';

    function rgbToHSL(red, green, blue, alpha) {
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
        if (delta === 0) {
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
            h: hue,
            s: saturation,
            l: lightness,
            a: alpha
        };
    }

    function rgbToHSV(red, green, blue, alpha) {
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
                h: hue,
                s: saturation,
                v: value,
                a: alpha
            };
        }

    function toColorPart(num) {
        num = Math.round(num);
        var digits = num.toString(16);
        if (num < 16) {
            return '0' + digits;
        }
        return digits;
    }

    const __repr__ = '[MochiKit.Color]';

    exports.__repr__ = __repr__;
    exports.clampColorComponent = clampColorComponent;
    exports.Color = Color;
    exports.fromColorString = fromColorString;
    exports.fromHexString = fromHexString;
    exports.fromHSL = fromHSL;
    exports.fromHSLString = fromHSLString;
    exports.fromHSV = fromHSV;
    exports.fromName = fromName;
    exports.fromRGB = fromRGB;
    exports.fromRGBString = fromRGBString;
    exports.fromString = fromString;
    exports.HSLColor = HSLColor;
    exports.hslToRGB = hslToRGB;
    exports.hslValue = hslValue;
    exports.HSVColor = HSVColor;
    exports.hsvToRGB = hsvToRGB;
    exports.isColor = isColor;
    exports.rgbToHSL = rgbToHSL;
    exports.rgbToHSV = rgbToHSV;
    exports.toColorPart = toColorPart;
    exports.blackColor = blackColor;
    exports.blueColor = blueColor;
    exports.brownColor = brownColor;
    exports.cyanColor = cyanColor;
    exports.darkGrayColor = darkGrayColor;
    exports.grayColor = grayColor;
    exports.greenColor = greenColor;
    exports.lightGrayColor = lightGrayColor;
    exports.magentaColor = magentaColor;
    exports.orangeColor = orangeColor;
    exports.purpleColor = purpleColor;
    exports.redColor = redColor;
    exports.transparentColor = transparentColor;
    exports.whiteColor = whiteColor;
    exports.yellowColor = yellowColor;
    exports.aliceblue = aliceblue;
    exports.antiquewhiteHex = antiquewhiteHex;
    exports.aquaHex = aquaHex;
    exports.aquamarineHex = aquamarineHex;
    exports.azureHex = azureHex;
    exports.beigeHex = beigeHex;
    exports.bisqueHex = bisqueHex;
    exports.blackHex = blackHex;
    exports.blanchedalmondHex = blanchedalmondHex;
    exports.blueHex = blueHex;
    exports.bluevioletHex = bluevioletHex;
    exports.brownHex = brownHex;
    exports.burlywoodHex = burlywoodHex;
    exports.cadetblueHex = cadetblueHex;
    exports.chartreuseHex = chartreuseHex;
    exports.chocolateHex = chocolateHex;
    exports.coralHex = coralHex;
    exports.cornflowerblueHex = cornflowerblueHex;
    exports.cornsilkHex = cornsilkHex;
    exports.crimsonHex = crimsonHex;
    exports.cyanHex = cyanHex;
    exports.darkblueHex = darkblueHex;
    exports.darkcyanHex = darkcyanHex;
    exports.darkgoldenrodHex = darkgoldenrodHex;
    exports.darkgrayHex = darkgrayHex;
    exports.darkgreenHex = darkgreenHex;
    exports.darkgreyHex = darkgreyHex;
    exports.darkkhakiHex = darkkhakiHex;
    exports.darkmagentaHex = darkmagentaHex;
    exports.darkolivegreenHex = darkolivegreenHex;
    exports.darkorangeHex = darkorangeHex;
    exports.darkorchidHex = darkorchidHex;
    exports.darkredHex = darkredHex;
    exports.darksalmonHex = darksalmonHex;
    exports.darkseagreenHex = darkseagreenHex;
    exports.darkslateblueHex = darkslateblueHex;
    exports.darkslategrayHex = darkslategrayHex;
    exports.darkslategreyHex = darkslategreyHex;
    exports.darkturquoiseHex = darkturquoiseHex;
    exports.darkvioletHex = darkvioletHex;
    exports.deeppinkHex = deeppinkHex;
    exports.deepskyblueHex = deepskyblueHex;
    exports.dimgrayHex = dimgrayHex;
    exports.dimgreyHex = dimgreyHex;
    exports.dodgerblueHex = dodgerblueHex;
    exports.firebrickHex = firebrickHex;
    exports.floralwhiteHex = floralwhiteHex;
    exports.forestgreenHex = forestgreenHex;
    exports.fuchsiaHex = fuchsiaHex;
    exports.gainsboroHex = gainsboroHex;
    exports.ghostwhiteHex = ghostwhiteHex;
    exports.goldHex = goldHex;
    exports.goldenrodHex = goldenrodHex;
    exports.grayHex = grayHex;
    exports.greenHex = greenHex;
    exports.greenyellowHex = greenyellowHex;
    exports.greyHex = greyHex;
    exports.honeydewHex = honeydewHex;
    exports.hotpinkHex = hotpinkHex;
    exports.indianredHex = indianredHex;
    exports.indigoHex = indigoHex;
    exports.ivoryHex = ivoryHex;
    exports.khakiHex = khakiHex;
    exports.lavenderHex = lavenderHex;
    exports.lavenderblushHex = lavenderblushHex;
    exports.lawngreenHex = lawngreenHex;
    exports.lemonchiffonHex = lemonchiffonHex;
    exports.lightblueHex = lightblueHex;
    exports.lightcoralHex = lightcoralHex;
    exports.lightcyanHex = lightcyanHex;
    exports.lightgoldenrodyellowHex = lightgoldenrodyellowHex;
    exports.lightgrayHex = lightgrayHex;
    exports.lightgreenHex = lightgreenHex;
    exports.lightgreyHex = lightgreyHex;
    exports.lightpinkHex = lightpinkHex;
    exports.lightsalmonHex = lightsalmonHex;
    exports.lightseagreenHex = lightseagreenHex;
    exports.lightskyblueHex = lightskyblueHex;
    exports.lightslategrayHex = lightslategrayHex;
    exports.lightslategreyHex = lightslategreyHex;
    exports.lightsteelblueHex = lightsteelblueHex;
    exports.lightyellowHex = lightyellowHex;
    exports.limeHex = limeHex;
    exports.limegreenHex = limegreenHex;
    exports.linenHex = linenHex;
    exports.magentaHex = magentaHex;
    exports.maroonHex = maroonHex;
    exports.mediumaquamarineHex = mediumaquamarineHex;
    exports.mediumblueHex = mediumblueHex;
    exports.mediumorchidHex = mediumorchidHex;
    exports.mediumpurpleHex = mediumpurpleHex;
    exports.mediumseagreenHex = mediumseagreenHex;
    exports.mediumslateblueHex = mediumslateblueHex;
    exports.mediumspringgreenHex = mediumspringgreenHex;
    exports.mediumturquoiseHex = mediumturquoiseHex;
    exports.mediumvioletredHex = mediumvioletredHex;
    exports.midnightblueHex = midnightblueHex;
    exports.mintcreamHex = mintcreamHex;
    exports.mistyroseHex = mistyroseHex;
    exports.moccasinHex = moccasinHex;
    exports.navajowhiteHex = navajowhiteHex;
    exports.navyHex = navyHex;
    exports.oldlaceHex = oldlaceHex;
    exports.oliveHex = oliveHex;
    exports.olivedrabHex = olivedrabHex;
    exports.orangeHex = orangeHex;
    exports.orangeredHex = orangeredHex;
    exports.orchidHex = orchidHex;
    exports.palegoldenrodHex = palegoldenrodHex;
    exports.palegreenHex = palegreenHex;
    exports.paleturquoiseHex = paleturquoiseHex;
    exports.palevioletredHex = palevioletredHex;
    exports.papayawhipHex = papayawhipHex;
    exports.peachpuffHex = peachpuffHex;
    exports.peruHex = peruHex;
    exports.pinkHex = pinkHex;
    exports.plumHex = plumHex;
    exports.powderblueHex = powderblueHex;
    exports.purpleHex = purpleHex;
    exports.redHex = redHex;
    exports.rosybrownHex = rosybrownHex;
    exports.royalblueHex = royalblueHex;
    exports.saddlebrownHex = saddlebrownHex;
    exports.salmonHex = salmonHex;
    exports.sandybrownHex = sandybrownHex;
    exports.seagreenHex = seagreenHex;
    exports.seashellHex = seashellHex;
    exports.siennaHex = siennaHex;
    exports.silverHex = silverHex;
    exports.skyblueHex = skyblueHex;
    exports.slateblueHex = slateblueHex;
    exports.slategrayHex = slategrayHex;
    exports.slategreyHex = slategreyHex;
    exports.snowHex = snowHex;
    exports.springgreenHex = springgreenHex;
    exports.steelblueHex = steelblueHex;
    exports.tanHex = tanHex;
    exports.tealHex = tealHex;
    exports.thistleHex = thistleHex;
    exports.tomatoHex = tomatoHex;
    exports.turquoiseHex = turquoiseHex;
    exports.violetHex = violetHex;
    exports.wheatHex = wheatHex;
    exports.whiteHex = whiteHex;
    exports.whitesmokeHex = whitesmokeHex;
    exports.yellowHex = yellowHex;
    exports.yellowgreenHex = yellowgreenHex;

    return exports;

}({}));
