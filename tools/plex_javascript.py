if True:
    # Specific to MochiKit
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'Plex-MochiKit'))

from Plex import *
from Plex.Traditional import re

__all__ = ['JavaScriptScanner']

identifier = re(r'[a-zA-Z_$]+')
expression = re(r'[a-zA-Z_$.]+')
chars = re(r"'([^\\'\n]|\\')*'")
string = re(r'"([^\\"\n]|\\")*"')
regex = re(r'/([^\\/]|\\/)*/')
space = Rep1(Any(' \t\r\n'))
inequality = Str('===', '!==', '==', '>=' '<=', '><', '<>', '>', '<', '!=')
assignment = Str('=')
singleLineComment = Str('//') + Rep(AnyBut('\r\n'))
blockCommentStart = Str('/*')
blockCommentEnd = Str('*/')
anonymousFunction = Seq(Str('function'), Opt(space), Str('('))
namedFunction = Seq(Str('function'), space, identifier, Opt(space), Str('('))
argumentsEnd = Seq(Str(')'), Opt(space), Str('{'))
blockBegin = Str('{')
blockEnd = Str('}')
parenBegin = Str('(')
parenEnd = Str(')')


class JavaScriptScanner(Scanner):

    def __init__(self, stream):
        Scanner.__init__(self, self.lexicon, stream)
        self.buffers = []
        self.statebuffer = []
        self.state_begin('block')

    def got_eof(self, text):
        while self.state_end():
            pass
        self.produce(None)
        return None

    def buffer_begin(self):
        self.buffers.append([])

    def buffer_end(self):
        return self.buffers.pop()

    def state_begin(self, state):
        self.statebuffer.append(state)
        self.begin(state)

    def state_get(self):
        try:
            return self.statebuffer[-1]
        except IndexError:
            return ''

    def state_end(self):
        try:
            self.statebuffer.pop()
        except IndexError:
            pass
        self.begin(self.state_get())
    
    def buffer_text(self, text):
        self.buffers[-1].append(text)
    
    def do_singleLineComment(self, text):
        self.produce('comment', text[2:])
        return None
    
    def begin_blockComment(self, text):
        self.state_begin('blockComment')
        self.buffer_begin()
        return None
    
    def end_blockComment(self, text):
        text = ''.join(self.buffer_end())
        self.produce('comment', text)
        self.state_end()
        return None

    def begin_function(self, text):
        self.state_begin('arguments')
        self.produce('begin_arguments', 'function (')
        return None

    def end_arguments(self, text):
        self.produce('end_arguments', ')')
        self.state_end()
        self.begin_block(text)

    def begin_block(self, text):
        self.produce('blockBegin', '{')
        self.state_begin('block')
        return None

    def end_block(self, text):
        self.produce('blockEnd', '}')
        self.state_end()
        return None

    def begin_namedFunction(self, text):
        name = text.split()[1].rstrip('(')
        self.produce('expression', name)
        self.produce('assignment', '=')
        return self.begin_function(text)
    
    lexicon = Lexicon([
        State('block', [
            (Eol, got_eof),
            (space, IGNORE),
            (anonymousFunction, begin_function),
            (namedFunction, begin_namedFunction),
            (expression, 'expression'),
            (inequality, 'inequality'),
            (assignment, 'assignment'),
            (singleLineComment, do_singleLineComment),
            (string, 'string'),
            (chars, 'chars'),
            (regex, 'regex'),
            (parenBegin, 'parenBegin'),
            (parenEnd, 'parenEnd'),
            (blockBegin, begin_block),
            (blockEnd, end_block),
            (blockCommentStart, begin_blockComment),
            (AnyChar, IGNORE),
        ]),
        State('blockComment', [
            (Eol, got_eof),
            (blockCommentEnd, end_blockComment),
            (re(r'[^*]+'), buffer_text),
            (Str('*'), buffer_text),
        ]),
        State('arguments', [
            (Eol, got_eof),
            (argumentsEnd, end_arguments),
            (identifier, 'argument'),
            (space, IGNORE),
            (Str(','), 'argumentDelimiter'),
            (blockCommentStart, begin_blockComment),
        ]),
    ])

if __name__ == '__main__':
    scanner = JavaScriptScanner(file('../MochiKit/Async.js'))
    for tok, s in scanner:
        print tok, s
