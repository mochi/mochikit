/***

MochiKit.Visual 1.3

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito and others.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Visual');
    dojo.require('MochiKit.Base');
    dojo.require('MochiKit.DOM');
    dojo.require('MochiKit.Color');
    dojo.require('MochiKit.Iter');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
    JSAN.use("MochiKit.DOM", []);
    JSAN.use("MochiKit.Color", []);
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined' ||
        typeof(MochiKit.DOM) == 'undefined' ||
        typeof(MochiKit.Color) == 'undefined' ||
        typeof(MochiKit.Iter) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.Visual depends on MochiKit.Base, MochiKit.DOM, MochiKit.Color and MochiKit.Iter!";
}

if (typeof(MochiKit.Visual) == "undefined") {
    MochiKit.Visual = {};
}

MochiKit.Visual.NAME = "MochiKit.Visual";
MochiKit.Visual.VERSION = "1.3";

MochiKit.Visual.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.Visual.toString = function () {
    return this.__repr__();
};

MochiKit.Visual._RoundCorners = function (e, options) {
    e = MochiKit.DOM.getElement(e);
    this._setOptions(options);
    if (this.options.__unstable__wrapElement) {
        e = this._doWrap(e);
    }

    var color = this.options.color;
    var C = MochiKit.Color.Color;
    if (this.options.color == "fromElement") {
        color = C.fromBackground(e);
    } else if (!(color instanceof C)) {
        color = C.fromString(color);
    }
    this.isTransparent = (color.asRGB().a <= 0);

    var bgColor = this.options.bgColor;
    if (this.options.bgColor == "fromParent") {
        bgColor = C.fromBackground(e.offsetParent);
    } else if (!(bgColor instanceof C)) {
        bgColor = C.fromString(bgColor);
    }

    this._roundCornersImpl(e, color, bgColor);
};

MochiKit.Visual._RoundCorners.prototype = {
    _doWrap: function (e) {
        var parent = e.parentNode;
        var doc = MochiKit.DOM.currentDocument();
        if (typeof(doc.defaultView) == "undefined"
            || doc.defaultView == null) {
            return e;
        }
        var style = doc.defaultView.getComputedStyle(e, null);
        if (typeof(style) == "undefined" || style == null) {
            return e;
        }
        var wrapper = MochiKit.DOM.DIV({"style": {
            display: "block",
            // convert padding to margin
            marginTop: style.getPropertyValue("padding-top"),
            marginRight: style.getPropertyValue("padding-right"),
            marginBottom: style.getPropertyValue("padding-bottom"),
            marginLeft: style.getPropertyValue("padding-left"),
            // remove padding so the rounding looks right
            padding: "0px"
            /*
            paddingRight: "0px",
            paddingLeft: "0px"
            */
        }});
        wrapper.innerHTML = e.innerHTML;
        e.innerHTML = "";
        e.appendChild(wrapper);
        return e;
    },

    _roundCornersImpl: function (e, color, bgColor) {
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

    _renderBorder: function (el, bgColor) {
        var borderValue = "1px solid " + this._borderColor(bgColor);
        var borderL = "border-left: "  + borderValue;
        var borderR = "border-right: " + borderValue;
        var style   = "style='" + borderL + ";" + borderR +  "'";
        el.innerHTML = "<div " + style + ">" + el.innerHTML + "</div>";
    },

    _roundTopCorners: function (el, color, bgColor) {
        var corner = this._createCorner(bgColor);
        for (var i = 0; i < this.options.numSlices; i++) {
            corner.appendChild(
                this._createCornerSlice(color, bgColor, i, "top")
            );
        }
        el.style.paddingTop = 0;
        el.insertBefore(corner, el.firstChild);
    },

    _roundBottomCorners: function (el, color, bgColor) {
        var corner = this._createCorner(bgColor);
        for (var i = (this.options.numSlices - 1); i >= 0; i--) {
            corner.appendChild(
                this._createCornerSlice(color, bgColor, i, "bottom")
            );
        }
        el.style.paddingBottom = 0;
        el.appendChild(corner);
    },

    _createCorner: function (bgColor) {
        var dom = MochiKit.DOM;
        return dom.DIV({style: {backgroundColor: bgColor.toString()}});
    },

    _createCornerSlice: function (color, bgColor, n, position) {
        var slice = MochiKit.DOM.SPAN();

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

    _setOptions: function (options) {
        this.options = {
            corners: "all",
            color: "fromElement",
            bgColor: "fromParent",
            blend: true,
            border: false,
            compact: false,
            __unstable__wrapElement: false
        };
        MochiKit.Base.update(this.options, options);

        this.options.numSlices = (this.options.compact ? 2 : 4);
    },

    _whichSideTop: function () {
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

    _whichSideBottom: function () {
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

    _borderColor: function (color, bgColor) {
        if (color == "transparent") {
            return bgColor;
        } else if (this.options.border) {
            return this.options.border;
        } else if (this.options.blend) {
            return bgColor.blendedColor(color);
        }
        return "";
    },


    _setMargin: function (el, n, corners) {
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

    _setBorder: function (el, n, corners) {
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

    _marginSize: function (n) {
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

    _borderSize: function (n) {
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

    _hasString: function (str) {
        for (var i = 1; i< arguments.length; i++) {
            if (str.indexOf(arguments[i]) != -1) {
                return true;
            }
        }
        return false;
    },

    _isTopRounded: function () {
        return this._hasString(this.options.corners,
            "all", "top", "tl", "tr"
        );
    },

    _isBottomRounded: function () {
        return this._hasString(this.options.corners,
            "all", "bottom", "bl", "br"
        );
    },

    _hasSingleTextChild: function (el) {
        return (el.childNodes.length == 1 && el.childNodes[0].nodeType == 3);
    }
};

MochiKit.Visual.roundElement = function (e, options) {
    new MochiKit.Visual._RoundCorners(e, options);
};

MochiKit.Visual.roundClass = function (tagName, className, options) {
    var elements = MochiKit.DOM.getElementsByTagAndClassName(
        tagName, className
    );
    for (var i = 0; i < elements.length; i++) {
        MochiKit.Visual.roundElement(elements[i], options);
    }
};

MochiKit.Visual.tagifyText = function (element, /* optional */tagifyStyle) {
    /***

    Change a node text to character in tags.

    @param tagifyStyle: the style to apply to character nodes, default to
    'position: relative'.

    ***/
    var tagifyStyle = tagifyStyle || 'position:relative';
    if (MochiKit.Base.isIE()) {
        tagifyStyle += ';zoom:1';
    }
    element = MochiKit.DOM.getElement(element);
    MochiKit.Iter.forEach(element.childNodes, function (child) {
        if (child.nodeType == 3) {
            MochiKit.Iter.forEach(child.nodeValue.split(''), function (character) {
                element.insertBefore(
                    MochiKit.DOM.SPAN({style: tagifyStyle},
                        character == ' ' ? String.fromCharCode(160) : character), child);
            });
            MochiKit.DOM.removeElement(child);
        }
    });
};

MochiKit.Visual.multiple = function (elements, effect, /* optional */options) {
    /***

    Launch the same effect subsequently on given elements.

    ***/
    options = MochiKit.Base.update({
        speed: 0.1,
        delay: 0.0
    }, options || {});
    var masterDelay = options.delay;
    var index = 0;
    MochiKit.Iter.forEach(elements, function (element) {
        options.delay = index * options.speed + masterDelay;
        new effect(element, options);
        index += 1;
    });
};

MochiKit.Visual.PAIRS = {
    'slide': ['slideDown', 'slideUp'],
    'blind': ['blindDown', 'blindUp'],
    'appear': ['appear', 'fade'],
    'size': ['grow', 'shrink']
};

MochiKit.Visual.toggle = function (element, /* optional */effect, /* optional */options) {
    /***

    Toggle an item between two state depending of its visibility, making
    a effect between these states. Default  effect is 'appear', can be
    'slide' or 'blind'.

    ***/
    element = MochiKit.DOM.getElement(element);
    effect = (effect || 'appear').toLowerCase();
    options = MochiKit.Base.update({
        queue: {position: 'end', scope: (element.id || 'global'), limit: 1}
    }, options || {});
    MochiKit.Visual[MochiKit.DOM.isVisible(element) ?
      MochiKit.Visual.PAIRS[effect][1] : MochiKit.Visual.PAIRS[effect][0]](element, options);
};

/***

Transitions: define functions calculating variations depending of a position.

***/

MochiKit.Visual.Transitions = {}

MochiKit.Visual.Transitions.linear = function (pos) {
    return pos;
};

MochiKit.Visual.Transitions.sinoidal = function (pos) {
    return (-Math.cos(pos*Math.PI)/2) + 0.5;
};

MochiKit.Visual.Transitions.reverse = function (pos) {
    return 1 - pos;
};

MochiKit.Visual.Transitions.flicker = function (pos) {
    return ((-Math.cos(pos*Math.PI)/4) + 0.75) + Math.random()/4;
};

MochiKit.Visual.Transitions.wobble = function (pos) {
    return (-Math.cos(pos*Math.PI*(9*pos))/2) + 0.5;
};

MochiKit.Visual.Transitions.pulse = function (pos) {
    return (Math.floor(pos*10) % 2 == 0 ?
        (pos*10 - Math.floor(pos*10)) : 1 - (pos*10 - Math.floor(pos*10)));
};

MochiKit.Visual.Transitions.none = function (pos) {
    return 0;
};

MochiKit.Visual.Transitions.full = function (pos) {
    return 1;
};

/***

Core effects

***/

MochiKit.Visual.ScopedQueue = function () {
    this.__init__();
};

MochiKit.Base.update(MochiKit.Visual.ScopedQueue.prototype, {
    __init__: function () {
        this.effects = [];
        this.interval = null;
    },

    add: function (effect) {
        var timestamp = new Date().getTime();

        var position = (typeof(effect.options.queue) == 'string') ?
            effect.options.queue : effect.options.queue.position;

        switch(position) {
            case 'front':
                // move unstarted effects after this effect
                MochiKit.Iter.forEach(this.effects, function (e) {
                    if (e.state == 'idle') {
                        e.startOn += effect.finishOn;
                        e.finishOn += effect.finishOn;
                    }
                });
                break;
            case 'end':
                var finish;
                // start effect after last queued effect has finished
                MochiKit.Iter.forEach(this.effects, function (e) {
                    var i = e.finishOn;
                    if (i >= (finish || i)) {
                        finish = i;
                    }
                });
                timestamp = finish || timestamp;
                break;
        }

        effect.startOn += timestamp;
        effect.finishOn += timestamp;
        if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit)) {
            this.effects.push(effect);
        }
                      
        if (!this.interval) {
            this.interval = setInterval(MochiKit.Base.bind(this.loop, this),
                                        40);
        }
    },

    remove: function (effect) {
        this.effects = MochiKit.Base.filter(function (e) {
            return e != effect;
        }, this.effects);
        if (this.effects.length == 0) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },

    loop: function () {
        var timePos = new Date().getTime();
        MochiKit.Iter.forEach(this.effects, function (effect) {
            effect.loop(timePos);
        });
    }
});

MochiKit.Visual.Queues = {
    instances: new Array(),

    get: function (queueName) {
        if (typeof(queueName) != 'string') {
            return queueName;
        }

        if (!this.instances[queueName]) {
            this.instances[queueName] = new MochiKit.Visual.ScopedQueue();
        }
        return this.instances[queueName];
    }
};

MochiKit.Visual.Queue = MochiKit.Visual.Queues.get('global');

MochiKit.Visual.DefaultOptions = {
    transition: MochiKit.Visual.Transitions.sinoidal,
    duration: 1.0,  // seconds
    fps: 25.0,  // max. 25fps due to MochiKit.Visual.Queue implementation
    sync: false,  // true for combining
    from: 0.0,
    to: 1.0,
    delay: 0.0,
    queue: 'parallel'
};

MochiKit.Visual.Base = function () {};

MochiKit.Visual.Base.prototype = {
    /***

    Basic class for all Effects. Define a looping mecanism called for each step
    of an effect. Don't instanciate it, only subclass it.

    ***/

    __class__ : MochiKit.Visual.Base,

    position: null,

    start: function (options) {
        this.options = MochiKit.Base.setdefault(options || {},
                                                MochiKit.Visual.DefaultOptions);
        this.currentFrame = 0;
        this.state = 'idle';
        this.startOn = this.options.delay*1000;
        this.finishOn = this.startOn + (this.options.duration*1000);
        this.event('beforeStart');
        if (!this.options.sync) {
            MochiKit.Visual.Queues.get(typeof(this.options.queue) == 'string' ?
                'global' : this.options.queue.scope).add(this);
        }
    },

    loop: function (timePos) {
        if (timePos >= this.startOn) {
            if (timePos >= this.finishOn) {
                this.render(1.0);
                this.cancel();
                this.event('beforeFinish');
                if (this.finish) {
                    this.finish();
                }
                this.event('afterFinish');
                return;
            }
            var pos = (timePos - this.startOn) / (this.finishOn - this.startOn);
            var frame =
                Math.round(pos * this.options.fps * this.options.duration);
            if (frame > this.currentFrame) {
                this.render(pos);
                this.currentFrame = frame;
            }
        }
    },

    render: function (pos) {
        if (this.state == 'idle') {
            this.state = 'running';
            this.event('beforeSetup');
            if (this.setup) {
                this.setup();
            }
            this.event('afterSetup');
        }
        if (this.state == 'running') {
            if (this.options.transition) {
                pos = this.options.transition(pos);
            }
            pos *= (this.options.to - this.options.from);
            pos += this.options.from;
            this.position = pos;
            this.event('beforeUpdate');
            if (this.update) {
                this.update(pos);
            }
            this.event('afterUpdate');
        }
    },

    cancel: function () {
        if (!this.options.sync) {
            MochiKit.Visual.Queues.get(typeof(this.options.queue) == 'string' ?
                'global' : this.options.queue.scope).remove(this);
        }
        this.state = 'finished';
    },

    event: function (eventName) {
        if (this.options[eventName + 'Internal']) {
            this.options[eventName + 'Internal'](this);
        }
        if (this.options[eventName]) {
            this.options[eventName](this);
        }
    },

    repr: function () {
        return '[' + this.__class__.NAME + ', options:' +
               MochiKit.Base.repr(this.options) + ']';
    }
}

MochiKit.Visual.Parallel = function (effects, options) {
    this.__init__(effects, options);
};

MochiKit.Base.update(MochiKit.Visual.Parallel.prototype,
                     MochiKit.Visual.Base.prototype);

MochiKit.Base.update(MochiKit.Visual.Parallel.prototype, {
    /***

    Run multiple effects at the same time.

    ***/
    __init__: function (effects, options) {
        this.effects = effects || [];
        this.start(options);
    },

    update: function (position) {
        MochiKit.Iter.forEach(this.effects, function (effect) {
            effect.render(position);
        });
    },

    finish: function (position) {
        MochiKit.Iter.forEach(this.effects, function (effect) {
            effect.render(1.0);
            effect.cancel();
            effect.event('beforeFinish');
            if (effect.finish) {
                effect.finish(position);
            }
            effect.event('afterFinish');
        });
    }
});

MochiKit.Visual.Opacity = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(MochiKit.Visual.Opacity.prototype,
                     MochiKit.Visual.Base.prototype);

MochiKit.Base.update(MochiKit.Visual.Opacity.prototype, {
    /***

    Change the opacity of an element.

    @param options: 'from' and 'to' change the starting and ending opacities.
    Must be between 0.0 and 1.0. Default to current opacity and 1.0.

    ***/
    __init__: function (element, /* optional */options) {
        this.element = MochiKit.DOM.getElement(element);
        // make this work on IE on elements without 'layout'
        if (MochiKit.Base.isIE() && (!this.element.hasLayout)) {
            MochiKit.DOM.setStyle(this.element, {zoom: 1});
        }
        options = MochiKit.Base.update({
            from: MochiKit.DOM.getOpacity(this.element) || 0.0,
            to: 1.0
        }, options || {});
        this.start(options);
    },

    update: function (position) {
        MochiKit.DOM.setOpacity(this.element, position);
    }
});

MochiKit.Visual.Move = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(MochiKit.Visual.Move.prototype, MochiKit.Visual.Base.prototype);

MochiKit.Base.update(MochiKit.Visual.Move.prototype, {
    /***

    Move an element between its current position to a defined position

    @param options: 'x' and 'y' for final positions, default to 0, 0.

    ***/
    __init__: function (element, /* optional */options) {
        this.element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update({
            x: 0,
            y: 0,
            mode: 'relative'
        }, options || {});
        this.start(options);
    },

    setup: function () {
        // Bug in Opera: Opera returns the 'real' position of a static element
        // or relative element that does not have top/left explicitly set.
        // ==> Always set top and left for position relative elements in your
        // stylesheets (to 0 if you do not need them)
        MochiKit.DOM.makePositioned(this.element);

        var s = this.element.style;
        var originalVisibility = s.visibility;
        var originalDisplay = s.display;
        if (originalDisplay == 'none') {
            s.visibility = 'hidden';
            s.display = '';
        }

        this.originalLeft = parseFloat(MochiKit.DOM.getStyle(this.element,
                                                           'left') || '0');
        this.originalTop = parseFloat(MochiKit.DOM.getStyle(this.element,
                                                            'top') || '0');

        if (this.options.mode == 'absolute') {
            // absolute movement, so we need to calc deltaX and deltaY
            this.options.x = this.options.x - this.originalLeft;
            this.options.y = this.options.y - this.originalTop;
        }
        if (originalDisplay == 'none') {
            s.visibility = originalVisibility;
            s.display = originalDisplay;
        }
    },

    update: function (position) {
        MochiKit.DOM.setStyle(this.element, {
            left: this.options.x * position + this.originalLeft + 'px',
            top: this.options.y * position + this.originalTop + 'px'
        });
    }
});

MochiKit.Visual.Scale = function (element, percent, options) {
    this.__init__(element, percent, options);
};

MochiKit.Base.update(MochiKit.Visual.Scale.prototype, MochiKit.Visual.Base.prototype);

MochiKit.Base.update(MochiKit.Visual.Scale.prototype, {
    /***

    Change the size of an element.

    @param percent: final_size = percent*original_size

    @param options: several options changing scale behaviour

    ***/
    __init__: function (element, percent, /* optional */options) {
        this.element = MochiKit.DOM.getElement(element)
        options = MochiKit.Base.update({
            scaleX: true,
            scaleY: true,
            scaleContent: true,
            scaleFromCenter: false,
            scaleMode: 'box',  // 'box' or 'contents' or {} with provided values
            scaleFrom: 100.0,
            scaleTo: percent
        }, options || {});
        this.start(options);
    },

    setup: function () {
        this.restoreAfterFinish = this.options.restoreAfterFinish || false;
        this.elementPositioning = MochiKit.DOM.getStyle(this.element,
                                                        'position');

        this.originalStyle = {};
        MochiKit.Iter.forEach(['top', 'left', 'width', 'height', 'fontSize'],
            MochiKit.Base.bind(function (k) {
                this.originalStyle[k] = this.element.style[k];
            }, this));

        this.originalTop = this.element.offsetTop;
        this.originalLeft = this.element.offsetLeft;

        var fontSize = MochiKit.DOM.getStyle(this.element,
                                             'font-size') || '100%';
        MochiKit.Iter.forEach(['em', 'px', '%'],
            MochiKit.Base.bind(function (fontSizeType) {
            if (fontSize.indexOf(fontSizeType) > 0) {
                this.fontSize = parseFloat(fontSize);
                this.fontSizeType = fontSizeType;
            }
        }, this));

        this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

        this.dims = null;
        if (this.options.scaleMode=='box') {
            this.dims = [this.element.offsetHeight, this.element.offsetWidth];
        }
        if (/^content/.test(this.options.scaleMode)) {
            this.dims = [this.element.scrollHeight, this.element.scrollWidth];
        }
        if (!this.dims) {
            this.dims = [this.options.scaleMode.originalHeight,
                         this.options.scaleMode.originalWidth];
        }
    },

    update: function (position) {
        var currentScale = (this.options.scaleFrom/100.0) +
                           (this.factor * position);
        if (this.options.scaleContent && this.fontSize) {
            MochiKit.DOM.setStyle(this.element, {
                fontSize: this.fontSize * currentScale + this.fontSizeType
            });
        }
        this.setDimensions(this.dims[0] * currentScale,
                           this.dims[1] * currentScale);
    },

    finish: function (position) {
        if (this.restoreAfterFinish) {
            MochiKit.DOM.setStyle(this.element, this.originalStyle);
        }
    },

    setDimensions: function (height, width) {
        var d = {};
        if (this.options.scaleX) {
            d.width = width + 'px';
        }
        if (this.options.scaleY) {
            d.height = height + 'px';
        }
        if (this.options.scaleFromCenter) {
            var topd = (height - this.dims[0])/2;
            var leftd = (width - this.dims[1])/2;
            if (this.elementPositioning == 'absolute') {
                if (this.options.scaleY) {
                    d.top = this.originalTop - topd + 'px';
                }
                if (this.options.scaleX) {
                    d.left = this.originalLeft - leftd + 'px';
                }
            } else {
                if (this.options.scaleY) {
                    d.top = -topd + 'px';
                }
                if (this.options.scaleX) {
                    d.left = -leftd + 'px';
                }
            }
        }
        MochiKit.DOM.setStyle(this.element, d);
    }
});

MochiKit.Visual.Highlight = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(MochiKit.Visual.Highlight.prototype, MochiKit.Visual.Base.prototype);

MochiKit.Base.update(MochiKit.Visual.Highlight.prototype, {
    /***

    Highlight an item of the page.

    @param options: 'startcolor' for choosing highlighting color, default
    to '#ffff99'.

    ***/
    __init__: function (element, /* optional */options) {
        this.element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update({
            startcolor: '#ffff99'
        }, options || {});
        this.start(options);
    },

    setup: function () {
        // Prevent executing on elements not in the layout flow
        if (MochiKit.DOM.getStyle(this.element, 'display') == 'none') {
            this.cancel();
            return;
        }
        // Disable background image during the effect
        this.oldStyle = {
            backgroundImage: MochiKit.DOM.getStyle(this.element,
                                                   'background-image')
        };
        MochiKit.DOM.setStyle(this.element, {
            backgroundImage: 'none'
        });

        if (!this.options.endcolor) {
            this.options.endcolor =
                MochiKit.Color.Color.fromBackground(this.element).toHexString();
        }
        if(!this.options.restorecolor) {
            this.options.restorecolor = MochiKit.DOM.getStyle(this.element,
                                                            'background-color');
        }
        // init color calculations
        this._base = MochiKit.Base.map(MochiKit.Base.bind(function (i) {
            return parseInt(
                this.options.startcolor.slice(i*2 + 1, i*2 + 3), 16);
        }, this), [0, 1, 2]);
        this._delta = MochiKit.Base.map(MochiKit.Base.bind(function (i) {
            return parseInt(this.options.endcolor.slice(i*2 + 1, i*2 + 3), 16)
                - this._base[i];
        }, this), [0, 1, 2]);
    },

    update: function (position) {
        var m = '#';
        MochiKit.Iter.forEach([0, 1, 2], MochiKit.Base.bind(function (i) {
            m += MochiKit.Color.toColorPart(Math.round(this._base[i] +
                                            this._delta[i]*position));
        }, this));
        MochiKit.DOM.setStyle(this.element, {
            backgroundColor: m
        });
    },

    finish: function () {
        MochiKit.DOM.setStyle(this.element,
            MochiKit.Base.update(this.oldStyle, {
                backgroundColor: this.options.endcolor
        }));
    }
});

MochiKit.Visual.ScrollTo = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(MochiKit.Visual.ScrollTo.prototype, MochiKit.Visual.Base.prototype);

MochiKit.Base.update(MochiKit.Visual.ScrollTo.prototype, {
    /***

    Scroll to an element in the page.

    ***/
    __init__: function (element, /* optional */options) {
        this.element = MochiKit.DOM.getElement(element);
        this.start(options || {});
    },

    setup: function () {
        MochiKit.Position.prepare();
        var offsets = MochiKit.Position.cumulativeOffset(this.element);
        if (this.options.offset) {
            offsets[1] += this.options.offset;
        }
        var max;
        if (window.innerHeight) {
            max = window.innerHeight - window.height;
        } else if (document.documentElement &&
                   document.documentElement.clientHeight) {
            max = document.documentElement.clientHeight -
                  document.body.scrollHeight;
        } else if (document.body) {
            max = document.body.clientHeight - document.body.scrollHeight;
        }
        this.scrollStart = MochiKit.Position.deltaY;
        this.delta = (offsets[1] > max ? max : offsets[1]) - this.scrollStart;
    },

    update: function (position) {
        MochiKit.Position.prepare();
        window.scrollTo(MochiKit.Position.deltaX,
            this.scrollStart + (position*this.delta));
    }
});

/***

Combination effects.

***/

MochiKit.Visual.fade = function (element, options) {
    /***

    Fade a given element: change its opacity and hide it in the end.

    @param options: 'to' and 'from' to change opacity.

    ***/
    var oldOpacity = MochiKit.DOM.getInlineOpacity(element);
    options = MochiKit.Base.update({
        from: MochiKit.DOM.getOpacity(element) || 1.0,
        to: 0.0,
        afterFinishInternal: function (effect) {
            if (effect.options.to !== 0) {
                return;
            }
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.setStyle(effect.element, {opacity: oldOpacity});
        }
    }, options || {});
    return new MochiKit.Visual.Opacity(element, options);
};

MochiKit.Visual.appear = function (element, options) {
    /***

    Make an element appear.

    @param options: 'to' and 'from' to change opacity.

    ***/
    options = MochiKit.Base.update({
        from: (MochiKit.DOM.getStyle(element, 'display') == 'none' ? 0.0 :
               MochiKit.DOM.getOpacity(element) || 0.0),
        to: 1.0,
        beforeSetup: function (effect) {
            MochiKit.DOM.setOpacity(effect.element, effect.options.from);
            MochiKit.DOM.showElement(effect.element);
        }
    }, options || {});
    return new MochiKit.Visual.Opacity(element, options);
};

MochiKit.Visual.puff = function (element, options) {
    /***

    'Puff' an element: grow it to double size, fading it and make it hidden.

    ***/
    element = MochiKit.DOM.getElement(element);
    var oldStyle = {
        opacity: MochiKit.DOM.getInlineOpacity(element),
        position: MochiKit.DOM.getStyle(element, 'position')
    };
    options = MochiKit.Base.update({
        beforeSetupInternal: function (effect) {
            MochiKit.DOM.setStyle(effect.effects[0].element,
                                  {position: 'absolute'});
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.effects[0].element);
            MochiKit.DOM.setStyle(effect.effects[0].element, oldStyle);
        }
    }, options || {});
    return new MochiKit.Visual.Parallel(
        [new MochiKit.Visual.Scale(element, 200,
            {sync: true, scaleFromCenter: true,
             scaleContent: true, restoreAfterFinish: true}),
         new MochiKit.Visual.Opacity(element, {sync: true, to: 0.0 })],
        options
    );
};

MochiKit.Visual.blindUp = function (element, options) {
    /***

    Blind an element up: change its vertical size to 0.

    ***/
    element = MochiKit.DOM.getElement(element);
    MochiKit.DOM.makeClipping(element);
    options = MochiKit.Base.update({
        scaleContent: false,
        scaleX: false,
        restoreAfterFinish: true,
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.undoClipping(effect.element);
        }
    }, options || {});

    return new MochiKit.Visual.Scale(element, 0, options);
};

MochiKit.Visual.blindDown = function (element, options) {
    /***

    Blind an element down: restore its vertical size.

    ***/
    element = MochiKit.DOM.getElement(element);
    var oldHeight = MochiKit.DOM.getStyle(element, 'height');
    var elementDimensions = MochiKit.DOM.elementDimensions(element);
    options = MochiKit.Base.update({
        scaleContent: false,
        scaleX: false,
        scaleFrom: 0,
        scaleMode: {originalHeight: elementDimensions.h,
                    originalWidth: elementDimensions.w},
        restoreAfterFinish: true,
        afterSetup: function (effect) {
            MochiKit.DOM.makeClipping(effect.element);
            MochiKit.DOM.setStyle(effect.element, {height: '0px'});
            MochiKit.DOM.showElement(effect.element);
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.undoClipping(effect.element);
            MochiKit.DOM.setStyle(effect.element, {height: oldHeight});
        }
    }, options || {});
    return new MochiKit.Visual.Scale(element, 100, options);
};

MochiKit.Visual.switchOff = function (element) {
    /***

    Apply a switch-off-like effect.

    ***/
    element = MochiKit.DOM.getElement(element);
    var oldOpacity = MochiKit.DOM.getInlineOpacity(element);
    var optionsScale = {
        duration: 0.3,
        scaleFromCenter: true,
        scaleX: false,
        scaleContent: false,
        restoreAfterFinish: true,
        beforeSetup: function (effect) {
            MochiKit.DOM.makePositioned(effect.element);
            MochiKit.DOM.makeClipping(effect.element);
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.undoClipping(effect.element);
            MochiKit.DOM.undoPositioned(effect.element);
            MochiKit.DOM.setStyle(effect.element, {opacity: oldOpacity});
        }
    };
    return new MochiKit.Visual.appear(element, {
        duration: 0.4,
        from: 0,
        transition: MochiKit.Visual.Transitions.flicker,
        afterFinishInternal: function (effect) {
            new MochiKit.Visual.Scale(effect.element, 1, optionsScale)
        }
    });
};

MochiKit.Visual.dropOut = function (element, options) {
    /***

    Make an element fall and disappear.

    ***/
    element = MochiKit.DOM.getElement(element);
    var oldStyle = {
        top: MochiKit.DOM.getStyle(element, 'top'),
        left: MochiKit.DOM.getStyle(element, 'left'),
        opacity: MochiKit.DOM.getInlineOpacity(element)
    };

    options = MochiKit.Base.update({
        duration: 0.5,
        beforeSetup: function (effect) {
            MochiKit.DOM.makePositioned(effect.effects[0].element);
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.effects[0].element);
            MochiKit.DOM.undoPositioned(effect.effects[0].element);
            MochiKit.DOM.setStyle(effect.effects[0].element, oldStyle);
        }
    }, options || {});
    return new MochiKit.Visual.Parallel(
        [new MochiKit.Visual.Move(element, {x: 0, y: 100, sync: true}),
         new MochiKit.Visual.Opacity(element, {sync: true, to: 0.0})],
        options);
};

MochiKit.Visual.shake = function (element) {
    /***

    Move an element from left to right several times.

    ***/
    element = MochiKit.DOM.getElement(element);
    var oldStyle = {
        top: MochiKit.DOM.getStyle(element, 'top'),
        left: MochiKit.DOM.getStyle(element, 'left') };
        return new MochiKit.Visual.Move(element,
          {x: 20, y: 0, duration: 0.05, afterFinishInternal: function (effect) {
        new MochiKit.Visual.Move(effect.element,
          {x: -40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new MochiKit.Visual.Move(effect.element,
           {x: 40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new MochiKit.Visual.Move(effect.element,
          {x: -40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new MochiKit.Visual.Move(effect.element,
           {x: 40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new MochiKit.Visual.Move(effect.element,
         {x: -20, y: 0, duration: 0.05, afterFinishInternal: function (effect) {
                MochiKit.DOM.undoPositioned(effect.element);
                MochiKit.DOM.setStyle(effect.element, oldStyle);
    }}) }}) }}) }}) }}) }});
};

