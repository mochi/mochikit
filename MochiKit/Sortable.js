/***
Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
    Mochi-ized By Thomas Herve (_firstname_@nimail.org)

See scriptaculous.js for full license.

***/

if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.DragAndDrop');
    dojo.require('MochiKit.Base');
    dojo.require('MochiKit.DOM');
    dojo.require('MochiKit.Iter');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base", []);
    JSAN.use("MochiKit.DOM", []);
    JSAN.use("MochiKit.Iter", []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined' ||
        typeof(MochiKit.DOM) == 'undefined' ||
        typeof(MochiKit.Iter) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.DragAndDrop depends on MochiKit.Base, MochiKit.DOM and MochiKit.Iter!";
}

if (typeof(MochiKit.Sortable) == 'undefined') {
    MochiKit.Sortable = {};
}

MochiKit.Sortable.NAME = 'MochiKit.Sortable';
MochiKit.Sortable.VERSION = '1.3';

MochiKit.Sortable.__repr__ = function () {
    return '[' + this.NAME + ' ' + this.VERSION + ']';
};

MochiKit.Sortable.toString = function () {
    return this.__repr__();
};

MochiKit.Sortable.EXPORT = [
    "SortableObserver"
];

MochiKit.DragAndDrop.EXPORT_OK = [
    "Sortable"
];

MochiKit.Sortable.SortableObserver = function (element, observer) {
    this.__init__(element, observer);
};

MochiKit.Sortable.SortableObserver.prototype = {
    /***

    Observe events of drag and drop sortables.

    ***/
    __init__: function (element, observer) {
        this.element = MochiKit.DOM.getElement(element);
        this.observer = observer;
        this.lastValue = MochiKit.Sortable.Sortable.serialize(this.element);
    },

    onStart: function () {
        this.lastValue = MochiKit.Sortable.Sortable.serialize(this.element);
    },

    onEnd: function () {
        MochiKit.Sortable.Sortable.unmark();
        if (this.lastValue != MochiKit.Sortable.Sortable.serialize(this.element)) {
            this.observer(this.element)
        }
    }
};

MochiKit.Sortable.Sortable = {
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
        MochiKit.Base.map(function (s) {
            MochiKit.DragAndDrop.Draggables.removeObserver(s.element);
            MochiKit.Base.map(function (d) {
                MochiKit.DragAndDrop.Droppables.remove(d);
            }, s.droppables);
            MochiKit.Base.map(function (d) {
                d.destroy();
            }, s.draggables);
        }, toDestroy);
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
            scroll: false,
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
            scroll: options.scroll,
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
            onhover: MochiKit.Sortable.Sortable.onHover,
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
                onhover: MochiKit.Sortable.Sortable.onEmptyHover,
                greedy: false
            });
            options.droppables.push(element);
        }
        MochiKit.Base.map(function (e) {
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
        }, (this.findElements(element, options) || []));

        // keep reference
        this.sortables.push(options);

        // for onupdate
        MochiKit.DragAndDrop.Draggables.addObserver(
            new MochiKit.Sortable.SortableObserver(element, options.onUpdate));
    },

    // return all suitable-for-sortable elements in a guaranteed order
    findElements: function (element, options) {
        if (!element.hasChildNodes()) {
            return null;
        }
        var elements = [];
        MochiKit.Base.map(MochiKit.Base.bind(function (e) {
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
        }, this), element.childNodes);

        return (elements.length > 0 ? elements : null);
    },

    onHover: function (element, dropon, overlap) {
        if (overlap > 0.5) {
            MochiKit.Sortable.Sortable.mark(dropon, 'before');
            if (dropon.previousSibling != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = 'hidden';  // fix gecko rendering
                dropon.parentNode.insertBefore(element, dropon);
                if (dropon.parentNode != oldParentNode) {
                    MochiKit.Sortable.Sortable.options(oldParentNode).onChange(element);
                }
                MochiKit.Sortable.Sortable.options(dropon.parentNode).onChange(element);
            }
        } else {
            MochiKit.Sortable.Sortable.mark(dropon, 'after');
            var nextElement = dropon.nextSibling || null;
            if (nextElement != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = 'hidden';  // fix gecko rendering
                dropon.parentNode.insertBefore(element, nextElement);
                if (dropon.parentNode != oldParentNode) {
                    MochiKit.Sortable.Sortable.options(oldParentNode).onChange(element);
                }
                MochiKit.Sortable.Sortable.options(dropon.parentNode).onChange(element);
            }
        }
    },

    onEmptyHover: function (element, dropon) {
        if (element.parentNode != dropon) {
            var oldParentNode = element.parentNode;
            dropon.appendChild(element);
            MochiKit.Sortable.Sortable.options(oldParentNode).onChange(element);
            MochiKit.Sortable.Sortable.options(dropon).onChange(element);
        }
    },

    unmark: function () {
        if (MochiKit.Sortable.Sortable._marker) {
            MochiKit.DOM.hideElement(MochiKit.Sortable.Sortable._marker);
        }
    },

    mark: function (dropon, position) {
        // mark on ghosting only
        var sortable = MochiKit.Sortable.Sortable.options(dropon.parentNode);
        if (sortable && !sortable.ghosting) {
            return;
        }

        if (!MochiKit.Sortable.Sortable._marker) {
            MochiKit.Sortable.Sortable._marker = MochiKit.DOM.getElement('dropmarker') ||
                               document.createElement('DIV');
            MochiKit.DOM.hideElement(MochiKit.Sortable.Sortable._marker);
            MochiKit.DOM.addElementClass(MochiKit.Sortable.Sortable._marker, 'dropmarker');
            MochiKit.Sortable.Sortable._marker.style.position = 'absolute';
            document.getElementsByTagName('body').item(0).appendChild(
                MochiKit.Sortable.Sortable._marker);
        }
        var offsets = MochiKit.Position.cumulativeOffset(dropon);
        MochiKit.Sortable.Sortable._marker.style.left = offsets[0] + 'px';
        MochiKit.Sortable.Sortable._marker.style.top = offsets[1] + 'px';

        if (position == 'after') {
            if (sortable.overlap == 'horizontal') {
                MochiKit.Sortable.Sortable._marker.style.left = (offsets[0] +
                                               dropon.clientWidth) + 'px';
            } else {
                MochiKit.Sortable.Sortable._marker.style.top = (offsets[1] +
                                              dropon.clientHeight) + 'px';
            }
        }
        MochiKit.DOM.showElement(MochiKit.Sortable.Sortable._marker);
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

