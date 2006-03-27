/***

MochiKit.Signal 1.3

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2006 Jonathan Gardner, Beau Hartshorne.  All rights Reserved.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Signal');
    dojo.require('MochiKit.Base');
    dojo.require('MochiKit.DOM');
}
if (typeof(JSAN) != 'undefined') {
    JSAN.use('MochiKit.Base', []);
    JSAN.use('MochiKit.DOM', []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined') {
        throw '';
    }
} catch (e) {
    throw 'MochiKit.Signal depends on MochiKit.Base!';
}

try {
    if (typeof(MochiKit.DOM) == 'undefined') {
        throw '';
    }
} catch (e) {
    throw 'MochiKit.Signal depends on MochiKit.DOM!';
}

if (typeof(MochiKit.Signal) == 'undefined') {
    MochiKit.Signal = {};
}

MochiKit.Signal.NAME = 'MochiKit.Signal';
MochiKit.Signal.VERSION = '1.3';

MochiKit.Signal._observers = [];

MochiKit.Signal.Event = function (e) {
    this._event = e || window.event;
};

MochiKit.Signal.Event.prototype.event = function () {
    return this._event;
};

MochiKit.Signal.Event.prototype.type = function () {
    return this._event.type || undefined;
};

MochiKit.Signal.Event.prototype.target = function () {
    return this._event.target || this._event.srcElement;
};

MochiKit.Signal.Event.prototype.relatedTarget = function () {
    if (this.type() == 'mouseover') {
        return (this._event.relatedTarget ||
            this._event.fromElement);
    } else if (this.type() == 'mouseout') {
        return (this._event.relatedTarget ||
            this._event.toElement);
    }
    throw new Error('No related target');
};

MochiKit.Signal.Event.prototype.modifier = function () {
    var m = {};
    m.alt = this._event.altKey;
    m.ctrl = this._event.ctrlKey;
    m.meta = this._event.metaKey || false; // ie and opera punt here
    m.shift = this._event.shiftKey;
    return m;
};

MochiKit.Signal.Event.prototype.key = function () {
    var k = {};
    if (this.type() && this.type().indexOf('key') === 0) {

        /*

        If you're looking for a special key, look for it in keydown or keyup,
        but never keypress. If you're looking for a Unicode chracter, look for
        it with keypress, but never kd or ku.

        keyCode will contain the raw key code in a kd/ku event keyString will
        contain a human-redable keyCode.

        charCode will contain the raw character code in a kp event charString
        will contain the actual character.

        Notes:

        FF key event behavior:
        key event   charCode    keyCode
        DOWN    ku,kd   0           40
        DOWN    kp      0           40
        ESC     ku,kd   0           27
        ESC     kp      0           27
        a       ku,kd   0           65
        a       kp      97          0
        shift+a ku,kd   0           65
        shift+a kp      65          0
        1       ku,kd   0           49
        1       kp      49          0
        shift+1 ku,kd   0           0
        shift+1 kp      33          0

        IE key event behavior:
        key     event   keyCode
        DOWN    ku,kd   40
        DOWN    kp      undefined
        ESC     ku,kd   27
        ESC     kp      27
        a       ku,kd   65
        a       kp      97
        shift+a ku,kd   65
        shift+a kp      65
        1       ku,kd   49
        1       kp      49
        shift+1 ku,kd   49
        shift+1 kp      33

        Safari key event behavior:
        key     event   charCode    keyCode
        DOWN    ku,kd   63233       40
        DOWN    kp      63233       63233
        ESC     ku,kd   27          27
        ESC     kp      27          27
        a       ku,kd   97          65
        a       kp      97          97
        shift+a ku,kd   65          65
        shift+a kp      65          65
        1       ku,kd   49          49
        1       kp      49          49
        shift+1 ku,kd   33          49
        shift+1 kp      33          33

        */

        // look for special keys here
        if (this.type() == 'keydown' || this.type() == 'keyup') {
            k.code = this._event.keyCode;
            k.string = (MochiKit.Signal._specialKeys[k.code] ||
                'KEY_UNKNOWN');
            return k;
        
        // look for unicode characters here
        } else if (this.type() == 'keypress') {
            k.code = (this._event.charCode || this._event.keyCode);
            k.string = String.fromCharCode(k.code);
            return k;
        }
    }
    throw new Error('This is not a key event');
};

