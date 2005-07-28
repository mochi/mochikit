import os
import sys
import glob
import zipfile
def json_encode(o, indent=0):
    if isinstance(o, dict):
        if len(o) == 0:
            yield '{}'
        else:
            yield '{\n'
            first = True
            for key, value in o.iteritems():
                if first:
                    first = False
                else:
                    yield ',\n'
                yield ' ' * (indent + 4)
                assert isinstance(key, (basestring, float, int, long))
                for chunk in json_encode(key):
                    yield chunk
                yield ': '
                for chunk in json_encode(value, indent + 4):
                    yield chunk
            yield '\n' + (' ' * indent) + '}'
    elif isinstance(o, list):
        if len(o) == 0:
            yield '[]'
        else:
            yield '[\n'
            first = True
            for value in o:
                if first:
                    first = False
                else:
                    yield ',\n'
                yield ' ' * (indent + 4)
                for chunk in json_encode(value, indent + 4):
                    yield chunk
            yield '\n' + (' ' * indent) + ']'
    elif isinstance(o, basestring):
        yield '"' + o.replace('\\', '\\\\').replace('"', '\\"') + '"'
    elif isinstance(o, (float, int, long)):
        yield str(o)
    else:
        raise NotImplementedError
VERSION = '0.50'
META = dict(
    name='MochiKit',
    author=['Bob Ippolito <bob@redivi.com>'],
    abstract='Python-inspired JavaScript kit',
    license='mit',
    version=VERSION,
    build_requires={'Test.Simple': '0.11'},
    recommends={'JSAN': '0.10'},
    provides={},
    generated_by="MochiKit's build script",
)
FILES = glob.glob('lib/MochiKit/*.js')
for fn in FILES:
    modname = os.path.splitext(os.path.basename(fn))[0]
    META['provides'][modname] = dict(file=fn, version=VERSION)
if not os.path.exists('dist'):
    os.makedirs('dist')
sys.stdout.writelines(json_encode(META))
