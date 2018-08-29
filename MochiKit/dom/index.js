function createShortcut(tag) {    return function (attrds, doc = document) {
        return doc.createElement(tag, attrs);
    }
}

 export const A = createShortcut('A'),
 ABBR = createShortcut('ABBR'),
 ADDRESS = createShortcut('ADDRESS'),
 AREA = createShortcut('AREA'),
 ARTICLE = createShortcut('ARTICLE'),
 ASIDE = createShortcut('ASIDE'),
 AUDIO = createShortcut('AUDIO'),
 B = createShortcut('B'),
 BASE = createShortcut('BASE'),
 BDI = createShortcut('BDI'),
 BDO = createShortcut('BDO'),
 BLOCKQUOTE = createShortcut('BLOCKQUOTE'),
 BODY = createShortcut('BODY'),
 BR = createShortcut('BR'),
 BUTTON = createShortcut('BUTTON'),
 CANVAS = createShortcut('CANVAS'),
 CAPTION = createShortcut('CAPTION'),
 CITE = createShortcut('CITE'),
 CODE = createShortcut('CODE'),
 COL = createShortcut('COL'),
 COLGROUP = createShortcut('COLGROUP'),
 DATA = createShortcut('DATA'),
 DATALIST = createShortcut('DATALIST'),
 DD = createShortcut('DD'),
 DEL = createShortcut('DEL'),
 DETAILS = createShortcut('DETAILS'),
 DFN = createShortcut('DFN'),
 DIALOG = createShortcut('DIALOG'),
 DIV = createShortcut('DIV'),
 DL = createShortcut('DL'),
 DT = createShortcut('DT'),
 EM = createShortcut('EM'),
 EMBED = createShortcut('EMBED'),
 FIELDSET = createShortcut('FIELDSET'),
 FIGCAPTION = createShortcut('FIGCAPTION'),
 FIGURE = createShortcut('FIGURE'),
 FOOTER = createShortcut('FOOTER'),
 FORM = createShortcut('FORM'),
 H1 = createShortcut('H1'),
 H2 = createShortcut('H2'),
 H3 = createShortcut('H3'),
 H4 = createShortcut('H4'),
 H5 = createShortcut('H5'),
 H6 = createShortcut('H6'),
 HEAD = createShortcut('HEAD'),
 HEADER = createShortcut('HEADER'),
 HR = createShortcut('HR'),
 HTML = createShortcut('HTML'),
 I = createShortcut('I'),
 IFRAME = createShortcut('IFRAME'),
 IMG = createShortcut('IMG'),
 INPUT = createShortcut('INPUT'),
 INS = createShortcut('INS'),
 KBD = createShortcut('KBD'),
 LABEL = createShortcut('LABEL'),
 LEGEND = createShortcut('LEGEND'),
 LI = createShortcut('LI'),
 LINK = createShortcut('LINK'),
 MAIN = createShortcut('MAIN'),
 MAP = createShortcut('MAP'),
 MARK = createShortcut('MARK'),
 META = createShortcut('META'),
 METER = createShortcut('METER'),
 NAV = createShortcut('NAV'),
 NOSCRIPT = createShortcut('NOSCRIPT'),
 OBJECT = createShortcut('OBJECT'),
 OL = createShortcut('OL'),
 OPTGROUP = createShortcut('OPTGROUP'),
 OPTION = createShortcut('OPTION'),
 OUTPUT = createShortcut('OUTPUT'),
 P = createShortcut('P'),
 PARAM = createShortcut('PARAM'),
 PICTURE = createShortcut('PICTURE'),
 PRE = createShortcut('PRE'),
 PROGRESS = createShortcut('PROGRESS'),
 Q = createShortcut('Q'),
 RP = createShortcut('RP'),
 RT = createShortcut('RT'),
 RUBY = createShortcut('RUBY'),
 S = createShortcut('S'),
 SAMP = createShortcut('SAMP'),
 SCRIPT = createShortcut('SCRIPT'),
 SECTION = createShortcut('SECTION'),
 SELECT = createShortcut('SELECT'),
 SMALL = createShortcut('SMALL'),
 SOURCE = createShortcut('SOURCE'),
 SPAN = createShortcut('SPAN'),
 STRONG = createShortcut('STRONG'),
 STYLE = createShortcut('STYLE'),
 SUB = createShortcut('SUB'),
 SUMMARY = createShortcut('SUMMARY'),
 SUP = createShortcut('SUP'),
 SVG = createShortcut('SVG'),
 TABLE = createShortcut('TABLE'),
 TBODY= createShortcut('TBODY'),
 TD = createShortcut('TD'),
 TEMPLATE = createShortcut('TEMPLATE'),
 TEXTAREA = createShortcut('TEXTAREA'),
 TFOOT = createShortcut('TFOOT'),
 TH = createShortcut('TH'),
 THEAD = createShortcut('THEAD'),
 TIME = createShortcut('TIME'),
 TITLE = createShortcut('TITLE'),
 TR = createShortcut('TR'),
 TRACK = createShortcut('TRACK'),
 U = createShortcut('U'),
 UL = createShortcut('UL'),
 VAR = createShortcut('VAR'),
 VIDEO = createShortcut('VIDEO'),
 WBR = createShortcut('WBR');