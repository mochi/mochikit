RegExpManager = function () {
    bindMethods(this);
};

RegExpManager.prototype.initialize = function () {
    updateNodeAttributes("input_text", {
        "value": "matched with your pattern",
        "onchange": this.changeText
    });
    updateNodeAttributes("input_regexp", {
        "value": "/(pattern)/",
        "onchange": this.changeRegExp
    });
    updateNodeAttributes("regexp_form", {
        "onsubmit": this.submit
    });
    this.update();
};

RegExpManager.prototype.update = function () {
    var re;
    try {
        re = eval("(" + getElement("input_regexp").value + ")");
    } catch (e) {
        log("error: " + e);
        return;
    }
    var result = getElement("input_text").value.match(re);
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
    log("submit");
    this.update();
    return false;
};

RegExpManager.prototype.changeInput = function () {
    log("text changed");
    this.update();
};

RegExpManager.prototype.changeRegExp = function () {
    log("regexp changed");
    this.update();
};


regExpManager = new RegExpManager();
addLoadEvent(function () {
    regExpManager.initialize();
});
