// # $Id: Kinetic.pm 1493 2005-04-07 19:20:18Z theory $

// Set up namespace.
if (typeof self != 'undefined') {
    //Browser
    if (typeof Test == 'undefined') Test = {PLATFORM: 'browser'};
    else Test.PLATFORM = 'browser';
} else if (typeof _player != 'undefined'){
    //Director
    if (typeof _global.Test != "object") _global.Test = {PLATFORM: 'director'};
    else _global.Test.PLATFORM = 'director';
} else {
    throw new Error("Test.Harness does not support your platform");
}

Test.Harness = function () {};
Test.Harness.VERSION = '0.21';
Test.Harness.Done = 0;

// Stoopid IE.
Test.Harness.LF = typeof navigator != "undefined"
    && navigator.userAgent.toLowerCase().indexOf('msie') + 1
    && ( ( typeof JSAN != "undefined" && JSAN.globalScope.opera == undefined )
         || ( Test.PLATFORM == 'browser' && window.opera == undefined ) )
  ? "\r"
  : "\n";

Test.Harness.prototype.isDone = Test.Harness.isDone;

/*

    bonus           Number of individual todo tests unexpectedly passed
    ran             Number of individual tests ran
    ok              Number of individual tests passed
    subSkipped      Number of individual tests skipped
    todo            Number of individual todo tests

    files           Number of test files ran
    good            Number of test files passed
    bad             Number of test files failed
    tests           Number of test files originally given
    skipped         Number of test files skipped

*/

Test.Harness.prototype.bonus      = 0;
Test.Harness.prototype.ran        = 0;
Test.Harness.prototype.ok         = 0;
Test.Harness.prototype.subSkipped = 0;
Test.Harness.prototype.todo       = 0;
Test.Harness.prototype.files      = 0;
Test.Harness.prototype.good       = 0;
Test.Harness.prototype.bad        = 0;
Test.Harness.prototype.tests      = 0;
Test.Harness.prototype.skipped    = 0;
Test.Harness.prototype.failures   = [];
Test.Harness.prototype._encoding  = null;

Test.Harness.prototype.encoding = function (enc) {
    if (!enc) return this._encoding;
    this._encoding = enc;
    return this;
};

Test.Harness.runTests = function () {
    // XXX Can't handle inheritance, right? Or can we?
    var harness = new Test.Harness();
    harness.runTests.apply(harness, arguments);
};

Test.Harness.prototype.outFileNames = function (files) {
    var len = 0;
    for (var i = 0; i < files.length; i++) {
        if (files[i].length > len) len = files[i].length;
    }
    len += 3;
    var ret = [];
    for (var i = 0; i < files.length; i++) {
        var outName = files[i];
        var add = len - files[i].length;
        // Where is Perl's x operator when I need it??
        for (var j = 0; j < add; j++) {
            outName += '.';
        }
        ret.push(outName);
    }
    return ret;
};

