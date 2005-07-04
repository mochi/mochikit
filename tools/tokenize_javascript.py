from scanner import *
from textwrap import dedent
import re

SUBPATTERNS = dict(
    KEYWORD=r'(var)',
    IDENTIFIER=r'([a-zA-Z_$]+)',
    EXPRESSION=r'([a-zA-Z_$.]+)',
    CHARS=r"('([^\\'\n]|\\')*')",
    STRING=r'("([^\\"\n]|\\")*")',
)

class UnmatchedText(object):
    def __init__(self, string, i, j):
        self.string = string
        self.begin = i
        self.end = j

    def get_text(self):
        return self.string[self.begin:self.end]
    text = property(get_text)

    def __repr__(self):
        return '%s%r' % (type(self).__name__, (self.text, self.begin, self.end))
 
def pattern(s):
    return dedent(s).strip() % SUBPATTERNS

def example(s):
    return dedent(s).strip()

class BlockComment(Token):
    # Note: we use non-greedy matching instead of spelling out that the
    # contents of a comment cannot contain '*/' because we ran into 
    # limitation of the regexp-engine when parsing files with very big
    # comments
    pattern = pattern(r'''
    \s* \/\*
    (?P<comment>.*?)
    \*\/ \s*
    ''')
    example = example('''
    /*************\t\tThis is an annoying one\t\t**********/
    /* this is a block comment */
    ''')
    # The really nasty one is this:
    # /* foo \*/ bar */
    # Don't worry about it until we see this in real headers

class SingleLineComment(Token):
    pattern = pattern(r'//(?P<comment>[^\n]*)(\n|$)')
    example = example(r'// this is a single line comment')

class BlockEnd(Token):
    pattern = pattern(r'''\s* } \s* ;? \s*''')
    example = example(r'''
    }
    };
    ''')

class Block(ScanningToken):
    pattern = pattern(r'''\s* { \s*''')
    lexicon = property(lambda self:[
        Block,
        Function,
        AnonymousFunction,
        SingleLineComment,
        BlockComment
    ])
    endtoken = BlockEnd
    dead = UnmatchedText

class Semicolon(Token):
    pattern = pattern(r'''\s* (;|}) \s*''')
    example = example(''';''')

class ObjectAssignmentEnd(Token):
    pattern = pattern(r'''\s* (?P<endtoken>,|}) \s*''')
    example = example(r'''
    ,
    ''')

class AnonymousFunction(ScanningToken):
    pattern = pattern(r'''
    \s* function \s* \( \s* (?P<args>%(IDENTIFIER)s \s* ,? \s*)* \) \s* { \s*
    ''')
    lexicon = [
        BlockComment,
        SingleLineComment,
        Block,
    ]
    dead = UnmatchedText
    endtoken = BlockEnd
    example = example('''
    function() {}
    function(foo, bar, baz) {/* w00t */}
    ''')

class ObjectAssignment(ScanningToken):
    pattern = pattern(r'''
    \s* (?P<name>%(IDENTIFIER)s|%(CHARS)s|%(STRING)s) \s* : \s*
    ''')
    lexicon = property(lambda self: [
        BlockComment,
        SingleLineComment,
        AnonymousFunction,
        ObjectLiteral,
    ])
    dead = UnmatchedText
    endtoken = ObjectAssignmentEnd
    example = example('''
    "foo": bar,
    foo: function () { baz }}
    ''')

class ObjectLiteral(FuncScanningToken):
    pattern = pattern('''\s* { \s*''')
    lexicon = [
        SingleLineComment,
        BlockComment,
        ObjectAssignment,
        BlockEnd,
    ]
    dead = UnmatchedText
    def endfunc(self, match):
        if isinstance(match, BlockEnd):
            return True
        elif isinstance(match, ObjectAssignment):
            if match.matches()[-1]['endtoken'] == '}':
                return True
        return False

class Assignment(ScanningToken):
    pattern = pattern(r'''
    \s* (?:var)? \s* (?P<name>%(EXPRESSION)s) \s* = \s*
    ''')
    lexicon = [
        BlockComment,
        SingleLineComment,
        ObjectLiteral,
        AnonymousFunction,
    ]
    dead = UnmatchedText
    endtoken = Semicolon
    example = example('''
    var foo = partial(a, b, c);
    ''')

class Function(ScanningToken):
    pattern = pattern(r'''
    \s* function \s* (?P<name>%(IDENTIFIER)s) \s* \( \s* (?P<args>%(IDENTIFIER)s \s* ,? \s*)* \) \s* { \s*
    ''')
    lexicon = [
        BlockComment,
        SingleLineComment,
        Block,
    ]
    dead = UnmatchedText
    endtoken = BlockEnd
    example = example('''
    function foobar() {}
    function foobar(foo, bar, baz) {/* w00t */}
    ''')

   
LEXICON = [
    InsignificantWhitespace,
    BlockComment,
    SingleLineComment,
    Function,
    Assignment,
    AnonymousFunction,
    Block,
]

if __name__ == '__main__':
    from pdb import pm
    import re
    import sys
    files = sys.argv[1:]
    if not files:
        import glob
        files = glob.glob('*.js')
    scan = Scanner(LEXICON)
    for fn in files:
        print '-' * len(fn)
        print fn
        print '-' * len(fn)
        for token in scan.iterscan(file(fn).read(), dead=UnmatchedText):
            if token is not None:
                print token
                print