MochiKit.Visual.slideDown = function (element, options) {
    /***

    Slide an element down.
    It needs to have the content of the element wrapped in a container
    element with fixed height.

    ***/
    element = MochiKit.DOM.getElement(element);
    MochiKit.DOM.cleanWhitespace(element);
    var oldInnerBottom = MochiKit.DOM.getStyle(element.firstChild, 'bottom') || 0;
    var elementDimensions = MochiKit.DOM.elementDimensions(element);
    options = MochiKit.Base.update({
        scaleContent: false,
        scaleX: false,
        scaleFrom: 0,
        scaleMode: {originalHeight: elementDimensions.h,
                    originalWidth: elementDimensions.w},
        restoreAfterFinish: true,
        afterSetup: function (effect) {
            MochiKit.DOM.makePositioned(effect.element);
            MochiKit.DOM.makePositioned(effect.element.firstChild);
            if (MochiKit.Base.isOpera()) {
                MochiKit.DOM.setStyle(effect.element, {top: ''});
            }
            MochiKit.DOM.makeClipping(effect.element);
            MochiKit.DOM.setStyle(effect.element, {height: '0px'});
            MochiKit.DOM.showElement(element);
        },
        afterUpdateInternal: function (effect) {
            MochiKit.DOM.setStyle(effect.element.firstChild,
               {bottom: (effect.dims[0] - effect.element.clientHeight) + 'px'})
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.undoClipping(effect.element);
            // IE will crash if child is undoPositioned first
            if (MochiKit.Base.isIE()){
                MochiKit.DOM.undoPositioned(effect.element);
                MochiKit.DOM.undoPositioned(effect.element.firstChild);
            } else {
                MochiKit.DOM.undoPositioned(effect.element.firstChild);
                MochiKit.DOM.undoPositioned(effect.element);
            }
            MochiKit.DOM.setStyle(effect.element.firstChild,
                                  {bottom: oldInnerBottom});
        }
    }, options || {});

    return new MochiKit.Visual.Scale(element, 100, options);
};