MochiKit.Signal.Event.prototype._fixPoint = function (point) {
    // inline this for performance?
    if (typeof(point) == 'undefined' || point < 0) {
        return 0;
    }
    return point;
};

MochiKit.Signal.Event.prototype.mouse = function () {
    // mouse events
    var m = {};
    if (this.type() && (
        this.type().indexOf('mouse') === 0 ||
        this.type().indexOf('click') != -1 ||
        this.type() == 'contextmenu')) {

        m.client = new MochiKit.DOM.Coordinates(0, 0);
        if (this._event.clientX || this._event.clientY) {
            m.client.x = this._fixPoint(this._event.clientX);
            m.client.y = this._fixPoint(this._event.clientY);
        }

        m.page = new MochiKit.DOM.Coordinates(0, 0);
        if (this._event.pageX || this._event.pageY) {
            m.page.x = this._fixPoint(this._event.pageX);
            m.page.y = this._fixPoint(this._event.pageY);
        } else {
            /*
            IE keeps its document offset in document.documentElement.clientTop
            
            http://msdn.microsoft.com/workshop/author/dhtml/reference/
                methods/getboundingclientrect.asp
                
            the offset is (2,2) in standards mode and (0,0) in quirks mode
            */
            
            m.page.x = (this._event.clientX +
                (document.documentElement.scrollLeft ||
                document.body.scrollLeft) -
                document.documentElement.clientLeft);
            m.page.y = (this._event.clientY +
                (document.documentElement.scrollTop ||
                document.body.scrollTop) -
                document.documentElement.clientTop);
        }
        if (this.type() != 'mousemove') {
            m.button = {};
            m.button.left = false;
            m.button.right = false;
            m.button.middle = false;

            // we could check this._event.button, but which is more consistent
            if (this._event.which) {
                m.button.left = (this._event.which == 1);
                m.button.middle = (this._event.which == 2);
                m.button.right = (this._event.which == 3);

                /*
                Mac browsers and right click:
                
                    -   Safari doesn't fire any click events on a right click:
                        http://bugzilla.opendarwin.org/show_bug.cgi?id=6595
                        
                    -   Firefox fires the event, and sets ctrlKey = true
                    
                    -   Opera fires the event, and sets metaKey = true                
                
                oncontextmenu is fired on right clicks between browsers and
                across platforms.
                */
                
            } else {
                m.button.left = !!(this._event.button & 1);
                m.button.right = !!(this._event.button & 2);
                m.button.middle = !!(this._event.button & 4);
            }
        }
        return m;
    }
    throw new Error('This is not a mouse event');
};

MochiKit.Signal.Event.prototype.stop = function () {
    this.stopPropagation();
    this.preventDefault();
};

MochiKit.Signal.Event.prototype.stopPropagation = function () {
    if (this._event.stopPropagation) {
        this._event.stopPropagation();
    } else {
        this._event.cancelBubble = true;
    }
};

MochiKit.Signal.Event.prototype.preventDefault = function () {
    if (this._event.preventDefault) {
        this._event.preventDefault();
    } else {
        this._event.returnValue = false;
    }
};

