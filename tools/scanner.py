import sre_parse, sre_compile, sre_constants
from sre_constants import BRANCH, SUBPATTERN
from sre import VERBOSE, MULTILINE, DOTALL
import re


__all__ = ['Scanner', 'Token', 'IgnoreToken', 'ScanningToken', 'InsignificantWhitespace', 'FuncScanningToken']

class Scanner(object):
    def __init__(self, lexicon, flags=(VERBOSE | MULTILINE | DOTALL), verify=True):
        self.actions = [None]
        # combine phrases into a compound pattern
        s = sre_parse.Pattern()
        s.flags = flags
        p = []
        for idx, token in enumerate(lexicon):
            phrase = token.pattern
            try:
                subpattern = sre_parse.SubPattern(s,
                    [(SUBPATTERN, (idx+1, sre_parse.parse(phrase, flags)))])
            except sre_constants.error:
                print "Can't parse %s" % (token.__name__,)
                raise
            token.regex = re.compile(phrase, flags)
            p.append(subpattern)
            self.actions.append(token)

        p = sre_parse.SubPattern(s, [(BRANCH, (None, p))])
        self.scanner = sre_compile.compile(p)

        if verify:
            for token in lexicon:
                example = token.example
                if example is None:
                    continue

                def dead(string, i, j):
                    print token.__name__, i, j
                    print '--- PATTERN ---'
                    print token.pattern
                    print '--- PARSED EXAMPLE ---'
                    print string[:i]
                    print '--- UNMATCHED CHUNK ---'
                    print repr(string[i:j])
                    raise ValueError, "Token %s can not be verified" % token.__name__
                s = Scanner([token, InsignificantWhitespace], verify=False)
                for m in s.iterscan(example, dead=dead):
                    pass


    def iterscan(self, string, dead=None, idx=0):
        match = self.scanner.scanner(string, idx).search
        actions = self.actions
        i, j, k = 0, 0, 0
        end = len(string)
        while True:
            m = match()
            if m is None:
                break
            k, j = m.span()
            if i == j:
                break
            # yield for dead space
            if k != i and dead is not None:
                rval = dead(string, i, k)
                if rval is not None:
                    yield rval
            action = actions[m.lastindex]
            if action is not None:
                rval, next_pos = action(m)
                yield rval
                if next_pos is not None and next_pos != j:
                    # "fast forward" the scanner
                    j = next_pos
                    match = self.scanner.scanner(string, j).search
            i = j
        if i != end and dead is not None:
            rval = dead(string, i, end)
            yield rval
            

class Token(object):
    pattern = None
    example = None
    regex = None
    match = None
    _groupdict = None

    def __new__(cls, match):
        self = super(Token, cls).__new__(cls)
        return self.found(match)
    
    def tree(self):
        return repr(self)

    def groupdict(self):
        groups = self._groupdict
        if groups is None:
            if self.match is None:
                return None
            groups = self._groupdict = self.match.groupdict()
        return groups
       
    def __getitem__(self, item):
        return self.groupdict()[item]

    def found(self, match):
        if self.regex is not None:
            match = self.regex.match(match.string, *match.span())
        self.match = match
        return self, None

    def __repr__(self):
        return '%s(%r)' % (type(self).__name__, self.groupdict())

class FuncScanningToken(Token):
    scanner = None
    dead = None
    endfunc = None
    lexicon = None
    _matches = None

    def setup(self):
        if self.lexicon is None:
            raise ValueError, "missing lexicon"
        if self.endfunc is None:
            raise ValueError, "missing endfunc"
        if self.scanner is None:
            self.scanner = self.buildScanner()
    
    def buildScanner(self):
        return Scanner(list(self.lexicon))
    
    def tree(self):
        l = []
        for m in self._matches:
            try:
                l.append(m.tree())
            except AttributeError:
                l.append(m)
        return Token.__repr__(self), l

    def found(self, match):
        end = match.end()
        if self.regex is not None:
            self.match = self.regex.match(match.string, *match.span())
        else:
            self.match = match
        self.setup()
        scanner = self.scanner.iterscan(match.string, dead=self.dead, idx=end)
        matches = self._matches = [ ]
        if self.dead and isinstance(self.dead, type):
            deadmatches = []
        else:
            deadmatches = None
        def prunedMatches():
            if deadmatches is not None:
                def deadfilter(match):
                    if isinstance(match, self.dead) and match.begin == match.end:
                        return False
                    return True
                return filter(deadfilter, matches)
            return matches
        for match in scanner:
            if match is None:
                continue
            if deadmatches is not None:
                if isinstance(match, self.dead):
                    match.begin = max(match.begin, end)
                    deadmatches.append(match)
                elif deadmatches:
                    ld = deadmatches[-1]
                    end = match.match.end()
                    ld.end = min(ld.end, end)
            matches.append(match)
            if self.endfunc(match):
                self._matches = prunedMatches()
                return self, match.match.end()
        else:
            self._matches = matches = prunedMatches()
            raise ValueError, "EndToken not matched"

    def matches(self):
        return self._matches

    def __repr__(self):
        return '%s(%r, %r)' % (
            type(self).__name__,
            self.groupdict(),
            self.matches(),
        )


class ScanningToken(FuncScanningToken):
    endtoken = None

    def buildScanner(self):
        lex = [self.endtoken]
        lex.extend(self.lexicon)
        return Scanner(lex)

    def endfunc(self, match):
        return isinstance(match, self.endtoken)

class IgnoreToken(Token):
    def found(self, match):
        return None, None

class InsignificantWhitespace(IgnoreToken):
    pattern = r'\s+'
    example = '  \t \n \r   '
