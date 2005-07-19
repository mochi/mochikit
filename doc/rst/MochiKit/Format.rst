.. -*- mode: rst -*-

MochiKit.Format
===============

Functions
---------

twoDigitAverage(numerator, denominator):
    Calculate an average from a numerator and a denominator and return
    it as a string with two digits of precision (e.g. "1.23").

    If the denominator is 0, "0" will be returned instead of NaN.

twoDigitFloat(someFloat):
    Roughly equivalent to: sprintf("%.2f", someFloat)

percentFormat(someFloat):
    Roughly equivalent to: sprintf("%.2f%%", someFloat * 100)
