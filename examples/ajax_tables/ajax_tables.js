SortableManager = function () {
    this.thead = null;
    this.tbody = null;
    this.deferred = null;
    this.columns = [];
    this.rows = [];
    this.templates = [];
    this.sortState = {};
};

mouseOverFunc = function () {
    addElementClass(this, "over");
};

mouseOutFunc = function () {
    removeElementClass(this, "over");
};

ignoreEvent = function (ev) {
    if (ev && ev.preventDefault) {
        ev.preventDefault();
        ev.stopPropagation();
    } else if (typeof(event) != 'undefined') {
        event.cancelBubble = false;
        event.returnValue = false;
    }
};

getAttribute = function (dom, key) {
    try {
        return dom.getAttribute(key);
    } catch (e) {
        return null;
    }
}

datatableFromXMLRequest = function (req) {
    /***

        This effectively converts domains.xml to the
        same form as domains.json

    ***/
    var xml = req.responseXML;
    var nodes = xml.getElementsByTagName("column");
    var rval = {"columns": map(scrapeText, nodes)};
    var rows = [];
    nodes = xml.getElementsByTagName("row") 
    for (var i = 0; i < nodes.length; i++) {
        var cells = nodes[i].getElementsByTagName("cell");
        rows.push(map(scrapeText, cells));
    }
    rval.rows = rows;
    return rval;
};

loadFromDataAnchor = function (ev) {
    ignoreEvent(ev);
    var format = this.getAttribute("mochi:dataformat");
    var href = this.href;
    sortableManager.loadFromURL(format, href);
};

valueForKeyPath = function (data, keyPath) {
    var chunks = keyPath.split(".");
    while (chunks.length && data) {
        data = data[chunks.shift()];
    }
    return data;
};

update(SortableManager.prototype, {

    "initialize": function () {
        // just rip all mochi-examples out of the DOM
        var examples = getElementsByTagAndClassName(null, "mochi-example");
        while (examples.length) {
            swapDOM(examples.pop(), null);
        }
        // make a template list
        var templates = getElementsByTagAndClassName(null, "mochi-template");
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            var proto = template.cloneNode(true);
            removeElementClass(proto, "mochi-template");
            this.templates.push({
                "template": proto,
                "node": template
            });
        }
        // set up the data anchors to do loads
        var anchors = getElementsByTagAndClassName("a", null);
        for (var i = 0; i < anchors.length; i++) {
            var node = anchors[i];
            var format = getAttribute(node, "mochi:dataformat");
            if (format) {
                node.onclick = loadFromDataAnchor;
            }
        }

        // to find sort columns
        this.thead = getElementsByTagAndClassName("thead", null, $("sortable_table"))[0];

        this.sortkey = "domain_name";
        this.loadFromURL("json", "domains.json");
    },

    "loadFromURL": function (format, url) {
        log('loadFromURL', format, url);
        var d;
        if (this.deferred) {
            this.deferred.cancel();
        }
        if (format == "xml") {
            var req = getXMLHttpRequest();
            if (req.overrideMimeType) {
                req.overrideMimeType("text/xml");
            }
            req.open("GET", url, true);
            d = sendXMLHttpRequest(req).addCallback(datatableFromXMLRequest);
        } else if (format == "json") {
            d = loadJSONDoc(url);
        } else {
            throw new TypeError("format " + repr(format) + " not supported");
        }
        this.deferred = d;
        d.addBoth(bind(function (res) {
            this.deferred = null; 
            log('loadFromURL success');
            return res;
        }, this));
        d.addCallback(bind(this.initWithData, this));
        d.addErrback(function (err) {
            if (err instanceof CancelledError) {
                return;
            }
            logError(err);
            logger.debuggingBookmarklet();
        });
        return d;
    },

    
    "initWithData": function (data) {
        /***

            Initialize the SortableManager with a table object
        
        ***/
        this.data = data;
        var order = !!this.sortState[this.sortkey];
        this.drawSortedRows(this.sortkey, order, false);

    },

    "onSortClick": function (name) {
        /***

            Return a sort function for click events

        ***/
        return bind(function () {
            log('onSortClick', name);
            var order = this.sortState[name];
            order = !((order == null) ? false : order);
            this.drawSortedRows(name, order, true);
        }, this);
    },

    "drawSortedRows": function (key, forward, clicked) {
        /***

            Draw the new sorted table body, and modify the column headers
            if appropriate

        ***/
        log('drawSortedRows', key, forward);
        // sort based on the state given (forward or reverse)
        var cmp = (forward ? keyComparator : reverseKeyComparator);
        this.rows.sort(cmp(key));
        // save it so we can flip next time
        this.sortState[key] = forward;
        log('sort state');

        for (var i = 0; i < this.templates.length; i++) {
            log('template', i, template);
            var template = this.templates[i];
            var dom = template.template.cloneNode(true);
            this.processMochiTAL(dom, this.data);
            template.node = swapDOM(template.node, dom);
        }
            
        
        /*
        // get every "row" element from this.rows and make a new tbody
        var newBody = TBODY(null, map(itemgetter("row"), this.rows));
        // swap in the new tbody
        this.tbody = swapDOM(this.tbody, newBody);
        for (var i = 0; i < this.columns.length; i++) {
            var col = this.columns[i];
            var node = col.proto.cloneNode(true);
            // remove the existing events to minimize IE leaks
            col.element.onclick = null;
            col.element.onmousedown = null;
            col.element.onmouseover = null;
            col.element.onmouseout = null;
            // set new events for the new node
            node.onclick = this.onSortClick(i);
            node.onmousedown = ignoreEvent;
            node.onmouseover = mouseOverFunc;
            node.onmouseout = mouseOutFunc;
            // if this is the sorted column
            if (key == i) {
                // \u2193 is down arrow, \u2191 is up arrow
                // forward sorts mean the rows get bigger going down
                var arrow = (forward ? "\u2193" : "\u2191");
                // add the character to the column header
                node.appendChild(SPAN(null, arrow));
                if (clicked) {
                    node.onmouseover();
                }
            }
 
            // swap in the new th
            col.element = swapDOM(col.element, node);
        }
        */
    },

    "processMochiTAL": function (dom, data) {
        if (dom.nodeType != 1) {
            return;
        }
        var attr;
        attr = getAttribute(dom, "mochi:repeat");
        if (attr) {
            dom.removeAttribute("mochi:repeat");
            var parent = dom.parentNode;
            attr = attr.split(" ");
            var name = attr[0];
            var lst = valueForKeyPath(data, attr[1]);
            if (!lst) {
                return;
            }
            for (var i = 0; i < lst.length; i++) {
                data[name] = lst[i];
                var newDOM = dom.cloneNode(true);
                this.processMochiTAL(newDOM, data);
                parent.insertBefore(newDOM, dom);
            }
            parent.removeChild(dom);
            return;
        }
        attr = getAttribute(dom, "mochi:content");
        if (attr) {
            dom.removeAttribute("mochi:content");
            while (dom.firstChild) {
                dom.removeChild(dom.firstChild);
            }
            var content = valueForKeyPath(data, attr);
            if (content) {
                dom.appendChild(document.createTextNode(content));
            }
            return;
        }
        var nodes = list(dom.childNodes);
        for (var i = 0; i < nodes.length; i++) {
            this.processMochiTAL(nodes[i], data);
        }
    }

});

sortableManager = new SortableManager();

addLoadEvent(function () {
    sortableManager.initialize();
});
