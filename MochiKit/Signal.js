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
MochiKit.Signal.VERSION = '1.2';

MochiKit.Signal._observers = [];

MochiKit.Signal.Event = function (e) {
    this.event = e || window.event;
    this.type = this.event.type;

    // the actual this.event.timeStamp value seems kind of random, or is
    // missing, or is broken, so fixing it
    this.timeStamp = (new Date()).getTime();

    this.target = this.event.target || this.event.srcElement;
    
    this.altKey = this.event.altKey;
    this.ctrlKey = this.event.ctrlKey;
    this.metaKey = this.event.metaKey || false; // ie and opera punt here
    this.shiftKey = this.event.shiftKey;
    
    // key events
    if (this.type && this.type.indexOf('key') === 0) {
    
        /*
        
        // If you're looking for a special key, look for it in keydown or
        // keyup, but never keypress. If you're looking for a Unicode
        // chracter, look for it with keypress, but never kd or ku.
        
        // keyCode will contain the raw key code in a kd/ku event
        // keyString will contain a human-redable keyCode
        
        // charCode will contain the raw character code in a kp event
        // charString will contain the actual character
        
        Here are some of my notes:
        
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
        if (this.type == 'keydown' || this.type == 'keyup') {
            this.keyCode = this.event.keyCode;
            this.keyString = MochiKit.Signal._specialKeys[this.keyCode] || 
                'KEY_UNKNOWN';
        
        // look for unicode characters here
        } else if (this.type == 'keypress') {
            this.charCode = this.event.charCode || this.event.keyCode;
            // special keys don't have a character
            if (MochiKit.Signal._specialKeys[this.charCode]) {
                this.charString = '';
            } else {
                this.charString = String.fromCharCode(this.charCode);
            }
        }
    }
    
    // mouse events
    if (this.type && (
        this.type.indexOf('mouse') === 0 || 
        this.type.indexOf('click') != -1 ||
        this.type == 'contextmenu')) {

        this.cursor = new MochiKit.DOM.Coordinates(0, 0);

        if (this.event.pageX || this.event.pageY) {
            this.cursor.x = this.event.pageX;
            this.cursor.y = this.event.pageY;
        } else {
            // IE keeps its document offset in 
            // document.documentElement.clientTop
            
            // see http://msdn.microsoft.com/workshop/author/dhtml/reference/
            //     methods/getboundingclientrect.asp
            
            // the offset is (2,2) in standards mode and (0,0) in quirks mode
            this.cursor.x = (this.event.clientX + 
                (document.documentElement.scrollLeft || 
                document.body.scrollLeft) - 
                document.documentElement.clientLeft);
            this.cursor.y = (this.event.clientY + 
                (document.documentElement.scrollTop || 
                document.body.scrollTop) - 
                document.documentElement.clientTop);
        }
        
        if (this.type != 'mousemove') {
            this.isLeftClick = false;
            this.isRightClick = false;
            this.isMiddleClick = false;
            
            if (this.event.which) {
                this.isLeftClick = (this.event.which == 1);
                this.isMiddleClick = (this.event.which == 2);
                this.isRightClick = (this.event.which == 3);
    
                // mac browsers and right click:
                // safari doesn't fire any click events on a right click
                // firefox fires the event, and sets ctrlKey = true
                // opera fires the event, and sets metaKey = true
                // oncontextmenu can detect right clicks between browsers and
                // across platforms
                
            } else {
                this.isLeftClick = !!(this.event.button & 1);
                this.isRightClick = !!(this.event.button & 2);
                this.isMiddleClick = !!(this.event.button & 4);
            }
        }
        
        if (this.type == 'mouseover') {
            this.relatedTarget = (this.event.relatedTarget
                || this.event.fromElement);
        } else if (this.type == 'mouseout') {
            this.relatedTarget = (this.event.relatedTarget
                || this.event.toElement);
        }
    }
};

MochiKit.Signal.Event.prototype.stop = function () {
    if (this.event.stopPropagation) {
        this.event.stopPropagation();
        this.event.preventDefault();
    } else {
        this.event.returnValue = false;
        this.event.cancelBubble = true;
    }
};

MochiKit.Signal.Event.prototype.repr = function () {
    var repr = MochiKit.Base.repr;
    var str = '{event: ' + repr(this.event) +
        ', type: ' + repr(this.type) +
        ', timeStamp: ' + repr(this.timeStamp) + 
        ', target: ' + repr(this.target) +
        ', altKey: ' + repr(this.altKey) + 
        ', ctrlKey: ' + repr(this.ctrlKey) + 
        ', metaKey: ' + repr(this.metaKey) + 
        ', shiftKey: ' + repr(this.shiftKey);

    if (this.type && this.type.indexOf('key') === 0) {
        if (this.type == 'keydown' || this.type == 'keyup') {
            str += ', keyCode: ' + repr(this.keyCode) + 
                ', keyString: ' + repr(this.keyString);
        } else if (this.type == 'keypress') {
            str += ', charCode: ' + repr(this.charCode) + 
                ', charString: ' + repr(this.charString);
        }
    }

    if (this.type && (
        this.type.indexOf('mouse') === 0 || 
        this.type.indexOf('click') != -1 || 
        this.type == 'contextmenu')) {  
        
        str += ', cursor: ' + repr(this.cursor);
        
        if (this.type != 'mousemove') {
            str += ', isLeftClick: ' + repr(this.isLeftClick) + 
                ', isMiddleClick: ' + repr(this.isMiddleClick) + 
                ', isRightClick: ' + repr(this.isRightClick);
        }
    }
    
    if (this.type == 'mouseover' || this.type == 'mouseout') {
        str += ', relatedTarget: ' + repr(this.relatedTarget) + '}';
    }
    return str;
};

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
    
    _get_slot: function (slot, func) {
        if (typeof(func) == 'string' || typeof(func) == 'function') {
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
                if (src.addEventListener) {
                    src.removeEventListener(sig.substr(2), listener, false);
                } else if (src.attachEvent) {
                    src.detachEvent(sig, listener);
                } else {
                    src[sig] = undefined;
                }
            } catch(e) {
                // clean IE garbage
            }
        }

        MochiKit.Signal._observers = null;

        try {
            window.onload = null;
        } catch(e) {
            // clean IE garbage
        }
        
        try { 
            window.onunload = null; 
        } catch(e) {
            // clean IE garbage
        }
    },
    
    connect: function (src, sig, slot, /* optional */func) {
        /***
            
            Connects a signal to a slot.

            'src' is the object that has the signal. You may pass in a string,
            in which case, it is interpreted as an id for an HTML Element.

            'signal' is a string that represents a signal name. If 'src' is an
            HTML Element, Window, or the Document, then it can be one of the
            'on-XYZ' events. Note that you must include the 'on' prefix, and
            it must be all lower-case. If 'src' is another kind of object, the
            signal must be previously registered with 'register_signals()'.

            'dest' and 'func' describe the slot, or the action to take when
            the signal is triggered.

                - If 'dest' is an object and 'func' is a string, then
                'dest[func](...)' will be called when the signal is signalled.

                - If 'dest' is an object and 'func' is a function, then
                'func.apply(dest, ...)' will be called when the signal is
                signalled.

                - If 'func' is undefined and 'dest' is a function, then
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

        slot = MochiKit.Signal._get_slot(slot, func);

        // Find the signal, attach the slot.
        
        // DOM object
        if (src.addEventListener || src.attachEvent || src[signal]) { 
            // Create the __listeners object. This will help us remember which
            // events we are watching.
            if (!src.__listeners) {
                src.__listeners = {};
            }

            // Add the signal connector if it hasn't been done already.
            if (!src.__listeners[sig]) {
                var listener = function (nativeEvent) {
                    var eventObject = new MochiKit.Signal.Event(nativeEvent);
                    MochiKit.Signal.signal(src, sig, eventObject);
                    return true;
                };
                MochiKit.Signal._observers.push([src, sig, listener]);

                if (src.addEventListener) {
                    src.addEventListener(sig.substr(2), listener, false);
                } else if (src.attachEvent) {
                    src.attachEvent(sig, listener);
                } else {
                    src[sig] = listener;
                }

                src.__listeners[sig] = listener;
            }

            if (!src.__signals) {
                src.__signals = {};
            }
            if (!src.__signals[sig]) {
                src.__signals[sig] = [];
            }
        } else {
            if (!src.__signals || !src.__signals[sig]) {
                throw new Error("No such signal '" + sig + "' registered.");
            }
        }

        // Actually add the slot... if it isn't there already.
        var signals = src.__signals[sig];
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
        
            When 'disconnect()' is called, it will disconnect whatever
            connection was made given the same parameters to 'connect()'. Note
            that if you want to pass a closure to 'connect()', you'll have to
            remember it if you want to later 'disconnect()' it.

        ***/
        if (typeof(src) == 'string') {
            src = MochiKit.DOM.getElement(src);
        }

        if (typeof(sig) != 'string') {
            throw new Error("'signal' must be a string");
        }

        slot = MochiKit.Signal._get_slot(slot, func);

        if (src.__signals && src.__signals[sig]) {
            var signals = src.__signals[sig];
            var origlen = signals.length;
            for (var i = 0; i < signals.length; i++) {
                var s = signals[i];
                if (s[0] === slot[0] && s[1] === slot[1] && s[2] === slot[2]) {
                    signals.splice(i, 1);
                    break;
                }
            }
        }

        if (src.addEventListener || src.attachEvent || src.__signals[sig]) {
            // DOM object

            // Stop listening if there are no connected slots.
            if (src.__listeners && src.__listeners[sig] &&
                src.__signals[sig].length === 0) {

                var listener = src.__listeners[sig];

                if (src.addEventListener) {
                    src.removeEventListener(sig.substr(2), listener, false);
                } else if (src.attachEvent) {
                    src.detachEvent(sig, listener);
                } else {
                    src.__signals[sig] = undefined;
                }

                var observers = MochiKit.Signal._observers;
                for (var i = 0; i < observers.length; i++) {
                    var o = observers[i];
                    if (o[0] === src && o[1] === sig && o[2] === listener) {
                        observers.splice(i, 1);
                        break;
                    }
                }
                src.__listeners[sig] = undefined;
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

        if (!src.__signals || !src.__signals[sig]) {
            if (src.addEventListener || src.attachEvent || src[sig]) {
                // Ignored.
                return;
            } else {
                throw new Error("No such signal '" + sig + "'");
            }
        }
        var slots = src.__signals[sig];

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
        if (errors.length) {
            var e = new Error("There were errors in handling signal 'sig'.");
            e.errors = errors;
            throw e;
        }
    },

    register_signals: function (src, signals) {
        /***
    
        This will register signals for the object 'src'. (Note that a string
        here is not allowed--you don't need to register signals for DOM
        objects.) 'signals' is an array of strings.

        You may register the same signals multiple times; subsequent register
        calls with the same signal names will have no effect, and the existing
        connections, if any, will not be lost.
    
        ***/
        if (!src.__signals) {
            src.__signals = {
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
            if (!src.__signals[sig]) {
                src.__signals[sig] = [];
            }
        }
    }
});

MochiKit.Signal.connect(window, 'onunload', MochiKit.Signal._unloadCache);

MochiKit.Signal.EXPORT_OK = [];

MochiKit.Signal.EXPORT = [
    'connect',
    'disconnect',
    'signal',
    'register_signals'
];

MochiKit.Signal.__new__ = function (win) {
    var m = MochiKit.Base;
    this._document = document;
    this._window = win;

    this.EXPORT_TAGS = {
        ':common': this.EXPORT,
        ':all': m.concat(this.EXPORT, this.EXPORT_OK)
    };

    m.nameFunctions(this);

};

MochiKit.Signal.__new__(this);

MochiKit.Base._exportSymbols(this, MochiKit.Signal);
