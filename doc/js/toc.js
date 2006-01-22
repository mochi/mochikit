FUNCTIONS = [];
function function_ref(fn) {
    return A({"href": fn[1], "class": "mochiref reference"}, fn[0], BR());
};

function toggle_docs() {
    toggleElementClass("invisible", "show_index", "function_index");
    return false;
};

function spider_docs() {
    var tags = getElementsByTagAndClassName("A", "mochidef");
    var sections = getElementsByTagAndClassName("DIV", "section");
    if (!getElement("api-reference")) {
        return;
    }
    
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        FUNCTIONS.push([scrapeText(tag), getNodeAttribute(tag, "href")]);
    }
    var ptr = sections[1];
    var ref = DIV({"class": "section"},
        H1(null, "Function Index"),
        A({"id": "show_index", "href": "#", "onclick": toggle_docs}, "[show]"),
        DIV({"id": "function_index", "class": "invisible"},
            A({"href":"#", "onclick": toggle_docs}, "[hide]"),
            P(null, map(function_ref, FUNCTIONS))));
    ptr.parentNode.insertBefore(ref, ptr);
};

addLoadEvent(spider_docs);
