twoDigitAverage = function (numerator, denominator) {
    /***

        Calculate an average from a numerator and a denominator and return
        it as a string with two digits of precision (e.g. "1.23").

        If the denominator is 0, "0" will be returned instead of NaN.

    ***/
    if (denominator) {
        var res = numerator / denominator;
        if (!isNaN(res)) {
            return twoDigitFloat(numerator / denominator);
        }
    }
    return "0";
}

twoDigitFloat = function (someFloat) {
    /***
    
        Roughly equivalent to: sprintf("%.2f", someFloat)

    ***/
    var s = Math.floor(someFloat * 100).toString();
    if (s == '0') {
        return s;
    }
    if (s.length < 3) {
        return '0.' + s;
    }
    var head = s.substring(0, s.length - 2);
    var tail = s.substring(s.length - 2, s.length);
    if (tail == '00') {
        return head;
    } else if (tail.charAt(1) == '0') {
        return head + '.' + tail.charAt(0);
    } else {
        return head + '.' + tail;
    }
}

percentFormat = function (someFloat) {
    /***

        Roughly equivalent to: sprintf("%.2f%%", someFloat * 100)

    ***/
    return twoDigitFloat(100 * someFloat) + '%';
}
