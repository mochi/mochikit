#!/usr/bin/env python
import os
import sys
from docutils.core import publish_file
def main():
    basepath = os.path.join('doc/rst', '')
    destpath = os.path.join('doc/html', '')
    for root, dirs, files in os.walk(basepath):
        if '.svn' in dirs:
            dirs.remove('.svn')
        destroot = destpath + root[len(basepath):]
        if not os.path.exists(destroot):
            os.makedirs(destroot)
        for fn in files:
            basefn, ext = os.path.splitext(fn)
            if ext == '.rst':
                srcfn = os.path.join(root, fn)
                dest = os.path.join(destroot, basefn + '.html')
                if basefn != "index" and os.path.getmtime(dest) >= os.path.getmtime(srcfn):
                    print srcfn, "not changed"
                    continue
                print srcfn
                res = publish_file(
                    source_path=srcfn,
                    destination_path=dest,
                    writer_name='html',
                    settings_overrides=dict(
                        input_encoding='utf8',
                        output_encoding='utf8',
                        embed_stylesheet=False,
                        stylesheet_path='include/css/documentation.css',
                    ),
                )

if __name__ == '__main__':
    main()
