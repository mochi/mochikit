/***

MochiKit.LoggingPane 1.0

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.LoggingPane');
    dojo.require('MochiKit.Logging');
    dojo.require('MochiKit.Base');
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Logging", []);
    JSAN.use("MochiKit.Base", []);
}

try {
    if (typeof(MochiKit.Base) == 'undefined' || typeof(MochiKit.Logging) == 'undefined') {
        throw "";
    }
} catch (e) {
    throw "MochiKit.LoggingPane depends on MochiKit.Base and MochiKit.Logging!";
}

if (typeof(MochiKit.LoggingPane) == 'undefined') {
    MochiKit.LoggingPane = {};
}

MochiKit.LoggingPane.NAME = "MochiKit.LoggingPane";
MochiKit.LoggingPane.VERSION = "1.0";
MochiKit.LoggingPane.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.LoggingPane.toString = function () {
    return this.__repr__();
};

MochiKit.LoggingPane.createLoggingPane = function (inline/* = false */) {
    var m = MochiKit.LoggingPane;
    inline = !(!inline);
    if (m._loggingPane && m._loggingPane.inline != inline) {
        m._loggingPane.closePane();
        m._loggingPane = null;
    }
    if (!m._loggingPane || m._loggingPane.closed) {
        m._loggingPane = new m.LoggingPane(inline, MochiKit.Logging.logger);
    }
    return m._loggingPane;
};

