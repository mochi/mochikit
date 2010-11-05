__version__ = '2'

import sys
import cgi
import gzip
import StringIO

def compressData(data):
    zbuf = StringIO.StringIO()
    zfile = gzip.GzipFile(None, 'wb', 9, zbuf)
    zfile.write(data)
    zfile.close()
    return zbuf.getvalue() 

def main():
    form = cgi.parse_qs(sys.stdin.read())
    data = form.get('data')[0]
    if 'compress' in form:
        data = compressData(data)
        print 'Content-Type: application/octet-stream'
        print 'Content-Length: %d' % len(data)
        if form['compress'][0] == 'gz':
            print 'Content-Disposition: attachment; filename=MochiKit.js.gz'
        else:
            print 'Content-Disposition: attachment; filename=MochiKit.js.RENAME-TO-gz'
    else:
        print 'Content-Type: text/plain'
        print 'Content-Length: %d' % len(data)
        print 'Content-Disposition: attachment; filename=MochiKit.js'
    print ''
    sys.stdout.write(data)

if __name__ == '__main__':
    main()