MochiKit.Visual.slideUp = function (element, options) {
    /***

    Slide an element up.
    It needs to have the content of the element wrapped in a container
    element with fixed height.

    ***/
    element = MochiKit.DOM.getElement(element);
    MochiKit.DOM.cleanWhitespace(element);
    var oldInnerBottom = MochiKit.DOM.getStyle(element.firstChild, 'bottom');
    options = MochiKit.Base.update({
        scaleContent: false,
        scaleX: false,
        scaleMode: 'box',
        scaleFrom: 100,
        restoreAfterFinish: true,
        beforeStartInternal: function (effect) {
            MochiKit.DOM.makePositioned(effect.element);
            MochiKit.DOM.makePositioned(effect.element.firstChild);
            if (MochiKit.Base.isOpera()) {
                MochiKit.DOM.setStyle(effect.element, {top: ''});
            }
            MochiKit.DOM.makeClipping(effect.element);
            MochiKit.DOM.showElement(element);
        },
        afterUpdateInternal: function (effect) {
            MochiKit.DOM.setStyle(effect.element.firstChild,
            {bottom: (effect.dims[0] - effect.element.clientHeight) + 'px'});
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.undoClipping(effect.element);
            MochiKit.DOM.undoPositioned(effect.element.firstChild);
            MochiKit.DOM.undoPositioned(effect.element);
            MochiKit.DOM.setStyle(effect.element.firstChild, {bottom: oldInnerBottom});
        }
    }, options || {});
    return new MochiKit.Visual.Scale(element, 0, options);
};

