/***

MochiKit.MochiKit 0.80

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/

if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}

if (typeof(MochiKit.MochiKit) == 'undefined') {
    MochiKit.MochiKit = {};
}

MochiKit.MochiKit.NAME = "MochiKit.MochiKit";
MochiKit.MochiKit.VERSION = "0.80";
MochiKit.MochiKit.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

MochiKit.MochiKit.toString = function () {
    return this.__repr__();
};

MochiKit.MochiKit.SUBMODULES = [
    "Base",
    "Iter",
    "Logging",
    "DateTime",
    "Format",
    "Async",
    "DOM",
    "Visual"
];

if (typeof(JSAN) != 'undefined' || typeof(dojo) != 'undefined') {
    if (typeof(dojo) != 'undefined') {
        dojo.provides('MochiKit.MochiKit');
        dojo.require("MochiKit.*");
    }
    if (typeof(JSAN) != 'undefined') {
        // hopefully this makes it easier for static analysis?
        JSAN.use("MochiKit.Base", []);
        JSAN.use("MochiKit.Iter", []);
        JSAN.use("MochiKit.Logging", []);
        JSAN.use("MochiKit.DateTime", []);
        JSAN.use("MochiKit.Format", []);
        JSAN.use("MochiKit.Async", []);
        JSAN.use("MochiKit.DOM", []);
        JSAN.use("MochiKit.Visual", []);
    }
    (function () {
        var extend = MochiKit.Base.extend;
        var self = MochiKit.MochiKit;
        var modules = self.SUBMODULES;
        var EXPORT = [];
        var EXPORT_OK = [];
        var EXPORT_TAGS = {};
        for (var i = 0; i < modules.length; i++) {
            var m = MochiKit[modules[i]];
            extend(EXPORT, m.EXPORT);
            extend(EXPORT_OK, m.EXPORT_OK);
            for (var k in m.EXPORT_TAGS) {
                EXPORT_TAGS[k] = extend(EXPORT_TAGS[k], m.EXPORT_TAGS[k]);
            }
            var all = m.EXPORT_TAGS[":all"];
            if (!all) {
                all = extend(null, m.EXPORT, m.EXPORT_OK);
            }
            for (var i = 0; i < all.length; i++) {
                var k = all[i];
                self[k] = m[k];
            }
        }
        self.EXPORT = EXPORT;
        self.EXPORT_OK = EXPORT_OK;
        self.EXPORT_TAGS = EXPORT_TAGS;
    }());
    
} else {
    if (typeof(MochiKit.__compat__) == 'undefined') {
        MochiKit.__compat__ = true;
    }
    (function () {
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
        var modules = MochiKit.MochiKit.SUBMODULES;
        modules.unshift("Compat");
        for (var i = 0; i < modules.length; i++) {
            if (MochiKit[modules[i]]) {
                continue;
            }
            var uri = base + modules[i] + '.js';
            if (uri in allScripts) {
                continue;
            }
            if (false) {
                // doesn't work in Safari
                var s = document.createElement('script');
                s.setAttribute("src", uri);
                s.setAttribute("type", "text/javascript");
                baseElem.parentNode.appendChild(s);
            } else {
                var tag = '<' + 'script src="' + uri + '" type="text/javascript"' + '>' + '<' + '/script' + '>';
                document.write(tag);
            }
        }
    })();
}
