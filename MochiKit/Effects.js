/***

Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
Contributors:
    Justin Palmer (http://encytemedia.com/)
    Mark Pilgrim (http://diveintomark.org/)
    Martin Bialasinki
    Mochi-ized By Thomas Herve (_firstname_@nimail.org)

See scriptaculous.js for full license.

***/

var Effect = {
    tagifyText: function (element) {
        var tagifyStyle = 'position:relative';
        if (MochiKit.Base.isIE()) {
            tagifyStyle += ';zoom:1';
        }
        element = MochiKit.DOM.getElement(element);
        MochiKit.Iter.forEach(element.childNodes, function (child) {
            if (child.nodeType == 3) {
                MochiKit.Iter.forEach(child.split(''), function (character) {
                    element.insertBefore(
                        Builder.node('span', {style: tagifyStyle},
                            character == ' ' ? String.fromCharCode(160) : character),
                            child);
                });
                MochiKit.DOM.removeElement(child);
            }
        });
    },

    multiple: function (element, effect, options) {
        var elements;
        if (((typeof element == 'object') ||
             (typeof element == 'function')) &&
            (element.length)) {
            elements = element;
        } else {
            elements = MochiKit.DOM.getElement(element).childNodes;
        }
        options = MochiKit.Base.update({
            speed: 0.1,
            delay: 0.0
        }, options || {});
        var masterDelay = options.delay;

        MochiKit.Iter.forEach(elements, function (element, index) {
            options.delay = index * options.speed + masterDelay;
            new effect(element, options);
        });
    },

    PAIRS: {
        'slide': ['SlideDown','SlideUp'],
        'blind': ['BlindDown','BlindUp'],
        'appear': ['Appear','Fade']
    },

    toggle: function (element, effect, options) {
        element = MochiKit.DOM.getElement(element);
        effect = (effect || 'appear').toLowerCase();
        options = MochiKit.Base.update({
            queue: {position: 'end', scope: (element.id || 'global')}
        }, options || {});
        Effect[MochiKit.DOM.isVisible(element) ?
            Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);
    }
};

/* ------------- transitions ------------- */

Effect.Transitions = {}

Effect.Transitions.linear = function (pos) {
    return pos;
}
Effect.Transitions.sinoidal = function (pos) {
    return (-Math.cos(pos*Math.PI)/2) + 0.5;
}
Effect.Transitions.reverse    = function (pos) {
    return 1-pos;
}
Effect.Transitions.flicker = function (pos) {
    return ((-Math.cos(pos*Math.PI)/4) + 0.75) + Math.random()/4;
}
Effect.Transitions.wobble = function (pos) {
    return (-Math.cos(pos*Math.PI*(9*pos))/2) + 0.5;
}
Effect.Transitions.pulse = function (pos) {
    return (Math.floor(pos*10) % 2 == 0 ?
        (pos*10-Math.floor(pos*10)) : 1-(pos*10-Math.floor(pos*10)));
}
Effect.Transitions.none = function (pos) {
    return 0;
}
Effect.Transitions.full = function (pos) {
    return 1;
}

/* ------------- core effects ------------- */

Effect.ScopedQueue = function () {
    this.__init__();
};

