RegExpManager = function () {
    this.timer = null;
    bindMethods(this);
};

RegExpManager.prototype.initialize = function () {
    updateNodeAttributes("inp_text", {
        "value": "matched with your pattern",
        "onkeyup": partial(this.doSoon, this.changeInput),
        "onchange": this.changeInput
    });
    updateNodeAttributes("inp_regexp", {
        "value": "/(pattern)/",
        "onkeyup": partial(this.doSoon, this.changeRegExp),
        "onchange": this.changeRegExp
    });
    updateNodeAttributes("regexp_form", {
        "onsubmit": this.submit
    });
    this.update();
};

RegExpManager.prototype.doSoon = function (doWhat) {
    this.cancelTimer();
    this.timer = callLater(0.5, doWhat);
};

RegExpManager.prototype.cancelTimer = function () {
    if (this.timer) {
        this.timer.cancel();
    }
    this.timer = null;
};

RegExpManager.prototype.update = function () {
    var re;
    this.cancelTimer();
    try {
        re = eval("(" + getElement("inp_regexp").value + ")");
    } catch (e) {
        addElementClass("lab_regexp", "error");
        return;
    }
    removeElementClass("lab_regexp", "error");
    var result = getElement("inp_text").value.match(re);
    if (result) {
        replaceChildNodes("result_body",
            map(function (kv) {
                if (kv[0] == "input") {
                    var v = kv[1];
                    var end = result.index + result[0].length;
                    return TR(null,
                        TD(null, kv[0]),
                        TD(null,
                            SPAN(null, v.substr(0, result.index)),
                            SPAN({"class": "highlight"},
                                v.substring(result.index, end)
                            ),
                            SPAN(null, v.substr(end))
                        ),
                        TD(null, repr(v))
                    );
                }
                return TR(null,
                    TD(null, kv[0]),
                    TD(null, kv[1]),
                    TD(null, repr(kv[1]))
                );
            }, items(result)));
    // /(\d{4,})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?(?:(Z)|([+-])(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/
    } else {
        replaceChildNodes("result_body", TR(null, TD({"colspan": "0"})));
    }
};

RegExpManager.prototype.submit = function () {
    this.update();
    return false;
};

RegExpManager.prototype.changeInput = function () {
    this.update();
};

RegExpManager.prototype.changeRegExp = function () {
    this.update();
};


regExpManager = new RegExpManager();
addLoadEvent(function () {
    regExpManager.initialize();
});
