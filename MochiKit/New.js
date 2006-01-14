
MochiKit.Base.update(MochiKit.Base, {
    ScriptFragment: '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)',

    emptyFunction: function () {},

    camelize: function (str) {
        var oStringList = str.split('-');
        if (oStringList.length == 1) {
            return oStringList[0];
        }

        var camelizedString = str.indexOf('-') == 0
          ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
          : oStringList[0];

        for (var i = 1, len = oStringList.length; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    },

    stripScripts: function (str) {
        return str.replace(new RegExp(MochiKit.Base.ScriptFragment, 'img'), '');
    },

    extractScripts: function (str) {
        var matchAll = new RegExp(MochiKit.Base.ScriptFragment, 'img');
        var matchOne = new RegExp(MochiKit.Base.ScriptFragment, 'im');
        return MochiKit.Iter.imap(function (scriptTag) {
            return (scriptTag.match(matchOne) || ['', ''])[1];
        }, str.match(matchAll) || []);
    },

    evalScripts: function (str) {
        return MochiKit.Iter.list(MochiKit.Iter.imap(function (scr) {
            eval(scr);
        }, MochiKit.Base.extractScripts(str)));
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

MochiKit.Base.update(MochiKit.Iter, {
    flatten: function (array) {
        return MochiKit.Iter.list(MochiKit.Iter.imap(function (item) {
            if (item.constructor == Array) {
                return MochiKit.Iter.list(MochiKit.Iter.flatten(item));
            } else {
                return item;
            }
        }, array));
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

    bindAsEventListener: function (func, self) {
        return MochiKit.DOM.asEventListener(MochiKit.Base.bind(func, self));
    },

    asEventListener: function (func) {
        return function (e) {
            func.call(this, e || event);
        };
    },

    addEventListener: function (element, action, func) {
        var listener = MochiKit.DOM.asEventListener(func);
        element = MochiKit.DOM.getElement(element);
        if (element.addEventListener) {
            element.addEventListener(action, listener, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + action, listener);
        }
        return listener;
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
        element= MochiKit.DOM.getElement(element);
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
        if (pos == 'static' || !pos) {
            element._madePositioned = true;
            element.style.position = 'relative';
            // Opera returns the offset relative to the positioning context, when an
            // element is position relative but top and left have not been defined
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

    collectTextNodes: function (element) {
        return MochiKit.Iter.flatten(MochiKit.Iter.imap(function (node) {
            if (node.nodeType == 3) {
                return node.nodeValue;
            } else if (node.hasChildNodes()) {
                return MochiKit.DOM.collectTextNodes(node);
            }
            return '';
        }, MochiKit.DOM.getElement(element).childNodes)).join('');
    },

    collectTextNodesIgnoreClass: function (element, className) {
        return MochiKit.Iter.flatten(MochiKit.Iter.imap(function (node) {
            if (node.nodeType == 3) {
                return node.nodeValue;
            } else if (node.hasChildNodes() && !MochiKit.DOM.hasElementClass(node, className)) {
                return MochiKit.DOM.collectTextNodesIgnoreClass(node, className);
            }
            return '';
        }, MochiKit.DOM.getElement(element).childNodes)).join('');
    },

    setContentZoom: function (element, percent) {
        MochiKit.DOM.setStyle(element, {fontSize: (percent/100) + 'em'});
        if (MochiKit.Base.isSafari()) {
            window.scrollBy(0, 0);
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
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueL += element.offsetLeft || 0;
            element = parent.offsetParent;
        } while (element);
        return [valueL, valueT];
    },

    realOffset: function(element) {
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
        var top = parseFloat(element.style.top || 0) - (element._originalTop || 0);
        var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

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
    }
};

MochiKit.Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,

    element: function (event) {
        return event.target || event.srcElement;
    },

    isLeftClick: function (event) {
        return (((event.which) && (event.which == 1)) ||
                ((event.button) && (event.button == 1)));
    },

    pointerX: function (event) {
        return event.pageX || (event.clientX +
            (document.documentElement.scrollLeft || document.body.scrollLeft));
    },

    pointerY: function (event) {
        return event.pageY || (event.clientY +
            (document.documentElement.scrollTop || document.body.scrollTop));
    },

    stop: function (event) {
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            event.returnValue = false;
            event.cancelBubble = true;
        }
    },

    // find the first node with the given tagName, starting from the
    // node the event was triggered on; traverses the DOM upwards
    findElement: function (event, tagName) {
        var element = MochiKit.Event.element(event);
        while (element.parentNode && (!element.tagName ||
              (element.tagName.toUpperCase() != tagName.toUpperCase()))) {
            element = element.parentNode;
        }
        return element;
    },

    observers: false,

    _observeAndCache: function (element, name, observer, useCapture) {
        if (!this.observers) {
            this.observers = [];
        }
        if (element.addEventListener) {
            this.observers.push([element, name, observer, useCapture]);
            element.addEventListener(name, observer, useCapture);
        } else if (element.attachEvent) {
            this.observers.push([element, name, observer, useCapture]);
            element.attachEvent('on' + name, observer);
        }
    },

    unloadCache: function () {
        if (!MochiKit.Event.observers) {
            return;
        }
        for (var i = 0; i < MochiKit.Event.observers.length; i++) {
            MochiKit.Event.stopObserving.apply(this, MochiKit.Event.observers[i]);
            MochiKit.Event.observers[i][0] = null;
        }
        MochiKit.Event.observers = false;
    },

    observe: function (element, name, observer, useCapture) {
        var element = MochiKit.DOM.getElement(element);
        useCapture = useCapture || false;

        if (name == 'keypress' && (MochiKit.Base.isKHTML() || element.attachEvent)) {
            name = 'keydown';
        }

        this._observeAndCache(element, name, observer, useCapture);
    },

    stopObserving: function (element, name, observer, useCapture) {
        var element = MochiKit.DOM.getElement(element);
        useCapture = useCapture || false;

        if (name == 'keypress' && (MochiKit.Base.isKHTML() || element.detachEvent)) {
            name = 'keydown';
        }

        if (element.removeEventListener) {
            element.removeEventListener(name, observer, useCapture);
        } else if (element.detachEvent) {
            element.detachEvent('on' + name, observer);
        }
    }
};

/* prevent memory leaks in IE */
MochiKit.Event.observe(window, 'unload', MochiKit.Event.unloadCache, false);

MochiKit.Form = {
    serialize: function (form) {
        var elements = MochiKit.Form.getElements(form);
        var queryComponents = new Array();

        for (var i = 0; i < elements.length; i++) {
            var queryComponent = Form.serializeElement(elements[i]);
            if (queryComponent) {
                queryComponents.push(queryComponent);
            }
        }

        return queryComponents.join('&');
    },

    getElements: function (form) {
        form = MochiKit.DOM.getElement(form);
        var elements = new Array();

        for (tagName in Form.Element.Serializers) {
            var tagElements = form.getElementsByTagName(tagName);
            for (var j = 0; j < tagElements.length; j++) {
                elements.push(tagElements[j]);
            }
        }
        return elements;
    },

    serializeElement: function (element) {
        element = MochiKit.DOM.getElement(element);
        var method = element.tagName.toLowerCase();
        var parameter = MochiKit.Form.Serializers[method](element);

        if (parameter) {
            var key = encodeURIComponent(parameter[0]);
            if (key.length == 0) {
                return;
            }

            if (parameter[1].constructor != Array) {
                parameter[1] = [parameter[1]];
            }

            return parameter[1].map(function (value) {
                return key + '=' + encodeURIComponent(value);
            }).join('&');
        }
    }
};

MochiKit.Form.Serializers = {
    input: function (element) {
        switch (element.type.toLowerCase()) {
            case 'submit':
            case 'hidden':
            case 'password':
            case 'text':
                return MochiKit.Form.Serializers.textarea(element);
            case 'checkbox':
            case 'radio':
                return MochiKit.Form.Serializers.inputSelector(element);
        }
        return false;
    },

    inputSelector: function (element) {
        if (element.checked) {
            return [element.name, element.value];
        }
    },

    textarea: function (element) {
        return [element.name, element.value];
    },

    select: function (element) {
        return MochiKit.Form.Serializers[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    },

    selectOne: function (element) {
        var value = '', opt, index = element.selectedIndex;
        if (index >= 0) {
            opt = element.options[index];
            value = opt.value;
            if (!value && !('value' in opt)) {
                value = opt.text;
            }
        }
        return [element.name, value];
    },

    selectMany: function (element) {
        var value = new Array();
        for (var i = 0; i < element.length; i++) {
            var opt = element.options[i];
            if (opt.selected) {
                var optValue = opt.value;
                if (!optValue && !('value' in opt)) {
                    optValue = opt.text;
                }
                value.push(optValue);
            }
        }
        return [element.name, value];
    }
};

var Ajax = {
    activeRequestCount: 0
};

Ajax.Responders = {
    responders: [],

    register: function (responderToAdd) {
        if (MochiKit.Base.find(this.responders, responderToAdd) == -1) {
            this.responders.push(responderToAdd);
        }
    },

    unregister: function (responderToRemove) {
        this.responders = this.responders.without(responderToRemove);
    },

    dispatch: function (callback, request, transport, json) {
        MochiKit.Iter.forEach(this.responders, function (responder) {
            if (responder[callback] && typeof responder[callback] == 'function') {
                try {
                    responder[callback].apply(responder, [request, transport, json]);
                } catch (e) {}
            }
        });
    }
};

Ajax.Responders.register({
    onCreate: function () {
        Ajax.activeRequestCount++;
    },

    onComplete: function () {
        Ajax.activeRequestCount--;
    }
});

Ajax.Base = function () {};

Ajax.Base.prototype = {
    setOptions: function (options) {
        this.options = {
            method: 'post',
            asynchronous: true,
            parameters:   ''
        }
        MochiKit.Base.update(this.options, options || {});
    },

    responseIsSuccess: function () {
        return this.transport.status == undefined
            || this.transport.status == 0
            || (this.transport.status >= 200 && this.transport.status < 300);
    },

    responseIsFailure: function () {
        return !this.responseIsSuccess();
    }
};

Ajax.Request = function (url, options) {
    this.__init__(url, options);
};

Ajax.Request.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

MochiKit.Base.update(Ajax.Request.prototype, Ajax.Base.prototype);

MochiKit.Base.update(Ajax.Request.prototype, {
    __init__: function (url, options) {
        this.transport = MochiKit.Async.getXMLHttpRequest();
        this.setOptions(options);
        this.request(url);
    },

    request: function (url) {
        var parameters = this.options.parameters || '';
        if (parameters.length > 0){
            parameters += '&_=';
        }

        try {
            this.url = url;
            if (this.options.method == 'get' && parameters.length > 0) {
                this.url += (this.url.match(/\?/) ? '&' : '?') + parameters;
            }
            Ajax.Responders.dispatch('onCreate', this, this.transport);

            this.transport.open(this.options.method, this.url, this.options.asynchronous);

            if (this.options.asynchronous) {
                this.transport.onreadystatechange = MochiKit.Base.bind(this.onStateChange, this);
                setTimeout(MochiKit.Base.bind(function () {
                    this.respondToReadyState(1);
                }, this), 10);
            }

            this.setRequestHeaders();

            var body = this.options.postBody ? this.options.postBody : parameters;
            this.transport.send(this.options.method == 'post' ? body : null);

        } catch (e) {
               this.dispatchException(e);
        }
    },

    setRequestHeaders: function () {
        var requestHeaders = ['X-Requested-With', 'XMLHttpRequest'];

        if (this.options.method == 'post') {
            requestHeaders.push('Content-type', 'application/x-www-form-urlencoded');

            /* Force 'Connection: close' for Mozilla browsers to work around
             * a bug where XMLHttpReqeuest sends an incorrect Content-length
             * header. See Mozilla Bugzilla #246651.
             */
            if (this.transport.overrideMimeType) {
                requestHeaders.push('Connection', 'close');
            }
        }

        if (this.options.requestHeaders) {
            requestHeaders.push.apply(requestHeaders, this.options.requestHeaders);
        }

        for (var i = 0; i < requestHeaders.length; i += 2) {
            this.transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
        }
    },

    onStateChange: function () {
        var readyState = this.transport.readyState;
        if (readyState != 1) {
            this.respondToReadyState(this.transport.readyState);
        }
    },

    header: function (name) {
        try {
          return this.transport.getResponseHeader(name);
        } catch (e) {}
    },

    evalJSON: function () {
        try {
          return eval(this.header('X-JSON'));
        } catch (e) {}
    },

    evalResponse: function () {
        try {
          return eval(this.transport.responseText);
        } catch (e) {
          this.dispatchException(e);
        }
    },

    respondToReadyState: function (readyState) {
        var event = Ajax.Request.Events[readyState];
        var transport = this.transport, json = this.evalJSON();

        if (event == 'Complete') {
            try {
                (this.options['on' + this.transport.status]
                || this.options['on' + (this.responseIsSuccess() ? 'Success' : 'Failure')]
                || MochiKit.Base.emptyFunction)(transport, json);
            } catch (e) {
                this.dispatchException(e);
            }

            if ((this.header('Content-type') || '').match(/^text\/javascript/i)) {
                this.evalResponse();
            }
        }

        try {
            (this.options['on' + event] || MochiKit.Base.emptyFunction)(transport, json);
            Ajax.Responders.dispatch('on' + event, this, transport, json);
        } catch (e) {
            this.dispatchException(e);
        }

        /* Avoid memory leak in MSIE: clean up the oncomplete event handler */
        if (event == 'Complete') {
            this.transport.onreadystatechange = MochiKit.Base.emptyFunction;
        }
    },

    dispatchException: function (exception) {
        (this.options.onException || MochiKit.Base.emptyFunction)(this, exception);
        Ajax.Responders.dispatch('onException', this, exception);
    }
});

Ajax.Updater = function (container, url, options) {
    this.__init__(container, url, options);
};

MochiKit.Base.update(Ajax.Updater.prototype, Ajax.Request.prototype);

MochiKit.Base.update(Ajax.Updater.prototype, {
    __init__: function (container, url, options) {
        this.containers = {
            success: container.success ? MochiKit.DOM.getElement(container.success) : MochiKit.DOM.getElement(container),
            failure: container.failure ? MochiKit.DOM.getElement(container.failure) :
                (container.success ? null : MochiKit.DOM.getElement(container))
        }
        this.transport = MochiKit.Async.getXMLHttpRequest();
        this.setOptions(options);

        var onComplete = this.options.onComplete || MochiKit.Base.emptyFunction;
        this.options.onComplete = MochiKit.Base.bind(function (transport, object) {
            this.updateContent();
            onComplete(transport, object);
        }, this);

        this.request(url);
    },

    updateContent: function () {
        var receiver = this.responseIsSuccess() ?
            this.containers.success : this.containers.failure;
        var response = this.transport.responseText;

        if (!this.options.evalScripts) {
            response = MochiKit.Base.stripScripts(response);
        }

        if (receiver) {
            if (this.options.insertion) {
                new this.options.insertion(receiver, response);
            } else {
                MochiKit.DOM.getElement(receiver).innerHTML = MochiKit.Base.stripScripts(response);
                setTimeout(function() {
                    MochiKit.Base.evalScripts(response);
                }, 10);
            }
        }

        if (this.responseIsSuccess()) {
            if (this.onComplete) {
                setTimeout(MochiKit.Base.bind(this.onComplete, this), 10);
            }
        }
    }
});

var Field = {
    clear: function () {
        for (var i = 0; i < arguments.length; i++) {
            MochiKit.DOM.getElement(arguments[i]).value = '';
        }
    },

    focus: function (element) {
        MochiKit.DOM.getElement(element).focus();
    },

    present: function () {
        for (var i = 0; i < arguments.length; i++) {
            if (MochiKit.DOM.getElement(arguments[i]).value == '') {
                return false;
            }
        }
        return true;
    },

    select: function (element) {
        MochiKit.DOM.getElement(element).select();
    },

    activate: function (element) {
        element = MochiKit.DOM.getElement(element);
        element.focus();
        if (element.select) {
            element.select();
        }
    }
};

