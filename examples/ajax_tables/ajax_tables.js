SortableManager = function () {
    this.thead = null;
    this.thead_proto = null;
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

lower = function (s) {
    return s.toLowerCase();
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
        this.thead_proto = this.thead.cloneNode(true);

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
        d.addCallback(function (res) {
            res.format = format;
            return res;
        });
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
        var domains = [];
        var rows = data.rows;
        var cols = data.columns;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var domain = {};
            for (var j = 0; j < cols.length; j++) {
                domain[cols[j]] = row[j];
            }
            domains.push(domain);
        }
        data.domains = domains;
        this.data = data;
        var order = this.sortState[this.sortkey];
        if (typeof(order) == 'undefined') {
            order = true;
        }
        this.drawSortedRows(this.sortkey, order, false);

    },

    "onSortClick": function (name) {
        /***

            Return a sort function for click events

        ***/
        return bind(function () {
            log('onSortClick', name);
            var order = this.sortState[name];
            order = !((typeof(order) == 'undefined') ? false : order);
            this.drawSortedRows(name, order, true);
        }, this);
    },

    "drawSortedRows": function (key, forward, clicked) {
        /***

            Draw the new sorted table body, and modify the column headers
            if appropriate

        ***/
        log('drawSortedRows', key, forward);

        // save it so we can flip next time
        this.sortState[key] = forward;
        this.sortkey = key;
        var sortstyle = "str";

        // setup the sort columns   
        var thead = this.thead_proto.cloneNode(true);
        var cols = thead.getElementsByTagName("th");
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            var sortinfo = getAttribute(col, "mochi:sortcolumn").split(" ");
            var sortkey = sortinfo[0];
            col.onclick = this.onSortClick(sortkey);
            col.onmousedown = ignoreEvent;
            col.onmouseover = mouseOverFunc;
            col.onmouseout = mouseOutFunc;
            // if this is the sorted column
            if (sortkey == key) {
                sortstyle = sortinfo[1];
                // \u2193 is down arrow, \u2191 is up arrow
                // forward sorts mean the rows get bigger going down
                var arrow = (forward ? "\u2193" : "\u2191");
                // add the character to the column header
                col.appendChild(SPAN(null, arrow));
                if (clicked) {
                    col.onmouseover();
                }
            }
        }
        this.thead = swapDOM(this.thead, thead);

        var domains = this.data.domains;
        if (sortstyle && sortstyle != "str") {
            var func = null;
            switch (sortstyle) {
                case "istr":
                    func = lower;
                    break;
                case "isoDate":
                    func = isoDate;
                    break;
                default:
                    throw new TypeError("unsupported sort style " + repr(sortstyle));
            }
            for (var i = 0; i < domains.length; i++) {
                var domain = domains[i];
                domain.__sort__ = func(domain[key]);
            }
            key = "__sort__";
        }
        
        // sort based on the state given (forward or reverse)
        var cmp = (forward ? keyComparator : reverseKeyComparator);
        domains.sort(cmp(key));
        for (var i = 0; i < this.templates.length; i++) {
            log('template', i, template);
            var template = this.templates[i];
            var dom = template.template.cloneNode(true);
            this.processMochiTAL(dom, this.data);
            template.node = swapDOM(template.node, dom);
        }
 

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
