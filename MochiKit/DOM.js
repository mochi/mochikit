_DOMConverters = new AdapterRegistry(); 

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


registerDOMConverter = function (name, check, wrap, /* optional */override) {
    /***

        Register an adapter to convert objects that match check(obj, ctx) to
        a DOM element, or something that can be converted to a DOM element
        (i.e. number, bool, string, function, iterable).

    ***/
    _DOMConverters.register(name, check, wrap, override);
};

coerceToDOM = function (node, ctx) {
    /***

        Used internally by createDOM, coerces a node to null, a DOM object, or an iterable.

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
            node = _DOMConverters.match(node, ctx);
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
    
createDOM = function (name, attrs/*, nodes... */) {
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

        @param *nodes: All additional parameters will be coerced into DOM nodes
                       that are appended as children using the following rules:
                    
                       1. Functions are called with a "this" of the parent node
                          and their return value is subject to the following
                          rules (even this one)
                       2. undefined and null are ignored.
                       3. Iterables are flattened (as if they were passed
                          in-line as nodes) and each return value is subject
                          to all of these rules.
                       4. Values that look like DOM nodes (objects with a
                          nodeType > 0) are appendChild'ed to the created DOM
                          fragment.
                       5. Strings are converted to textNodes.
                       6. Objects that are not strings are converted to strings
                          using a "registerDOMConverter" adapters.
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

createDOMFunc = function (/* tag, attrs, *nodes */) {
    /***

        Convenience function to create a partially applied createDOM

        @param tag: The name of the tag

        @param attrs: Optionally specify the attributes to apply

        @param *notes: Optionally specify any children nodes it should have

        @rtype: function

    ***/
    return partial.apply(this, extend([createDOM], arguments));
};

swapDOM = function (dest, src) {
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
TD = createDOMFunc("td");
TR = createDOMFunc("tr");
TBODY = createDOMFunc("tbody");
TFOOT = createDOMFunc("tfoot");
TABLE = createDOMFunc("table");
TH = createDOMFunc("th");
INPUT = createDOMFunc("input");
SPAN = createDOMFunc("span");
A = createDOMFunc("a");
DIV = createDOMFunc("div");
IMG = createDOMFunc("img");

getElement = function (id) {
    /***

        A small quick little function to encapsulate the getElementById method.
        It includes a check to ensure we can use that method.

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

$ = getElement;

addLoadEvent = function (func) {
    /***

        This will stack load functions on top of each other.
        Each function added will be called after onload in the
        order that they were added.

    ***/
    var oldonload = window.onload;
    if (typeof(window.onload) != 'function') {
        window.onload = func;
    } else {
        window.onload = function() {
            oldonload.apply(this);
            func.apply(this);
        }
    }
};

focusOnLoad = function (element) {
    addLoadEvent(function () {
        element = getElement(element);
        if (element) {
            element.focus();
        }
    });
};
        

setElementClass = function (element, className) {
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
        
toggleElementClass = function (className/*, element... */) {
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

addElementClass = function (element, className) {
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

removeElementClass = function (element, className) {
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

swapElementClass = function (element, fromClass, toClass) {
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

_TRANSTABLE = {
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;"
};

escapeHTML = function (s) {
    /***

        Make a string safe for HTML, converting the usual suspects (lt, gt, quot, apos, amp)

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

toHTML = function (dom) {
    /***

        Convert a DOM tree to a HTML string using emitHTML

    ***/
    return list(emitHTML(dom)).join("");
};

emitHTML = function (dom) {
    /***

        Convert a DOM tree to a HTML-string-fragment-iterator

        In other words you probably want to use toHTML instead.

    ***/

    lst = [];
    if (dom.nodeType == 1) {
        lst.push('<' + dom.nodeName.toLowerCase());
        var attributes = map(
            function (a) {
                return [" ", a.name, "=", '"', escapeHTML(a.value), '"'];
            },
            attributeArray(dom)
        );
        attributes.sort();
        for (var i = 0; i < attributes.length; i++) {
            extend(lst, attributes[i]);
        }
        if (dom.hasChildNodes()) {
            lst.push(">");
            var c = [lst];
            iextend(c, map(emitHTML, dom.childNodes));
            c.push(["</" + dom.nodeName.toLowerCase() + ">"]);
            return chain.apply(this, c);
        } else {
            lst.push('/>');
        }
    } else if (dom.nodeType == 3) {
        lst.push(escapeHTML(dom.nodeValue));
    }
    return iter(lst);
};

setDisplayForElements = function (display, element/*, ...*/) {
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

hideElement = partial(setDisplayForElements, "none");
showElement = partial(setDisplayForElements, "block");

