__version__ = '1'

import sys
import cgi

def main():
    data = cgi.parse_qs(sys.stdin.read()).get('data')[0]
    print 'Content-Type: text/plain'
    print 'Content-Length: %d' % (len(data),)
    print 'Content-Disposition: attachment; filename=MochiKit.js'
    print ''
    print data

if __name__ == '__main__':
    main()
