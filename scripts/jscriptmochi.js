/**

run with:
cscript.exe //nologo scripts\jscriptmochi.js

**/
if (typeof(print) == "undefined" && typeof(WScript) != "undefined") {
    // Make JScript look like SpiderMonkey and Rhino
    var print = WScript.Echo;
    var load = function (fn) {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var textStream = fso.OpenTextFile(fn, 1);
        arguments.callee.do_eval.apply(JSAN.global, [textStream.ReadAll()]);
    };
    load.do_eval = function () {
        eval(arguments[0]);
    };
}

load('tests/FakeJSAN.js');
load('tests/standalone.js');
