if (typeof(dojo) != 'undefined') {
    dojo.provide('MochiKit.Selector');
}

if (typeof(MochiKit) == 'undefined') {
    MochiKit = {};
}

if (typeof(MochiKit.Selector) == 'undefined') {
    MochiKit.Selector = {};
}

MochiKit.Selector.NAME = "MochiKit.Selector";
MochiKit.Selector.VERSION = "1.0";
MochiKit.Selector.__repr__ = function () {
    return "[" + this.NAME + " " + this.VERSION + "]";
};
MochiKit.Selector.toString = function () {
    return this.__repr__();
};

MochiKit.Selector.Selector = function (expression) {
    this.params = {classNames: [], pseudoClassNames: []};
    this.expression = expression.toString().replace(/(^\s+|\s+$)/g, '');
    this.parseExpression();
    this.compileMatcher();
};

MochiKit.Selector.Selector.prototype = {

    __class__: MochiKit.Selector.Selector,

    parseExpression: function () {
        function abort(message) {
            throw 'Parse error in selector: ' + message;
        }

        if (this.expression == '')  {
            abort('empty expression');
        }

        var params = this.params, expr = this.expression, match, modifier, clause, rest;
        while (match = expr.match(/^(.*)\[([a-z0-9_:-]+?)(?:([~\|!^$*]?=)(?:"([^"]*)"|([^\]\s]*)))?\]$/i)) {
            params.attributes = params.attributes || [];
            params.attributes.push({name: match[2], operator: match[3], value: match[4] || match[5] || ''});
            expr = match[1];
        }

        if (expr == '*') {
            return this.params.wildcard = true;
        }

        while (match = expr.match(/^([^a-z0-9_-])?([a-z0-9_-]+(?:\([^)]*\))?)(.*)/i)) {
            modifier = match[1], clause = match[2], rest = match[3];
            switch (modifier) {
                case '#': 
                    params.id = clause;
                    break;
                case '.': 
                    params.classNames.push(clause);
                    break;
                case ':':
                    params.pseudoClassNames.push(clause);
                    break;
                case '':
                case undefined:
                    params.tagName = clause.toUpperCase();
                    break;
                default:
                    abort(repr(expr));
            }
            expr = rest;
        }

        if (expr.length > 0) {
            abort(repr(expr));
        }
    },

    buildMatchExpression: function () {
        var params = this.params;
        var conditions = [];
        var clause;

        function childElements(element) {
            return "filter(function (node){ return node.nodeType == Node.ELEMENT_NODE; }, " + element + ".childNodes)";
        }

        if (params.wildcard) {
            conditions.push('true');
        }
        if (clause = params.id) {
            conditions.push('element.id == ' + repr(clause));
        }
        if (clause = params.tagName) {
            conditions.push('element.tagName.toUpperCase() == ' + repr(clause));
        }
        if ((clause = params.classNames).length > 0) {
            for (var i = 0; i < clause.length; i++) {
                conditions.push('hasElementClass(element, ' + repr(clause[i]) + ')');
            }
        }
        if ((clause = params.pseudoClassNames).length > 0) {
            for (var i = 0; i < clause.length; i++) {
                var match = clause[i].match(/^([^(]+)(?:\((.*)\))?$/);
                var pseudoClass = match[1];
                var pseudoClassArgument = match[2];
                switch (pseudoClass) {
                    case 'root':
                        conditions.push('element === document.documentElement'); break;
                    case 'nth-child':
                    case 'nth-last-child':
                    case 'nth-of-type':
                    case 'nth-last-of-type':
                        match = pseudoClassArgument.match(/^((?:(\d+)n\+)?(\d+)|odd|even)$/);
                        if (!match) {
                            throw "Invalid argument to pseudo element nth-child: " + pseudoClassArgument;
                        }
                        var a, b;
                        if (match[0] == 'odd') {
                            a = 2;
                            b = 1;
                        } else if (match[0] == 'even') {
                            a = 2;
                            b = 0;
                        } else {
                            a = match[2] && parseInt(match);
                            b = parseInt(match[3]);
                        }
                        conditions.push('this.nthChild(element,' + a + ',' + b
                                        + ',' + !!pseudoClass.match('^nth-last')    // Reverse
                                        + ',' + !!pseudoClass.match('of-type$')     // Restrict to same tagName
                                        + ')');
                        break;
                    case 'first-child':
                        conditions.push('this.nthChild(element, null, 1)');
                        break;
                    case 'last-child':
                        conditions.push('this.nthChild(element, null, 1, true)');
                        break;
                    case 'first-of-type':
                        conditions.push('this.nthChild(element, null, 1, false, true)');
                        break;
                    case 'last-of-type':
                        conditions.push('this.nthChild(element, null, 1, true, true)');
                        break;
                    case 'only-child':
                        conditions.push(childElements('element.parentNode') + '.length == 1');
                        break;
                    case 'only-of-type':
                        conditions.push('filter(function (node) { return node.tagName == element.tagName; }, ' + childElements('element.parentNode') + ').length == 1');
                        break;
                    case 'empty':
                        conditions.push('element.childNodes.length == 0');
                        break;
                    case 'enabled':
                        conditions.push('element.disabled === false');
                        break;
                    case 'disabled':
                        conditions.push('element.disabled === true');
                        break;
                    case 'checked':
                        conditions.push('element.checked === true');
                        break;
                    case 'not':
                        var subselector = new MochiKit.Selector.Selector(pseudoClassArgument);
                        conditions.push('!( ' + subselector.buildMatchExpression() + ')')
                        break;
                }
            }
        }
        if (clause = params.attributes) {
            map(function (attribute) {
                var value = 'element.getAttribute(' + repr(attribute.name) + ')';
                var splitValueBy = function (delimiter) {
                    return value + ' && ' + value + '.split(' + repr(delimiter) + ')';
                }

                switch (attribute.operator) {
                    case '=':
                        conditions.push(value + ' == ' + repr(attribute.value));
                        break;
                    case '~=':
                        conditions.push('findValue(' + splitValueBy(' ') + ', ' + repr(attribute.value) + ') > -1');
                        break;
                    case '^=':
                        conditions.push(value + '.substring(0, ' + attribute.value.length + ') == ' + repr(attribute.value));
                        break;
                    case '$=':
                        conditions.push(value + '.substring(' + value + '.length - ' + attribute.value.length + ') == ' + repr(attribute.value));
                        break;
                    case '*=':
                        conditions.push(value + '.match(' + repr(attribute.value) + ')');
                        break;
                    case '|=':
                        conditions.push(
                            splitValueBy('-') + '[0].toUpperCase() == ' + repr(attribute.value.toUpperCase())
                        );
                        break;
                    case '!=':
                        conditions.push(value + ' != ' + repr(attribute.value));
                        break;
                    case '':
                    case undefined:
                        conditions.push(value + ' != null');
                        break;
                    default:
                        throw 'Unknown operator ' + attribute.operator + ' in selector';
                }
            }, clause);
        }

        return conditions.join(' && ');
    },

    compileMatcher: function () {
        this.match = new Function('element', 'if (!element.tagName) return false; \
                return ' + this.buildMatchExpression());
    },

    nthChild: function (element, a, b, reverse, sametag){
        var siblings = filter(function (node) {
            return node.nodeType == Node.ELEMENT_NODE;
            }, element.parentNode.childNodes);
        if (sametag) {
            siblings = filter(function (node) {
                return node.tagName == element.tagName;
            }, siblings);
        }
        if (reverse) {
            siblings = MochiKit.Iter.reversed(siblings);
        }
        if (a) {
            var actualIndex = MochiKit.Base.findIdentical(siblings, element);
            return ((actualIndex + 1 - b) / a) % 1 == 0;
        } else {
            return b == MochiKit.Base.findIdentical(siblings, element) + 1;
        }
    },

    findElements: function (scope, axis) {
        var element;

        if (axis == undefined) {
            axis = "";
        }

        function inScope(element, scope) {
            if (axis == "") {
                return MochiKit.DOM.isChildNode(element, scope);
            } else if (axis == ">") {
                return element.parentNode == scope;
            } else if (axis == "+") {
                return element.previousSibling == scope;
            } else if (axis == "~") {
                while (element.previousSibling) {
                    if (element.previousSibling == scope) return true;
                    element = element.previousSibling;
                }
                return false;
            } else {
                throw "Invalid axis: " + axis;
            }
        }

        if (element = $(this.params.id)) {
            if (this.match(element)) {
                if (!scope || inScope(element, scope)) {
                    return [element];
                }
            }
        }

        function nextSiblingElement(node) {
            node = node.nextSibling;
            while (node && node.nodeType != Node.ELEMENT_NODE) {
                node = node.nextSibling;
            }
            return node;
        }

        if (axis == "") {
            scope = (scope || document).getElementsByTagName(this.params.tagName || '*');
        } else if (axis == ">") {
            if (!scope) {
                throw "> combinator not allowed without preceeding expression";
            }
            scope = filter(function (node) {
                return node.nodeType == Node.ELEMENT_NODE;
            }, scope.childNodes);
        } else if (axis == "+") {
            if (!scope) {
                throw "+ combinator not allowed without preceeding expression";
            }
            scope = nextSiblingElement(scope) && [nextSiblingElement(scope)];
        } else if (axis == "~") {
            if (!scope) {
                throw "~ combinator not allowed without preceeding expression";
            }
            var newscope = new Array();
            while (nextSiblingElement(scope)) {
                scope = nextSiblingElement(scope);
                newscope.push(scope);
            }
            scope = newscope;
        }

        if (!scope) {
            return [];
        }

        var results = [];
        for (var i = 0; i < scope.length; i++) {
            if (this.match(element = scope[i])) {
                results.push(element);
            }
        }

        return results;
    },

    toString: function () {
        return this.expression;
    }

};

MochiKit.Base.update(MochiKit.Selector, {
    matchElements: function (elements, expression) {
        var selector = new Selector(expression);
        return elements.select(selector.match.bind(selector)).collect(Element.extend);
    },

    findElement: function (elements, expression, index) {
        if (typeof expression == 'number') {
            index = expression;
            expression = false;
        }
        return Selector.matchElements(elements, expression || '*')[index || 0];
    },

    findChildElements: function (element, expressions) {
        return flattenArray(map(function (expression) {
            var nextScope = "";
            return reduce(function (results, expr) {
                if (match = expr.match(/^[>+~]$/)) {
                    nextScope = match[0];
                    return results;
                } else {
                    var selector = new MochiKit.Selector.Selector(expr);
                    var elements = reduce(function (elements, result) {
                        return extend(elements, selector.findElements(result || element, nextScope));
                    }, results, []);
                    nextScope = "";
                    return elements;
                }
            }, expression.replace(/(^\s+|\s+$)/g, '').split(/\s+/), [null]);
        }, expressions));
    }

});

function $$() {
    return MochiKit.Selector.findChildElements(document, arguments);
}

