from tokenize_javascript import Scanner, LEXICON, UnmatchedText
def main():
    import sys
    import glob
    files = sys.argv[1:] or glob.glob('../MochiKit/*.js')
    scan = Scanner(LEXICON)
    for fn in files:
        print '-' * len(fn)
        print fn
        print '-' * len(fn)
        for token in scan.iterscan(file(fn).read(), dead=UnmatchedText):
            if token is None:
                continue
            print token
            print

if __name__ == '__main__':
    main()
