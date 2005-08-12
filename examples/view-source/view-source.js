/*

Do syntax highlighting on every textarea inside of a "codeview" element

The content of textareas are URLs, not code!

*/
var viewSource = function () {
    var filename = location.hash;
    if (!filename) {
        filename = location.hash = "view-source/view-source.js";
    }
    filename = lstrip(filename, "#");
    replaceChildNodes("filename", filename);
    replaceChildNodes("code", "../" + filename);
    ext = filename.split(".").pop();
    var classes = {
        "html": "xml",
        "js": "javascript"
    };
    updateNodeAttributes("code", {"class": classes[ext]});
    syntaxHighlight();
};

var syntaxHighlight = function () {
    var swapContents = function (dest, req) {
        replaceChildNodes(dest, req.responseText);
    };

    var finishSyntaxHighlight = function () {
        dp.sh.HighlightAll("code", true, true, false);
        removeElementClass("codeview", "invisible");
    };

    var elems = getElementsByTagAndClassName("textarea", null, "codeview");
    var dl = new Deferred();
    var deferredCount = 0;
    var checkDeferredList = function () {
        deferredCount -= 1;
        if (!deferredCount) {
            dl.callback();
        }
    };
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        if (elem.name != "code") {
            continue;
        }
        var url = strip(scrapeText(elem))
        var d = doSimpleXMLHttpRequest(url).addCallback(
            partial(swapContents, elem)
        );
        deferredCount += 1;
        d.addCallback(checkDeferredList);
    }
    dl.addCallback(finishSyntaxHighlight);
};
