function function_ref(fn) {
    return A({"href": fn[1], "class": "mochiref reference"}, fn[0], BR());
};

function toggle_docs() {
    toggleElementClass("invisible", "show_index", "function_index");
    return false;
};

function create_toc() {
    /*
    if (getElement("distribution")) {
        return global_index();
    } 
    */
    if (getElement("api-reference")) {
        return module_index();
    }
};

function doXHTMLRequest(url) {
    var req = getXMLHttpRequest();
    if (req.overrideMimeType) {
        req.overrideMimeType("text/xml");
    }
    req.open("GET", url, true);
    return sendXMLHttpRequest(req).addCallback(function (res) {
        return res.responseXML.documentElement;
    });
};

function load_request(href, span, doc) {
    var functions = withDocument(doc, spider_doc);
    forEach(functions, function (func) {
        // fix anchors
        if (func[1].charAt(0) == "#") {
            func[1] = href + func[1];
        }
        window.console.log(func[1] + " - " + func[0]);
    })
};

function global_index() {
    var distList = getElementsByTagAndClassName("ul")[0];
    var bullets = getElementsByTagAndClassName("li", null, distList);
    var modules = [];
    var deferreds = [];
    for (var i = 0; i < bullets.length; i++) {
        var tag = bullets[i];
        var firstLink = getElementsByTagAndClassName("a", "mochiref", tag)[0];
        var href = getNodeAttribute(firstLink, "href");
        var span = SPAN(null, href);
        appendChildNodes(tag, BR(), SPAN(null, href));
        modules.push([href, span]);
        var d = doXHTMLRequest(href).addCallback(load_request, href, span);
        deferreds.push(d);
    }
};

function spider_doc() {
    return map(
        function (tag) {
            return [scrapeText(tag), getNodeAttribute(tag, "href")];
        },
        getElementsByTagAndClassName("a", "mochidef")
    );
};

function module_index() {
    var sections = getElementsByTagAndClassName("div", "section");
    var ptr = sections[1];
    var ref = DIV({"class": "section"},
        H1(null, "Function Index"),
        A({"id": "show_index", "href": "#", "onclick": toggle_docs}, "[show]"),
        DIV({"id": "function_index", "class": "invisible"},
            A({"href":"#", "onclick": toggle_docs}, "[hide]"),
            P(null, map(function_ref, spider_doc()))));
    ptr.parentNode.insertBefore(ref, ptr);
};

addLoadEvent(create_toc);
