/*

=head1 NAME

JSAN - JavaScript Archive Network

=head1 SYNOPSIS

  <script type="text/javascript" src="/js/JSAN.js"></script>
  <script>
      var jsan = new JSAN('/js', '/jsan');
      jsan.use('Test.Simple');
      plan('tests', 1);
      ok(1 == 1, 'one does equal one!');
  </script>

  // Or in a library.
  try {
      var jsan = new JSAN();
      jsan.use('Some.Library');
  } catch (e) {
      alert("Requires JSAN");
  }

=head1 DESCRIPTION

This library allows JavaScript to behave more like traditional programming
languages and offers the programmer the abilility to create well-designed,
modular code.

=head2 Constructor

  var jsan = new JSAN('/js');

Create a new C<JSAN> object. A list of optional repository include paths
may be given as constructor arguments. These arguments are added
to C<includePath> using C<addRepository()>.

=cut

*/

var JSAN = function () {
    for (var i = 0; i < arguments.length; i++) {
        var repository = arguments[i];
        if (repository != null) this.addRepository(repository);
    }
}

JSAN.VERSION = 0.02;

/*

=head2 Class Properties

=head3 globalScope

  JSAN.globalScope = _player;

By default C<globalScope> is set to the value of C<self>. This works
great in web browswers, however other environments may not have C<self>
(an alias for C<window> in web browswers) for a global context. In those
cases, such as embedded JavaScript, you should reset C<globalScope>
before calling C<use()>.

=head3 includePath

  JSAN.includePath = [];

The C<includePath> is a list of URLs that should be used as prefixes
for libraries when they are C<use()>d. If you are adding repositories
please consider using the C<addRepository()> method.

=head3 errorLevel

  JSAN.errorLevel = "die";

By default the C<errorLevel> is set to I<none>. This will supress errors
when trying to load libraries.

I<die> will throw an exception and it is the responsibility of the calling
code to catch it.

I<warn> will use the C<alarm()> function, usually present in web browsers,
to alert a user on error. This is good for debugging (in web browsers).

=head3 errorMessage

  var error = JSAN.errorMessage;

This contains the text of any error, no matter what the C<errorLevel>. Inspect
it to discover problems.

=cut

*/

JSAN.globalScope   = self;
JSAN.includePath   = [];
JSAN.errorLevel    = "none";
JSAN.errorMessage  = "";

JSAN._includeCache = {};

JSAN.prototype = {
    _req: null,

/*

=head2 Methods

=head3 use()

  jsan.use('Test.Simple');

Download and import a library. There is a mapping that is done with the
library name. It must be converted into a URL. Here is how it works.

  Test.Simple        Test/Simple.js
  HTTP.Request       HTTP/Request.js
  Foo.Bar.Baz        Foo/Bar/Baz.js

Each C<includePath> is prepended to the libraries URL representation
creating the full URL to the library.

The library's constructor and prototype is imported into the calling
context. You can also request certain functions, or groups of functions,
to be imported explicitly. Here is an example of each.

  jsan.use('Test.More', 'plan', 'ok', 'is');
  
  jsan.use('Digest.MD5', ':all');

=cut

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

/*

=head3 addRepository()

  jsan.addRepository('js/private');

Add a path to C<includePath>. This will move the repository to the
beginning of the list and it will be checked first for libraries.

=cut

*/

    addRepository: function(repository) {
        JSAN.includePath.unshift(repository);
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
                    parent[name].prototype = classdef.prototype;
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

            if (self[name] == null)
                self[name] = classdef[name];
        }
    }
};