MochiKit.Base.update(Effect.ScopedQueue.prototype, {
    __init__: function () {
        this.effects = [];
        this.interval = null;
    },

    add: function (effect) {
        var timestamp = new Date().getTime();

        var position = (typeof effect.options.queue == 'string') ?
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
                    var i = e.finishOn();
                    if (i >= (finish || i)) {
                        finish = i;
                    }
                });
                timestamp = finish || timestamp;
                break;
        }

        effect.startOn += timestamp;
        effect.finishOn += timestamp;
        this.effects.push(effect);
        if (!this.interval) {
            this.interval = setInterval(MochiKit.Base.bind(this.loop, this), 40);
        }
    },

    remove: function (effect) {
        this.effects = MochiKit.Iter.list(MochiKit.Iter.ifilter(function (e) {
            return e != effect;
        }, this.effects));
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

Effect.Queues = {
    instances: new Array(),
    get: function (queueName) {
        if (typeof queueName != 'string') {
            return queueName;
        }

        if (!this.instances[queueName]) {
            this.instances[queueName] = new Effect.ScopedQueue();
        }
        return this.instances[queueName];
    }
};

Effect.Queue = Effect.Queues.get('global');

Effect.DefaultOptions = {
    transition: Effect.Transitions.sinoidal,
    duration: 1.0,  // seconds
    fps: 25.0,  // max. 25fps due to Effect.Queue implementation
    sync: false,  // true for combining
    from: 0.0,
    to: 1.0,
    delay: 0.0,
    queue: 'parallel'
};

Effect.Base = function () {};

Effect.Base.prototype = {
    position: null,

    start: function (options) {
        this.options = MochiKit.Base.setdefault(options || {}, Effect.DefaultOptions);
        this.currentFrame = 0;
        this.state = 'idle';
        this.startOn = this.options.delay*1000;
        this.finishOn = this.startOn + (this.options.duration*1000);
        this.event('beforeStart');
        if (!this.options.sync) {
            Effect.Queues.get(typeof this.options.queue == 'string' ?
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
            var frame = Math.round(pos * this.options.fps * this.options.duration);
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
            Effect.Queues.get(typeof this.options.queue == 'string' ?
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

    __repr__: function () {
        return '<Effect:' + MochiKit.Base.repr(this) + ', options:' + MochiKit.Base.repr(this.options) + '>';
    }
}

Effect.Parallel = function (effects, options) {
    this.__init__(effects, options);
};

MochiKit.Base.update(Effect.Parallel.prototype, Effect.Base.prototype);

MochiKit.Base.update(Effect.Parallel.prototype, {
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

Effect.Opacity = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(Effect.Opacity.prototype, Effect.Base.prototype);

MochiKit.Base.update(Effect.Opacity.prototype, {
    __init__: function (element, options) {
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

Effect.Move = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(Effect.Move.prototype, Effect.Base.prototype);

MochiKit.Base.update(Effect.Move.prototype, {
    __init__: function (element, options) {
        this.element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update({
            x: 0,
            y: 0,
            mode: 'relative'
        }, options || {});
        this.start(options);
    },

    setup: function () {
        // Bug in Opera: Opera returns the 'real' position of a static element or
        // relative element that does not have top/left explicitly set.
        // ==> Always set top and left for position relative elements in your stylesheets
        // (to 0 if you do not need them)
        MochiKit.DOM.makePositioned(this.element);
        this.originalLeft = parseFloat(MochiKit.DOM.getStyle(this.element,'left') || '0');
        this.originalTop = parseFloat(MochiKit.DOM.getStyle(this.element,'top') || '0');
        if (this.options.mode == 'absolute') {
            // absolute movement, so we need to calc deltaX and deltaY
            this.options.x = this.options.x - this.originalLeft;
            this.options.y = this.options.y - this.originalTop;
        }
    },

    update: function (position) {
        MochiKit.DOM.setStyle(this.element, {
            left: this.options.x * position + this.originalLeft + 'px',
            top: this.options.y * position + this.originalTop + 'px'
        });
    }
});

Effect.Scale = function (element, percent, options) {
    this.__init__(element, percent, options);
};

MochiKit.Base.update(Effect.Scale.prototype, Effect.Base.prototype);

MochiKit.Base.update(Effect.Scale.prototype, {
    __init__: function (element, percent, options) {
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
        this.elementPositioning = MochiKit.DOM.getStyle(this.element,'position');

        this.originalStyle = {};
        MochiKit.Iter.forEach(['top', 'left', 'width', 'height', 'fontSize'],
            MochiKit.Base.bind(function (k) {
                this.originalStyle[k] = this.element.style[k];
            }, this));

        this.originalTop = this.element.offsetTop;
        this.originalLeft = this.element.offsetLeft;

        var fontSize = MochiKit.DOM.getStyle(this.element,'font-size') || '100%';
        MochiKit.Iter.forEach(['em','px','%'], MochiKit.Base.bind(function (fontSizeType) {
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
        var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
        if (this.options.scaleContent && this.fontSize) {
            MochiKit.DOM.setStyle(this.element, {
                fontSize: this.fontSize * currentScale + this.fontSizeType
            });
        }
        this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
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

Effect.Highlight = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(Effect.Highlight.prototype, Effect.Base.prototype);

MochiKit.Base.update(Effect.Highlight.prototype, {
    __init__: function (element, options) {
        this.element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update({
            startcolor: '#ffff99',
            numSteps: 16
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
            backgroundImage: MochiKit.DOM.getStyle(this.element, 'background-image')
        };
        MochiKit.DOM.setStyle(this.element, {
            backgroundImage: 'none'
        });

        if (!this.options.endcolor) {
            this.options.endcolor = MochiKit.Color.Color.fromBackground(this.element).toHexString();
        }
        if(!this.options.restorecolor) {
            this.options.restorecolor = MochiKit.DOM.getStyle(this.element, 'background-color');
        }
        // init color calculations
        this._base = MochiKit.Base.map(MochiKit.Base.bind(function (i) {
            return parseInt(this.options.startcolor.slice(i*2 + 1, i*2 + 3), 16);
        }, this), [0, 1, 2]);
        this._delta = MochiKit.Base.map(MochiKit.Base.bind(function (i) {
            return parseInt(this.options.endcolor.slice(i*2 + 1, i*2 + 3), 16) - this._base[i];
        }, this), [0, 1, 2]);
    },

    update: function (position) {
        var m = '#';
        MochiKit.Iter.forEach([0, 1, 2], MochiKit.Base.bind(function (i) {
            m += MochiKit.Color.toColorPart(Math.round(this._base[i] + (this._delta[i]*position)));
        }, this));
        MochiKit.DOM.setStyle(this.element, {
            backgroundColor: m
        });
    },

    finish: function () {
        MochiKit.DOM.setStyle(this.element, MochiKit.Base.update(this.oldStyle, {
            backgroundColor: this.options.endColor
        }));
    }
});

Effect.ScrollTo = function (element, options) {
    this.__init__(element, options);
};

MochiKit.Base.update(Effect.ScrollTo.prototype, Effect.Base.prototype);

MochiKit.Base.update(Effect.ScrollTo.prototype, {
    __init__: function (element, options) {
        this.element = MochiKit.DOM.getElement(element);
        this.start(options || {});
    },

    setup: function () {
        Position.prepare();
        var offsets = MochiKit.Position.cumulativeOffset(this.element);
        if (this.options.offset) {
            offsets[1] += this.options.offset;
        }
        var max = window.innerHeight ?
            window.height - window.innerHeight :
            document.body.scrollHeight -
                (document.documentElement.clientHeight ?
                    document.documentElement.clientHeight : document.body.clientHeight);
        this.scrollStart = MochiKit.Position.deltaY;
        this.delta = (offsets[1] > max ? max : offsets[1]) - this.scrollStart;
    },

    update: function (position) {
        Position.prepare();
        window.scrollTo(Position.deltaX,
            this.scrollStart + (position*this.delta));
    }
});

/* ------------- combination effects ------------- */

Effect.Fade = function (element, options) {
    var oldOpacity = MochiKit.DOM.getInlineOpacity(element);
    options = MochiKit.Base.update({
        from: MochiKit.DOM.getOpacity(element) || 1.0,
        to: 0.0,
        afterFinishInternal: function (effect) {
            if (effect.options.to != 0) {
                return;
            }
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.setStyle(effect.element, {opacity: oldOpacity});
        }
    }, options || {});
    return new Effect.Opacity(element, options);
};

Effect.Appear = function (element, options) {
    options = MochiKit.Base.update({
        from: (MochiKit.DOM.getStyle(element, 'display') == 'none' ? 0.0 : MochiKit.DOM.getOpacity(element) || 0.0),
        to: 1.0,
        beforeSetup: function (effect) {
            MochiKit.DOM.setOpacity(effect.element, effect.options.from);
            MochiKit.DOM.showElement(effect.element);
        }
    }, options || {});
    return new Effect.Opacity(element, options);
};

Effect.Puff = function (element, options) {
    element = MochiKit.DOM.getElement(element);
    var oldStyle = {
        opacity: MochiKit.DOM.getInlineOpacity(element),
        position: MochiKit.DOM.getStyle(element, 'position')
    };
    options = MochiKit.Base.update({
        duration: 1.0,
        beforeSetupInternal: function (effect) {
            MochiKit.DOM.setStyle(effect.effects[0].element, {position: 'absolute'});
        },
        afterFinishInternal: function (effect) {
            MochiKit.DOM.hideElement(effect.effects[0].element);
            MochiKit.DOM.setStyle(effect.effects[0].element, oldStyle);
        }
    }, options || {});
    return new Effect.Parallel(
     [new Effect.Scale(element, 200,
            {sync: true, scaleFromCenter: true,
             scaleContent: true, restoreAfterFinish: true}),
      new Effect.Opacity(element, {sync: true, to: 0.0 })],
      options
    );
};

Effect.BlindUp = function (element, options) {
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

    return new Effect.Scale(element, 0, options);
};

Effect.BlindDown = function (element, options) {
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
    return new Effect.Scale(element, 100, options);
};

Effect.SwitchOff = function (element) {
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
    return new Effect.Appear(element, {
        duration: 0.4,
        from: 0,
        transition: Effect.Transitions.flicker,
        afterFinishInternal: function (effect) {
            new Effect.Scale(effect.element, 1, optionsScale)
        }
    });
};

Effect.DropOut = function (element, options) {
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
    return new Effect.Parallel(
        [new Effect.Move(element, {x: 0, y: 100, sync: true}),
         new Effect.Opacity(element, {sync: true, to: 0.0})],
        options);
};

Effect.Shake = function (element) {
    element = MochiKit.DOM.getElement(element);
    var oldStyle = {
        top: MochiKit.DOM.getStyle(element, 'top'),
        left: MochiKit.DOM.getStyle(element, 'left') };
        return new Effect.Move(element,
            {x: 20, y: 0, duration: 0.05, afterFinishInternal: function (effect) {
        new Effect.Move(effect.element,
            {x: -40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new Effect.Move(effect.element,
            {x: 40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new Effect.Move(effect.element,
            {x: -40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new Effect.Move(effect.element,
            {x: 40, y: 0, duration: 0.1, afterFinishInternal: function (effect) {
        new Effect.Move(effect.element,
            {x: -20, y: 0, duration: 0.05, afterFinishInternal: function (effect) {
                MochiKit.DOM.undoPositioned(effect.element);
                MochiKit.DOM.setStyle(effect.element, oldStyle);
    }}) }}) }}) }}) }}) }});
};

Effect.SlideDown = function (element, options) {
    element = MochiKit.DOM.getElement(element);
    MochiKit.DOM.cleanWhitespace(element);
    // SlideDown need to have the content of the element wrapped in a container element with fixed height!
    var oldInnerBottom = MochiKit.DOM.getStyle(element.firstChild, 'bottom');
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
            MochiKit.DOM.undoPositioned(effect.element.firstChild);
            MochiKit.DOM.undoPositioned(effect.element);
            MochiKit.DOM.setStyle(effect.element.firstChild, {bottom: oldInnerBottom});
        }
    }, options || {});

    return new Effect.Scale(element, 100, options);
};

Effect.SlideUp = function (element, options) {
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
    return new Effect.Scale(element, 0, options);
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function (element) {
    return new Effect.Scale(element, MochiKit.Base.isOpera() ? 1 : 0,
        {restoreAfterFinish: true,
         beforeSetup: function (effect) {
             MochiKit.DOM.makeClipping(effect.element);
         },
         afterFinishInternal: function (effect) {
              MochiKit.DOM.hideElement(effect.element);
              MochiKit.DOM.undoClipping(effect.element);
         }
    });
};

Effect.Grow = function (element, options) {
    element = MochiKit.DOM.getElement(element);
    options = MochiKit.Base.update({
        direction: 'center',
        moveTransistion: Effect.Transitions.sinoidal,
        scaleTransition: Effect.Transitions.sinoidal,
        opacityTransition: Effect.Transitions.full
    }, options || {});
    var oldStyle = {
        top: element.style.top,
        left: element.style.left,
        height: element.style.height,
        width: element.style.width,
        opacity: MochiKit.DOM.getInlineOpacity(element) };

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

    return new Effect.Move(element, {
        x: initialMoveX,
        y: initialMoveY,
        duration: 0.01,
        beforeSetup: function (effect) {
            MochiKit.DOM.hideElement(effect.element);
            MochiKit.DOM.makeClipping(effect.element);
            MochiKit.DOM.makePositioned(effect.element);
        },
        afterFinishInternal: function (effect) {
            new Effect.Parallel(
                [new Effect.Opacity(effect.element, {
                    sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition
                 }),
                 new Effect.Move(effect.element, {
                     x: moveX, y: moveY, sync: true, transition: options.moveTransition
                 }),
                 new Effect.Scale(effect.element, 100, {
                        scaleMode: {originalHeight: dims.h,
                                    originalWidth: dims.w},
                        sync: true,
                        scaleFrom: MochiKit.Base.isOpera() ? 1 : 0,
                        transition: options.scaleTransition,
                        restoreAfterFinish: true
                })
                ], optionsParallel
            )
        }
    });
};

Effect.Shrink = function (element, options) {
    element = MochiKit.DOM.getElement(element);
    options = MochiKit.Base.update({
        direction: 'center',
        moveTransistion: Effect.Transitions.sinoidal,
        scaleTransition: Effect.Transitions.sinoidal,
        opacityTransition: Effect.Transitions.none
    }, options || {});
    var oldStyle = {
        top: element.style.top,
        left: element.style.left,
        height: element.style.height,
        width: element.style.width,
        opacity: MochiKit.DOM.getInlineOpacity(element) };

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

    var optionsParallel = MochiKit.Base.update(
    {
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

    return new Effect.Parallel(
        [new Effect.Opacity(element, {
            sync: true, to: 0.0, from: 1.0,
            transition: options.opacityTransition
         }),
         new Effect.Scale(element, MochiKit.Base.isOpera() ? 1 : 0, {
             sync: true, transition: options.scaleTransition,
             restoreAfterFinish: true
         }),
         new Effect.Move(element, {
             x: moveX, y: moveY, sync: true, transition: options.moveTransition
         })
        ], optionsParallel
    );
};

Effect.Pulsate = function (element, options) {
    element = MochiKit.DOM.getElement(element);
    options = MochiKit.Base.update({
        duration: 3.0,
        from: 0,
        afterFinishInternal: function (effect) {
            MochiKit.DOM.setStyle(effect.element, {opacity: oldOpacity});
        },
        transition: reverser
    }, options || {});
    var oldOpacity = MochiKit.DOM.getInlineOpacity(element);
    var transition = options.transition || Effect.Transitions.sinoidal;
    var reverser = function (pos) {
        return transition(1 - Effect.Transitions.pulse(pos));
    };
    MochiKit.Base.bind(reverser, transition);
    return new Effect.Opacity(element, options);
};

Effect.Fold = function (element, options) {
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
            new Effect.Scale(element, 1, {
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
    return new Effect.Scale(element, 5, options);
};