// Bug in opera makes the TD containing this element expand for a instance
// after finish
MochiKit.Visual.squish = function (element, options) {
    /***

    Reduce an element and make it disappear.

    ***/
    options = MochiKit.Base.update({
        restoreAfterFinish: true,
        beforeSetup: function (effect) {
             MochiKit.DOM.makeClipping(effect.element);
        },
        afterFinishInternal: function (effect) {
              MochiKit.DOM.hideElement(effect.element);
              MochiKit.DOM.undoClipping(effect.element);
        }
    }, options || {});

    return new MochiKit.Visual.Scale(element, MochiKit.Base.isOpera() ? 1 : 0, options);
};

MochiKit.Visual.grow = function (element, options) {
    /***

    Grow an element to its original size. Make it zero-sized before
    if necessary.

    ***/
    element = MochiKit.DOM.getElement(element);
    options = MochiKit.Base.update({
        direction: 'center',
        moveTransition: MochiKit.Visual.Transitions.sinoidal,
        scaleTransition: MochiKit.Visual.Transitions.sinoidal,
        opacityTransition: MochiKit.Visual.Transitions.full
    }, options || {});
    var oldStyle = {
        top: element.style.top,
        left: element.style.left,
        height: element.style.height,
        width: element.style.width,
        opacity: MochiKit.DOM.getInlineOpacity(element)
    };

    var dims = MochiKit.DOM.elementDimensions(element);
    var initialMoveX, initialMoveY;
    var moveX, moveY;

    switch (options.direction) {
        case 'top-left':
            initialMoveX = initialMoveY = moveX = moveY = 0;
            break;
        case 'top-right':
            initialMoveX = dims.w;
            initialMoveY = moveY = 0;
            moveX = -dims.w;
            break;
        case 'bottom-left':
            initialMoveX = moveX = 0;
            initialMoveY = dims.h;
            moveY = -dims.h;
            break;
        case 'bottom-right':
            initialMoveX = dims.w;
            initialMoveY = dims.h;
            moveX = -dims.w;
            moveY = -dims.h;
            break;
        case 'center':
            initialMoveX = dims.w / 2;
            initialMoveY = dims.h / 2;
            moveX = -dims.w / 2;
            moveY = -dims.h / 2;
            break;
    }

    var optionsParallel = MochiKit.Base.update({
        beforeSetup: function (effect) {
            MochiKit.DOM.setStyle(effect.effects[0].element, {height: '0px'});
            MochiKit.DOM.showElement(effect.effects[0].element);
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.undoClipping(effect.effects[0].element);
            MochiKit.DOM.undoPositioned(effect.effects[0].element);
            MochiKit.DOM.setStyle(effect.effects[0].element, oldStyle);
        }
    }, options || {});

    return new MochiKit.Visual.Move(element, {
        x: initialMoveX,
        y: initialMoveY,
        duration: 0.01,
        beforeSetup: function (effect) {
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.makeClipping(effect.element);
            MochiKit.DOM.makePositioned(effect.element);
        },
        afterFinishInternal: function (effect) {
            new MochiKit.Visual.Parallel(
                [new MochiKit.Visual.Opacity(effect.element, {
                    sync: true, to: 1.0, from: 0.0,
                    transition: options.opacityTransition
                 }),
                 new MochiKit.Visual.Move(effect.element, {
                     x: moveX, y: moveY, sync: true,
                     transition: options.moveTransition
                 }),
                 new MochiKit.Visual.Scale(effect.element, 100, {
                        scaleMode: {originalHeight: dims.h,
                                    originalWidth: dims.w},
                        sync: true,
                        scaleFrom: MochiKit.Base.isOpera() ? 1 : 0,
                        transition: options.scaleTransition,
                        restoreAfterFinish: true
                })
                ], optionsParallel
            );
        }
    });
};

