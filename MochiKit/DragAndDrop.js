/***
MochiKit.DragAndDrop 1.2

See <http://mochikit.com/> for documentation, downloads, license, etc.

Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
    Mochi-ized By Thomas Herve (_firstname_@nimail.org)

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.DragAndDrop');
    dojo.require('MochiKit.Base');
    dojo.require('MochiKit.DOM');
    dojo.require('MochiKit.Iter');
    dojo.require('MochiKit.Visual');
    dojo.require('MochiKit.Signal');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
    JSAN.use("MochiKit.DOM", []);
    JSAN.use("MochiKit.Visual", []);
    JSAN.use("MochiKit.Iter", []);
    JSAN.use("MochiKit.Signal", []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined' ||
        typeof(MochiKit.DOM) == 'undefined' ||
        typeof(MochiKit.Visual) == 'undefined' ||
        typeof(MochiKit.Signal) == 'undefined' ||
        typeof(MochiKit.Iter) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.DragAndDrop depends on MochiKit.Base, MochiKit.DOM, MochiKit.Visual, MochiKit.Signal and MochiKit.Iter!";
}

if (typeof(MochiKit.DragAndDrop) == 'undefined') {
    MochiKit.DragAndDrop = {};
}

MochiKit.DragAndDrop.NAME = 'MochiKit.DragAndDrop';
MochiKit.DragAndDrop.VERSION = '1.2';

MochiKit.DragAndDrop.__repr__ = function () {
    return '[' + this.NAME + ' ' + this.VERSION + ']';
};

MochiKit.DragAndDrop.toString = function () {
    return this.__repr__();
};

MochiKit.DragAndDrop.EXPORT = [
    "Droppable",
    "Draggable"
];

MochiKit.DragAndDrop.EXPORT_OK = [
    "Droppables",
    "Draggables"
];

MochiKit.DragAndDrop.Droppables = {
    /***

    Manage all droppables. Shouldn't be used, use the Droppable object instead.

    ***/
    drops: [],

    remove: function (element) {
        this.drops = MochiKit.Base.filter(function (d) {
            return d.element != MochiKit.DOM.getElement(element)
        }, this.drops);
    },

    register: function (drop) {
        this.drops.push(drop);
    },

    unregister: function (drop) {
        this.drops = MochiKit.Base.filter(function (d) {
            return d != drop;
        }, this.drops);
    },

    prepare: function (element) {
        MochiKit.Iter.forEach(this.drops, function (drop) {
            if (drop.isAccepted(element)) {
                if (drop.options.activeclass) {
                    MochiKit.DOM.addElementClass(drop.element,
                                                 drop.options.activeclass);
                }
                if (drop.options.onactive) {
                    drop.options.onactive(drop.element, element);
                }
            }
        });
    },

    show: function (point, element) {
        if (!this.drops.length) {
            return;
        }

        if (this.last_active) {
            this.last_active.deactivate();
        }
        MochiKit.Iter.forEach(this.drops, function (drop) {
            if (drop.isAffected(point, element)) {
                if (drop.options.onhover) {
                    drop.options.onhover(element, drop.element,
                       MochiKit.Position.overlap(drop.options.overlap,
                                                 drop.element));
                }
                if (drop.options.greedy) {
                    drop.activate();
                    throw MochiKit.Iter.StopIteration;
                }
            }
        });
    },

    fire: function (event, element) {
        if (!this.last_active) {
            return;
        }
        MochiKit.Position.prepare();

        if (this.last_active.isAffected(event.mouse(), element)) {
            if (this.last_active.options.ondrop) {
                this.last_active.options.ondrop(element,
                   this.last_active.element, event);
            }
        }
    },

    reset: function (element) {
        MochiKit.Iter.forEach(this.drops, function (drop) {
            if (drop.options.activeclass) {
                MochiKit.DOM.removeElementClass(drop.element,
                                                drop.options.activeclass);
            }
            if (drop.options.ondesactive) {
                drop.options.ondesactive(drop.element, element);
            }
        });
        if (this.last_active) {
            this.last_active.deactivate();
        }
    }
};

MochiKit.DragAndDrop.Droppable = function (element, options) {
    this.__init__(element, options);
};

