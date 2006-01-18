/***

MochiKit.Signal 1.2

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

MochiKit.Signal.Event = function (ev) {
    // pop the bubbles by default. we could add another method to 
    // turn it back on, if someone needs that.
            
    if (ev.stopPropagation && ev.preventDefault) {
        ev.stopPropagation();
        ev.preventDefault();
    } else {
        ev.returnValue = false;
        ev.cancelBubble = true;
    }

    this.event = ev;
    this.type = ev.type || false;

    // the actual ev.timeStamp value seems kind of random (looks like a
    // relative stamp), so fixing it
    this.timeStamp = (new Date).getTime();

    this.target = ev.target || ev.srcElement;
    
    this.altKey = ev.altKey;
    this.ctrlKey = ev.ctrlKey;
    this.metaKey = ev.metaKey || false; // ie and opera punt here
    this.shiftKey = ev.shiftKey;
    
    // key events
    if (this.type && this.type.indexOf('key') == 0) {
    
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
            this.keyCode = ev.keyCode;
            this.keyString = MochiKit.Signal._specialKeys[this.keyCode] || 
                'KEY_UNKNOWN';
        
        // look for unicode characters here
        } else if (this.type == 'keypress') {
            this.charCode = ev.charCode || ev.keyCode;
            // special keys don't have a character
            if (MochiKit.Signal._specialKeys[this.charCode]) {
                this.charString = '';
            } else {
                this.charString = String.fromCharCode(this.charCode);
            }
        }
    }
    
    // mouse events
    if (this.type && (this.type.indexOf('mouse') == 0 || 
        this.type == 'click' || this.type == 'dblclick' || 
        this.type == 'contextmenu')) {
            
        this.pageX = ev.pageX || (ev.clientX + 
          (document.documentElement.scrollLeft || 
          document.body.scrollLeft));
        this.pageY = ev.pageY || (ev.clientY + 
            (document.documentElement.scrollTop || 
            document.body.scrollTop));        
        this.page = new MochiKit.DOM.Coordinates(this.pageX, this.pageY);
        
        // layerX and offsetX are **NOT** equivalent
        // layerX refers to the cursor position in the positioning context,
        // offsetX refers to the cursor position in target element. this
        // should make things consistent, need to test!!
        
        var pos = MochiKit.DOM.elementPosition(this.target);

		// test to see how fast this is

        this.element = new MochiKit.DOM.Coordinates(this.pageX - pos['x'], 
        	this.pageY - pos['y']);
        this.context = new MochiKit.DOM.Coordinates(this.target.offsetLeft +
        	this.element['x'], this.target.offsetTop + this.element['y']);
        
        // click events, but we don't care what mouse button was pressed
        // when contextmenu was fired
        
        // safari does not fire click events on a control- or right-click
        // http://bugzilla.opendarwin.org/show_bug.cgi?id=6595
        if (this.type == 'mousedown' || this.type == 'mouseup' || 
            this.type == 'click' || this.type == 'dblclick') {
            
            this.isLeftClick = false;
            this.isRightClick = false;
            this.isMiddleClick = false;
            
            if (ev.which) {
                this.isLeftClick = (ev.which == 1) ? true : false;
                this.isMiddleClick = (ev.which == 2) ? true: false;
                this.isRightClick = (ev.which == 3) ? true : false;

                // mac browsers and right click:
                // safari doesn't fire any click events on a right click
                // firefox fires the event, and sets ctrlKey = true
                // opera fires the event, and sets metaKey = true
                
            } else {
                this.isLeftClick = (ev.button & 1) ? true : false;
                this.isRightClick = (ev.button & 2) ? true : false;
                this.isMiddleClick = (ev.button & 4) ? true : false;               
            }
        
        } else if (this.type == 'mouseover') {
            this.relatedTarget = ev.relatedTarget || ev.fromElement;
        } else if (this.type == 'mouseout') {
            this.relatedTarget = ev.relatedTarget || ev.toElement;
        }
    }
};
MochiKit.Signal.Event.prototype.repr = function () {
    var repr = MochiKit.Base.repr;
    return '{event: ' + repr(this.event) +
        ', type: ' + repr(this.type) +
        ', timeStamp: ' + repr(this.timeStamp) + 
        ', target: ' + repr(this.target) + 
    
        ', charCode: ' + repr(this.charCode) + 
        ', charString: ' + repr(this.charString) + 
    
        ', keyCode: ' + repr(this.keyCode) + 
        ', keyString: ' + repr(this.keyString) + 
    
        ', altKey: ' + repr(this.altKey) + 
        ', ctrlKey: ' + repr(this.ctrlKey) + 
        ', metaKey: ' + repr(this.metaKey) + 
        ', shiftKey: ' + repr(this.shiftKey) + 
    
        ', isLeftClick: ' + repr(this.isLeftClick) + 
        ', isMiddleClick: ' + repr(this.isMiddleClick) + 
        ', isRightClick: ' + repr(this.isRightClick) + 

        ', pageX: ' + repr(this.pageX) + 
        ', pageY: ' + repr(this.pageY) + 
        ', page: ' + repr(this.page) + 
    
        ', layerX: ' + repr(this.layerX) + 
        ', layerY: ' + repr(this.layerY) + 
        ', layer: ' + repr(this.layer) + 
    
        ', offsetX: ' + repr(this.offsetX) + 
        ', offsetY: ' + repr(this.offsetY) + 
        ', offset: ' + repr(this.offset) + 
    
        ', relatedTarget: ' + repr(this.relatedTarget) + '}';
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
    
    _get_slot: function(slot, func) {
        if (typeof(func) == 'string' || typeof(func) == 'function') {
            slot = [slot, func];
        } else if (!func && typeof(slot) == 'function') {
            slot = [slot];
        } else {
            throw new Error('Invalid slot parameters');
        }

        return slot;
    },

    _unloadCache: function() {
        try {
            for (var i = 0; i < MochiKit.Signal._observers.length; i++) {
                var src = MochiKit.Signal._observers[i][0];
                var sig = MochiKit.Signal._observers[i][1];
                var listener = MochiKit.Signal._observers[i][2];
    
                if (src.addEventListener) {
                    src.removeEventListener(sig.substr(2), listener, false);
                } else if (src.attachEvent) {
                    src.detachEvent(sig, listener);
                } else {
                    src[sig] = undefined;
                }
            }
        } catch(e) {
            // clean IE garbage
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
    connect: function(src, sig, slot, /* optional */func) {
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
                var listener = function(ev) {
                    ev = new MochiKit.Signal.Event(ev);
                    MochiKit.Signal.signal(src, sig, ev);
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
        if (MochiKit.Base.filter(
            function(s) {
                return MochiKit.Base.operator.ceq(s, slot);
            },
            src.__signals[sig]) == 0) {

            src.__signals[sig].push(slot);
        }
    },

    disconnect: function(src, sig, slot, /* optional */func) {
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
            src.__signals[sig] = MochiKit.Base.filter(
                function(s) {
                    return MochiKit.Base.operator.cne(s, slot); // FIXME: possible bug?
                },
                src.__signals[sig]);
        }

        if (src.addEventListener || src.attachEvent || src[signal]) {
            // DOM object

            // Stop listening if there are no connected slots.
            if (src.__listeners && src.__listeners[sig] &&
                src.__signals[sig].length == 0) {

                var listener = src.__listeners[sig];

                if (src.addEventListener) {
                    src.removeEventListener(sig, listener, false);
                } else if (src.attachEvent) {
                    src.detachEvent('on' + sig, listener);
                } else {
                    src[sig] = undefined;
                }

                MochiKit.Signal._observers = MochiKit.Base.filter(
                    function(o) {
                        return MochiKit.Base.operator.cne(o,
                            [src.sig, listener]);
                    },
                    MochiKit.Signal._observers
                );

                src.__listeners[sig] = undefined;
            }
        }
    },

    signal: function(src, sig) {
        /***
        
            This will signal a signal, passing whatever additional parameters
            on to the connected slots. 'src' and 'signal' are the same as for
            'connect()'.
        
        ***/
        if (typeof src == 'string') {
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
                    if (typeof slot[1] == 'string') {
                        slot[0][slot[1]].apply(slot[0], args)
                    } else {
                        slot[1].apply(slot[0], args);
                    }
                }
            } catch (e) {
                // TODO: Should we use the Logging module? Hartshorne says no.
                // I need to ask Bob.
                errors.push(e);
            }
        }
        if (errors.length) {
            var e = new Error("There were errors in handling signal 'sig'.");
            e.errors = errors;
            throw e;
        }
    },

    register_signals: function(src, signals) {
    /***
    
        This will register signals for the object 'src'. (Note that a string
        here is not allowed--you don't need to register signals for DOM
        objects.) 'signals' is an array of strings.

        You may register the same signals multiple times; subsequent register
        calls with the same signal names will have no effect, and the existing
        connections, if any, will not be lost.
    
    ***/
        if (!src.__signals) {
            src.__signals = {};
        }
        for (var i = 0; i < signals.length; i++) {
            if (!src.__signals[signals[i]]) {
                src.__signals[signals[i]] = [];
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
    'register_signals',
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

