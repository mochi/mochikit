if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Text = function (t) {

    // startsWith tests
    t.ok(startsWith("ab", "abc"), "startsWith for normal substring");
    t.ok(!startsWith("bc", "abc"), "startsWith for non-matching substring");
    t.ok(startsWith("aa", "aaaa"), "startsWith for repeated substring");
    t.ok(!startsWith("abcde", "abc"), "startsWith for long substring");
    t.ok(startsWith("", "abc"), "startsWith for blank substring");
    t.ok(startsWith("", ""), "startsWith on empty strings");
    t.ok(!startsWith("", null), "startsWith for null string");
    t.ok(!startsWith(null, ""), "startsWith for null substring");

    // endsWith tests
    t.ok(endsWith("bc", "abc"), "endsWith for normal substring");
    t.ok(!endsWith("ab", "abc"), "endsWith for non-matching substring");
    t.ok(endsWith("aa", "aaaa"), "endsWith for repeated substring");
    t.ok(!endsWith("abcde", "abc"), "endsWith for long substring");
    t.ok(endsWith("", "abc"), "endsWith for blank substring");
    t.ok(endsWith("", ""), "endsWith on empty strings");
    t.ok(!endsWith("", null), "endsWith for null string");
    t.ok(!endsWith(null, ""), "endsWith for null substring");

    // contains tests
    t.ok(contains("bc", "abcd"), "contains for normal substring");
    t.ok(!contains("ac", "abc"), "contains for non-matching substring");
    t.ok(contains("aa", "aaaa"), "contains for repeated substring");
    t.ok(!contains("abcde", "abc"), "contains for long substring");
    t.ok(contains("", "abc"), "contains for blank substring");
    t.ok(contains("", ""), "contains on empty strings");
    t.ok(!contains("", null), "contains for null string");
    t.ok(!contains(null, ""), "contains for null substring");

    // padLeft tests
    t.is(padLeft("abc", 5), "  abc", "padLeft normal string");
    t.is(padLeft("abc", 2), "abc", "padLeft long string");
    t.is(padLeft("123", 5, "0"), "00123", "padLeft other char string");
    t.is(padLeft(null, 2), "  ", "padLeft null string");

    // padRight tests
    t.is(padRight("abc", 5), "abc  ", "padRight normal string");
    t.is(padRight("abc", 2), "abc", "padRight long string");
    t.is(padRight("123", 5, "0"), "12300", "padRight other char string");
    t.is(padRight(null, 2), "  ", "padRight null string");

    // truncate tests
    t.is(truncate("abcd", 2), "ab", "truncate normal string");
    t.is(truncate("abcd", 4, "..."), "abcd", "truncate with sufficient maxLength");
    t.is(truncate("abcd", 3, ".."), "a..", "truncate with tail");
    t.is(truncate("abcd", 2, "..."), "...", "truncate with too long tail");
    t.is(truncate(null, 2), null, "truncate null string");
    t.is(truncate("abcd", 0), "", "truncate to zero length");
    t.is(truncate("abcd", -1), "abcd", "truncate to negative length");
    t.is(repr(truncate([1,2,3], 2)), repr([1,2]), "truncate array");
    t.is(repr(truncate([1,2,3,4,5], 4, [7])), repr([1,2,3,7]), "truncate array with tail");

    // split and rsplit tests
    t.ok(objEqual(split("  abc   \n aa\t", " "), "  abc   \n aa\t".split(" ")), "split equivalence with str.split");
    t.ok(objEqual(rsplit("  abc   \n aa\t", " "), "  abc   \n aa\t".split(" ")), "rsplit equivalence with str.split");
    t.ok(objEqual(split("  abc   \n aa\t", " ", 2), ["", "", "abc   \n aa\t"]), "Splitting 2");
    t.ok(objEqual(rsplit("red-orange-yellow-green", "-", 1), ["red-orange-yellow", "green"]), "Rsplitting 1");
    t.ok(objEqual(split("red-orange-yellow-green", "-", 3), ["red", "orange", "yellow", "green"]), "splitting at n"); 
    t.ok(objEqual(rsplit("red-orange-yellow-green", "-", 13), ["red", "orange", "yellow", "green"]), "rsplitting at > n");
    t.ok(objEqual(split(null, " "), null), "split handles null values");
    t.ok(objEqual(rsplit(null, " "), null), "rsplit handles null values");
    t.ok(objEqual(split("", " "), [""]), "split handles empty string");
    t.ok(objEqual(rsplit("", " "), [""]), "rsplit handles empty string");

    // format pattern tests
    t.is(format("plain text 123"), "plain text 123", "plain text is unmodified");
    t.is(format("{{}}abc}}{{123"), "{}abc}{123", "escaping { and } characters");
    try {
        format("{");
        t.ok(false, "should throw error on single {");
    } catch (e) {
        t.ok(e instanceof FormatPatternError, "should throw FormatPatternError on single {");
    }
    try {
        format("}");
        t.ok(false, "should throw error on single }");
    } catch (e) {
        t.ok(e instanceof FormatPatternError, "should throw FormatPatternError on single }");
    }
    try {
        format("{0");
        t.ok(false, "should throw error on missing }");
    } catch (e) {
        t.ok(e instanceof FormatPatternError, "should throw FormatPatternError on missing }");
    }
    try {
        format("{ :z }", o);
        t.ok(false, "should throw error on invalid format type");
    } catch (e) {
        t.ok(e instanceof FormatPatternError, "should throw FormatPatternError on invalid format type");
    }
    t.is(format("{  }", "value"), "value", "blank format locator is similar to {0}");
    t.is(format("{}", 0.25), "0.25", "blank is string format");

    // format pattern locator tests
    t.is(format("a {0} text", "replaced"), "a replaced text", "simple positional insert");
    t.is(format("{1}{2}{0}{1}", "a", "b", "c"), "bcab", "positional reorderer insert");
    t.is(format("{name}: {value}", { name: "a", value: "b" }), "a: b", "simple named insert");
    t.is(format("{ 0.name }: {1. sub .value }", { name: "a" }, { sub: { value: "b" } }), "a: b", "combined pos & name insert");
    try {
        format("{0.}", "value");
        t.ok(false, "should throw error on blank format locator section");
    } catch (e) {
        t.ok(e instanceof FormatPatternError, "should throw FormatPatternError on blank format locator section");
    }

    // string formatting tests
    var o = { toString: function() { return "toString"; },
              repr: function() { return "repr"; } };
    t.is(format("{:s}", o), "toString", "string format type");
    t.is(format("{ :s }", null), "", "null string format");
    t.is(format("{:s}", undefined), "", "undefined string format");
    t.is(format("abc {:s}", 0.25), "abc 0.25", "number string format");
    t.is(format("{:4s}", 2), "   2", "padded string format");
    t.is(format("{:<4}", 2), "2   ", "left-aligned padded string format");
    t.is(format("{:>4}", 2), "   2", "right-aligned padded string format");
    t.is(format("{:>6.4s}", o), "  toSt", "left-aligned padded truncated string format");

    // repr formatting tests
    t.is(format("{:r}", o), "repr", "repr format type");
    t.is(format("{:r}", null), "null", "null repr format");
    t.is(format("{:r}", undefined), "undefined", "undefined repr format");
    t.is(format("{:<5.3r}", o), "rep  ", "right-aligned padded truncated repr format");

    // decimal formatting tests
    t.is(format("{:d}", 1.5), "2", "decimal format type (rounding)");
    t.is(format("{:05d}", null), "     ", "null decimal format");
    t.is(format("{:05d}", undefined), "     ", "undefined decimal format");
    t.is(format("{:05d}", Number.NaN), "     ", "NaN decimal format");
    t.is(format("{:05d}", Number.POSITIVE_INFINITY), "    \u221e", "infinity decimal format");
    t.is(format("{:05d}", Number.NEGATIVE_INFINITY), "   -\u221e", "neg. infinity decimal format");
    t.is(format("{:4d}", 25), "  25", "padded decimal format");
    t.is(format("{:04d}", 25), "0025", "zero-padded decimal format");
    t.is(format("{:4d}", -25), " -25", "unsigned decimal format");
    t.is(format("{:04d}", -25), "-025", "unsigned zero-padded decimal format");
    t.is(format("{:+4d}", 25), " +25", "signed decimal format");
    t.is(format("{:+04d}", 25), "+025", "signed zero-padded decimal format");
    t.is(format("{: d}", 25), " 25", "spaced decimal format");
    t.is(format("{: 4d}", 25), "  25", "spaced padded decimal format");
    t.is(format("{: 04d}", 25), " 025", "spaced zero-padded decimal format");
    t.is(format("{:,d}", 1234567), "1,234,567", "grouped decimal format");
    t.is(format("{:,d}", 123), "123", "not grouped decimal format");
    t.is(format("{:,05d}", 25), "0,025", "grouped zero-padded decimal format");
    t.is(format("{:<4d}", 25), "25  ", "left-aligned decimal format");
    t.is(format("{:>4d}", 25), "  25", "right-aligned decimal format");

    // fixed-point formatting tests
    t.is(format("{:f}", 1.5), "1.5", "floating format type");
    t.is(format("{:05f}", null), "     ", "null floating format");
    t.is(format("{:05f}", undefined), "     ", "undefined floating format");
    t.is(format("{:05f}", Number.NaN), "     ", "NaN floating format");
    t.is(format("{:05f}", Number.POSITIVE_INFINITY), "    \u221e", "infinity floating format");
    t.is(format("{:05f}", Number.NEGATIVE_INFINITY), "   -\u221e", "neg. infinity floating format");
    t.is(format("{:5f}", 1.5), "  1.5", "padded floating format");
    t.is(format("{:.5f}", 1.5), "1.50000", "precision floating format");
    t.is(format("{:05.2f}", 1.5351), "01.54", "zero-padded floating format");
    t.is(format("{:6.2f}", -1.5), " -1.50", "unsigned floating format");
    t.is(format("{:05f}", -1.5), "-01.5", "unsigned zero-padded floating format");
    t.is(format("{:+5f}", 1.5), " +1.5", "signed floating format");
    t.is(format("{:+07.3f}", 1.5), "+01.500", "signed zero-padded floating format");
    t.is(format("{: f}", 1.5), " 1.5", "spaced floating format");
    t.is(format("{: 5f}", 1.5), "  1.5", "spaced padded floating format");
    t.is(format("{: 05f}", 1.5), " 01.5", "spaced zero-padded floating format");
    t.is(format("{:,f}", 1.5234), "1.523,4", "grouped precision floating format");
    t.is(format("{:,f}", 1.523), "1.523", "not grouped precision floating format");
    t.is(format("{:,08.4f}", 1.5), "01.500,0", "grouped precision floating format");
    t.is(format("{:<7.3f}", 1.5), "1.500  ", "left-aligned floating format");
    t.is(format("{:>5f}", 1.5), "  1.5", "right-aligned floating format");

    // percent formatting tests
    t.is(format("{:%}", 1.5), "150%", "percent format type");
    t.is(format("{:05%}", null), "     ", "null percent format");
    t.is(format("{:05%}", undefined), "     ", "undefined percent format");
    t.is(format("{:05%}", Number.NaN), "     ", "NaN percent format");
    t.is(format("{:05%}", Number.POSITIVE_INFINITY), "   \u221e%", "infinity percent format");
    t.is(format("{:05%}", Number.NEGATIVE_INFINITY), "  -\u221e%", "neg. infinity percent format");
    t.is(format("{:5%}", 0.15), "  15%", "padded percent format");
    t.is(format("{:.2%}", 0.153), "15.30%", "precision percent format");
    t.is(format("{:07.2%}", 0.153), "015.30%", "zero-padded percent format");
    t.is(format("{:8.2%}", -0.153), " -15.30%", "unsigned percent format");
    t.is(format("{:07%}", -0.153), "-015.3%", "unsigned zero-padded percent format");
    t.is(format("{:+7%}", 0.153), " +15.3%", "signed percent format");
    t.is(format("{:+08.2%}", 0.153), "+015.30%", "signed zero-padded percent format");
    t.is(format("{: %}", 0.15), " 15%", "spaced percent format");
    t.is(format("{: 5%}", 0.15), "  15%", "spaced padded percent format");
    t.is(format("{: 05%}", 0.15), " 015%", "spaced zero-padded percent format");
    t.is(format("{:,%}", 0.152345), "15.234,5%", "grouped precision percent format");
    t.is(format("{:,%}", 0.15234), "15.234%", "not grouped precision percent format");
    t.is(format("{:,010.4%}", 0.153), "015.300,0%", "zero-padded grouped precision percent format");
    t.is(format("{:<8.2%}", 0.153), "15.30%  ", "left-aligned percent format");
    t.is(format("{:>7%}", 0.153), "  15.3%", "right-aligned percent format");

    // binary formatting tests
    t.is(format("{:b}", 3), "11", "binary format type");
    t.is(format("{:b}", 3.7), "11", "binary format truncates value");
    t.is(format("{:05b}", null), "     ", "null binary format");
    t.is(format("{:05b}", undefined), "     ", "undefined binary format");
    t.is(format("{:05b}", Number.NaN), "     ", "NaN binary format");
    t.is(format("{:05b}", Number.POSITIVE_INFINITY), "    \u221e", "infinity binary format");
    t.is(format("{:05b}", Number.NEGATIVE_INFINITY), "   -\u221e", "neg. infinity binary format");
    t.is(format("{:5b}", 3), "   11", "padded binary format");
    t.is(format("{:05b}", 3), "00011", "zero-padded binary format");
    t.is(format("{:b}", -4), "-100", "unsigned binary format");
    t.is(format("{:5b}", -4), " -100", "unsigned binary format");
    t.is(format("{:05b}", -4), "-0100", "unsigned zero-padded binary format");
    t.is(format("{:+5b}", 4), " +100", "signed binary format");
    t.is(format("{:+05b}", 4), "+0100", "signed zero-padded binary format");
    t.is(format("{: b}", 3), " 11", "spaced binary format");
    t.is(format("{: 5b}", 3), "   11", "spaced padded binary format");
    t.is(format("{: 05b}", 3), " 0011", "spaced zero-padded binary format");
    t.is(format("{:<5b}", 3), "11   ", "left-aligned binary format");
    t.is(format("{:>5b}", 3), "   11", "right-aligned binary format");

    // octal formatting tests
    t.is(format("{:o}", 9), "11", "octal format type");
    t.is(format("{:o}", 9.7), "11", "octal format truncates value");
    t.is(format("{:05o}", null), "     ", "null octal format");
    t.is(format("{:05o}", undefined), "     ", "undefined octal format");
    t.is(format("{:05o}", Number.NaN), "     ", "NaN octal format");
    t.is(format("{:05o}", Number.POSITIVE_INFINITY), "    \u221e", "infinity octal format");
    t.is(format("{:05o}", Number.NEGATIVE_INFINITY), "   -\u221e", "neg. infinity octal format");
    t.is(format("{:5o}", 9), "   11", "padded octal format");
    t.is(format("{:05o}", 9), "00011", "zero-padded octal format");
    t.is(format("{:o}", -64), "-100", "unsigned octal format");
    t.is(format("{:5o}", -64), " -100", "unsigned octal format");
    t.is(format("{:05o}", -64), "-0100", "unsigned zero-padded octal format");
    t.is(format("{:+5o}", 64), " +100", "signed octal format");
    t.is(format("{:+05o}", 64), "+0100", "signed zero-padded octal format");
    t.is(format("{: o}", 9), " 11", "spaced octal format");
    t.is(format("{: 5o}", 9), "   11", "spaced padded octal format");
    t.is(format("{: 05o}", 9), " 0011", "spaced zero-padded octal format");
    t.is(format("{:<5o}", 9), "11   ", "left-aligned octal format");
    t.is(format("{:>5o}", 9), "   11", "right-aligned octal format");

    // hexadecimal formating tests
    t.is(format("{:x}", 31), "1f", "hexadecimal format type");
    t.is(format("{:X}", 31.7), "1F", "hexadecimal format truncates value");
    t.is(format("{:05x}", null), "     ", "null hexadecimal format");
    t.is(format("{:05x}", undefined), "     ", "undefined hexadecimal format");
    t.is(format("{:05x}", Number.NaN), "     ", "NaN hexadecimal format");
    t.is(format("{:05x}", Number.POSITIVE_INFINITY), "    \u221e", "infinity hexadecimal format");
    t.is(format("{:05x}", Number.NEGATIVE_INFINITY), "   -\u221e", "neg. infinity hexadecimal format");
    t.is(format("{:5x}", 30), "   1e", "padded hexadecimal format");
    t.is(format("{:05X}", 30), "0001E", "zero-padded hexadecimal format");
    t.is(format("{:x}", -256), "-100", "unsigned hexadecimal format");
    t.is(format("{:5x}", -256), " -100", "unsigned hexadecimal format");
    t.is(format("{:05x}", -256), "-0100", "unsigned zero-padded hexadecimal format");
    t.is(format("{:+5x}", 256), " +100", "signed hexadecimal format");
    t.is(format("{:+05x}", 256), "+0100", "signed zero-padded hexadecimal format");
    t.is(format("{: x}", 30), " 1e", "spaced hexadecimal format");
    t.is(format("{: 5x}", 32), "   20", "spaced padded hexadecimal format");
    t.is(format("{: 05x}", 31), " 001f", "spaced zero-padded hexadecimal format");
    t.is(format("{:<5x}", 31), "1f   ", "left-aligned hexadecimal format");
    t.is(format("{:>5x}", 31), "   1f", "right-aligned hexadecimal format");

    // formatValue tests (mostly already tested above)
    t.is(formatValue("%", 1.5), "150%", "formatValue percent");
    t.is(formatValue(",08.4f", 1.5, "fr_FR"), "01,500 0", "formatValue locale");
    t.is(formatValue(",.2%", 15, { separator: "_", decimal: ":", percent: "p"}), "1_500:00p", "formatValue custom locale");

    // formatter function tests
    var f = formatter("{1}{2}{0}{1}");
    t.is(f("a", "b", "c"), "bcab", "formatter function creation");
    t.is(f("1", "2", "3"), "2312", "formatter function reuse");
    var f = formatter("{:,08.4f}");
    t.is(f(1.5), "01.500,0", "default locale formatter");
    var f = formatter("{:,08.4f}", formatLocale("fr_FR"));
    t.is(f(1.5), "01,500 0", "fr_FR precision locale formatter");
    var f = formatter("{:,08.4f}", "de_DE");
    t.is(f(1.5), "01,500.0", "de_DE precision locale formatter");
    var f = formatter("{:.4f}", formatLocale("fr_FR"));
    t.is(f(1.5), "1,5000", "fr_FR non-grouping locale formatter");
    var f = formatter("{:.4f}", "de_DE");
    t.is(f(1.5), "1,5000", "de_DE non-grouping locale formatter");
    var f = formatter("{:,.2%}", { separator: "_", decimal: ":", percent: "p"});
    t.is(f(15), "1_500:00p", "custom locale formatter");
    var f = formatter("{:.2%}", { separator: "_", decimal: ":", percent: "p"});
    t.is(f(15), "1500:00p", "custom non-grouping locale formatter");
};