Test.Harness.prototype.outputResults = function (test, file, out, attrs) {
    this.tests++;
    this.ran += test.TestResults.length;
    var fails = [];
    var track = {
        fn:       file,
        total:    test.expectedTests(),
        ok:       0,
        failList: []
    };

    if (test.TestResults.length) {
        this.files++;
        var pass = true;
        for (var i = 0; i < test.TestResults.length; i++) {
            // Start out assuming passage.
            if (test.TestResults[i].ok) {
                if (attrs.verbose) out.pass(test.TestResults[i].output);
                this.ok++;
                track.ok++
                if (test.TestResults[i].type == 'todo') {
                    // Handle unexpected pass.
                    if (test.TestResults[i].actualOK) this.bonus++;
                    this.todo ++;
                } else if (test.TestResults[i].type == 'skip') this.subSkipped++;
            } else {
                if (test.TestResults[i].type == 'todo') {
                    // Expected failure.
                    this.todo++;
                    if (attrs.verbose) out.pass(test.TestResults[i].output);
                } else {
                    pass = false;
                    track.failList.push(i + 1);
                    out.fail(test.TestResults[i].output);
                }
            }
            
        }
        
        if (pass) {
            this.good++;
            out.pass("ok" + Test.Harness.LF);
        } else {
            this.bad++;
            var err = "NOK # Failed ";
            if (track.failList.length == 1) {
                err += "test " + track.failList[0];
            } else {
                err += "tests " + this._failList(track.failList);
            }
            out.fail(err + " in " + file + Test.Harness.LF);
        }
    } else if (test.SkipAll){
        // All tests skipped.
        this.skipped++;
        this.good++;
        out.pass(test.Buffer.join('').replace(/[^#]+#\s+Skip /, 'all skipped: '));
    } else {
        // Wha happened? Tests ran, but no results!
        this.files++;
        this.bad++;
        out.fail("FAILED before any test output arrived" + Test.Harness.LF);
    }
    if (track.failList.length) this.failures.push(track);
};

Test.Harness.prototype._allOK = function () {
    return this.bad == 0 && (this.ran || this.skipped) ? true : false;
};

Test.Harness.prototype.outputSummary = function (fn, time) {
    var bonusmsg = this._bonusmsg();
    var pct;
    if (this._allOK()) {
        fn("All tests successful" + bonusmsg + '.' + Test.Harness.LF);
    } else if (!this.tests) {
        fn("FAILED—no tests were run for some reason." + Test.Harness.LF);
    } else if (!this.ran) {
        var blurb = this.tests == 1 ? "file" : "files";
        fn("FAILED—" + this.tests + " test " + blurb + " could be run, "
           + "alas—no output ever seen." + Test.Harness.LF);
    } else {
        pct = this.good / this.tests * 100;
        var pctOK = 100 * this.ok / this.ran;
        var subpct = (this.ran - this.ok) + "/" + this.ran
          + " subtests failed, " + pctOK.toPrecision(4) + "% okay.";

        if (this.bad) {
            bonusmsg = bonusmsg.replace(/^,?\s*/, '');
            if (bonusmsg) fn(bonusmsg + '.' + Test.Harness.LF);
            fn("Failed " + this.bad + "/" + this.tests + " test scripts, "
               + pct.toPrecision(4) + "% okay. " + subpct + Test.Harness.LF);
        }
        this.formatFailures(fn);
    }

    fn("Files=" + this.tests + ", Tests=" + this.ran + ", " + (time / 1000)
       + " seconds" + Test.Harness.LF);
};

Test.Harness.prototype.formatFailures = function () {
    var table = '';
    var failedStr = "Failed Test";
    var middleStr = " Total Fail  Failed  ";
    var listStr = "List of Failed";
    var cols = 80;

    // Figure out our longest name string for formatting purposes.
    var maxNamelen = failedStr.length;
    for (var i = 0; i < this.failures.length; i++) {
        var len = this.failures[i].length;
        if (len > maxNamelen) maxNamelen = len;
    }

    var listLen = cols - middleStr.length - maxNamelen.length;
    if (listLen < listStr.length) {
        listLen = listStr.length;
        maxNamelen = cols - middleStr.length - listLen;
        if (maxNamelen < failedStr.length) {
            maxNamelen = failedStr.length;
            cols = maxNamelen + middleStr.length + listLen;
        }
    }

    var out = failedStr;
    if (out.length < maxNamelen) {
        for (var j = out.length; j < maxNameLength; j++) {
            out += ' ';
        }
    }
    out += '  ' + middleStr;
    // XXX Need to finish implementing the text-only version of the failures
    // table.
};

Test.Harness.prototype._bonusmsg = function () {
    var bonusmsg = '';
    if (this.bonus) {
        bonusmsg = (" (" + this.bonus + " subtest" + (this.bonus > 1 ? 's' : '')
          + " UNEXPECTEDLY SUCCEEDED)");
    }

    if (this.skipped) {
        bonusmsg += ", " + this.skipped + " test"
          + (this.skipped != 1 ? 's' : '');
        if (this.subSkipped) {
            bonusmsg += " and " + this.subSkipped + " subtest"
              + (this.subSkipped != 1 ? 's' : '');
        }
        bonusmsg += ' skipped';
    } else if (this.subSkipped) {
        bonusmsg += ", " + this.subSkipped + " subtest"
          + (this.subSkipped != 1 ? 's' : '') + " skipped";
    }

    return bonusmsg;
}

Test.Harness.prototype._failList = function (fails) {
    var last = -1;
    var dash = '';
    var list = [];
    for (var i = 0; i < fails.length; i++) {
        if (dash) {
            // We're in a series of numbers.
            if (fails[i] - 1 == last) {
                // We're still in it.
                last = fails[i];
            } else {
                // End of the line.
                list[list.length-1] += dash + last;
                last = -1;
                list.push(fails[i]);
                dash = '';
            }
        } else if (fails[i] - 1 == last) {
            // We're in a new series.
            last = fails[i];
            dash = '-';
        } else {
            // Not in a sequence.
            list.push(fails[i]);
            last = fails[i];
        }
    }
    if (dash) list[list.length-1] += dash + last;
    return list.join(' ');
}