MochiKit.DragAndDrop.Droppable.prototype = {
    /***

    A droppable object. Simple use is to create giving an element:

        new MochiKit.DragAndDrop.Droppable('myelement');

    Generally you'll want to define the 'ondrop' function and maybe the
    'accept' option to filter draggables.

    ***/
    __class__: MochiKit.DragAndDrop.Droppable,

    __init__: function (element, /* optional */options) {
        this.element = MochiKit.DOM.getElement(element);
        this.options = MochiKit.Base.update({
            greedy: true,
            hoverclass: null,
            activeclass: null
        }, options || {});

        // cache containers
        if (this.options.containment) {
            this.options._containers = [];
            var containment = this.options.containment;
            if ((typeof(containment) == 'object') &&
                (containment.constructor == Array)) {
                MochiKit.Iter.forEach(containment, function (c) {
                    this.options._containers.push(MochiKit.DOM.getElement(c));
                });
            } else {
                this.options._containers.push(
                    MochiKit.DOM.getElement(containment));
            }
        }

        MochiKit.DOM.makePositioned(this.element); // fix IE

        MochiKit.DragAndDrop.Droppables.register(this);
    },

    isContained: function (element) {
        var parentNode = element.parentNode;
        return MochiKit.Iter.some(this._containers, function (c) {
            return parentNode == c;
        });
    },

    isAccepted: function (element) {
        return ((!this.accept) || MochiKit.Iter.some(this.accept, function (d) {
            return MochiKit.Iter.some(element.className.split(' '),
            function (c) {
                return c == d;
            }
        )}));
    },

    isAffected: function (point, element) {
        return (
            (this.element != element) &&
            ((!this._containers) || this.isContained(element)) &&
            (this.isAccepted(element)) &&
            MochiKit.Position.within(this.element, point.page.x,
                                                   point.page.y));
    },

    deactivate: function () {
        /***

        A droppable is deactivate when a draggablehas been over it and left.

        ***/
        if (this.options.hoverclass) {
            MochiKit.DOM.removeElementClass(this.element,
                                            this.options.hoverclass);
        }
        if (this.options.hoverfunc) {
            this.options.hoverfunc(this.element, false);
        }
        MochiKit.DragAndDrop.Droppables.last_active = null;
    },

    activate: function () {
        /***

        A droppable is active when a draggable is over it.

        ***/
        if (this.options.hoverclass) {
            MochiKit.DOM.addElementClass(this.element, this.options.hoverclass);
        }
        if (this.options.hoverfunc) {
            this.options.hoverfunc(this.element, true);
        }
        MochiKit.DragAndDrop.Droppables.last_active = this;
    },

    destroy: function () {
        /***

        Delete this droppable.

        ***/
        MochiKit.DragAndDrop.Droppables.unregister(this);
    },

    repr: function () {
        return '[' + this.__class__.NAME + ", options:" + MochiKit.Base.repr(this.options) + "]";
    }
};

MochiKit.DragAndDrop.Draggables = {
    /***

    Manage draggables elements. Not intended to direct use.

    ***/
    drags: [],

    observers: [],

    register: function (draggable) {
        if (this.drags.length === 0) {
            this.eventMouseUp = MochiKit.Base.bind(this.endDrag, this); 
            this.eventMouseMove = MochiKit.Base.bind(this.updateDrag, this); 
            this.eventKeypress = MochiKit.Base.bind(this.keyPress, this); 
            MochiKit.Signal.connect(document, 'onmouseup', this.eventMouseUp); 
            MochiKit.Signal.connect(document, 'onmousemove', this.eventMouseMove); 
            MochiKit.Signal.connect(document, 'onkeypress', this.eventKeypress); 
        }
        this.drags.push(draggable);
    },

    unregister: function (draggable) {
        this.drags = MochiKit.Base.filter(function (d) {
            return d != draggable;
        }, this.drags);
        if (this.drags.length === 0) {
            MochiKit.Signal.disconnect(document, 'onmouseup', 
                                       this.eventMouseUp); 
            MochiKit.Signal.disconnect(document, 'onmousemove', 
                                       this.eventMouseMove); 
            MochiKit.Signal.disconnect(document, 'onkeypress', 
                                       this.eventKeypress);
        }
    },

    activate: function (draggable) {
        // allows keypress events if window is not currently focused
        // fails for Safari
        window.focus();
        this.activeDraggable = draggable;
    },

    deactivate: function (draggable) {
        this.activeDraggable = null;
    },

    updateDrag: function (event) {
        if (!this.activeDraggable) {
            return;
        }
        var pointer = event.mouse();
        // Mozilla-based browsers fire successive mousemove events with
        // the same coordinates, prevent needless redrawing (moz bug?)
        if (this._lastPointer && (MochiKit.Base.repr(this._lastPointer.page) ==
                                  MochiKit.Base.repr(pointer.page))) {
            return;
        }
        this._lastPointer = pointer;
        this.activeDraggable.updateDrag(event, pointer);
    },

    endDrag: function (event) {
        if (!this.activeDraggable) {
            return;
        }
        this._lastPointer = null;
        this.activeDraggable.endDrag(event);
        this.activeDraggable = null;
    },

    keyPress: function (event) {
        if (this.activeDraggable) {
            this.activeDraggable.keyPress(event);
        }
    },

    addObserver: function (observer) {
        this.observers.push(observer);
        this._cacheObserverCallbacks();
    },

    removeObserver: function (element) {
        // element instead of observer fixes mem leaks
        this.observers = MochiKit.Base.filter(function (o) {
            return o.element != element;
        }, this.observers);
        this._cacheObserverCallbacks();
    },

    notify: function (eventName, draggable, event) {
        // 'onStart', 'onEnd', 'onDrag'
        if (this[eventName + 'Count'] > 0) {
            MochiKit.Iter.forEach(this.observers, function (o) {
                if (o[eventName]) {
                    o[eventName](eventName, draggable, event);
                }
            });
        }
    },

    _cacheObserverCallbacks: function () {
        MochiKit.Iter.forEach(['onStart', 'onEnd', 'onDrag'],
        function (eventName) {
            MochiKit.DragAndDrop.Draggables[eventName + 'Count'] =
            MochiKit.Base.filter(function (o) {
                return o[eventName];
            }, MochiKit.DragAndDrop.Draggables.observers).length;
        });
    }
};