MochiKit.Signal.Event.prototype.__repr__ = function () {
    var repr = MochiKit.Base.repr;
    var str = '{event(): ' + repr(this.event()) +
        ', type(): ' + repr(this.type()) +
        ', target(): ' + repr(this.target()) +
        ', modifier(): ' + '{alt: ' + repr(this.modifier().alt) +
        ', ctrl: ' + repr(this.modifier().ctrl) +
        ', meta: ' + repr(this.modifier().meta) +
        ', shift: ' + repr(this.modifier().shift) + '}';

    if (this.type() && this.type().indexOf('key') === 0) {
        str += ', key(): {code: ' + repr(this.key().code) +
            ', string: ' + repr(this.key().string) + '}';
    }

    if (this.type() && (
        this.type().indexOf('mouse') === 0 ||
        this.type().indexOf('click') != -1 ||
        this.type() == 'contextmenu')) {

        str += ', mouse(): {page: ' + repr(this.mouse().page) + 
            ', client: ' + repr(this.mouse().client);

        if (this.type() != 'mousemove') {
            str += ', button: {left: ' + repr(this.mouse().button.left) +
                ', middle: ' + repr(this.mouse().button.middle) +
                ', right: ' + repr(this.mouse().button.right) + '}}';
        } else {
            str += '}';
        }
    }
    if (this.type() == 'mouseover' || this.type() == 'mouseout') {
        str += ', relatedTarget(): ' + repr(this.relatedTarget());
    }
    str += '}';
    return str;
};

MochiKit.Signal.Event.prototype.toString = function() {
    return this.__repr__();
}