// Low-Level HTTP Request
JSAN.Request = function (jsan) {
    this._jsan = jsan;
    if (self.XMLHttpRequest) {
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

=head2 Compile Time

C<JSAN> creates an interesting sort of compile time for libraries loaded
through it. This means that code that does not exist inside of a function
is considered I<compile time> code. This has certain implications when
a library uses JSAN to import another library.

=head2 Namespaces

JavaScript - exempting version 2 anyway - does not have a notion of
namespaces. For this reason something very important has been missing.
However, JavaScript's object system is perfectly suited to create
namespaces for well written code.

The first thing you have to do when creating a library is define the
namespace. The namespace must match the library name as well so C<use()>
can import the classes and functions correctly.

The name of this library, C<JSAN>, or the name of our testing system,
C<Test.Simple>, are exapmles of namespaces. A namespace is built by
defining objects at each level until you reach the final name.

Defining a namespace for JSAN is simple.

  var JSAN = {};

Defining the namespace for C<Test.Simple> takes a little more work.
First you have to create an object at the variable named C<Test> if
it doesn't already exist. Then you can create an object, or place a
constructor, at the C<Test.Simple> location.

  if (Test == undefined) var Test = {};
  Test.Simple = {};

So far we've just been inserting blank objects at the final namespace.
That's fine if your library implements functions and does not
implement a class. However, if you implement a class you will want
to place a constructor in the final namespace instead.

  if (Name == undefined) var Name = {};
  
  Name.Space = function () {
      // This is the constructor.
  }

Further, you'll want to define you class. This is done by defining
the prototype in your namespace.

  Name.Space.prototype = {
      publicProperty: 'you see me',
      
      _privateProperty: 'boo',
      
      publicMethod: function (arg1, arg2) {
          // We do stuff man.
      },
      
      _privateMethod: function () {
          this._privateProperty = "no peaking";
      }
  };

=head2 Exporting

The C<use()> function supports an Exporter sytle system. This means that
you can create functions that will be exported to the caller
automatically, functions that will be exported when requested, and
groups of functions - called tags - that are exported when requested.

=head3 EXPORT

Set up functions that are auto exported B<unless> the caller declares a
function list.

  Name.Space.EXPORT = [ 'functionOne', 'functionTwo' ];

Importing the default functions.

  jsan.use('Name.Space');

Importing specific functions.

  jsan.use('Name.Space', 'functionOne'); // Don't want functionTwo()

=head3 EXPORT_OK

Set up funcitons that can be exported but only by request.

  Name.Space.EXPORT    = [ 'functionOne', 'functionTwo' ];
  Name.Space.EXPORT_OK = [ 'specialOne',  'specialTwo'  ];

Import the default functions. This will B<not> import any functions inside
the C<EXPORT_OK> list.

  jsan.use('Name.Space');

Import some specific function from C<EXPORT_OK>. This will B<not> import any
functions from the C<EXPORT> list.

  jsan.use('Name.Space', 'specialOne');

=head3 EXPORT_TAGS

Set up a grouping of functions that can be exported all at once. This example
also illustrates something I dislike about JavaScript arrays. I'll leave that
for you to discover.

  function _expandTheFreakingLists () {
      var expanded = [];
      for (var i = 0; i <= arguments.length; i++ ) {
          var list = arguments[i];
          for (var j = 0; j <= list.length; j++) {
              expanded.push(list[j]);
          }
      }
      return expanded;
  }

  Name.Space.EXPORT_TAGS = {
      ":common": Name.Space.EXPORT,
      ":all":    _expandTheFreakingLists(Name.Space.EXPORT, Name.Space.EXPORT_OK)
  };

Now import all the functions.

  jsan.use('Name.Space', ':all');

Import the common functions and one special one.

  jsan.use('Name.Space', ':common', 'specialOne');

=head2 Writing Libraries

=head3 Class Libraries

Class libraries implement a public class that will be exported to the caller.
The public class contains the same name as the package C<use()> was called
with.

First, you have to set up a namespace.

  if (DOM == undefined) DOM = {};

  DOM.Display = function () {};

Next you can define the class's prototype.

  DOM.Display.prototype = {
      register: {},
  
      hideElement: function (id) {
          // Do stuff.
      },
  
      showElement: function (id) {
          // Do stuff.
      },
  
      showOnlyElement: function (id) {
          // Do stuff.
      },
  
      registerElement: function (id) {
          // Do stuff.
      }
  };


At this point your library may have dependences. If that's the case you
can use C<JSAN> to try and import them. This works because you have,
theoretically, modified the C<JSAN.includePath> on your initial
invocation of the library. So your libraries being C<use()>d need not
know anything about C<includePath>s.

  try {
      var jsan = new JSAN;
      jsan.use('Some.Dependency');
  } catch (e) {
      if (DOM.Display.DEBUG != undefined) alert(e.message);
  }

=head3 Functional Libraries

Functional libraries strictly intend to export a set of functions to the
caller. While they may contain a class, or many classes, those classes are
not part of the publicly documented API. These are simple to create but a
few rules do apply.

First, you still have to set up a namespace.

  if (Digest == undefined) var Digest = {};
  Digest.MD5 = {};

Next you can define your export list.

  Digest.MD5.EXPORT_OK   = [  'md5', 'md5Hex', 'md5Base64' ];
  Digest.MD5.EXPORT_TAGS = { ':all': Digest.MD5.EXPORT_OK };

Now you may go on to define your functions. They must be fully qualified
just like the C<EXPORT_OK> and C<EXPORT_TAGS> variables.

  Digest.MD5.md5 = function (str) {
      // Do stuff.
  }

  Digest.MD5.md5Hex = function (str) {
      // Do stuff.
  }

  Digest.MD5.md5Base64 = function (str) {
      // Do stuff.
  }

At this point your library may have dependences. If that's the case you can
use C<JSAN> to try and import them.

  try {
      var jsan = new JSAN;
      jsan.use('Some.Dependency');
  } catch (e) {
      if (Digest.MD5.DEBUG != undefined) alert(e.message);
  }

=head1 SEE ALSO

JavaScript Namespaces,
L<http://justatheory.com/computers/programming/javascript/emulating_namespaces.html>.

Original JSAN Brainstorming,
L<http://use.perl.org/~schwern/journal/24112>.

OpenJSAN,
L<http://openjsan.org>.

Signed JavaScript,
L<http://www.mozilla.org/projects/security/components/jssec.html>.

=head1 AUTHOR

Casey West, <F<casey@geeknest.com>>.

=head1 COPYRIGHT

  Copyright (c) 2005 Casey West.  All rights reserved.
  This module is free software; you can redistribute it and/or modify it
  under the terms of the Artistic license.

=cut

*/