MochiKit.LoggingPane.LoggingPane = function (inline/* = false */, logger/* = MochiKit.Logging.logger */) {
    /* Use a div if inline, pop up a window if not */
    /* Create the elements */
    var doc = document;
    if (typeof(logger) == "undefined" || logger == null) {
        MochiKit.Logging.logger;
    }
    var update = MochiKit.Base.update;
    var updatetree = MochiKit.Base.updatetree;
    var bind = MochiKit.Base.bind;
    var clone = MochiKit.Base.clone;
    var win;
    if (!inline) {
        win = window.open("", "", "dependent,resizable,height=200");
        if (!win) {
            alert("Not able to open debugging window due to pop-up blocking.");
            return;
        }
        doc = win.document;
    }
    this.doc = doc;
    var debugPane = doc.createElement("div");
    var levelFilterField = doc.createElement("input");
    var infoFilterField = doc.createElement("input");
    var filterButton = doc.createElement("button");
    var loadButton = doc.createElement("button");
    var clearButton = doc.createElement("button");
    var closeButton = doc.createElement("button");
    var logPaneArea = doc.createElement("div");
    var logPane = doc.createElement("div");

    /* Set up the functions */
    var listenerId = "_debugPaneListener";
    this.colorTable = clone(this.colorTable);
    var messages = [];
    var messageFilter = null;

    var messageLevel = function (msg) {
        var level = msg.level;
        if (typeof(level) == "number") {
            level = MochiKit.Logging.LogLevel[level];
        }
        return level;
    };

    var messageText = function (msg) {
        return msg.info.join(" ");
    };

    var addMessageText = bind(function (msg) {
        var level = messageLevel(msg);
        var text = messageText(msg);
        var c = this.colorTable[level];
        var p = doc.createElement("span");
        p.style.color = c;
        p.style.margin = "0";
        p.appendChild(doc.createTextNode(level + ": " + text));
        logPane.appendChild(p);
        logPane.appendChild(doc.createElement("br"));
        if (typeof(p.scrollIntoView) == "function") {
            p.scrollIntoView();
        } else {
            // safari workaround 
            logPaneArea.scrollTop = logPaneArea.scrollHeight;
        }
    }, this);

    var addMessage = function (msg) {
        messages[messages.length] = msg;
        addMessageText(msg);
    };

    var buildMessageFilter = function () {
        var levelre, infore;
        try {
            /* Catch any exceptions that might arise due to invalid regexes */
            levelre = new RegExp(levelFilterField.value);
            infore = new RegExp(infoFilterField.value);
        } catch(e) {
            /* If there was an error with the regexes, do no filtering */
            logDebug("Error in filter regex: " + e.message);
            return null;
        }

        return function (msg) {
            return (
                levelre.test(messageLevel(msg)) &&
                infore.test(messageText(msg))
            );
        };
    }

    var clearMessagePane = function () {
        while (logPane.firstChild) {
            logPane.removeChild(logPane.firstChild);
        }
    };

    var clearMessages = function () {
        messages = [];
        clearMessagePane();
    }

    var closePane = bind(function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        if (MochiKit.LoggingPane._loggingPane == this) {
            MochiKit.LoggingPane._loggingPane = null;
        }
        logger.removeListener(listenerId);

        if (inline) {
            debugPane.parentNode.removeChild(debugPane);
        } else {
            this.win.close();
        }
    }, this);

    var filterMessages = function () {
        clearMessagePane();

        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            if (messageFilter == null || messageFilter(msg)) {
                addMessageText(msg);
            }
        }
    };

    var buildAndApplyFilter = function () {
        messageFilter = buildMessageFilter();

        filterMessages();

        logger.removeListener(listenerId);
        logger.addListener(listenerId, messageFilter, addMessage);
    };


    var loadMessages = function () {
        messages = logger.getMessages();
        filterMessages();
    };

    var filterOnEnter = function (event) {
        event = event || window.event;
        key = event.which || event.keyCode;
        if (key == 13) {
            buildAndApplyFilter();
        }
    };

    /* Create the debug pane */
    var style = {
        "display": "block",
        "position": "fixed",
        "left": "0px",
        "bottom": "0px",
        "font": this.logFont,
        "width": "100%",
        "height": "100%",
        "backgroundColor": "white"
    };
    if (inline) {
        style.height = "10em";
        style.borderTop = "2px solid black";
    }
    update(debugPane.style, style);

    doc.body.appendChild(debugPane);

    /* Create the filter fields */
    style = {"width": "33%", "display": "inline", "font": this.logFont};

    updatetree(levelFilterField, {
        "value": "FATAL|ERROR|WARNING|INFO|DEBUG",
        "onkeypress": filterOnEnter,
        "style": style
    });
    debugPane.appendChild(levelFilterField);

    updatetree(infoFilterField, {
        "value": ".*",
        "onkeypress": filterOnEnter,
        "style": style
    });
    debugPane.appendChild(infoFilterField);

    /* Create the buttons */
    style = {"width": "8%", "display": "inline", "font": this.logFont};

    filterButton.appendChild(doc.createTextNode("Filter"));
    filterButton.onclick = buildAndApplyFilter;
    update(filterButton.style, style);
    debugPane.appendChild(filterButton);

    loadButton.appendChild(doc.createTextNode("Load"));
    loadButton.onclick = loadMessages;
    update(loadButton.style, style);
    debugPane.appendChild(loadButton);

    clearButton.appendChild(doc.createTextNode("Clear"));
    clearButton.onclick = clearMessages;
    update(clearButton.style, style);
    debugPane.appendChild(clearButton);

    closeButton.appendChild(doc.createTextNode("Close"));
    closeButton.onclick = closePane;
    update(closeButton.style, style);
    debugPane.appendChild(closeButton);

    /* Create the logging pane */
    debugPane.style.display = "block";
    logPaneArea.style.overflow = "auto";
    logPaneArea.style.width = "100%";
    logPane.style.whitespace = "preserve";
    logPane.style.width = "100%";
    logPane.style.height = "8em";

    logPaneArea.appendChild(logPane);
    debugPane.appendChild(logPaneArea);

    buildAndApplyFilter();
    loadMessages();

    this.win = win;
    this.inline = inline;
    this.closePane = closePane;
    this.closed = false;
};

MochiKit.LoggingPane.LoggingPane.prototype = {
    "logFont": "8pt Verdana,sans-serif",
    "colorTable": {
        "ERROR": "red",
        "FATAL": "darkred",
        "WARNING": "blue",
        "INFO": "black",
        "DEBUG": "green"
    }
};


MochiKit.LoggingPane.EXPORT_OK = [
    "LoggingPane"
];

MochiKit.LoggingPane.EXPORT = [
    "createLoggingPane"
];

MochiKit.LoggingPane.__new__ = function () {
    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": MochiKit.Base.concat(this.EXPORT, this.EXPORT_OK)
    };
    
    MochiKit.Base.nameFunctions(this);

    MochiKit.LoggingPane._loggingPane = null;
  
};

MochiKit.LoggingPane.__new__();

if ((typeof(JSAN) == 'undefined' && typeof(dojo) == 'undefined')
    || (typeof(MochiKit.__compat__) == 'boolean' && MochiKit.__compat__)) {
    (function (self) {
            var all = self.EXPORT_TAGS[":all"];
            for (var i = 0; i < all.length; i++) {
                this[all[i]] = self[all[i]];
            }
        })(MochiKit.LoggingPane);
}