MochiKit.Visual.shrink = function (element, options) {
    /***

    Shrink an element and make it disappear.

    ***/
    element = MochiKit.DOM.getElement(element);
    options = MochiKit.Base.update({
        direction: 'center',
        moveTransition: MochiKit.Visual.Transitions.sinoidal,
        scaleTransition: MochiKit.Visual.Transitions.sinoidal,
        opacityTransition: MochiKit.Visual.Transitions.none
    }, options || {});
    var oldStyle = {
        top: element.style.top,
        left: element.style.left,
        height: element.style.height,
        width: element.style.width,
        opacity: MochiKit.DOM.getInlineOpacity(element)
    };

    var dims = MochiKit.DOM.elementDimensions(element);
    var moveX, moveY;

    switch (options.direction) {
        case 'top-left':
            moveX = moveY = 0;
            break;
        case 'top-right':
            moveX = dims.w;
            moveY = 0;
            break;
        case 'bottom-left':
            moveX = 0;
            moveY = dims.h;
            break;
        case 'bottom-right':
            moveX = dims.w;
            moveY = dims.h;
            break;
        case 'center':
            moveX = dims.w / 2;
            moveY = dims.h / 2;
            break;
    }

    var optionsParallel = MochiKit.Base.update({
        beforeStartInternal: function (effect) {
            MochiKit.DOM.makePositioned(effect.effects[0].element);
            MochiKit.DOM.makeClipping(effect.effects[0].element);
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.effects[0].element);
            MochiKit.DOM.undoClipping(effect.effects[0].element);
            MochiKit.DOM.undoPositioned(effect.effects[0].element);
            MochiKit.DOM.setStyle(effect.effects[0].element, oldStyle);
        }
    }, options || {});

    return new MochiKit.Visual.Parallel(
        [new MochiKit.Visual.Opacity(element, {
            sync: true, to: 0.0, from: 1.0,
            transition: options.opacityTransition
         }),
         new MochiKit.Visual.Scale(element, MochiKit.Base.isOpera() ? 1 : 0, {
             sync: true, transition: options.scaleTransition,
             restoreAfterFinish: true
         }),
         new MochiKit.Visual.Move(element, {
             x: moveX, y: moveY, sync: true, transition: options.moveTransition
         })
        ], optionsParallel
    );
};

