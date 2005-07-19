if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}
if (typeof(MochiKit.MochiKit) == 'undefined') {
    MochiKit.MochiKit = {};
}

if (typeof(JSAN) != 'undefined') {
    JSAN.use("MochiKit.Base");
    JSAN.use("MochiKit.Iter");
    JSAN.use("MochiKit.Logging");
    JSAN.use("MochiKit.DateTime");
    JSAN.use("MochiKit.Format");
    JSAN.use("MochiKit.Async");
    JSAN.use("MochiKit.DOM");
} else {
    __MochiKit_Compat__ = true;
    (function (/* ... */) {
        var scripts = document.getElementsByTagName("script");
        var base = null;
        var baseElem = null;
        var allScripts = {};
        for (var i = 0; i < scripts.length; i++) {
            src = scripts[i].src;
            allScripts[src] = true;
            if (src.match(/MochiKit.js$/)) {
                base = src.substring(0, src.lastIndexOf('MochiKit.js'));
                baseElem = scripts[i];
            }
        }
        if (base == null) {
            return;
        }
        for (var i = 0; i < arguments.length; i++) {
            var uri = base + arguments[i] + '.js';
            if (uri in allScripts) {
                continue;
            }
            var tag = '<' + 'script src="' + uri + '" type="text/javascript"' + '>' + '<' + '/script' + '>';
            document.write(tag);
            // the following doesn't work in Safari
            if (false) {
                var s = document.createElement('script');
                s.setAttribute("src", uri);
                s.setAttribute("type", "text/javascript");
                baseElem.parentNode.appendChild(s);
            }
        }
    })(
        "Base",
        "Iter",
        "Logging",
        "DateTime",
        "Format",
        "Async",
        "DOM"
    );
}
