// # $Id: Kinetic.pm 1493 2005-04-07 19:20:18Z theory $

if (typeof JSAN != 'undefined') JSAN.use('Test.Harness');
else {
    if (typeof Test == 'undefined') Test = {};
    if (!Test.Harness) Test.Harness = {};
}

if (window.parent != window &&
    location.href.replace(/[?#].+/, "") == parent.location.href.replace(/[?#].+/, ""))
{

    // Build fake T.H.B so original script from this file doesn't throw
    // exception. This is a bit of a hack...
    Test.Harness.Browser = function() {
        this.runTests = function() {},
        this.encoding = function () { return this }
    };

    // We're in a test iframe. Set up the necessary parts and load the
    // test script with XMLHttpRequest (to support Safari and Opera).
    var __MY = {};
    __MY.pre = document.createElement("pre");
    __MY.pre.id = "test";
    if (window.parent.Test.Harness.Browser._encoding) {
        // Set all scripts to use the appropriate encoding.
        __MY.scripts = document.getElementsByTagName('script');
        for (var j = 0; j < __MY.scripts.length; j++) {
            __MY.scripts[j].charset =
                window.parent.Test.Harness.Browser._encoding;
        }
    }

    // XXX replace with a script element at some point? Safari is due to
    // have this working soon (not sure about IE or Opera):
    // http://bugzilla.opendarwin.org/show_bug.cgi?id=3748
    __MY.inc = window.parent.Test.Harness.Browser.includes;
    __MY.req = typeof XMLHttpRequest != 'undefined'
      ? new XMLHttpRequest()
      : new ActiveXObject("Microsoft.XMLHTTP");

    for (var k = 0; k < __MY.inc.length; k++) {
        __MY.req.open("GET", __MY.inc[k], false);
        __MY.req.send(null);
        var stat = __MY.req.status;
        //           OK   Not Modified    IE Cached   Safari cached
        if (stat == 200 || stat == 304 || stat == 0 || stat == null) {
            eval(__MY.req.responseText);
        } else {
            throw new Error(
                "Unable to load " + __MY.inc[k]
                + ': Status ' + __MY.req.status
            );
        }
    }

    // IE 6 SP 2 doesn't seem to run the onload() event, so we force the
    // issue.
    Test.Builder._finish(Test);

    // XXX Opera throws a DOM exception here, but I don't know what to do
    // about that.
    __MY.body = document.body
        || document.getElementsByTagName("body")[0].appendChild(__MY.pre);
    if (__MY.body) __MY.body.appendChild(__MY.pre);
    else if (document.appendChild) document.appendChild(__MY.pre);

} else {
    Test.Harness.Browser = function () {
        this.includes = Test.Harness.Browser.includes = [];
        Array.prototype.push.apply(Test.Harness.Browser.includes, arguments);
        this.includes.push('');
    };

    Test.Harness.Browser.VERSION = '0.21';

    Test.Harness.Browser.runTests = function () {
        var harness = new Test.Harness.Browser();
        harness.runTests.apply(harness, arguments);
    };

    Test.Harness.Browser.prototype = new Test.Harness();
    Test.Harness.Browser.prototype.interval = 100;

    Test.Harness.Browser.prototype._setupFrame = function () {
        // Setup the iFrame to run the tests.
        var node = document.getElementById('buffer');
        if (node) return node.contentWindow || frames.buffer;
        node = document.createElement("iframe");
        node.setAttribute("id", "buffer");
        node.setAttribute("name", "buffer");
        // Safari makes it impossible to do anything with the iframe if it's
        // set to display:none. See:
        // http://www.quirksmode.org/bugreports/archives/2005/02/hidden_iframes.html
        if (/Safari/.test(navigator.userAgent)) {
            node.style.visibility = "hidden";
            node.style.height = "0"; 
            node.style.width = "0";
        } else
            node.style.display = "none";
        document.body.appendChild(node);
        return node.contentWindow || frames.buffer;
    };

    Test.Harness.Browser.prototype._setupOutput = function () {
        // Setup the pre element for test output.
        var node = document.createElement("pre");
        node.setAttribute("id", "output");
        document.body.appendChild(node);
        return {
            pass: function (msg) {
                node.appendChild(document.createTextNode(msg));
                window.scrollTo(0, document.body.offsetHeight
                                || document.body.scrollHeight);
            },
            fail: function (msg) {
                var red = document.createElement("span");
                red.setAttribute("style", "color: red; font-weight: bold");
                node.appendChild(red);
                red.appendChild(document.createTextNode(msg));
                window.scrollTo(0, document.body.offsetHeight
                                || document.body.scrollHeight);
            }
        };
    };

    Test.Harness.Browser.prototype._setupSummary = function () {
        // Setup the div for the summary.
        var node = document.createElement("div");
        node.setAttribute("id", "summary");
        node.setAttribute(
            "style", "white-space:pre; font-family: Verdana,Arial,serif;"
        );
        document.body.appendChild(node);
        return function (msg) {
            node.appendChild(document.createTextNode(msg));
            window.scrollTo(0, document.body.offsetHeight
                            || document.body.scrollHeight);
        };
};

    Test.Harness.Browser.prototype.runTests = function () {
        Test.Harness.Browser._encoding = this.encoding();
        var files = this.args.file
        ? typeof this.args.file == 'string' ? [this.args.file] : this.args.file
        : arguments;
        if (!files.length) return;
        var outfiles = this.outFileNames(files);
        var buffer = this._setupFrame();
        var harness = this;
        var ti = 0;
        var start;
        var output = this._setupOutput();
        var summaryOutput = this._setupSummary();
        // These depend on how we're watching for a test to finish.
        var finish = function () {}, runNext = function () {};

        // This function handles most of the work of outputting results and
        // running the next test, if there is one.
        var runner = function () {
            harness.outputResults(
                buffer.Test.Builder.Test,
                files[ti],
                output,
                harness.args
            );

            if (files[++ti]) {
                output.pass(
                    outfiles[ti]
                    + (harness.args.verbose ? Test.Harness.LF : '')
                );
                harness.runTest(files[ti], buffer);
                runNext();
            } else {
                harness.outputSummary(summaryOutput, new Date() - start);
                finish();
            }
        };

        if (Object.watch) {
            // We can use the cool watch method, and avoid setting timeouts!
            // We just need to unwatch() when all tests are finished.
            finish = function () { Test.Harness.unwatch('Done') };
            Test.Harness.watch('Done', function (attr, prev, next) {
                if (next < buffer.Test.Builder.Instances.length) return next;
                runner();
                return 0;
            });
        } else {
            // Damn. We have to set timeouts. :-(
            var pkg;
            var wait = function () {
                // Check Test.Harness.Done. If it's non-zero, then we know
                // that the buffer is fully loaded, because it has incremented
                // Test.Harness.Done. Grrr.. IE 6 SP 2 seems to delete
                // buffer.Test after all the tests have finished running, but
                // before this code executes for the correct number of
                // completed tests. So we cache it in a variable outside of
                // the function on previous calls to the function.
                if (!pkg) pkg = buffer.Test;
                if (Test.Harness.Done > 0
                    && Test.Harness.Done >= pkg.Builder.Instances.length)
                {
                    Test.Harness.Done = 0;
                    // Avoid race condition by resetting the instances, too. I
                    // have no idea why this might remain set from a previous
                    // test, but such can be the case in IE 6 SP 2.
                    pkg.Builder.Instances = [];
                    runner();
                } else {
                    window.setTimeout(wait, harness.interval);
                }
            };
            // We'll just have to set a timeout for the next test.
            runNext = function () {
                window.setTimeout(wait, harness.interval);
            };
            window.setTimeout(wait, this.interval);
        }

        // Now start the first test.
        output.pass(outfiles[ti] + (this.args.verbose ? Test.Harness.LF : ''));
        start = new Date();
        this.runTest(files[ti], buffer);
    };

    Test.Harness.Browser.prototype.runTest = function (file, buffer) {
        if (/\.html$/.test(file)) {
            buffer.location.replace(file);
        } else { // if (/\.js$/.test(file)) {
            if (/MSIE/.test(navigator.userAgent)
                || /Opera/.test(navigator.userAgent)
                || /Safari/.test(navigator.userAgent))
            {
                // These browsers have problems with the DOM solution. It
                // simply doesn't work in Safari, and Opera considers its
                // handling of buffer.document to be a security violation. So
                // have them use the XML hack, instead.
                this.includes[this.includes.length-1] = file;
                buffer.location.replace(location.pathname + "?xml-hack=1");
                return;
            }
            // document.write() simply doesn't work here. Thanks to
            // Pawel Chmielowski for figuring that out!
            var doc = buffer.document;
            doc.open("text/html");
            doc.close();
            var el;

            // XXX Opera chokes on this line. It thinks that using the doc
            // element like this is a security violation, never mind that we
            // were the ones who actually created it. Whatever!
            var body = doc.body || doc.getElementsByTagName("body")[0];
            var head = doc.getElementsByTagName("head")[0];

            // Safari seems to be headless at this point.
            if (!head) {
                head = doc.createElement('head');
                doc.appendChild(head);
            }

            // Add script elements for all includes.
            for (var i = 0; i < this.includes.length - 1; i++) {
                el = doc.createElement("script");
                el.setAttribute("src", this.includes[i]);
                head.appendChild(el);
            }


            // Create the pre and script element for the test file.
            var pre = doc.createElement("pre");
            pre.id = "test";
            el = doc.createElement("script");
            el.type = "text/javascript";
            if (this.encoding()) el.charset = this.encoding();

            // XXX This doesn't work in Safari right now. See
            // http://bugzilla.opendarwin.org/show_bug.cgi?id=3748
            el.src = file;
            pre.appendChild(el);

            // Create a script element to finish the tests.
            el = doc.createElement("script");
            el.type = "text/javascript";
            var text = "window.onload(null, Test)";

            // IE doesn't let script elements have children.
            if (null != el.canHaveChildren) el.text = text;
            // But most other browsers do.
            else el.appendChild(document.createTextNode(text));

            pre.appendChild(el);

            // IE 6 SP 2 Requires getting the body element again.
            body = doc.body || doc.getElementsByTagName("body")[0];
            body.appendChild(pre);
        /* Let's just assume that if it's not .html, it's JavaScript.
        } else {
            // Who are you, man??
            alert("I don't know what kind of file '" + file + "' is");
        */
        }
    };

    Test.Harness.Browser.prototype.args = {};
    var pairs = location.search.substring(1).split(/[;&]/);
    for (var i = 0; i < pairs.length; i++) {
        var parts = pairs[i].split('=');
        if (parts[0] == null) continue;
        var key = unescape(parts[0]), val = unescape(parts[1]);
        if (Test.Harness.Browser.prototype.args[key] == null) {
            Test.Harness.Browser.prototype.args[key] = unescape(val);
        } else {
            if (typeof Test.Harness.Browser.prototype.args[key] == 'string') {
                Test.Harness.Browser.prototype.args[key] =
                    [Test.Harness.Browser.prototype.args[key], unescape(val)];
            } else {
                Test.Harness.Browser.prototype.args[key].push(unescape(val));
            }
        }
    }
    delete pairs;

    Test.Harness.Browser.prototype.formatFailures = function (fn) {
        // XXX Switch to DOM?
        var failedStr = "Failed Test";
        var middleStr = " Total Fail  Failed  ";
        var listStr = "List of Failed";
        var table =
            '<style>table {padding: 0; border-collapse: collapse; }'
          + 'tr { height: 2em; }'
          + 'th { background: lightgrey; }'
          + 'td, th { padding: 2px 5px; text-align: left; border: solid #000000 1px;}'
          + '.odd { background: #e8e8cd }'
          + '</style>'
          + '<table style="padding: 0"><tr><th>Failed Test</th><th>Total</th>'
          + '<th>Fail</th><th>Failed</th></tr>';
        for (var i = 0; i < this.failures.length; i++) {
            var track = this.failures[i];
            var style = i % 2 ? 'even' : 'odd';
            table += '<tr class="' + style + '"><td>' + track.fn + '</td>'
              + '<td>' + track.total + '</td>'
              + '<td>' + (track.total - track.ok) + '</td>'
              + '<td>' + this._failList(track.failList) + '</td></tr>';
        };
        table += '</table>' + Test.Harness.LF;
        var node = document.getElementById('summary');
        node.innerHTML += table;
        window.scrollTo(0, document.body.offsetHeight
                        || document.body.scrollHeight);
    };
}