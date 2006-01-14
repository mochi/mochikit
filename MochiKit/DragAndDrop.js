/***
Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
    Mochi-ized By Thomas Herve (_firstname_@nimail.org)

See scriptaculous.js for full license.

***/

if (typeof(DragAndDrop) == 'undefined') {
    DragAndDrop = {};
}

DragAndDrop.NAME = 'DragAndDrop';
DragAndDrop.VERSION = '1.0';

DragAndDrop.__repr__ = function () {
    return '[' + this.NAME + ' ' + this.VERSION + ']';
};

DragAndDrop.toString = function () {
    return this.__repr__();
};

DragAndDrop.Droppables = {
    drops: [],

    remove: function (element) {
        this.drops = MochiKit.Base.filter(function (d) {
            return d.element != MochiKit.DOM.getElement(element)
        }, this.drops);
    },

    add: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update({
            greedy: true,
            hoverclass: null
        }, options || {});

        // cache containers
        if (options.containment) {
            options._containers = [];
            var containment = options.containment;
            if ((typeof containment == 'object') &&
                (containment.constructor == Array)) {
                MochiKit.Iter.forEach(containment, function (c) {
                    options._containers.push(MochiKit.DOM.getElement(c));
                });
            } else {
                options._containers.push(MochiKit.DOM.getElement(containment));
            }
        }

        if (options.accept) {
            options.accept = MochiKit.Iter.flatten([options.accept]);
        }

        MochiKit.DOM.makePositioned(element); // fix IE
        options.element = element;

        this.drops.push(options);
    },

    isContained: function (element, drop) {
        var parentNode = element.parentNode;
        return MochiKit.Iter.some(drop._containers, function (c) {
            return parentNode == c;
        });
    },

    isAffected: function (point, element, drop) {
        return (
            (drop.element != element) &&
            ((!drop._containers) || this.isContained(element, drop)) &&
            ((!drop.accept) || MochiKit.Iter.some(drop.accept, function (d) {
                return MochiKit.Iter.some(element.className.split(' '), function (c) {
                    return c == d;
                })
            })) &&
            MochiKit.Position.within(drop.element, point[0], point[1]));
    },

    deactivate: function (drop) {
        if (drop.hoverclass) {
            MochiKit.DOM.removeElementClass(drop.element, drop.hoverclass);
        }
        this.last_active = null;
    },

    activate: function (drop) {
        if (drop.hoverclass) {
            MochiKit.DOM.addElementClass(drop.element, drop.hoverclass);
        }
        this.last_active = drop;
    },

    show: function (point, element) {
        if (!this.drops.length) {
            return;
        }

        if (this.last_active) {
            this.deactivate(this.last_active);
        }
        MochiKit.Iter.forEach(this.drops, function (drop) {
            if (DragAndDrop.Droppables.isAffected(point, element, drop)) {
                if (drop.onHover) {
                    drop.onHover(element, drop.element,
                       MochiKit.Position.overlap(drop.overlap, drop.element));
                }
                if (drop.greedy) {
                    DragAndDrop.Droppables.activate(drop);
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

        if (this.isAffected([MochiKit.Event.pointerX(event), MochiKit.Event.pointerY(event)], element, this.last_active)) {
            if (this.last_active.onDrop) {
                this.last_active.onDrop(element, this.last_active.element, event);
            }
        }
    },

    reset: function () {
        if (this.last_active) {
          this.deactivate(this.last_active);
        }
    }
};

DragAndDrop.Draggables = {
    drags: [],
    observers: [],

    register: function (draggable) {
        if (this.drags.length == 0) {
            this.eventMouseUp = MochiKit.DOM.bindAsEventListener(this.endDrag, this);
            this.eventMouseMove = MochiKit.DOM.bindAsEventListener(this.updateDrag, this);
            this.eventKeypress = MochiKit.DOM.bindAsEventListener(this.keyPress, this);

            MochiKit.Event.observe(document, 'mouseup', this.eventMouseUp);
            MochiKit.Event.observe(document, 'mousemove', this.eventMouseMove);
            MochiKit.Event.observe(document, 'keypress', this.eventKeypress);
        }
        this.drags.push(draggable);
    },

    unregister: function (draggable) {
        this.drags = MochiKit.Iter.ifilter(function (d) {
            return d != draggable
        }, this.drags);
        if (this.drags.length == 0) {
            MochiKit.Event.stopObserving(document, 'mouseup', this.eventMouseUp);
            MochiKit.Event.stopObserving(document, 'mousemove', this.eventMouseMove);
            MochiKit.Event.stopObserving(document, 'keypress', this.eventKeypress);
        }
    },

    activate: function (draggable) {
        window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
        this.activeDraggable = draggable;
    },

    deactivate: function (draggbale) {
        this.activeDraggable = null;
    },

    updateDrag: function (event) {
        if (!this.activeDraggable) {
            return;
        }
        var pointer = [MochiKit.Event.pointerX(event), MochiKit.Event.pointerY(event)];
        // Mozilla-based browsers fire successive mousemove events with
        // the same coordinates, prevent needless redrawing (moz bug?)
        if (this._lastPointer && (MochiKit.Base.repr(this._lastPointer) == MochiKit.Base.repr(pointer))) {
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

    removeObserver: function (element) {  // element instead of observer fixes mem leaks
        this.observers = MochiKit.Iter.ifilter(function (o) {
            return o.element != element;
        }, this.observers);
        this._cacheObserverCallbacks();
    },

    notify: function (eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
        if (this[eventName+'Count'] > 0) {
            MochiKit.Iter.forEach(this.observers, function (o) {
                if (o[eventName]) {
                    o[eventName](eventName, draggable, event);
                }
            });
        }
    },

    _cacheObserverCallbacks: function () {
        MochiKit.Iter.forEach(['onStart', 'onEnd', 'onDrag'], function (eventName) {
            DragAndDrop.Draggables[eventName + 'Count'] = MochiKit.Base.filter(function (o) {
                    return o[eventName];
                }, DragAndDrop.Draggables.observers).length;
        });
    }
};

DragAndDrop.Draggable = function (element, options) {
    this.__init__(element, options);
};

DragAndDrop.Draggable.prototype = {
    __init__: function (element, options) {
        options = MochiKit.Base.update({
            handle: false,
            starteffect: function (element) {
                new Effect.Opacity(element,
                                   {duration:0.2, from:1.0, to:0.7});
            },
            reverteffect: function (element, top_offset, left_offset) {
                var dur = Math.sqrt(Math.abs(top_offset^2) +
                          Math.abs(left_offset^2))*0.02;
                element._revert = new Effect.Move(element, 
                            {x: -left_offset, y: -top_offset, duration: dur});
            },
            endeffect: function (element) {
                new Effect.Opacity(element, {duration:0.2, from:0.7, to:1.0});
            },
            zindex: 1000,
            revert: false,
            // false, or xy or [x, y] or function (x, y){return [x, y];}
            snap: false
        }, options || {});

        this.element = MochiKit.DOM.getElement(element);

        if (options.handle && (typeof options.handle == 'string')) {
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

        this.eventMouseDown = MochiKit.DOM.bindAsEventListener(this.initDrag,
                                                               this);
        MochiKit.Event.observe(this.handle, 'mousedown', this.eventMouseDown);
        DragAndDrop.Draggables.register(this);
    },

    destroy: function () {
        MochiKit.Event.stopObserving(this.handle, 'mousedown',
                                     this.eventMouseDown);
        DragAndDrop.Draggables.unregister(this);
    },

    currentDelta: function () {
        return [
          parseInt(MochiKit.DOM.getStyle(this.element, 'left') || '0'),
          parseInt(MochiKit.DOM.getStyle(this.element, 'top') || '0')];
    },

    initDrag: function (event) {
        if (!MochiKit.Event.isLeftClick(event)) {
            return;
        }
        // abort on form elements, fixes a Firefox issue
        var src = MochiKit.Event.element(event);
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

        var pointer = [MochiKit.Event.pointerX(event),
                       MochiKit.Event.pointerY(event)];
        var pos = MochiKit.Position.cumulativeOffset(this.element);
        this.offset = MochiKit.Base.map(function (i) {
            return (pointer[i] - pos[i]);
        }, [0, 1]);

        DragAndDrop.Draggables.activate(this);
        MochiKit.Event.stop(event);
    },

    startDrag: function (event) {
        this.dragging = true;
        if (this.options.selectClass) {
            MochiKit.DOM.addElementClass(this.element,
                                         this.options.selectClass);
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

        DragAndDrop.Draggables.notify('onStart', this, event);
        if (this.options.starteffect) {
            this.options.starteffect(this.element);
        }
    },

    updateDrag: function (event, pointer) {
        if (!this.dragging) {
            this.startDrag(event);
        }
        MochiKit.Position.prepare();
        DragAndDrop.Droppables.show(pointer, this.element);
        DragAndDrop.Draggables.notify('onDrag', this, event);
        this.draw(pointer);
        if (this.options.change) {
            this.options.change(this);
        }

        // fix AppleWebKit rendering
        if (MochiKit.Base.isSafari()) {
            window.scrollBy(0, 0);
        }
        MochiKit.Event.stop(event);
    },

    finishDrag: function (event, success) {
        this.dragging = false;
        if (this.options.selectClass) {
            MochiKit.DOM.removeElementClass(this.element,
                                            this.options.selectClass);
        }

        if (this.options.ghosting) {
            MochiKit.Position.relativize(this.element);
            MochiKit.DOM.removeElement(this._clone);
            this._clone = null;
        }

        if (success) {
            DragAndDrop.Droppables.fire(event, this.element);
        }
        DragAndDrop.Draggables.notify('onEnd', this, event);

        var revert = this.options.revert;
        if (revert && typeof revert == 'function') {
            revert = revert(this.element);
        }

        var d = this.currentDelta();
        if (revert && this.options.reverteffect) {
            this.options.reverteffect(this.element,
                d[1]-this.delta[1], d[0]-this.delta[0]);
        } else {
            this.delta = d;
        }

        if (this.options.zindex) {
            this.element.style.zIndex = this.originalZ;
        }

        if (this.options.endeffect) {
            this.options.endeffect(this.element);
        }

        DragAndDrop.Draggables.deactivate(this);
        DragAndDrop.Droppables.reset();
    },

    keyPress: function (event) {
        if (event.keyCode != MochiKit.Event.KEY_ESC) {
            return;
        }
        this.finishDrag(event, false);
        MochiKit.Event.stop(event);
    },

    endDrag: function (event) {
        if (!this.dragging) {
            return;
        }
        this.finishDrag(event, true);
        MochiKit.Event.stop(event);
    },

    draw: function (point) {
        var pos = MochiKit.Position.cumulativeOffset(this.element);
        var d = this.currentDelta();
        pos[0] -= d[0]; pos[1] -= d[1];

        var p = MochiKit.Base.map(MochiKit.Base.bind(function (i) {
            return (point[i]-pos[i]-this.offset[i])
        }, this), [0, 1]);

        if (this.options.snap) {
            if (typeof this.options.snap == 'function') {
                p = this.options.snap(p[0], p[1]);
            } else {
                if (this.options.snap instanceof Array) {
                    p = MochiKit.Base.map(MochiKit.Base.bind(function (v, i) {
                            return Math.round(v/this.options.snap[i])*this.options.snap[i]
                        }, this), p)
                } else {
                    p = MochiKit.Base.map(MochiKit.Base.bind(function (v) {
                        return Math.round(v/this.options.snap)*this.options.snap
                        }, this), p)
                }
            }
        }

        var style = this.element.style;
        if ((!this.options.constraint) || (this.options.constraint == 'horizontal')) {
            style.left = p[0] + 'px';
        }
        if ((!this.options.constraint) || (this.options.constraint == 'vertical')) {
            style.top  = p[1] + 'px';
        }
        if (style.visibility == 'hidden') {
            style.visibility = '';  // fix gecko rendering
        }
    }
};

SortableObserver = function (element, observer) {
    this.__init__(element, observer);
};

SortableObserver.prototype = {
    __init__: function (element, observer) {
        this.element = MochiKit.DOM.getElement(element);
        this.observer = observer;
        this.lastValue = Sortable.serialize(this.element);
    },

    onStart: function () {
        this.lastValue = Sortable.serialize(this.element);
    },

    onEnd: function () {
        Sortable.unmark();
        if (this.lastValue != Sortable.serialize(this.element)) {
            this.observer(this.element)
        }
    }
};

var Sortable = {
    sortables: new Array(),

    options: function (element){
        element = MochiKit.DOM.getElement(element);
        var result;
        MochiKit.Iter.forEach(this.sortables, function (s) {
            if (s.element == element) {
                result = s;
                throw MochiKit.Iter.StopIteration;
            }
        });
        return result;
    },

    destroy: function (element){
        element = MochiKit.DOM.getElement(element);
        MochiKit.Iter.forEach(MochiKit.Iter.ifilter(function (s) {
                return s.element == element;
            }, this.sortables), function (s) {
                DragAndDrop.Draggables.removeObserver(s.element);
                MochiKit.Iter.forEach(s.droppables, function (d) {
                    DragAndDrop.Droppables.remove(d);
                });
            s.draggables.invoke('destroy');
        });
        this.sortables = MochiKit.Base.filter(function (s) {
            return s.element != element;
        }, this.sortables);
    },

    create: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update(
        {
            element: element,
            tag: 'li',  // assumes li children, override with tag: 'tagname'
            dropOnEmpty: false,
            tree: false,  // fixme: unimplemented
            overlap: 'vertical',  // one of 'vertical', 'horizontal'
            constraint: 'vertical',  // one of 'vertical', 'horizontal', false
            containment: element,  // also takes array of elements (or ids); or false
            handle: false,  // or a CSS class
            only: false,
            hoverclass: null,
            ghosting: false,
            format: null,
            onChange: MochiKit.Base.emptyFunction,
            onUpdate: MochiKit.Base.emptyFunction
        }, options);

        // clear any old sortable with same element
        this.destroy(element);

        // build options for the draggables
        var options_for_draggable = {
            revert: true,
            ghosting: options.ghosting,
            constraint: options.constraint,
            handle: options.handle
        };

        if (options.starteffect) {
            options_for_draggable.starteffect = options.starteffect;
        }

        if (options.reverteffect) {
          options_for_draggable.reverteffect = options.reverteffect;
        } else if (options.ghosting) {
            options_for_draggable.reverteffect = function (element) {
                element.style.top = 0;
                element.style.left = 0;
            };
        }

        if (options.endeffect) {
            options_for_draggable.endeffect = options.endeffect;
        }

        if (options.zindex) {
            options_for_draggable.zindex = options.zindex;
        }

        // build options for the droppables
        var options_for_droppable = {
            overlap: options.overlap,
            containment: options.containment,
            hoverclass: options.hoverclass,
            onHover: Sortable.onHover,
            greedy: !options.dropOnEmpty
        }

        // fix for gecko engine
        MochiKit.DOM.cleanWhitespace(element);

        options.draggables = [];
        options.droppables = [];

        // make it so

        // drop on empty handling
        if (options.dropOnEmpty) {
            DragAndDrop.Droppables.add(element,
            {containment: options.containment, onHover: Sortable.onEmptyHover, greedy: false});
            options.droppables.push(element);
        }
        MochiKit.Iter.forEach((this.findElements(element, options) || []), function (e) {
            // handles are per-draggable
            var handle = options.handle ?
                MochiKit.DOM.getElementsByTagAndClassName(null, options.handle, e)[0] : e;
            options.draggables.push(
                new DragAndDrop.Draggable(e, MochiKit.Base.update(options_for_draggable,
                                                          {handle: handle})));
            DragAndDrop.Droppables.add(e, options_for_droppable);
            options.droppables.push(e);
        });

        // keep reference
        this.sortables.push(options);

        // for onupdate
        DragAndDrop.Draggables.addObserver(new SortableObserver(element, options.onUpdate));
    },

    // return all suitable-for-sortable elements in a guaranteed order
    findElements: function (element, options) {
        if (!element.hasChildNodes()) {
            return null;
        }
        var elements = [];
        MochiKit.Iter.forEach(element.childNodes, function (e) {
            if (e.tagName && e.tagName.toUpperCase() == options.tag.toUpperCase() &&
               (!options.only || (MochiKit.DOM.hasElementClass(e, options.only)))) {
                elements.push(e);
            }
            if (options.tree) {
                var grandchildren = this.findElements(e, options);
                if (grandchildren) {
                    elements.push(grandchildren);
                }
            }
        });

        return (elements.length > 0 ? MochiKit.Iter.flatten(elements) : null);
    },

    onHover: function (element, dropon, overlap) {
        if (overlap > 0.5) {
            Sortable.mark(dropon, 'before');
            if (dropon.previousSibling != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = 'hidden';  // fix gecko rendering
                dropon.parentNode.insertBefore(element, dropon);
                if (dropon.parentNode != oldParentNode) {
                    Sortable.options(oldParentNode).onChange(element);
                }
                Sortable.options(dropon.parentNode).onChange(element);
            }
        } else {
            Sortable.mark(dropon, 'after');
            var nextElement = dropon.nextSibling || null;
            if (nextElement != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = 'hidden';  // fix gecko rendering
                dropon.parentNode.insertBefore(element, nextElement);
                if (dropon.parentNode != oldParentNode) {
                    Sortable.options(oldParentNode).onChange(element);
                }
                Sortable.options(dropon.parentNode).onChange(element);
            }
        }
    },

    onEmptyHover: function (element, dropon) {
        if (element.parentNode != dropon) {
            var oldParentNode = element.parentNode;
            dropon.appendChild(element);
            Sortable.options(oldParentNode).onChange(element);
            Sortable.options(dropon).onChange(element);
        }
    },

    unmark: function () {
        if (Sortable._marker) {
            MochiKit.DOM.hideElement(Sortable._marker);
        }
    },

    mark: function (dropon, position) {
        // mark on ghosting only
        var sortable = Sortable.options(dropon.parentNode);
        if (sortable && !sortable.ghosting) {
            return;
        }

        if (!Sortable._marker) {
            Sortable._marker = MochiKit.DOM.getElement('dropmarker') || document.createElement('DIV');
            MochiKit.DOM.hideElement(Sortable._marker);
            MochiKit.DOM.addElementClass(Sortable._marker, 'dropmarker');
            Sortable._marker.style.position = 'absolute';
            document.getElementsByTagName('body').item(0).appendChild(Sortable._marker);
        }
        var offsets = MochiKit.Position.cumulativeOffset(dropon);
        Sortable._marker.style.left = offsets[0] + 'px';
        Sortable._marker.style.top = offsets[1] + 'px';

        if (position == 'after') {
            if (sortable.overlap == 'horizontal') {
                Sortable._marker.style.left = (offsets[0]+dropon.clientWidth) + 'px';
            } else {
                Sortable._marker.style.top = (offsets[1]+dropon.clientHeight) + 'px';
            }
        }
        MochiKit.DOM.showElement(Sortable._marker);
    },

    serialize: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        var sortableOptions = this.options(element);
        options = MochiKit.Base.update(
        {
            tag: sortableOptions.tag,
            only: sortableOptions.only,
            name: element.id,
            format: sortableOptions.format || /^[^_]*_(.*)$/
        }, options || {});
        return MochiKit.Base.map(function (item) {
          return (encodeURIComponent(options.name) + '[]=' +
                  encodeURIComponent(item.id.match(options.format) ? item.id.match(options.format)[1] : ''));
        }, MochiKit.DOM.getElement(this.findElements(element, options) || [])).join('&');
    }
};

