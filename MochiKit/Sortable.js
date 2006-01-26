/***
Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
    Mochi-ized By Thomas Herve (_firstname_@nimail.org)

See scriptaculous.js for full license.

***/
SortableObserver = function (element, observer) {
    this.__init__(element, observer);
};

SortableObserver.prototype = {
    /***

    Observe events of drag and drop sortables.

    ***/
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
    /***

    Manage sortables. Mainly use the create function to add a sortable.

    ***/
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
        var toDestroy = MochiKit.Base.filter(function (s) {
            return s.element == element;
        }, this.sortables);
        MochiKit.Iter.forEach(toDestroy, function (s) {
            MochiKit.DragAndDrop.Draggables.removeObserver(s.element);
            MochiKit.Iter.forEach(s.droppables, function (d) {
                MochiKit.DragAndDrop.Droppables.remove(d);
            });
            MochiKit.Iter.forEach(s.draggables, function (d) {
                d.destroy();
            });
        });
        this.sortables = MochiKit.Base.filter(function (s) {
            return s.element != element;
        }, this.sortables);
    },

    create: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        options = MochiKit.Base.update({
            element: element,
            tag: 'li',  // assumes li children, override with tag: 'tagname'
            dropOnEmpty: false,
            tree: false,  // fixme: unimplemented
            overlap: 'vertical',  // one of 'vertical', 'horizontal'
            constraint: 'vertical',  // one of 'vertical', 'horizontal', false
            // also takes array of elements (or ids); or false
            containment: element,
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
            onhover: Sortable.onHover,
            greedy: !options.dropOnEmpty
        }

        // fix for gecko engine
        MochiKit.DOM.cleanWhitespace(element);

        options.draggables = [];
        options.droppables = [];

        // make it so

        // drop on empty handling
        if (options.dropOnEmpty) {
            new MochiKit.DragAndDrop.Droppable(element, {
                containment: options.containment,
                onhover: Sortable.onEmptyHover,
                greedy: false
            });
            options.droppables.push(element);
        }
        MochiKit.Iter.forEach((this.findElements(element, options) || []),
        function (e) {
            // handles are per-draggable
            var handle = options.handle ?
                MochiKit.DOM.getElementsByTagAndClassName(null,
                    options.handle, e)[0] : e;
            options.draggables.push(
                new MochiKit.DragAndDrop.Draggable(e,
                    MochiKit.Base.update(options_for_draggable,
                                         {handle: handle})));
            new MochiKit.DragAndDrop.Droppable(e, options_for_droppable);
            options.droppables.push(e);
        });

        // keep reference
        this.sortables.push(options);

        // for onupdate
        MochiKit.DragAndDrop.Draggables.addObserver(
            new SortableObserver(element, options.onUpdate));
    },

    // return all suitable-for-sortable elements in a guaranteed order
    findElements: function (element, options) {
        if (!element.hasChildNodes()) {
            return null;
        }
        var elements = [];
        MochiKit.Iter.forEach(element.childNodes, function (e) {
            if (e.tagName &&
                e.tagName.toUpperCase() == options.tag.toUpperCase() &&
               (!options.only ||
                (MochiKit.DOM.hasElementClass(e, options.only)))) {
                elements.push(e);
            }
            if (options.tree) {
                var grandchildren = this.findElements(e, options);
                if (grandchildren) {
                    elements.push(grandchildren);
                }
            }
        });

        return (elements.length > 0 ? MochiKit.Base.flatten(elements) : null);
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
            Sortable._marker = MochiKit.DOM.getElement('dropmarker') ||
                               document.createElement('DIV');
            MochiKit.DOM.hideElement(Sortable._marker);
            MochiKit.DOM.addElementClass(Sortable._marker, 'dropmarker');
            Sortable._marker.style.position = 'absolute';
            document.getElementsByTagName('body').item(0).appendChild(
                Sortable._marker);
        }
        var offsets = MochiKit.Position.cumulativeOffset(dropon);
        Sortable._marker.style.left = offsets[0] + 'px';
        Sortable._marker.style.top = offsets[1] + 'px';

        if (position == 'after') {
            if (sortable.overlap == 'horizontal') {
                Sortable._marker.style.left = (offsets[0] +
                                               dropon.clientWidth) + 'px';
            } else {
                Sortable._marker.style.top = (offsets[1] +
                                              dropon.clientHeight) + 'px';
            }
        }
        MochiKit.DOM.showElement(Sortable._marker);
    },

    serialize: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        var sortableOptions = this.options(element);
        options = MochiKit.Base.update({
            tag: sortableOptions.tag,
            only: sortableOptions.only,
            name: element.id,
            format: sortableOptions.format || /^[^_]*_(.*)$/
        }, options || {});
        return MochiKit.Base.map(function (item) {
          return (encodeURIComponent(options.name) + '[]=' +
                  encodeURIComponent(item.id.match(options.format) ?
                    item.id.match(options.format)[1] : ''));
        }, MochiKit.DOM.getElement(
            this.findElements(element, options) || [])).join('&');
    }
};

