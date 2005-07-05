#
#   Example 5
#

from Plex import *

letter = Range("AZaz")
digit = Range("09")
name = letter + Rep(letter | digit)
number = Rep1(digit)
space = Any(" \t\n")

lexicon = Lexicon([
  (name,            'ident'),
  (number,          'int'),
  (space,           IGNORE),
  (Str("(*"),       Begin('comment')),
  State('comment', [
    (Str("*)"), Begin('')),
    (AnyChar,   IGNORE)
  ])
])

filename = "example5.in"
f = open(filename, "r")
scanner = Scanner(lexicon, f, filename)
while 1:
  token = scanner.read()
  print token
  if token[0] is None:
    break


