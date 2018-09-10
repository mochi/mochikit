/*! MochiKit
        Making JavaScript better and easier with a consistent, clean API.
        Built at "Mon Sep 10 2018 16:55:30 GMT+0100 (British Summer Time)".
        Command line options: "async base color data datetime dom func iter logging repr"
*/
this.mochikit = this.mochikit || {};
this.mochikit.dom = (function (exports) {
    'use strict';

    function ownerDocument(el) {
        if (!el) {
            return null;
        }

        let { ownerDocument, defaultView } = el;
        return ownerDocument || defaultView || el.nodeType === 9 && el || null;
    }

    function empty(node) {
        let first;
        switch(node.nodeType) {
            //Element:
            case 1:
            //fast track.
            node.innerHTML = '';
            
            default:
            //Cache the firstChild call.
            if(node.removeChild && (first = node.firstChild)) {
                while(first) {
                    node.removeChild(first);
                    //Recompute the value:
                    first = node.firstChild;
                }
            }
        }

        return node;
    }

    function clearRoot(node) {
        let doc = ownerDocument(node);
        return doc && empty(doc);
    }

    function cloneTree(node, deep) {
        //Get the tree from the node.
        let root = node.getRootNode();
        return root.cloneNode(deep);
    }

    function getBody (doc) {
        let val = ownerDocument(doc);
        return val && val.body || null;
    }

    const ostr = Object.prototype.toString;

    function getType(a) {
        switch(a) {
            case null:
            case undefined:
            return `[object ${a === null ? 'Null' : 'Undefined'}]`;
            //Allow faster results for booleans:
            case true:
            case false:
            return '[object Boolean]';
            case NaN:
            case Infinity:
            return '[object Number]';
        }

        if(a === '') {
            return '[object String]';
        }

        return ostr.call(a);
    }

    function isObject(a) {
        return a && getType(a) === '[object Object]';
    }

    function isNumber(a) {
        return getType(a) === '[object Number]';
    }

    function isNode(node) {
        return typeof node === 'object' && isNumber(node.nodeType) && !isObject(node);
    }

    function isDocument(doc) {
        return isNode(doc) && doc.nodeType === 9; 
    }

    function isEmpty(node) {
        return node.childNodes.length === 0;
    }

    function isFragment(doc) {
        return isNode(doc) && doc.nodeType === 11; 
    }

    var nodeTypeMap = {
        1: 'element',
        3: 'text',
        4: 'cdata_section',
        7: 'processing_instruction',
        8: 'comment',
        9: 'document',
        10: 'document_type',
        11: 'document_fragment'
    };

    function nodeType(node) {
        return nodeTypeMap[node.nodeType] || null;
    }

    let spaceRe = /\s+/;

    function off(node, event, func) {
        if(spaceRe.test(event)) {
            //Multiple events.
            for(let actualEvent of event) {
                node.removeEventListener(actualEvent, func);
            }
        } else {
            node.removeEventListener(event, func);
        }

        return node;
    }

    let spaceRe$1 = /\s+/;

    function on(node, event, func) {
        if(spaceRe$1.test(event)) {
            //Multiple events.
            for(let actualEvent of event) {
                node.addEventListener(actualEvent, func);
            }
        } else {
            node.addEventListener(event, func);
        }

        return node;
    }

    function removeMatching(selector, dom) {
        let el = dom.querySelectorAll(selector);

        //Classic iteration: some qSA impls might return a non-iterable.
        for(let parent, index = 0, len = el.length; index < len; ++index) {
            if(parent = el.parentNode) {
                parent.removeChild(el[index]);
            }
        }

        return el;
    }

    function purify(tree) {
        removeMatching('script', tree);
        removeMatching('style', tree);
        removeMatching('link', tree);
        //TODO: remove [style]
        return tree;
    }

    function removeScripts(node) {
        return removeMatching('script', node);
    }

    function rootChildren(node) {
        let val = ownerDocument(node);
        return val && val.childNodes || null;
    }

    function counter(n/* = 1 */) {
        if (n == null) {
            n = 1;
        }
        return function () {
            return n++;
        };
    }

    const _counter = counter(0);

    class Visibility {
        constructor(el) {
            this.element = el;

            //Customize these:
            this.hiddenDisplay = 'hidden';
            this.visibleDisplay = 'block';
            this.hiddenVisibility = 'hidden';
            this.visibleVisibility = 'visible';

            this.modifiable = true;
            this.token = _counter();
        }

        show() {
            return this.setDisplay(this.visibleDisplay);
        }

        hide() {
            return this.setDisplay(this.hiddenDisplay);
        }

        isHiddenInAnyWay() {
            return this.isHidden() || this.isInvisible();
        }

        invisible() {
            return this.setVisibility(this.hiddenVisibility);
        }

        visible() {
            return this.setVisibility(this.visibleVisibility);
        }

        isInvisible() {
            return this.getVisibility() === this.hiddenVisibility;
        }

        isVisible() {
            return this.getVisibility() === this.visibleVisibility;
        }

        setVisibility(val) {
            if (!this.isLocked()) {
                this.element.style.visibility = val;
            }

            return this;
        }

        getVisibility() {
            return this.element.style.visibility;
        }

        isHidden() {
            return this.getDisplay() === this.hiddenDisplay;
        }

        isVisible() {
            return this.getDisplay() === this.visibleDisplay;
        }

        toggle() {
            this.isHidden() ? this.show() : this.hide();
            return this;
        }

        hideAfter(timeout) {
            return this.taskAfter('hide', timeout);
        }

        showAfter(timeout) {
            return this.taskAfter('show', timeout);
        }

        toggleAfter(timeout) {
            return this.taskAfter('toggle', timeout);
        }

        taskAfter(method, timeout) {
            let self = this;
            this.timeoutID = setTimeout(
                () => ((self.timeoutID = null), self[method]()),
                timeout
            );
            return this;
        }

        getDisplay() {
            return this.element.style.display;
        }

        setDisplay(val) {
            if (!this.isLocked()) {
                this.element.style.display = val;
            }

            return this;
        }

        cancelTimeout() {
            clearTimeout(this.timeoutID);
            return this;
        }

        timeoutActive() {
            return this.timeoutID != null;
        }

        lock() {
            this.modifiable = false;
            return this;
        }

        unlock() {
            this.modifiable = true;
            return this;
        }

        isLocked() {
            return !this.modifiable;
        }

        isModifiable() {
            return !this.isLocked();
        }

        clone() {
            let vis = new Visibility();
            vis.modifiable = this.modifiable;
            vis.timeoutID = this.timeoutID;
            vis.visibleDisplay = this.visibleDisplay;
            vis.element = this.element;
            vis.hiddenDisplay = this.hiddenDisplay;
            return vis;
        }

        fromParent() {
            return new Visibility(this.element.parentNode);
        }

        fromChildAt(index) {
            return new Visibility(this.element.childNodes[+index]);
        }

        fromFirstMatch(selector) {
            return new Visibility(this.element.querySelector(selector));
        }

        clearContent() {
            this.element.innerHTML = '';
            return this;
        }

        cloneWithEl(el) {
            let vis = this.clone();
            vis.element = el;
            return vis;
        }

        setShowStates(display, visibility) {
            this.visibleDisplay = display;
            this.visibleVisibility = visibility;
            return this;
        }

        getShowStates() {
            return [this.visibleDisplay, this.visibleVisibility];
        }

        setHiddenStates(display, visibility) {
            this.hiddenVisibility = visibility;
            this.hiddenDisplay = display;
            return this;
        }

        getHiddenStates() {
            return [this.visibleVisibility, this.hiddenVisibility];
        }
    }

    function createShortcut(tag) {
        return function(attrs, doc = document) {
            return doc.createElement(tag, attrs);
        };
    }

    const A = createShortcut('A'),
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
        TBODY = createShortcut('TBODY'),
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

    //dom index.js

    const __repr__ = '[MochiKit.DOM]';

    exports.__repr__ = __repr__;
    exports.clearRoot = clearRoot;
    exports.cloneTree = cloneTree;
    exports.empty = empty;
    exports.getBody = getBody;
    exports.isDocument = isDocument;
    exports.isEmpty = isEmpty;
    exports.isFragment = isFragment;
    exports.isNode = isNode;
    exports.nodeType = nodeType;
    exports.nodeTypeMap = nodeTypeMap;
    exports.off = off;
    exports.on = on;
    exports.ownerDocument = ownerDocument;
    exports.purify = purify;
    exports.removeMatching = removeMatching;
    exports.removeScripts = removeScripts;
    exports.rootChildren = rootChildren;
    exports.Visibility = Visibility;
    exports.A = A;
    exports.ABBR = ABBR;
    exports.ADDRESS = ADDRESS;
    exports.AREA = AREA;
    exports.ARTICLE = ARTICLE;
    exports.ASIDE = ASIDE;
    exports.AUDIO = AUDIO;
    exports.B = B;
    exports.BASE = BASE;
    exports.BDI = BDI;
    exports.BDO = BDO;
    exports.BLOCKQUOTE = BLOCKQUOTE;
    exports.BODY = BODY;
    exports.BR = BR;
    exports.BUTTON = BUTTON;
    exports.CANVAS = CANVAS;
    exports.CAPTION = CAPTION;
    exports.CITE = CITE;
    exports.CODE = CODE;
    exports.COL = COL;
    exports.COLGROUP = COLGROUP;
    exports.DATA = DATA;
    exports.DATALIST = DATALIST;
    exports.DD = DD;
    exports.DEL = DEL;
    exports.DETAILS = DETAILS;
    exports.DFN = DFN;
    exports.DIALOG = DIALOG;
    exports.DIV = DIV;
    exports.DL = DL;
    exports.DT = DT;
    exports.EM = EM;
    exports.EMBED = EMBED;
    exports.FIELDSET = FIELDSET;
    exports.FIGCAPTION = FIGCAPTION;
    exports.FIGURE = FIGURE;
    exports.FOOTER = FOOTER;
    exports.FORM = FORM;
    exports.H1 = H1;
    exports.H2 = H2;
    exports.H3 = H3;
    exports.H4 = H4;
    exports.H5 = H5;
    exports.H6 = H6;
    exports.HEAD = HEAD;
    exports.HEADER = HEADER;
    exports.HR = HR;
    exports.HTML = HTML;
    exports.I = I;
    exports.IFRAME = IFRAME;
    exports.IMG = IMG;
    exports.INPUT = INPUT;
    exports.INS = INS;
    exports.KBD = KBD;
    exports.LABEL = LABEL;
    exports.LEGEND = LEGEND;
    exports.LI = LI;
    exports.LINK = LINK;
    exports.MAIN = MAIN;
    exports.MAP = MAP;
    exports.MARK = MARK;
    exports.META = META;
    exports.METER = METER;
    exports.NAV = NAV;
    exports.NOSCRIPT = NOSCRIPT;
    exports.OBJECT = OBJECT;
    exports.OL = OL;
    exports.OPTGROUP = OPTGROUP;
    exports.OPTION = OPTION;
    exports.OUTPUT = OUTPUT;
    exports.P = P;
    exports.PARAM = PARAM;
    exports.PICTURE = PICTURE;
    exports.PRE = PRE;
    exports.PROGRESS = PROGRESS;
    exports.Q = Q;
    exports.RP = RP;
    exports.RT = RT;
    exports.RUBY = RUBY;
    exports.S = S;
    exports.SAMP = SAMP;
    exports.SCRIPT = SCRIPT;
    exports.SECTION = SECTION;
    exports.SELECT = SELECT;
    exports.SMALL = SMALL;
    exports.SOURCE = SOURCE;
    exports.SPAN = SPAN;
    exports.STRONG = STRONG;
    exports.STYLE = STYLE;
    exports.SUB = SUB;
    exports.SUMMARY = SUMMARY;
    exports.SUP = SUP;
    exports.SVG = SVG;
    exports.TABLE = TABLE;
    exports.TBODY = TBODY;
    exports.TD = TD;
    exports.TEMPLATE = TEMPLATE;
    exports.TEXTAREA = TEXTAREA;
    exports.TFOOT = TFOOT;
    exports.TH = TH;
    exports.THEAD = THEAD;
    exports.TIME = TIME;
    exports.TITLE = TITLE;
    exports.TR = TR;
    exports.TRACK = TRACK;
    exports.U = U;
    exports.UL = UL;
    exports.VAR = VAR;
    exports.VIDEO = VIDEO;
    exports.WBR = WBR;

    return exports;

}({}));
