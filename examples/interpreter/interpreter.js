/*

    Interpreter: JavaScript Interactive Interpreter

*/
InterpreterManager = function () {
    bindMethods(this);
};

InterpreterManager.prototype.initialize = function () {
    updateNodeAttributes("interpreter_text", {
        "onkeyup": this.keyUp
    });
    updateNodeAttributes("interpreter_form", {
        "onsubmit": this.submit
    });
    this.banner();
    this.lines = [];
    this.history = [];
    this.currentHistory = "";
    this.historyPos = -1;
};

InterpreterManager.prototype.banner = function () {
    appendChildNodes("interpreter_output",
        SPAN(null, "Interpreter: MochiKit v" + MochiKit.Base.VERSION),
        BR()
    );
};

InterpreterManager.prototype.submit = function () {
    this.doSubmit();
    this.doScroll();
    return false;
};

InterpreterManager.prototype.doScroll = function () {
    var p = getElement("interpreter_output").lastChild;
    if (typeof(p.scrollIntoView) == "function") {
        p.scrollIntoView();
        return;
    }
    // Safari workaround
    var area = getElement("interpreter_area");
    area.scrollTop = area.scrollHeight;
};

InterpreterManager.prototype.moveHistory = function (dir) {
    // totally bogus value
    if (dir == 0 || this.history.length == 0) {
        return;
    }
    var elem = getElement("interpreter_text");
    if (this.historyPos == -1) {
        this.currentHistory = elem.value;
        if (dir > 0) {
            return;
        }
        this.historyPos = this.history.length - 1;
        elem.value = this.history[this.historyPos];
        return;
    }
    if (this.historyPos == 0 && dir < 0) {
        return;
    }
    if (this.historyPos == this.history.length - 1 && dir > 0) {
        this.historyPos = -1;
        elem.value = this.currentHistory;
        return;
    } 
    this.historyPos += dir;
    elem.value = this.history[this.historyPos];
}

InterpreterManager.prototype.keyUp = function (e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 38: this.moveHistory(-1); break;
        case 40: this.moveHistory(1); break;
        default: return true;
    }
    e.cancelBubble = true;
    return false;
};

InterpreterManager.prototype.doSubmit = function () {
    var elem = getElement("interpreter_text");
    var code = elem.value;
    elem.value = "";
    var isContinuation = false;
    if (code.length >= 2 && code.lastIndexOf("//") == code.length - 2) {
        isContinuation = true;
        code = code.substr(0, code.length - 2);
    }
    appendChildNodes("interpreter_output",
        SPAN({"class": "code"}, ">>> ", code),
        BR()
    );
    this.lines.push(code);
    this.history.push(code);
    this.historyPos = -1;
    this.currentHistory = "";
    if (isContinuation) {
        return;
    }
    var allCode = this.lines.join("\n");
    this.lines = [];
    var res;
    try {
        if (typeof(eval.call) != "undefined") {
            res = eval.call(window, allCode);
        } else {
            with (window) { __ = eval(allCode); }
            res = __;
        }
    } catch (e) {
        var seen = {};
        appendChildNodes("interpreter_output",
            TABLE({"class": "error"},
                THEAD(null,
                    TR({"colspan": 2}, TH({"class": "error"}, "Error:"))
                ),
                TFOOT(null, TR({"colspan": 2}, TD())),
                TBODY(null,
                    map(function (kv) {
                        if (seen[kv[0]]) {
                            return null;
                        }
                        seen[kv[0]] = true;
                        return TR(null,
                            TD({"class": "error"}, kv[0]),
                            TD({"class": "data"}, kv[1])
                        );
                    }, sorted(items(e)))
                )
            )
        );
        return;
    }
    if (typeof(res) != "undefined") {
        window._ = res;
    }
    appendChildNodes("interpreter_output",
        SPAN({"class": "data"}, repr(res)),
        BR()
    );
    return;
};

window.writeln = function () {
    appendChildNodes("interpreter_output",
        SPAN({"class": "data"}, arguments),
        BR()
    );
};
    
interpreterManager = new InterpreterManager();
addLoadEvent(interpreterManager.initialize);

// rewrite the view-source links
addLoadEvent(function () {
    var elems = getElementsByTagAndClassName("A", "view-source");
    var page = "interpreter/";
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        var href = elem.href.split(/\//).pop();
        elem.target = "_blank";
        elem.href = "../view-source/view-source.html#" + page + href;
    }
});
