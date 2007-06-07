#!/usr/bin/env python
# -*- encoding: utf8 -*-

# This script generates an index XML on stdout for MochiKit docs
# suitable for submission to http://gotapi.com
# It depends on the html docs being up to date.

import re, sys

try:
    import xml.etree.ElementTree as ET
except ImportError:
    try:
        import cElementTree as ET
    except ImportError:
        try:
            import elementtree.ElementTree as ET
        except ImportError:
            raise ImportError("You need ElementTree")

if __name__ == "__main__":

    mk = file('MochiKit/MochiKit.js').read()
    modules = map(str.strip, re.search(
        r"""(?mxs)MochiKit.MochiKit.SUBMODULES\s*=\s*\[([^\]]+)""",
        mk
    ).group(1).replace(' ', '').replace('"', '').split(','))

    root = ET.Element("pages")

    for modulename in modules:

        tb = ET.XMLTreeBuilder()
        tb.entity['nbsp'] = " ";
        doc = ET.parse("doc/html/MochiKit/%s.html" % modulename, parser=tb)

        mod = ET.SubElement(root, "page")
        mod.attrib.update(dict(title="MochiKit.%s" % modulename, 
                               type="package", 
                               url="http://mochikit.com/doc/html/MochiKit/%s.html" % modulename))

        for a in doc.findall("//{http://www.w3.org/1999/xhtml}a"):
            if a.attrib.get("class",None) == "mochidef reference":
                fun = ET.SubElement(mod, "page")
                fun.attrib.update(dict(title=a.text),
                                       type="method",
                                       url="http://mochikit.com/doc/html/MochiKit/%s.html%s" % (modulename, a.attrib["href"]))
    tree = ET.ElementTree(root)
    tree.write(sys.stdout, encoding="UTF-8")

