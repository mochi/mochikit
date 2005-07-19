.. -*- mode: rst -*-

MochiKit.DOM
============

Functions
---------

registerDOMConverter(name, check, wrap[, override]):
    Register an adapter to convert objects that match check(obj, ctx)
    to a DOM element, or something that can be converted to a DOM
    element (i.e. number, bool, string, function, iterable).

createDOM(name, [, attrs[, node[, ...]]]):
    Create a DOM fragment in a really convenient manner, much like
    `Nevow`_'s stan.

.. _`Nevow`: http://nevow.com/

    Partially applied versions of this function for common tags are
    available as aliases:

    - TABLE
    - TR
    - TD
    - TH
    - TBODY
    - TFOOT
    - THEAD
    - SPAN
    - INPUT
    - A
    - DIV

    Usage::

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

    Corresponding to the following HTML::

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

    name:
        The kind of fragment to create (e.g. 'span').

    attrs:
        A mapping of attributes or null, (e.g. {'style': 'display:block'}).

        Note that it will do the right thing for IE, so don't do
        the class -> className hack yourself.

    node...:
        All additional parameters will be coerced into DOM
        nodes that are appended as children using the
        following rules:

        1.  Functions are called with a "this" of the parent
            node and their return value is subject to the
            following rules (even this one)
        2.  undefined and null are ignored.
        3.  Iterables are flattened (as if they were passed
            in-line as nodes) and each return value is
            subject to all of these rules.
        4.  Values that look like DOM nodes (objects with a
            nodeType > 0) are appendChild'ed to the created
            DOM fragment.
        5.  Strings are converted to textNodes.
        6.  Objects that are not strings are converted to
            objects known to these rules using a
            "registerDOMConverter" adapter if one exists.
        7.  If no adapter is available, toString() is used to
            create a textNode.

    returns:
        A DOM element

createDOMFunc(tag[, attrs[, node[, ...]]]):
    Convenience function to create a partially applied createDOM

    tag:
        The name of the tag

    attrs:
        Optionally specify the attributes to apply

    node...:
        Optionally specify any children nodes it should have

    returns:
        function

swapDOM(dest, src):
    Replace dest in a DOM tree with src, returning src

    dest:
        a DOM element to be replaced

    src:
        the DOM element to replace it with

    returns:
        a DOM element (src)

getElement(id[, ...]):
    A small quick little function to encapsulate the getElementById
    method.  It includes a check to ensure we can use that method.

    If the id isn't a string, it will be returned as-is.

    Also available as $(...) for compatibility/convenience with "other"
    js frameworks (bah).

    If multiple arguments are given, an array will be returned.


addLoadEvent(func):
    This will stack window.onload functions on top of each other.
    Each function added will be called after onload in the
    order that they were added.

focusOnLoad(element):
    Add an onload event to focus the given element
       
setElementClass(element, className):
    Set the entire class attribute of an element to className.
        
toggleElementClass(className[, element[, ...]]):
    Toggle the presence of a given className in the class attribute
    of all given elements.

addElementClass(element, className):
    Ensure that the given element has className set as part of its
    class attribute.  This will not disturb other class names.

removeElementClass(element, className):
    Ensure that the given element does not have className set as part
    of its class attribute.  This will not disturb other class names.

swapElementClass(element, fromClass, toClass):
    If fromClass is set on element, replace it with toClass.  This
    will not disturb other classes on that element.

hasElementClass(element, className[, ...]):
  Return true if className is found in the element

escapeHTML(s):
    Make a string safe for HTML, converting the usual suspects (lt,
    gt, quot, apos, amp)

toHTML(dom):
    Convert a DOM tree to a HTML string using emitHTML

emitHTML(dom[, lst]):
    Convert a DOM tree to an Array of HTML string fragments

    You probably want to use toHTML instead.

setDisplayForElement(display, element[, ...]):
    Change the style.display for the given element(s).  Usually
    used as the partial forms:

        showElement(element, ...);
        hideElement(element, ...);

scrapeText(node):
    Walk a DOM tree and scrape all of the text out of it as an Array.
