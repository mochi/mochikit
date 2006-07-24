
MochiKit.Base.update(MochiKit.Base, {
    isIE: function () {
        return /MSIE/.test(navigator.userAgent);
    },

    isGecko: function () {
        return /Gecko/.test(navigator.userAgent);
    },

    isKHTML: function () {
        return /Konqueror|Safari|KHTML/.test(navigator.userAgent)
    },

    isSafari: function () {
        return /AppleWebKit'/.test(navigator.appVersion);
    },

    isOpera: function () {
        return /Opera/.test(navigator.userAgent);
    }
});

MochiKit.Base.update(MochiKit.DOM, {
    getStyle: function (element, style) {
        element = MochiKit.DOM.getElement(element);
        var value = element.style[MochiKit.Base.camelize(style)];
        if (!value) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                var css = document.defaultView.getComputedStyle(element, null);
                value = css ? css.getPropertyValue(style) : null;
            } else if (element.currentStyle) {
                value = element.currentStyle[MochiKit.Base.camelize(style)];
            }
        }

        if (MochiKit.Base.isOpera() && (MochiKit.Base.find(['left', 'top', 'right', 'bottom'], style))) {
            if (MochiKit.DOM.getStyle(element, 'position') == 'static') {
                value = 'auto';
            }
        }

        return value == 'auto' ? null : value;
    },

    setStyle: function (element, style) {
        element = MochiKit.DOM.getElement(element);
        for (name in style) {
            element.style[MochiKit.Base.camelize(name)] = style[name];
        }
    },

    getOpacity: function (element) {
        var opacity;
        if (opacity = MochiKit.DOM.getStyle(element, 'opacity')) {
            return parseFloat(opacity);
        }
        if (opacity = (MochiKit.DOM.getStyle(element, 'filter') || '').match(/alpha\(opacity=(.*)\)/)) {
            if (opacity[1]) {
                return parseFloat(opacity[1]) / 100;
            }
        }
        return 1.0;
    },

    getInlineOpacity: function (element) {
        return MochiKit.DOM.getElement(element).style.opacity || '';
    },

    setOpacity: function (element, value) {
        element = MochiKit.DOM.getElement(element);
        if (value == 1) {
            MochiKit.DOM.setStyle(element, {opacity:
                (MochiKit.Base.isGecko() && !MochiKit.Base.isKHTML()) ?
                0.999999 : null});
            if (MochiKit.Base.isIE())
                MochiKit.DOM.setStyle(element, {filter:
                MochiKit.DOM.getStyle(element, 'filter').replace(/alpha\([^\)]*\)/gi, '')});
        } else {
            if (value < 0.00001) {
                value = 0;
            }
            MochiKit.DOM.setStyle(element, {opacity: value});
            if (MochiKit.Base.isIE()) {
                MochiKit.DOM.setStyle(element,
                    {filter: MochiKit.DOM.getStyle(element, 'filter').replace(/alpha\([^\)]*\)/gi, '') + 'alpha(opacity=' + value * 100 + ')' });
            }
        }
    },

    isVisible: function (element) {
        return MochiKit.DOM.getElement(element).style.display != 'none';
    },

    makeClipping: function (element) {
        element = MochiKit.DOM.getElement(element);
        if (element._overflow) {
            return;
        }
        element._overflow = element.style.overflow;
        if ((MochiKit.DOM.getStyle(element, 'overflow') || 'visible') != 'hidden') {
            element.style.overflow = 'hidden';
        }
    },

    undoClipping: function (element) {
        element = MochiKit.DOM.getElement(element);
        if (!element._overflow) {
            return;
        }
        element.style.overflow = element._overflow;
        element._overflow = undefined;
    },

    makePositioned: function (element) {
        element = MochiKit.DOM.getElement(element);
        /*if (!element.style) {
            alert(element);
        }*/
        var pos = MochiKit.DOM.getStyle(element, 'position');
        if ((pos == 'static' || !pos) && !element._madePositioned) {
            element._madePositioned = true;
            element.style.position = 'relative';
            // Opera returns the offset relative to the positioning context,
            // when an element is position relative but top and left have
            // not been defined
            if (MochiKit.Base.isOpera()) {
                element.style.top = 0;
                element.style.left = 0;
            }
        }
    },

    undoPositioned: function (element) {
        element = MochiKit.DOM.getElement(element);
        if (element._madePositioned) {
            element._madePositioned = undefined;
            element.style.position = element.style.top = element.style.left = element.style.bottom = element.style.right = '';
        }
    },

    getFirstElementByTagAndClassName: function (tagName, className,
            /* optional */parent) {
        var self = MochiKit.DOM;
        if (typeof(tagName) == 'undefined' || tagName === null) {
            tagName = '*';
        }
        if (typeof(parent) == 'undefined' || parent === null) {
            parent = self._document;
        }
        parent = self.getElement(parent);
        var children = (parent.getElementsByTagName(tagName)
            || self._document.all);
        if (typeof(className) == 'undefined' || className === null) {
            return MochiKit.Base.extend(null, children);
        }

        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    return child;
                }
            }
        }
    },

    isParent: function (child, element) {
        if (!child.parentNode || child == element) {
            return false;
        }

        if (child.parentNode == element) {
            return true;
        }

        return MochiKit.DOM.isParent(child.parentNode, element);
    }
});

