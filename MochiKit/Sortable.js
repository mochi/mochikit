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
MochiKit.Sortable.VERSION = '1.4';

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
    sortables: {},

    _findRootElement: function (element) {
        while (element.tagName != "BODY") {
            if (element.id && MochiKit.Sortable.Sortable.sortables[element.id]) {
                return element;
            }
            element = element.parentNode;
        }
    },

    options: function (element) {
        element = MochiKit.Sortable.Sortable._findRootElement(MochiKit.DOM.getElement(element));
        if (!element) {
            return;
        }
        return MochiKit.Sortable.Sortable.sortables[element.id];
    },

    destroy: function (element){
        var s = MochiKit.Sortable.Sortable.options(element);
        var b = MochiKit.Base;
        var d = MochiKit.DragAndDrop;

        if (s) {
            d.Draggables.removeObserver(s.element);
            b.map(function (dr) {
                d.Droppables.remove(dr);
            }, s.droppables);
            b.map(function (dr) {
                dr.destroy();
            }, s.draggables);

            delete MochiKit.Sortable.Sortable.sortables[s.element.id];
        }
    },

    create: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        var self = MochiKit.Sortable.Sortable;
        options = MochiKit.Base.update({
            element: element,
            tag: 'li',  // assumes li children, override with tag: 'tagname'
            dropOnEmpty: false,
            tree: false,
            treeTag: 'ul',
            overlap: 'vertical',  // one of 'vertical', 'horizontal'
            constraint: 'vertical',  // one of 'vertical', 'horizontal', false
            // also takes array of elements (or ids); or false
            containment: [element],
            handle: false,  // or a CSS class
            only: false,
            hoverclass: null,
            ghosting: false,
            scroll: false,
            scrollSensitivity: 20,
            scrollSpeed: 15,
            format: /^[^_]*_(.*)$/,
            onChange: MochiKit.Base.noop,
            onUpdate: MochiKit.Base.noop,
            accept: null
        }, options);

        // clear any old sortable with same element
        self.destroy(element);

        // build options for the draggables
        var options_for_draggable = {
            revert: true,
            ghosting: options.ghosting,
            scroll: options.scroll,
            scrollSensitivity: options.scrollSensitivity,
            scrollSpeed: options.scrollSpeed,
            constraint: options.constraint,
            handle: options.handle
        };

        if (options.starteffect) {
            options_for_draggable.starteffect = options.starteffect;
        }

        if (options.reverteffect) {
            options_for_draggable.reverteffect = options.reverteffect;
        } else if (options.ghosting) {
            options_for_draggable.reverteffect = function (innerelement) {
                innerelement.style.top = 0;
                innerelement.style.left = 0;
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
            onhover: self.onHover,
            tree: options.tree,
            accept: options.accept
        }

        var options_for_tree = {
            onhover: self.onEmptyHover,
            overlap: options.overlap,
            containment: options.containment,
            hoverclass: options.hoverclass,
            accept: options.accept
        }

        // fix for gecko engine
        MochiKit.DOM.removeEmptyTextNodes(element);

        options.draggables = [];
        options.droppables = [];

        // drop on empty handling
        if (options.dropOnEmpty || options.tree) {
            new MochiKit.DragAndDrop.Droppable(element, options_for_tree);
            options.droppables.push(element);
        }
        MochiKit.Base.map(function (e) {
            // handles are per-draggable
            var handle = options.handle ?
                MochiKit.DOM.getFirstElementByTagAndClassName(null,
                    options.handle, e) : e;
            options.draggables.push(
                new MochiKit.DragAndDrop.Draggable(e,
                    MochiKit.Base.update(options_for_draggable,
                                         {handle: handle})));
            new MochiKit.DragAndDrop.Droppable(e, options_for_droppable);
            if (options.tree) {
                e.treeNode = element;
            }
            options.droppables.push(e);
        }, (self.findElements(element, options) || []));

        if (options.tree) {
            MochiKit.Base.map(function (e) {
                new MochiKit.DragAndDrop.Droppable(e, options_for_tree);
                e.treeNode = element;
                options.droppables.push(e);
            }, (self.findTreeElements(element, options) || []));
        }

        // keep reference
        self.sortables[element.id] = options;

        // for onupdate
        MochiKit.DragAndDrop.Draggables.addObserver(
            new MochiKit.Sortable.SortableObserver(element, options.onUpdate));
    },

    // return all suitable-for-sortable elements in a guaranteed order
    findElements: function (element, options) {
        return MochiKit.Sortable.Sortable.findChildren(
            element, options.only, options.tree ? true : false, options.tag);
    },

    findTreeElements: function (element, options) {
        return MochiKit.Sortable.Sortable.findChildren(
            element, options.only, options.tree ? true : false, options.treeTag);
    },

    findChildren: function (element, only, recursive, tagName) {
        if (!element.hasChildNodes()) {
            return null;
        }
        tagName = tagName.toUpperCase();
        if (only) {
            only = MochiKit.Base.flattenArray([only]);
        }
        var elements = [];
        MochiKit.Base.map(function (e) {
            if (e.tagName &&
                e.tagName.toUpperCase() == tagName &&
               (!only ||
                MochiKit.Iter.some(only, function (c) {
                    return MochiKit.DOM.hasElementClass(e, c);
                }))) {
                elements.push(e);
            }
            if (recursive) {
                var grandchildren = MochiKit.Sortable.Sortable.findChildren(e, only, recursive, tagName);
                if (grandchildren && grandchildren.length > 0) {
                    elements = elements.concat(grandchildren);
                }
            }
        }, element.childNodes);
        return elements;
    },

    onHover: function (element, dropon, overlap) {
        if (MochiKit.DOM.isParent(dropon, element)) {
            return;
        }
        var self = MochiKit.Sortable.Sortable;

        if (overlap > .33 && overlap < .66 && self.options(dropon).tree) {
            return;
        } else if (overlap > 0.5) {
            self.mark(dropon, 'before');
            if (dropon.previousSibling != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = 'hidden';  // fix gecko rendering
                dropon.parentNode.insertBefore(element, dropon);
                if (dropon.parentNode != oldParentNode) {
                    self.options(oldParentNode).onChange(element);
                }
                self.options(dropon.parentNode).onChange(element);
            }
        } else {
            self.mark(dropon, 'after');
            var nextElement = dropon.nextSibling || null;
            if (nextElement != element) {
                var oldParentNode = element.parentNode;
                element.style.visibility = 'hidden';  // fix gecko rendering
                dropon.parentNode.insertBefore(element, nextElement);
                if (dropon.parentNode != oldParentNode) {
                    self.options(oldParentNode).onChange(element);
                }
                self.options(dropon.parentNode).onChange(element);
            }
        }
    },

    _offsetSize: function (element, type) {
        if (type == 'vertical' || type == 'height') {
            return element.offsetHeight;
        } else {
            return element.offsetWidth;
        }
    },

    onEmptyHover: function (element, dropon, overlap) {
        var oldParentNode = element.parentNode;
        var self = MochiKit.Sortable.Sortable;
        var droponOptions = self.options(dropon);

        if (!MochiKit.DOM.isParent(dropon, element)) {
            var index;

            var children = self.findElements(dropon, {tag: droponOptions.tag,
                                                      only: droponOptions.only});
            var child = null;

            if (children) {
                var offset = self._offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

                for (index = 0; index < children.length; index += 1) {
                    if (offset - self._offsetSize(children[index], droponOptions.overlap) >= 0) {
                        offset -= self._offsetSize(children[index], droponOptions.overlap);
                    } else if (offset - (self._offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
                        child = index + 1 < children.length ? children[index + 1] : null;
                        break;
                    } else {
                        child = children[index];
                        break;
                    }
                }
            }

            dropon.insertBefore(element, child);

            self.options(oldParentNode).onChange(element);
            droponOptions.onChange(element);
        }
    },

    unmark: function () {
        var m = MochiKit.Sortable.Sortable._marker;
        if (m) {
            MochiKit.Style.hideElement(m);
        }
    },

    mark: function (dropon, position) {
        // mark on ghosting only
        var d = MochiKit.DOM;
        var self = MochiKit.Sortable.Sortable;
        var sortable = self.options(dropon.parentNode);
        if (sortable && !sortable.ghosting) {
            return;
        }

        if (!self._marker) {
            self._marker = d.getElement('dropmarker') ||
                        document.createElement('DIV');
            MochiKit.Style.hideElement(self._marker);
            d.addElementClass(self._marker, 'dropmarker');
            self._marker.style.position = 'absolute';
            document.getElementsByTagName('body').item(0).appendChild(self._marker);
        }
        var offsets = MochiKit.Position.cumulativeOffset(dropon);
        self._marker.style.left = offsets.x + 'px';
        self._marker.style.top = offsets.y + 'px';

        if (position == 'after') {
            if (sortable.overlap == 'horizontal') {
                self._marker.style.left = (offsets.x + dropon.clientWidth) + 'px';
            } else {
                self._marker.style.top = (offsets.y + dropon.clientHeight) + 'px';
            }
        }
        MochiKit.Style.showElement(self._marker);
    },

    _tree: function (element, options, parent) {
        var self = MochiKit.Sortable.Sortable;
        var children = self.findElements(element, options) || [];

        for (var i = 0; i < children.length; ++i) {
            var match = children[i].id.match(options.format);

            if (!match) {
                continue;
            }

            var child = {
                id: encodeURIComponent(match ? match[1] : null),
                element: element,
                parent: parent,
                children: [],
                position: parent.children.length,
                container: self._findChildrenElement(children[i], options.treeTag.toUpperCase())
            }

            /* Get the element containing the children and recurse over it */
            if (child.container) {
                self._tree(child.container, options, child)
            }

            parent.children.push (child);
        }

        return parent;
    },

    /* Finds the first element of the given tag type within a parent element.
       Used for finding the first LI[ST] within a L[IST]I[TEM].*/
    _findChildrenElement: function (element, containerTag) {
        if (element && element.hasChildNodes) {
            for (var i = 0; i < element.childNodes.length; ++i) {
                if (element.childNodes[i].tagName == containerTag) {
                    return element.childNodes[i];
                }
            }
        }
        return null;
    },

    tree: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        var sortableOptions = MochiKit.Sortable.Sortable.options(element);
        options = MochiKit.Base.update({
            tag: sortableOptions.tag,
            treeTag: sortableOptions.treeTag,
            only: sortableOptions.only,
            name: element.id,
            format: sortableOptions.format
        }, options || {});

        var root = {
            id: null,
            parent: null,
            children: new Array,
            container: element,
            position: 0
        }

        return MochiKit.Sortable.Sortable._tree(element, options, root);
    },

    setSequence: function (element, newSequence, options) {
        var self = MochiKit.Sortable.Sortable;
        var b = MochiKit.Base;
        element = MochiKit.DOM.getElement(element);
        options = b.update(self.options(element), options || {});

        var nodeMap = {};
        b.map(function (n) {
            var m = n.id.match(options.format);
            if (m) {
                nodeMap[m[1]] = [n, n.parentNode];
            }
            n.parentNode.removeChild(n);
        }, self.findElements(element, options));

        b.map(function (ident) {
            var n = nodeMap[ident];
            if (n) {
                n[1].appendChild(n[0]);
                delete nodeMap[ident];
            }
        }, newSequence);
    },

    /* Construct a [i] index for a particular node */
    _constructIndex: function (node) {
        var index = '';
        do {
            if (node.id) {
                index = '[' + node.position + ']' + index;
            }
        } while ((node = node.parent) != null);
        return index;
    },

    sequence: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        var self = MochiKit.Sortable.Sortable;
        var options = MochiKit.Base.update(self.options(element), options || {});

        return MochiKit.Base.map(function (item) {
            return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
        }, MochiKit.DOM.getElement(self.findElements(element, options) || []));
    },

    serialize: function (element, options) {
        element = MochiKit.DOM.getElement(element);
        var self = MochiKit.Sortable.Sortable;
        options = MochiKit.Base.update(self.options(element), options || {});
        var name = encodeURIComponent(options.name || element.id);

        if (options.tree) {
            return MochiKit.Base.flattenArray(MochiKit.Base.map(function (item) {
                return [name + self._constructIndex(item) + "[id]=" +
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
            }, self.tree(element, options).children)).join('&');
        } else {
            return MochiKit.Base.map(function (item) {
                return name + "[]=" + encodeURIComponent(item);
            }, self.sequence(element, options)).join('&');
        }
    }
};

