if (typeof(dojo) != 'undefined') { dojo.require('MochiKit.DateTime'); }
if (typeof(JSAN) != 'undefined') { JSAN.use('MochiKit.DateTime'); }
if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_DateTime = function (t) {
    var testDate = isoDate('2005-2-3');
    is(testDate.getFullYear(), 2005, "isoDate year ok");
    is(testDate.getDate(), 3, "isoDate day ok");
    is(testDate.getMonth(), 1, "isoDate month ok");
    ok(objEqual(testDate, new Date("February 3, 2005")), "matches string date");
    is(toISODate(testDate), '2005-02-03', 'toISODate ok');

    var testDate = isoDate('2005-06-08');
    is(testDate.getFullYear(), 2005, "isoDate year ok");
    is(testDate.getDate(), 8, "isoDate day ok");
    is(testDate.getMonth(), 5, "isoDate month ok");
    ok(objEqual(testDate, new Date("June 8, 2005")), "matches string date");
    is(toISODate(testDate), '2005-06-08', 'toISODate ok');

    is(compare(new Date("February 3, 2005"), new Date(2005, 1, 3)), 0, "dates compare eq");
    is(compare(new Date("February 3, 2005"), new Date(2005, 2, 3)), -1, "dates compare lt");
    is(compare(new Date("February 3, 2005"), new Date(2005, 0, 3)), 1, "dates compare gt");

    var testDate = isoDate('2005-2-3');
    is(compare(americanDate('2/3/2005'), testDate), 0, "americanDate eq");
    is(compare('2/3/2005', toAmericanDate(testDate)), 0, "toAmericanDate eq");

    var testTimestamp = isoTimestamp('2005-2-3 22:01:03');
    is(compare(testTimestamp, new Date(2005,1,3,22,1,3)), 0, "isoTimestamp eq");
    is(compare(testTimestamp, isoTimestamp('2005-2-3T22:01:03')), 0, "isoTimestamp (real ISO) eq");
    is(compare(toISOTimestamp(testTimestamp), '2005-02-03 22:01:03'), 0, "toISOTimestamp eq");
    testTimestamp = isoTimestamp('2005-2-3T22:01:03Z');
    is(toISOTimestamp(testTimestamp, true), '2005-02-03T22:01:03Z', "toISOTimestamp (real ISO) eq");

    var localTZ = Math.round((new Date()).getTimezoneOffset()/60)
    var direction = (localTZ < 0) ? "+" : "-";
    localTZ = Math.abs(localTZ);
    localTZ = direction + ((localTZ < 10) ? "0" : "") + localTZ;
    testTimestamp = isoTimestamp("2005-2-3T22:01:03" + localTZ);
    var testDateTimestamp = new Date(2005,1,3,22,1,3);
    is(compare(testTimestamp, testDateTimestamp), 0, "equal with local tz");
    testTimestamp = isoTimestamp("2005-2-3T17:01:03-05");
    var testDateTimestamp = new Date(Date.UTC(2005,1,3,22,1,3));
    is(compare(testTimestamp, testDateTimestamp), 0, "equal with specific tz");
}