MochiKit.Position = {
    // set to true if needed, warning: firefox performance problems
    // NOT neeeded for page scrolling, only if draggable contained in
    // scrollable elements
    includeScrollOffsets: false,

    prepare: function () {
        var deltaX =  window.pageXOffset
                   || document.documentElement.scrollLeft
                   || document.body.scrollLeft
                   || 0;
        var deltaY =  window.pageYOffset
                   || document.documentElement.scrollTop
                   || document.body.scrollTop
                   || 0;
        this.windowOffset = new MochiKit.Style.Coordinates(deltaX, deltaY);
    },

    cumulativeOffset: function (element) {
        var valueT = 0;
        var valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return new MochiKit.Style.Coordinates(valueL, valueT);
    },

    realOffset: function (element) {
        var valueT = 0;
        var valueL = 0;
        do {
            valueT += element.scrollTop  || 0;
            valueL += element.scrollLeft || 0;
            element = element.parentNode;
        } while (element);
        return new MochiKit.Style.Coordinates(valueL, valueT);
    },

    within: function (element, x, y) {
        if (this.includeScrollOffsets) {
            return this.withinIncludingScrolloffsets(element, x, y);
        }
        this.xcomp = x;
        this.ycomp = y;
        this.offset = this.cumulativeOffset(element);
        if (element.style.position == "fixed") {
            this.offset.x += this.windowOffset.x;
            this.offset.y += this.windowOffset.y;
        }

        return (y >= this.offset.y &&
                y <  this.offset.y + element.offsetHeight &&
                x >= this.offset.x &&
                x <  this.offset.x + element.offsetWidth);
    },

    withinIncludingScrolloffsets: function (element, x, y) {
        var offsetcache = this.realOffset(element);

        this.xcomp = x + offsetcache.x - this.windowOffset.x;
        this.ycomp = y + offsetcache.y - this.windowOffset.y;
        this.offset = this.cumulativeOffset(element);

        return (this.ycomp >= this.offset.y &&
                this.ycomp <  this.offset.y + element.offsetHeight &&
                this.xcomp >= this.offset.x &&
                this.xcomp <  this.offset.x + element.offsetWidth);
    },

    // within must be called directly before
    overlap: function (mode, element) {
        if (!mode) {
            return 0;
        }
        if (mode == 'vertical') {
          return ((this.offset.y + element.offsetHeight) - this.ycomp) /
                 element.offsetHeight;
        }
        if (mode == 'horizontal') {
          return ((this.offset.x + element.offsetWidth) - this.xcomp) /
                 element.offsetWidth;
        }
    },

    absolutize: function (element) {
        element = MochiKit.DOM.getElement(element);
        if (element.style.position == 'absolute') {
            return;
        }
        MochiKit.Position.prepare();

        var offsets = MochiKit.Position.positionedOffset(element);
        var width = element.clientWidth;
        var height = element.clientHeight;

        var oldStyle = {
            'position': element.style.position,
            'left': offsets.x - parseFloat(element.style.left  || 0),
            'top': offsets.y - parseFloat(element.style.top || 0),
            'width': element.style.width,
            'height': element.style.height
        };

        element.style.position = 'absolute';
        element.style.top = offsets.y + 'px';
        element.style.left = offsets.x + 'px';
        element.style.width = width + 'px';
        element.style.height = height + 'px';

        return oldStyle;
    },

    positionedOffset: function (element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
            if (element) {
                p = MochiKit.DOM.getStyle(element, 'position');
                if (p == 'relative' || p == 'absolute') {
                    break;
                }
            }
        } while (element);
        return new MochiKit.Style.Coordinates(valueL, valueT);
    },

    relativize: function (element, oldPos) {
        element = MochiKit.DOM.getElement(element);
        if (element.style.position == 'relative') {
            return;
        }
        MochiKit.Position.prepare();

        var top = parseFloat(element.style.top || 0) -
                  (oldPos['top'] || 0);
        var left = parseFloat(element.style.left || 0) -
                   (oldPos['left'] || 0);

        element.style.position = oldPos['position'];
        element.style.top = top + 'px';
        element.style.left = left + 'px';
        element.style.width = oldPos['width'];
        element.style.height = oldPos['height'];
    },

    clone: function (source, target) {
        source = MochiKit.DOM.getElement(source);
        target = MochiKit.DOM.getElement(target);
        target.style.position = 'absolute';
        var offsets = this.cumulativeOffset(source);
        target.style.top = offsets.y + 'px';
        target.style.left = offsets.x + 'px';
        target.style.width = source.offsetWidth + 'px';
        target.style.height = source.offsetHeight + 'px';
    },

    page: function (forElement) {
        var valueT = 0;
        var valueL = 0;

        var element = forElement;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;

            // Safari fix
            if (element.offsetParent == document.body && MochiKit.DOM.getStyle(element, 'position') == 'absolute') {
                break;
            }
        } while (element = element.offsetParent);

        element = forElement;
        do {
            valueT -= element.scrollTop  || 0;
            valueL -= element.scrollLeft || 0;
        } while (element = element.parentNode);

        return new MochiKit.Style.Coordinates(valueL, valueT);
    }
};