MochiKit.Base.update(MochiKit.Signal, {

    __repr__: function () {
        return '[' + this.NAME + ' ' + this.VERSION + ']';
    },

    toString: function () {
        return this.__repr__();
    },

    // this is straight out of Dojo
    _specialKeys: {
        8: 'KEY_BACKSPACE',
        9: 'KEY_TAB',
        13: 'KEY_ENTER',
        16: 'KEY_SHIFT',
        17: 'KEY_CTRL',
        18: 'KEY_ALT',
        19: 'KEY_PAUSE',
        20: 'KEY_CAPS_LOCK',
        27: 'KEY_ESCAPE',
        32: 'KEY_SPACE',
        33: 'KEY_PAGE_UP',
        34: 'KEY_PAGE_DOWN',
        35: 'KEY_END',
        36: 'KEY_HOME',
        37: 'KEY_LEFT_ARROW',
        38: 'KEY_UP_ARROW',
        39: 'KEY_RIGHT_ARROW',
        40: 'KEY_DOWN_ARROW',
        45: 'KEY_INSERT',
        46: 'KEY_DELETE',
        91: 'KEY_LEFT_WINDOW',
        92: 'KEY_RIGHT_WINDOW',
        93: 'KEY_SELECT',
        112: 'KEY_F1',
        113: 'KEY_F2',
        114: 'KEY_F3',
        115: 'KEY_F4',
        116: 'KEY_F5',
        117: 'KEY_F6',
        118: 'KEY_F7',
        119: 'KEY_F8',
        120: 'KEY_F9',
        121: 'KEY_F10',
        122: 'KEY_F11',
        123: 'KEY_F12',
        144: 'KEY_NUM_LOCK',
        145: 'KEY_SCROLL_LOCK'
        // undefined: 'KEY_UNKNOWN'
    },

    _getSlot: function (slot, func) {
        if (typeof(func) == 'string' || typeof(func) == 'function') {
            if (typeof(func) == 'string' && typeof(slot[func]) == 'undefined') {
                throw new Error('Invalid function slot');
            }
            slot = [slot, func];
        } else if (!func && typeof(slot) == 'function') {
            slot = [slot];
        } else {
            throw new Error('Invalid slot parameters');
        }

        return slot;
    },

    _unloadCache: function () {
        for (var i = 0; i < MochiKit.Signal._observers.length; i++) {
            var src = MochiKit.Signal._observers[i][0];
            var sig = MochiKit.Signal._observers[i][1];
            var listener = MochiKit.Signal._observers[i][2];

            try {
                if (src.removeEventListener) {
                    src.removeEventListener(sig.substr(2), listener, false);
                } else if (src.detachEvent) {
                    src.detachEvent(sig, listener);
                } else {
                    src._signals[sig] = undefined;
                }
                
                // some browsers don't let you set random properties on 
                // some elements (Firefox won't let you change window)
                if (src._listeners && src._listeners[sig]) {
                    src._listeners[sig] = undefined;
                }
                
                // delete removes object properties, not variables
                delete(src._listeners);
                delete(src._signals);
                
            } catch(e) {
                // pass
            }
        }
        
        MochiKit.Signal._observers = undefined;

        try {
            window.onload = undefined;
        } catch(e) {
            // pass
        }

        try {
            window.onunload = undefined;
        } catch(e) {
            // pass
        }
    },

    connect: function (src, sig, slot, /* optional */func) {
        /***

        Connects a signal to a slot.

        'src' is the object that has the signal. You may pass in a string, in
        which case, it is interpreted as an id for an HTML Element.

        'signal' is a string that represents a signal name. If 'src' is an
        HTML Element, Window, or the Document, then it can be one of the
        'on-XYZ' events. Note that you must include the 'on' prefix, and it
        must be all lower-case. If 'src' is another kind of object, the signal
        must be previously registered with 'registerSignals()'.

        'dest' and 'func' describe the slot, or the action to take when the
        signal is triggered.

            -   If 'dest' is an object and 'func' is a string, then
                'dest[func](...)' will be called when the signal is signalled.

            -   If 'dest' is an object and 'func' is a function, then
                'func.apply(dest, ...)' will be called when the signal is
                signalled.

            -   If 'func' is undefined and 'dest' is a function, then
                'func.apply(src, ...)' will be called when the signal is
                signalled.

        No other combinations are allowed and should raise and exception.

        You may call 'connect()' multiple times with the same connection
        paramters. However, only a single connection will be made.

        ***/
        if (typeof(src) == 'string') {
            src = MochiKit.DOM.getElement(src);
        }

        if (typeof(sig) != 'string') {
            throw new Error("'sig' must be a string");
        }

        slot = MochiKit.Signal._getSlot(slot, func);

        // Find the signal, attach the slot.
        
        if (src.addEventListener || src.attachEvent || src[sig]) {
            // Create the _listeners object. This will help us remember which
            // events we are watching.
            if (!src._listeners) {
                src._listeners = {};
            }

            // Add the signal connector if it hasn't been done already.
            if (!src._listeners[sig]) {
                var listener = function (nativeEvent) {
                    var eventObject = new MochiKit.Signal.Event(nativeEvent);
                    MochiKit.Signal.signal(src, sig, eventObject);
                    return true;
                };
                MochiKit.Signal._observers.push([src, sig, listener]);

                if (src.addEventListener) {
                    src.addEventListener(sig.substr(2), listener, false);
                } else if (src.attachEvent) {
                    src.attachEvent(sig, listener); // useCapture unsupported
                } else {
                    src[sig] = listener;
                }

                src._listeners[sig] = listener;
            }

            if (!src._signals) {
                src._signals = {};
            }
            if (!src._signals[sig]) {
                src._signals[sig] = [];
            }
        } else {
            if (!src._signals || !src._signals[sig]) {
                throw new Error("No such signal '" + sig + "' registered.");
            }
        }

        // Actually add the slot... if it isn't there already.
        var signals = src._signals[sig];
        for (var i = 0; i < signals.length; i++) {
            var s = signals[i];
            if (slot[0] === s[0] && slot[1] === s[1] && slot[2] === s[2]) {
                return;
            }
        }
        signals.push(slot);
    },

    disconnect: function (src, sig, slot, /* optional */func) {
        /***

        When 'disconnect()' is called, it will disconnect whatever connection
        was made given the same parameters to 'connect()'. Note that if you
        want to pass a closure to 'connect()', you'll have to remember it if
        you want to later 'disconnect()' it.

        ***/
        if (typeof(src) == 'string') {
            src = MochiKit.DOM.getElement(src);
        }

        if (typeof(sig) != 'string') {
            throw new Error("'signal' must be a string");
        }

        slot = MochiKit.Signal._getSlot(slot, func);

        if (src._signals && src._signals[sig]) {
            var signals = src._signals[sig];
            var origlen = signals.length;
            for (var i = 0; i < signals.length; i++) {
                var s = signals[i];
                if (s[0] === slot[0] && s[1] === slot[1] && s[2] === slot[2]) {
                    signals.splice(i, 1);
                    break;
                }
            }
        } else {
            throw new Error("Invalid signal to disconnect");
        }
        
        if (src.addEventListener || src.attachEvent || src._signals[sig]) {
            // Stop listening if there are no connected slots.
            if (src._listeners && src._listeners[sig] &&
                src._signals[sig].length === 0) {

                var listener = src._listeners[sig];

                if (src.removeEventListener) {
                    src.removeEventListener(sig.substr(2), listener, false);
                } else if (src.detachEvent) {
                    src.detachEvent(sig, listener);
                } else {
                    src._signals[sig] = undefined;
                }

                var observers = MochiKit.Signal._observers;
                for (var i = 0; i < observers.length; i++) {
                    var o = observers[i];
                    if (o[0] === src && o[1] === sig && o[2] === listener) {
                        observers.splice(i, 1);
                        break;
                    }
                }
                src._listeners[sig] = undefined;
            }
        }
    },

    signal: function (src, sig) {
        /***

        This will signal a signal, passing whatever additional parameters
        on to the connected slots. 'src' and 'signal' are the same as for
        'connect()'.

        ***/
        if (typeof(src) == 'string') {
            src = MochiKit.DOM.getElement(src);
        }

        if (typeof(sig) != 'string') {
            throw new Error("'signal' must be a string");
        }

        if (!src._signals || !src._signals[sig]) {
            if (src.addEventListener || src.attachEvent || src[sig]) {
                // Ignored.
                return;
            } else {
                throw new Error("No such signal '" + sig + "'");
            }
        }
        var slots = src._signals[sig];

        var args = MochiKit.Base.extend(null, arguments, 2);

        var slot;
        var errors = [];
        for (var i = 0; i < slots.length; i++) {
            slot = slots[i];
            try {
                if (slot.length == 1) {
                    slot[0].apply(src, args);
                } else {
                    if (typeof(slot[1]) == 'string') {
                        slot[0][slot[1]].apply(slot[0], args);
                    } else {
                        slot[1].apply(slot[0], args);
                    }
                }
            } catch (e) {
                errors.push(e);
            }
        }
        if (errors.length == 1) {
            throw errors[0];
        } else if (errors.length) {
            var e = new Error("There were errors in handling signal 'sig'.");
            e.errors = errors;
            throw e;
        }
    },

    registerSignals: function (src, signals) {
        /***

        This will register signals for the object 'src'. (Note that a string
        here is not allowed--you don't need to register signals for DOM
        objects.) 'signals' is an array of strings.

        You may register the same signals multiple times; subsequent register
        calls with the same signal names will have no effect, and the existing
        connections, if any, will not be lost.

        ***/
        if (!src._signals) {
            src._signals = {
                /*
                __repr__: function () {
                    var m = MochiKit.Base;
                    var signals = m.items(this);
                    signals = m.filter(
                        function (a) { return a[0] != "__repr__"; },
                        signals
                    );
                    signals.sort(m.compare);
                    return (
                        '{\n    ' + m.map(
                            function (a) {
                                return m.map(m.repr, a).join(": ")
                            },
                            signals
                        ).join(",\n    ") + "\n}"
                    );
                }
                */
            };
        }

        for (var i = 0; i < signals.length; i++) {
            var sig = signals[i];
            if (!src._signals[sig]) {
                src._signals[sig] = [];
            }
        }
    }
});

MochiKit.Signal.EXPORT_OK = [];

MochiKit.Signal.EXPORT = [
    'connect',
    'disconnect',
    'signal',
    'registerSignals'
];

MochiKit.Signal.__new__ = function (win) {
    var m = MochiKit.Base;
    this._document = document;
    this._window = win;

    try {
        this.connect(window, 'onunload', this._unloadCache);
    } catch (e) {
        // pass: might not be a browser
    }

    this.EXPORT_TAGS = {
        ':common': this.EXPORT,
        ':all': m.concat(this.EXPORT, this.EXPORT_OK)
    };

    m.nameFunctions(this);

};

MochiKit.Signal.__new__(this);

MochiKit.Base._exportSymbols(this, MochiKit.Signal);
