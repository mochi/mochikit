
MochiKit.Base.update(MochiKit.Base, {
    emptyFunction: function () {},

    camelize: function (str) {
        var oStringList = str.split('-');
        if (oStringList.length == 1) {
            return oStringList[0];
        }

        var camelizedString = str.indexOf('-') === 0
          ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
          : oStringList[0];

        for (var i = 1, len = oStringList.length; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    },

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
        return navigator.appVersion.indexOf('AppleWebKit') > 0;
    },

    isOpera: function () {
        return navigator.userAgent.indexOf('Opera') > 0;
    }
});

MochiKit.Base.update(MochiKit.DOM, {
    cleanWhitespace: function (element) {
        element = MochiKit.DOM.getElement(element);
        for (var i = 0; i < element.childNodes.length; i++) {
            var node = element.childNodes[i];
            if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
                MochiKit.DOM.removeElement(node);
            }
        }
    },

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
                 {filter: MochiKit.DOM.getStyle(element, 'filter').replace(/alpha\([^\)]*\)/gi, '') +
                                     'alpha(opacity='+value*100+')' });
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
    }
});

MochiKit.Position = {
    // set to true if needed, warning: firefox performance problems
    // NOT neeeded for page scrolling, only if draggable contained in
    // scrollable elements
    includeScrollOffsets: false,

    prepare: function () {
        this.deltaX =  window.pageXOffset
                    || document.documentElement.scrollLeft
                    || document.body.scrollLeft
                    || 0;
        this.deltaY =  window.pageYOffset
                    || document.documentElement.scrollTop
                    || document.body.scrollTop
                    || 0;
    },

    cumulativeOffset: function (element) {
        var valueT = 0;
        var valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return [valueL, valueT];
    },

    realOffset: function (element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.scrollTop  || 0;
            valueL += element.scrollLeft || 0;
            element = element.parentNode;
        } while (element);
        return [valueL, valueT];
    },

    within: function (element, x, y) {
        if (this.includeScrollOffsets) {
            return this.withinIncludingScrolloffsets(element, x, y);
        }
        this.xcomp = x;
        this.ycomp = y;
        this.offset = this.cumulativeOffset(element);

        return (y >= this.offset[1] &&
                y <  this.offset[1] + element.offsetHeight &&
                x >= this.offset[0] &&
                x <  this.offset[0] + element.offsetWidth);
    },

    withinIncludingScrolloffsets: function (element, x, y) {
        var offsetcache = this.realOffset(element);

        this.xcomp = x + offsetcache[0] - this.deltaX;
        this.ycomp = y + offsetcache[1] - this.deltaY;
        this.offset = this.cumulativeOffset(element);

        return (this.ycomp >= this.offset[1] &&
                this.ycomp <  this.offset[1] + element.offsetHeight &&
                this.xcomp >= this.offset[0] &&
                this.xcomp <  this.offset[0] + element.offsetWidth);
    },

    // within must be called directly before
    overlap: function (mode, element) {
        if (!mode) {
            return 0;
        }
        if (mode == 'vertical') {
          return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
                 element.offsetHeight;
        }
        if (mode == 'horizontal') {
          return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
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
        var top = offsets[1];
        var left = offsets[0];
        var width = element.clientWidth;
        var height = element.clientHeight;

        element._originalLeft = left - parseFloat(element.style.left  || 0);
        element._originalTop = top - parseFloat(element.style.top || 0);
        element._originalWidth = element.style.width;
        element._originalHeight = element.style.height;

        element.style.position = 'absolute';
        element.style.top = top + 'px';;
        element.style.left = left + 'px';;
        element.style.width = width + 'px';;
        element.style.height = height + 'px';;
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
        return [valueL, valueT];
    },

    relativize: function (element) {
        element = MochiKit.DOM.getElement(element);
        if (element.style.position == 'relative') {
            return;
        }
        MochiKit.Position.prepare();

        element.style.position = 'relative';
        var top = parseFloat(element.style.top || 0) -
                  (element._originalTop || 0);
        var left = parseFloat(element.style.left || 0) -
                   (element._originalLeft || 0);

        element.style.top = top + 'px';
        element.style.left = left + 'px';
        element.style.height = element._originalHeight;
        element.style.width = element._originalWidth;
    },

    clone: function (source, target) {
        source = MochiKit.DOM.getElement(source);
        target = MochiKit.DOM.getElement(target);
        target.style.position = 'absolute';
        var offsets = this.cumulativeOffset(source);
        target.style.top = offsets[1] + 'px';
        target.style.left = offsets[0] + 'px';
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

        return [valueL, valueT];
    }
};