MochiKit.DragAndDrop.Draggable = function (element, options) {
    this.__init__(element, options);
};

MochiKit.DragAndDrop.Draggable.prototype = {
    /***

    A draggable object. Simple instantiate :

        new MochiKit.DragAndDrop.Draggable('myelement');

    ***/
    __class__ : MochiKit.DragAndDrop.Draggable,

    __init__: function (element, /* optional */options) {
        options = MochiKit.Base.update({
            handle: false,
            starteffect: function (element) {
                new MochiKit.Visual.Opacity(element,
                                   {duration:0.2, from:1.0, to:0.7});
            },
            reverteffect: function (element, top_offset, left_offset) {
                var dur = Math.sqrt(Math.abs(top_offset^2) +
                          Math.abs(left_offset^2))*0.02;
                element._revert = new MochiKit.Visual.Move(element,
                            {x: -left_offset, y: -top_offset, duration: dur});
            },
            endeffect: function (element) {
                new MochiKit.Visual.Opacity(element, {duration:0.2, from:0.7, to:1.0});
            },
            zindex: 1000,
            revert: false,
            // false, or xy or [x, y] or function (x, y){return [x, y];}
            snap: false
        }, options || {});

        this.element = MochiKit.DOM.getElement(element);

        if (options.handle && (typeof(options.handle) == 'string')) {
            this.handle = MochiKit.DOM.getElementsByTagAndClassName(null,
                                       options.handle, this.element)[0];
        }
        if (!this.handle) {
            this.handle = MochiKit.DOM.getElement(options.handle);
        }
        if (!this.handle) {
            this.handle = this.element;
        }

        MochiKit.DOM.makePositioned(this.element);  // fix IE

        this.delta = this.currentDelta();
        this.options = options;
        this.dragging = false;

        this.eventMouseDown = MochiKit.Base.bind(this.initDrag, this); 
        MochiKit.Signal.connect(this.handle, 'onmousedown', this.eventMouseDown); 
        MochiKit.DragAndDrop.Draggables.register(this);
    },

    destroy: function () {
        MochiKit.Signal.disconnect(this.handle, 'onmousedown',
                                  this.eventMouseDown);
        MochiKit.DragAndDrop.Draggables.unregister(this);
    },

    currentDelta: function () {
        return [
          parseInt(MochiKit.DOM.getStyle(this.element, 'left') || '0'),
          parseInt(MochiKit.DOM.getStyle(this.element, 'top') || '0')];
    },

    initDrag: function (event) {
        if (!event.mouse().button.left) {
            return;
        }
        // abort on form elements, fixes a Firefox issue
        var src = event.target;
        if (src.tagName && (
            src.tagName == 'INPUT' ||
            src.tagName == 'SELECT' ||
            src.tagName == 'BUTTON' ||
            src.tagName == 'TEXTAREA')) {
            return;
        }

        if (this.element._revert) {
            this.element._revert.cancel();
            this.element._revert = null;
        }

        var pointer = event.mouse();
        var pos = MochiKit.Position.cumulativeOffset(this.element);
        this.offset = [pointer.page.x - pos[0], pointer.page.y - pos[1]]

        MochiKit.DragAndDrop.Draggables.activate(this);
        event.stop();
    },

    startDrag: function (event) {
        this.dragging = true;
        if (this.options.selectclass) {
            MochiKit.DOM.addElementClass(this.element,
                                         this.options.selectclass);
        }
        if (this.options.onselect) {
            this.options.onselect(this.element);
        }
        if (this.options.zindex) {
            this.originalZ = parseInt(MochiKit.DOM.getStyle(this.element,
                                      'z-index') || '0');
            this.element.style.zIndex = this.options.zindex;
        }

        if (this.options.ghosting) {
            this._clone = this.element.cloneNode(true);
            MochiKit.Position.absolutize(this.element);
            this.element.parentNode.insertBefore(this._clone, this.element);
        }
        MochiKit.DragAndDrop.Droppables.prepare(this.element);
        MochiKit.DragAndDrop.Draggables.notify('onStart', this, event);
        if (this.options.starteffect) {
            this.options.starteffect(this.element);
        }
    },

    updateDrag: function (event, pointer) {
        if (!this.dragging) {
            this.startDrag(event);
        }
        MochiKit.Position.prepare();
        MochiKit.DragAndDrop.Droppables.show(pointer, this.element);
        MochiKit.DragAndDrop.Draggables.notify('onDrag', this, event);
        this.draw(pointer);
        if (this.options.change) {
            this.options.change(this);
        }

        // fix AppleWebKit rendering
        if (MochiKit.Base.isSafari()) {
            window.scrollBy(0, 0);
        }
        event.stop();
    },

    finishDrag: function (event, success) {
        this.dragging = false;
        if (this.options.selectclass) {
            MochiKit.DOM.removeElementClass(this.element,
                                            this.options.selectclass);
        }
        if (this.options.ondeselect) {
            this.options.ondeselect(this.element);
        }

        if (this.options.ghosting) {
            // XXX: from a user point of view, it would be better to remove
            // the node only *after* the MochiKit.Visual.Move end
            MochiKit.Position.relativize(this.element);
            MochiKit.DOM.removeElement(this._clone);
            this._clone = null;
        }

        if (success) {
            MochiKit.DragAndDrop.Droppables.fire(event, this.element);
        }
        MochiKit.DragAndDrop.Draggables.notify('onEnd', this, event);

        var revert = this.options.revert;
        if (revert && typeof(revert) == 'function') {
            revert = revert(this.element);
        }

        var d = this.currentDelta();
        if (revert && this.options.reverteffect) {
            this.options.reverteffect(this.element,
                d[1] - this.delta[1], d[0] - this.delta[0]);
        } else {
            this.delta = d;
        }

        if (this.options.zindex) {
            this.element.style.zIndex = this.originalZ;
        }

        if (this.options.endeffect) {
            this.options.endeffect(this.element);
        }

        MochiKit.DragAndDrop.Draggables.deactivate(this);
        MochiKit.DragAndDrop.Droppables.reset(this.element);
    },

    keyPress: function (event) {
        if (event.keyString != "KEY_ESCAPE") {
            return;
        }
        this.finishDrag(event, false);
        event.stop();
    },

    endDrag: function (event) {
        if (!this.dragging) {
            return;
        }
        this.finishDrag(event, true);
        event.stop();
    },

    draw: function (point) {
        var pos = MochiKit.Position.cumulativeOffset(this.element);
        var d = this.currentDelta();
        pos[0] -= d[0];
        pos[1] -= d[1];

        var p = [point.page.x - pos[0] - this.offset[0],
                 point.page.y - pos[1] - this.offset[1]]

        if (this.options.snap) {
            if (typeof(this.options.snap) == 'function') {
                p = this.options.snap(p[0], p[1]);
            } else {
                if (this.options.snap instanceof Array) {
                    p = MochiKit.Base.map(MochiKit.Base.bind(function (v, i) {
                            return Math.round(v/this.options.snap[i]) *
                                this.options.snap[i]
                        }, this), p)
                } else {
                    p = MochiKit.Base.map(MochiKit.Base.bind(function (v) {
                        return Math.round(v/this.options.snap) *
                            this.options.snap
                        }, this), p)
                }
            }
        }
        var style = this.element.style;
        if ((!this.options.constraint) ||
            (this.options.constraint == 'horizontal')) {
            style.left = p[0] + 'px';
        }
        if ((!this.options.constraint) ||
            (this.options.constraint == 'vertical')) {
            style.top = p[1] + 'px';
        }
        if (style.visibility == 'hidden') {
            style.visibility = '';  // fix gecko rendering
        }
    },

    repr: function () {
        return '[' + this.__class__.NAME + ", options:" + MochiKit.Base.repr(this.options) + "]";
    }
};

MochiKit.DragAndDrop.__new__ = function () {
    MochiKit.Base.nameFunctions(this);

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": MochiKit.Base.concat(this.EXPORT, this.EXPORT_OK)
    };
};

MochiKit.DragAndDrop.__new__();

MochiKit.Base._exportSymbols(this, MochiKit.DragAndDrop);

