SortableManager = function () {
    this.thead = null;
    this.tbody = null;
    this.deferred = null;
    this.columns = [];
    this.rows = [];
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
    
update(SortableManager.prototype, {

    "initialize": function () {
        // just rip all mochi-examples out of the DOM
        var examples = getElementsByTagAndClassName(null, "mochi-example");
        while (examples.length) {
            swapDOM(examples.pop(), null);
        }
        // make a template list
        var templates = getElementsByTagAndClassName(null, "mochi-template");
        this.templates = [];
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
            this.templates.push({"template": template, "nodes": [template]});
        }
        // set up the data anchors to do loads
        var anchors = getElementsByTagAndClassName("a", null);
        for (var i = 0; i < anchors.length; i++) {
            var node = anchors[i];
            try {
                var format = node.getAttribute("mochi:dataformat");
                if (format) {
                    node.onclick = loadFromDataAnchor;
                }
            } catch (e) {
                // pass
            }
        }
    },

    "loadFromURL": function (format, url) {
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
            return res;
        }, this));
        d.addCallback(bind(this.initWithData, this));
        d.addErrback(function (err) {
            if (err instanceof CancelledError) {
                return;
            }
            logErr(err);
            logger.debuggingBookmarklet();
        });
    },

    
    "initWithData": function (data) {
        /***

            Initialize the SortableManager with a table object
        
        ***/
        log("columns", repr(data.columns));
        log("rows", repr(data.rows));
        /*
            XXX: work in progress
        */
        for (var i = 0; i < templates.length; i++) {
            var template = templates[i];
        }
/*
        // Find the thead
        this.thead = table.getElementsByTagName('thead')[0];
        // get the mochi:format key and contents for each column header
        var cols = this.thead.getElementsByTagName('th');
        for (var i = 0; i < cols.length; i++) {
            var node = cols[i];
            var attr = null;
            try {
                attr = node.getAttribute("mochi:format");
            } catch (err) {
                // pass
            }
            var o = node.childNodes;
            this.columns.push({
                "format": attr,
                "element": node,
                "proto": node.cloneNode(true)
            });
        }
        // scrape the tbody for data
        this.tbody = table.getElementsByTagName('tbody')[0];
        // every row
        var rows = this.tbody.getElementsByTagName('tr');
        for (var i = 0; i < rows.length; i++) {
            // every cell
            var row = rows[i];
            var cols = row.getElementsByTagName('td');
            var rowData = [];
            for (var j = 0; j < cols.length; j++) {
                // scrape the text and build the appropriate object out of it
                var cell = cols[j];
                var obj = scrapeText(cell).join("");
                switch (this.columns[j][0]) {
                    case 'isodate':
                        obj = isoDate(txt);
                        break;
                    case 'str':
                        break;
                    case 'istr':
                        obj = txt.toLowerCase();
                        break;
                    // cases for numbers, etc. could be here
                    default:
                        break;
                }
                rowData.push(obj);
            }
            // stow away a reference to the TR and save it
            rowData.row = row.cloneNode(true);
            this.rows.push(rowData);

        }

        // do initial sort on first column
        this.drawSortedRows(0, true, false);
*/

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
    }
});

sortableManager = new SortableManager();

addLoadEvent(function () {
    sortableManager.initialize();
});
