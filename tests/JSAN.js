/*

*/

var JSAN = function () {
    for (var i = 0; i < arguments.length; i++) {
        var repository = arguments[i];
        if (repository != null) JSAN.addRepository(repository);
    }
}

JSAN.VERSION = 0.08;

/*

*/

JSAN.globalScope   = self;
JSAN.includePath   = ['.', 'lib'];
JSAN.errorLevel    = "none";
JSAN.errorMessage  = "";

JSAN._includeCache = {};

/*

*/

JSAN.use = function () {
    JSAN.prototype.use.apply(JSAN.prototype, arguments);
}

/*

*/

JSAN.addRepository = function () {
    var temp = JSAN._flatten( arguments );
    // Need to go in reverse to do something as simple as unshift( @foo, @_ );
    for ( var i = temp.length - 1; i >= 0; i-- )
        JSAN.includePath.unshift(temp[i]);
    return JSAN;
}

JSAN._flatten = function( list1 ) {
        var list2 = new Array();
        for ( var i = 0; i < list1.length; i++ ) {
            if ( typeof list1[i] == 'object' ) {
                list2 = JSAN._flatten( list1[i], list2 );
            }
            else {
                list2.push( list1[i] );
            }
        }
        return list2;
    };

JSAN._findMyPath = function () {
    if (document) {
        var scripts = document.getElementsByTagName('script');
        for ( var i = 0; i < scripts.length; i++ ) {
            var src = scripts[i].getAttribute('src');
            if (src) {
                var inc = src.match(/^(.*?)\/?JSAN.js/);
                if (inc && inc[1]) {
                    var repo = inc[1];
                    for (var j = 0; j < JSAN.includePath.length; j++) {
                        if (JSAN.includePath[j] == repo) {
                            return;
                        }
                    }
                    JSAN.addRepository(repo);
                }
            }
        }
    }
}
JSAN._findMyPath();

JSAN.prototype = {
    _req: null,

/*

*/

    use: function () {
        var pkg = arguments[0];
        var importList = [];
        for (var i = 1; i < arguments.length; i++)
            importList.push(arguments[i]);
        for (var j = 0; j < JSAN.includePath.length; j++) {
            var url = this._convertPackageToUrl(pkg, JSAN.includePath[j]);
            var js = JSAN._includeCache[pkg];
            if (js == undefined) {
                try{
                    this._req = new JSAN.Request(this);
                    js        = this._req.getText(url);
                } catch (e) {
                    if (j == JSAN.includePath.length - 1) throw e;
                }
            }
            if (js != null) {
                this._createScript(js, pkg, importList);
                JSAN._includeCache[pkg] = js;
                break;
            }
        }
    },

    _handleError: function (msg, level) {
        if (!level) level = JSAN.errorLevel;
        JSAN.errorMessage = msg;

        switch (level) {
            case "none":
                break;
            case "warn":
                alert(msg);
                break;
            case "die":
            default:
                throw new Error(msg);
                break;
        }
    },

    _convertPackageToUrl: function (pkg, repository) {
        var url = pkg.replace(/\./g, '/');
            url = url.concat('.js');
            url = repository.concat('/' + url);
        return url;
    },
    
    _createScript: function (js, pkg, importList) {
        try {
            this._makeNamespace(js, pkg, importList);
        } catch (e) {
            this._handleError("Could not create namespace[" + pkg + "]: " + e);
        }
    },
    
    _makeNamespace: function(js, pkg, importList) {
        var spaces = pkg.split('.');
        var parent = JSAN.globalScope;
        if (!JSAN._includeCache[pkg]) eval(js);
        var classdef = eval(pkg);
        for (var i = 0; i < spaces.length; i++) {
            var name = spaces[i];
            if (i == spaces.length - 1) {
                if (typeof parent[name] == 'undefined') {
                    parent[name] = classdef;
                    if ( typeof classdef['prototype'] != 'undefined' ) {
                        parent[name].prototype = classdef.prototype;
                    }
                }
            } else {
                if (parent[name] == undefined) {
                    parent[name] = {};
                }
            }

            parent = parent[name];
        }
        this._exportItems(classdef, importList);
    },
    
    _exportItems: function (classdef, importList) {
        var exportList  = new Array();
        var EXPORT      = classdef.EXPORT;
        var EXPORT_OK   = classdef.EXPORT_OK;
        var EXPORT_TAGS = classdef.EXPORT_TAGS;
        
        if (importList.length > 0) {
           importList = JSAN._flatten( importList );

           for (var i = 0; i < importList.length; i++) {
                var request = importList[i];
                if (   this._findInList(EXPORT,    request) == 1
                    || this._findInList(EXPORT_OK, request) == 1) {
                    exportList.push(request);
                    continue;
                }
                var list = this._findInTag(EXPORT_TAGS, request);
                if (list != null) {
                    for (var i = 0; i < list.length; i++)
                        exportList.push(list[i]);
                }
            }
        } else {
            exportList = EXPORT;
        }
        this._exportList(classdef, exportList);
    },
    
    _findInList: function (list, request) {
        if (list == null) return null;
        for (var i = 0; i < list.length; i++)
            if (list[i] == request)
                return 1;
        return null;
    },
    
    _findInTag: function (tags, request) {
        if (tags == null) return null;
        for (var i in tags)
            if (i == request)
                return tags[i];
        return null;
    },
    
    _exportList: function (classdef, exportList) {
        if (typeof(exportList) != 'object') return null;
        for (var i = 0; i < exportList.length; i++) {
            var name = exportList[i];

            if (JSAN.globalScope[name] == null)
                JSAN.globalScope[name] = classdef[name];
        }
    }
};


// Low-Level HTTP Request
JSAN.Request = function (jsan) {
    this._jsan = jsan;
    if (JSAN.globalScope.XMLHttpRequest) {
        this._req = new XMLHttpRequest();
    } else {
        this._req = new ActiveXObject("Microsoft.XMLHTTP");
    }
}

JSAN.Request.prototype = {
    _req:  null,
    _jsan: null,
    
    getText: function (url) {
        this._req.open("GET", url, false);
        try {
            this._req.send(null);
            if (this._req.status == 200 || this._req.status == 0)
                return this._req.responseText;
        } catch (e) {
            this._jsan._handleError("File not found: " + url);
            return null;
        };

        this._jsan._handleError("File not found: " + url);
        return null;
    }
};

/*

*/