MochiKit.Visual.pulsate = function (element, options) {
    /***

    Pulse an element between appear/fade.

    ***/
    element = MochiKit.DOM.getElement(element);
    options = MochiKit.Base.update({
        duration: 3.0,
        from: 0,
        afterFinishInternal: function (effect) {
            MochiKit.DOM.setStyle(effect.element, {opacity: oldOpacity});
        }
    }, options || {});
    var oldOpacity = MochiKit.DOM.getInlineOpacity(element);
    var transition = options.transition || MochiKit.Visual.Transitions.sinoidal;
    var reverser = MochiKit.Base.bind(function (pos) {
        return transition(1 - MochiKit.Visual.Transitions.pulse(pos));
    }, transition);
    MochiKit.Base.bind(reverser, transition);
    return new MochiKit.Visual.Opacity(element, MochiKit.Base.update({
        transition: reverser}, options));
};

MochiKit.Visual.fold = function (element, options) {
    /***

    Fold an element, first vertically, then horizontally.

    ***/
    element = MochiKit.DOM.getElement(element);
    var oldStyle = {
        top: element.style.top,
        left: element.style.left,
        width: element.style.width,
        height: element.style.height
    };
    MochiKit.DOM.makeClipping(element);
    options = MochiKit.Base.update({
        scaleContent: false,
        scaleX: false,
        afterFinishInternal: function (effect) {
            new MochiKit.Visual.Scale(element, 1, {
                scaleContent: false,
                scaleY: false,
                afterFinishInternal: function (effect) {
                    MochiKit.DOM.hideElement(effect.element);
                    MochiKit.DOM.undoClipping(effect.element);
                    MochiKit.DOM.setStyle(effect.element, oldStyle);
                }
            });
        }
    }, options || {});
    return new MochiKit.Visual.Scale(element, 5, options);
};


// Compatibility with MochiKit 1.0
MochiKit.Visual.Color = MochiKit.Color.Color;
MochiKit.Visual.getElementsComputedStyle = MochiKit.DOM.computedStyle;

/* end of Rico adaptation */

MochiKit.Visual.__new__  = function () {
    var m = MochiKit.Base;

    m.nameFunctions(this);

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };

};

MochiKit.Visual.EXPORT = [
    "roundElement",
    "roundClass",
    "tagifyText",
    "multiple",
    "toggle",
    "Base",
    "Parallel",
    "Opacity",
    "Move",
    "Scale",
    "Highlight",
    "ScrollTo",
    "fade",
    "appear",
    "puff",
    "blindUp",
    "blindDown",
    "switchOff",
    "dropOut",
    "shake",
    "slideDown",
    "slideUp",
    "squish",
    "grow",
    "shrink",
    "pulsate",
    "fold"
];

MochiKit.Visual.EXPORT_OK = [
    "PAIRS"
];

MochiKit.Visual.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.Visual);
