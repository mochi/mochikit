if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Iter");
}

try {
    if (typeof(MochiKit.Iter) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.DOM depends on MochiKit.Iter!";
}

if (typeof(MochiKit.DOM) == 'undefined') {
    MochiKit.DOM = {};
}

MochiKit.DOM.NAME = "MochiKit.DOM";
MochiKit.DOM.VERSION = "0.5";
MochiKit.DOM.toString = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
}

MochiKit.DOM.__new__ = function () {

    var domConverters = new AdapterRegistry(); 

    var __tmpElement = document.createElement("span");
    if (__tmpElement.attributes.length > 0) {
        // for braindead browsers (IE) that insert extra junk
        attributeArray = function (node) {
            return filter(attributeArray.ignoreAttrFilter, node.attributes);
        }
        attributeArray.ignoreAttr = {};
        forEach(__tmpElement.attributes, function (a) {
            attributeArray.ignoreAttr[a.name] = a.value;
        });
        attributeArray.ignoreAttrFilter = function (a) {
            return (attributeArray.ignoreAttr[a.name] != a.value);
        }
        attributeArray.compliant = false;
    } else {
        attributeArray = function (node) {
            /***
                
                Return an array of attributes for a given node,
                filtering out attributes that don't belong for
                that are inserted by "Certain Browsers".

            ***/
            return node.attributes;
        }
        attributeArray.compliant = true;
    }
    delete __tmpElement;


    var registerDOMConverter = function (name, check, wrap, /* optional */override) {
        /***

            Register an adapter to convert objects that match check(obj, ctx)
            to a DOM element, or something that can be converted to a DOM
            element (i.e. number, bool, string, function, iterable).

        ***/
        domConverters.register(name, check, wrap, override);
    };

    var coerceToDOM = function (node, ctx) {
        /***

            Used internally by createDOM, coerces a node to null, a DOM object,
            or an iterable.

        ***/

        while (true) {
            if (isUndefinedOrNull(node)) {
                return null;
            }
            if (node.nodeType > 0) {
                return node;
            }
            if (typeof(node) == 'number' || typeof(node) == 'bool') {
                node = node.toString();
                // FALL THROUGH
            }
            if (typeof(node) == 'string') {
                return document.createTextNode(node);
            }
            if (typeof(node.toDOM) == 'function') {
                node = node.toDOM(ctx);
                continue;
            }
            if (typeof(node) == 'function') {
                node = node(ctx);
                continue;
            }

            // iterable
            var iterNodes = null;
            try {
                iterNodes = iter(node);
            } catch (e) {
                // pass
            }
            if (iterNodes) {
                return imap(coerceToDOM, iterNodes, repeat(ctx));
            }

            // adapter
            try {
                node = domConverters.match(node, ctx);
                continue;
            } catch (e) {
                if (e != NotFound) {
                    throw e;
                }
            }

            // fallback
            return document.createTextNode(node.toString());
        }
    };
        
    var createDOM = function (name, attrs/*, nodes... */) {
        /***

            Create a DOM fragment in a really convenient manner, much like
            Nevow's <http://nevow.com> stan.

            Partially applied versions of this function for common tags are
            available as aliases:

                TABLE
                TR
                TD
                TH
                TBODY
                TFOOT
                THEAD
                SPAN
                INPUT
                A
                DIV

            Usage:

                var rows = [
                    ["dataA1", "dataA2", "dataA3"],
                    ["dataB1", "dataB2", "dataB3"]
                ];
                row_display = function (row) {
                    return TR(null, map(partial(TD, null), row));
                }
                var newTable = TABLE({'class': 'prettytable'}
                    THEAD(null,
                        row_display(["head1", "head2", "head3"])),
                    TFOOT(null,
                        row_display(["foot1", "foot2", "foot3"])),
                    TBODY(null,
                        map(row_display, rows)));
                    

            This will create a table with the following visual layout (if it
            were inserted into the document DOM):

                +--------+--------+--------+
                | head1  | head2  | head3  |
                +========+========+========+
                | dataA1 | dataA2 | dataA3 |
                +--------+--------+--------+
                | dataB1 | dataB2 | dataB3 |
                +--------+--------+--------+
                | foot1  | foot2  | foot3  |
                +--------+--------+--------+

            Corresponding to the following HTML:

                <table>
                    <thead>
                        <tr>
                            <td>head1</td>
                            <td>head2</td>
                            <td>head3</td>
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <td>foot1</td>
                            <td>foot2</td>
                            <td>foot3</td>
                        </tr>
                    </tfoot>
                    <tbody>
                        <tr>
                            <td>dataA1</td>
                            <td>dataA2</td>
                            <td>dataA3</td>
                        </tr>
                        <tr>
                            <td>dataB1</td>
                            <td>dataB2</td>
                            <td>dataB3</td>
                        </tr>
                    </tbody>
                </table>

            @param name: The kind of fragment to create (e.g. 'span').

            @param attrs: A mapping of attributes or null, 
                          (e.g. {'style': 'display:block'}).

                          Note that it will do the right thing for IE, so don't do
                          the class -> className hack yourself.

            @param *nodes: All additional parameters will be coerced into DOM
                           nodes that are appended as children using the
                           following rules:
                        
                           1. Functions are called with a "this" of the parent
                              node and their return value is subject to the
                              following rules (even this one)
                           2. undefined and null are ignored.
                           3. Iterables are flattened (as if they were passed
                              in-line as nodes) and each return value is
                              subject to all of these rules.
                           4. Values that look like DOM nodes (objects with a
                              nodeType > 0) are appendChild'ed to the created
                              DOM fragment.
                           5. Strings are converted to textNodes.
                           6. Objects that are not strings are converted to
                              objects known to these rules using a
                              "registerDOMConverter" adapter if one exists.
                           7. If no adapter is available, toString() is used to
                              create a textNode.
            
            @rtype: A DOM fragment

        ***/

        var elem = document.createElement(name);
        if (attrs) {
            if (attributeArray.compliant) {
                // not IE, good.
                for (var k in attrs) {
                    elem.setAttribute(k, attrs[k]);
                }
            } else {
                // IE is insane in the membrane
                for (var k in attrs) {
                    elem.setAttribute((k == "class" ? "className" : k), attrs[k]);
                }
            }
        }

        nodeStack = [coerceToDOM(extend(null, arguments, 2), elem)];
        while (nodeStack.length) {
            var node = nodeStack.shift();
            if (isUndefinedOrNull(node)) {
                // pass
            } else if (typeof(node.nodeType) == 'number') {
                elem.appendChild(node);
            } else {
                iextend(nodeStack, node);
            }
        }
        return elem;
    };

    var createDOMFunc = function (/* tag, attrs, *nodes */) {
        /***

            Convenience function to create a partially applied createDOM

            @param tag: The name of the tag

            @param attrs: Optionally specify the attributes to apply

            @param *notes: Optionally specify any children nodes it should have

            @rtype: function

        ***/
        return partial.apply(this, extend([createDOM], arguments));
    };

    var swapDOM = function (dest, src) {
        /***

            Replace dest in a DOM tree with src, returning src

            @param dest: a DOM element to be replaced

            @param src: the DOM element to replace it with

            @rtype: a DOM element (src)

        ***/
        var parent = dest.parentNode;
        parent.insertBefore(src, dest);
        parent.removeChild(dest);
        return src;
    };

    // shorthand for createDOM syntax
    var TD = createDOMFunc("td");
    var TR = createDOMFunc("tr");
    var TBODY = createDOMFunc("tbody");
    var TFOOT = createDOMFunc("tfoot");
    var TABLE = createDOMFunc("table");
    var TH = createDOMFunc("th");
    var INPUT = createDOMFunc("input");
    var SPAN = createDOMFunc("span");
    var A = createDOMFunc("a");
    var DIV = createDOMFunc("div");
    var IMG = createDOMFunc("img");

    var getElement = function (id) {
        /***

            A small quick little function to encapsulate the getElementById
            method.  It includes a check to ensure we can use that method.

            If the id isn't a string, it will be returned as-is.

            Also available as $(...) for compatibility/convenience with "other"
            js frameworks (bah).

        ***/
        if (arguments.length == 1) {
            return ((typeof(id) == "string") ? document.getElementById(id) : id);
        } else {
            return map(getElement, arguments);
        }
    };

    var addToCallStack = function (target, path, func, once) {
        var existing = target[path];
        var regfunc = existing;
        if (!(typeof(existing) == 'function' && existing.callStack)) {
            var regfunc = function () {
                var callStack = regfunc.callStack;
                for (var i = 0; i < callStack.length; i++) {
                    callStack[i].apply(this, arguments);
                }
                if (once) {
                    try {
                        target[path] = null;
                    } catch (e) {
                        // pass
                    }
                }
            }
            regfunc.callStack = [];
            if (typeof(existing) == 'function') {
                regfunc.callStack.push(existing);
            }
            target[path] = regfunc;
        }
        regfunc.callStack.push(func);
    }

    var addLoadEvent = function (func) {
        /***

            This will stack load functions on top of each other.
            Each function added will be called after onload in the
            order that they were added.

        ***/
        addToCallStack(window, "onload", func, true);
        
    };

    var focusOnLoad = function (element) {
        addLoadEvent(function () {
            element = getElement(element);
            if (element) {
                element.focus();
            }
        });
    };
            

    var setElementClass = function (element, className) {
        /***

            Set the entire class attribute of an element to className.
        
        ***/
        var obj = getElement(element);
        if (attributeArray.compliant) {
            obj.setAttribute("class", className);
        } else {
            obj.setAttribute("className", className);
        }
    };
            
    var toggleElementClass = function (className/*, element... */) {
        /***
        
            Toggle the presence of a given className in the class attribute
            of all given elements.

        ***/
        for (i = 1; i < arguments.length; i++) {
            var obj = getElement(arguments[i]);
            if (!addElementClass(obj, className)) {
                removeElementClass(obj, className);
            }
        }
    };

    var addElementClass = function (element, className) {
        /***

            Ensure that the given element has className set as part of its
            class attribute.  This will not disturb other class names.

        ***/
        var obj = getElement(element);
        var cls = obj.className;
        // trivial case, no className yet
        if (cls.length == 0) {
            setElementClass(obj, className);
            return true;
        }
        // the other trivial case, already set as the only class
        if (cls == className) {
            return false;
        }
        var classes = obj.className.split(" ");
        for (var i = 0; i < classes.length; i++) {
            // already present
            if (classes[i] == className) {
                return false;
            }
        }
        // append class
        setElementClass(obj, cls + " " + className);
        return false;
    };

    var removeElementClass = function (element, className) {
        /***

            Ensure that the given element does not have className set as part
            of its class attribute.  This will not disturb other class names.

        ***/
        var obj = getElement(element);
        var cls = obj.className;
        // trivial case, no className yet
        if (cls.length == 0) {
            return false;
        }
        // other trivial case, set only to className
        if (cls == className) {
            setElementClass(obj, "");
            return true;
        }
        var classes = obj.className.split(" ");
        for (var i = 0; i < classes.length; i++) {
            // already present
            if (classes[i] == className) {
                // only check sane case where the class is used once
                classes.splice(i, 1);
                setElementClass(obj, classes.join(" "));
                return true;
            }
        }
        // not found
        return false;
    };

    var swapElementClass = function (element, fromClass, toClass) {
        /***

            If fromClass is set on element, replace it with toClass.  This
            will not disturb other classes on that element.

        ***/
        var obj = getElement(element);
        if (removeElementClass(obj, fromClass)) {
            return addElementClass(obj, toClass);
        }
        return false;
    };

    var _TRANSTABLE = {
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;"
    };

    var escapeHTML = function (s) {
        /***

            Make a string safe for HTML, converting the usual suspects (lt,
            gt, quot, apos, amp)

        ***/
        var buf = [];
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            var o = _TRANSTABLE[c];
            if (o) {
                c = o;
            }
            buf.push(c);
        }
        return buf.join("");
    };

    var toHTML = function (dom) {
        /***

            Convert a DOM tree to a HTML string using emitHTML

        ***/
        return emitHTML(dom).join("");
    };

    var emitHTML = function (dom, /* optional */lst) {
        /***

            Convert a DOM tree to a list of HTML string fragments

            You probably want to use toHTML instead.

        ***/

        if (typeof(lst) == 'undefined' || lst == null) {
            lst = [];
        }
        // queue is the call stack, we're doing this non-recursively
        var queue = [dom];
        while (queue.length) {
            dom = queue.pop();
            if (typeof(dom) == 'string') {
                lst.push(dom);
            } else if (dom.nodeType == 1) {
                // we're not using higher order stuff here
                // because safari has heisenbugs.. argh.
                //
                // I think it might have something to do with
                // garbage collection and function calls.
                lst.push('<' + dom.nodeName.toLowerCase());
                var attributes = [];
                var domAttr = attributeArray(dom);
                for (var i = 0; i < domAttr.length; i++) {
                    var a = domAttr[i];
                    attributes.push([
                        " ",
                        a.name,
                        '="',
                        escapeHTML(a.value),
                        '"'
                    ]);
                }
                attributes.sort();
                for (var i = 0; i < attributes.length; i++) {
                    var attrs = attributes[i];
                    for (var j = 0; j < attrs.length; j++) {
                        lst.push(attrs[j]);
                    }
                }
                if (dom.hasChildNodes()) {
                    lst.push(">");
                    // queue is the FILO call stack, so we put the close tag
                    // on first
                    queue.push("</" + dom.nodeName.toLowerCase() + ">");
                    var cnodes = dom.childNodes;
                    for (var i = cnodes.length - 1; i >= 0; i--) {
                        queue.push(cnodes[i]);
                    }
                } else {
                    lst.push('/>');
                }
            } else if (dom.nodeType == 3) {
                lst.push(escapeHTML(dom.nodeValue));
            }
        }
        return lst;
    };

    var setDisplayForElements = function (display, element/*, ...*/) {
        /***

            Change the style.display for the given element(s).  Usually
            used as the partial forms:

                showElement(element, ...);
                hideElement(element, ...);

        ***/
        var elements = extend(null, arguments, 1);
        forEach(filter(operator.truth, map(getElement, elements)), function (element) {
            element.style.display = display;
        });
    };

    var hideElement = partial(setDisplayForElements, "none");
    var showElement = partial(setDisplayForElements, "block");

    var scrapeText = function (node) {
        /***
        
            Walk a DOM tree and scrape all of the text out of it as an Array.

        ***/
        var rval = [];
        nodeWalk(node, function (node) {
            var nodeValue = node.nodeValue;
            if (typeof(nodeValue) == 'string') {
                rval.push(nodeValue);
            }
            return node.childNodes;
        });
        return rval;
    };

    var NAMES = [
        ["registerDOMConverter", registerDOMConverter],
        ["coerceToDOM", coerceToDOM],
        ["createDOM", createDOM],
        ["createDOMFunc", createDOMFunc],
        ["swapDOM", swapDOM],
        ["TD", TD],
        ["TR", TR],
        ["TBODY", TBODY],
        ["TFOOT", TFOOT],
        ["TABLE", TABLE],
        ["TH", TH],
        ["INPUT", INPUT],
        ["SPAN", SPAN],
        ["A", A],
        ["DIV", DIV],
        ["IMG", IMG],
        ["getElement", getElement],
        ["$", getElement],
        ["addToCallStack", addToCallStack],
        ["addLoadEvent", addLoadEvent],
        ["focusOnLoad", focusOnLoad],
        ["setElementClass", setElementClass],
        ["toggleElementClass", toggleElementClass],
        ["addElementClass", addElementClass],
        ["removeElementClass", removeElementClass],
        ["swapElementClass", swapElementClass],
        ["escapeHTML", escapeHTML],
        ["toHTML", toHTML],
        ["emitHTML", emitHTML],
        ["setDisplayForElements", setDisplayForElements],
        ["hideElement", hideElement],
        ["showElement", showElement],
        ["scrapeText", scrapeText]
    ];

    var EXPORT = [];
    
    for (var i = 0; i < NAMES.length; i++) {
        var o = NAMES[i];
        this[o[0]] = o[1];
        EXPORT.push(o[0]);
    }

    this.EXPORT = EXPORT;
    this.EXPORT_OK = ["domConverters"];
    this.domConverters = domConverters;

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": concat(this.EXPORT, this.EXPORT_OK)
    };

};

MochiKit.DOM.__new__();

if (typeof(JSAN) == 'undefined'
    || (typeof(__MochiKit_Compat__) == 'boolean' && __MochiKit_Compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.DOM);
}
