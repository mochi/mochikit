/***
Copyright (c) 2005 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
          (c) 2005 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
          (c) 2005 Jon Tirsen (http://www.tirsen.com)
Contributors:
    Richard Livsey
    Rahul Bhargava
    Rob Wills
    Mochi-ized By Thomas Herve (_firstname_@nimail.org)

See scriptaculous.js for full license.

Autocompleter.Base handles all the autocompletion functionality
that's independent of the data source for autocompletion. This
includes drawing the autocompletion menu, observing keyboard
and mouse events, and similar.

Specific autocompleters need to provide, at the very least,
a getUpdatedChoices function that will be invoked every time
the text inside the monitored textbox changes. This method
should get the text for which to provide autocompletion by
invoking this.getToken(), NOT by directly accessing
this.element.value. This is to allow incremental tokenized
autocompletion. Specific auto-completion logic (AJAX, etc)
belongs in getUpdatedChoices.

Tokenized incremental autocompletion is enabled automatically
when an autocompleter is instantiated with the 'tokens' option
in the options parameter, e.g.:
new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
will incrementally autocomplete with a comma as the token.
Additionally, ',' in the above example can be replaced with
a token array, e.g. { tokens: [',', '\n'] } which
enables autocompletion on multiple tokens. This is most
useful when one of the tokens is \n (a newline), as it
allows smart autocompletion after linebreaks.

***/

var Autocompleter = {};

Autocompleter.Base = function () {};

Autocompleter.Base.prototype = {
    baseInitialize: function (element, update, options) {
        this.element = MochiKit.DOM.getElement(element);
        this.update = MochiKit.DOM.getElement(update);
        this.hasFocus = false;
        this.changed = false;
        this.active = false;
        this.index = 0;
        this.entryCount = 0;

        if (this.setOptions) {
            this.setOptions(options);
        }
        else {
            this.options = options || {};
        }

        this.options.paramName = this.options.paramName || this.element.name;
        this.options.tokens = this.options.tokens || [];
        this.options.frequency = this.options.frequency || 0.4;
        this.options.minChars = this.options.minChars || 1;
        this.options.onShow = this.options.onShow || function (element, update) {
                if (!update.style.position || update.style.position == 'absolute') {
                    update.style.position = 'absolute';
                    MochiKit.Position.clone(element, update, {
                        setHeight: false,
                        offsetTop: element.offsetHeight
                    });
                }
                Effect.Appear(update, {duration:0.15});
            };
        this.options.onHide = this.options.onHide || function (element, update) {
                new Effect.Fade(update, {duration: 0.15});
            };

        if (typeof(this.options.tokens) == 'string') {
            this.options.tokens = new Array(this.options.tokens);
        }

        this.observer = null;

        this.element.setAttribute('autocomplete', 'off');

        MochiKit.DOM.hideElement(this.update);

        MochiKit.Event.observe(this.element, 'blur',
            MochiKit.DOM.bindAsEventListener(this.onBlur, this));
        MochiKit.Event.observe(this.element, 'keypress',
            MochiKit.DOM.bindAsEventListener(this.onKeyPress, this));
    },

    show: function () {
        if (MochiKit.DOM.getStyle(this.update, 'display') == 'none') {
            this.options.onShow(this.element, this.update);
        }
        if (!this.iefix && MochiKit.Base.isIE() && MochiKit.Base.isOpera() &&
            (MochiKit.DOM.getStyle(this.update, 'position') == 'absolute')) {
            new Insertion.After(this.update,
             '<iframe id="' + this.update.id + '_iefix" '+
             'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
             'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
            this.iefix = MochiKit.DOM.getElement(this.update.id + '_iefix');
        }
        if (this.iefix) {
            setTimeout(MochiKit.Base.bind(this.fixIEOverlapping, this), 50);
        }
    },

    fixIEOverlapping: function () {
        MochiKit.Position.clone(this.update, this.iefix);
        this.iefix.style.zIndex = 1;
        this.update.style.zIndex = 2;
        MochiKit.DOM.showElement(this.iefix);
    },

    hide: function () {
        this.stopIndicator();
        if (MochiKit.DOM.getStyle(this.update, 'display') != 'none') {
            this.options.onHide(this.element, this.update);
        }
        if (this.iefix) {
            MochiKit.DOM.hideElement(this.iefix);
        }
    },

    startIndicator: function () {
        if (this.options.indicator) {
            MochiKit.DOM.showElement(this.options.indicator);
        }
    },

    stopIndicator: function () {
        if (this.options.indicator) {
            MochiKit.DOM.hideElement(this.options.indicator);
        }
    },

    onKeyPress: function (event) {
        if (this.active) {
            switch(event.keyCode) {
             case MochiKit.Event.KEY_TAB:
             case MochiKit.Event.KEY_RETURN:
                 this.selectEntry();
                 MochiKit.Event.stop(event);
             case MochiKit.Event.KEY_ESC:
                 this.hide();
                 this.active = false;
                 MochiKit.Event.stop(event);
                 return;
             case MochiKit.Event.KEY_LEFT:
             case MochiKit.Event.KEY_RIGHT:
                 return;
             case MochiKit.Event.KEY_UP:
                 this.markPrevious();
                 this.render();
                 if (MochiKit.Base.isSafari()) {
                     MochiKit.Event.stop(event);
                 }
                 return;
             case MochiKit.Event.KEY_DOWN:
                 this.markNext();
                 this.render();
                 if (MochiKit.Base.isSafari()) {
                     MochiKit.Event.stop(event);
                 }
                 return;
            }
        } else {
            if (event.keyCode == MochiKit.Event.KEY_TAB || event.keyCode == MochiKit.Event.KEY_RETURN) {
                return;
            }
        }

        this.changed = true;
        this.hasFocus = true;

        if (this.observer) {
            clearTimeout(this.observer);
        }
        this.observer = setTimeout(MochiKit.Base.bind(this.onObserverEvent, this),
                                   this.options.frequency*1000);
    },

    onHover: function (event) {
        var element = MochiKit.Event.findElement(event, 'LI');
        if (this.index != element.autocompleteIndex) {
            this.index = element.autocompleteIndex;
            this.render();
        }
        MochiKit.Event.stop(event);
    },

    onClick: function (event) {
        var element = MochiKit.Event.findElement(event, 'LI');
        this.index = element.autocompleteIndex;
        this.selectEntry();
        this.hide();
    },

    onBlur: function (event) {
        // needed to make click events working
        setTimeout(MochiKit.Base.bind(this.hide, this), 250);
        this.hasFocus = false;
        this.active = false;
    },

    render: function () {
        if (this.entryCount > 0) {
            for (var i = 0; i < this.entryCount; i++) {
                this.index == i ?
                    MochiKit.DOM.addElementClass(this.getEntry(i), 'selected') :
                    MochiKit.DOM.removeElementClass(this.getEntry(i), 'selected');
            }
            if (this.hasFocus) {
                this.show();
                this.active = true;
            }
        } else {
            this.active = false;
            this.hide();
        }
    },

    markPrevious: function () {
        if (this.index > 0) {
            this.index--
        } else {
            this.index = this.entryCount-1;
        }
    },

    markNext: function () {
        if (this.index < this.entryCount-1) {
            this.index++
        } else {
            this.index = 0;
        }
    },

    getEntry: function (index) {
        return this.update.firstChild.childNodes[index];
    },

    getCurrentEntry: function () {
        return this.getEntry(this.index);
    },

    selectEntry: function () {
        this.active = false;
        this.updateElement(this.getCurrentEntry());
    },

    updateElement: function (selectedElement) {
        if (this.options.updateElement) {
            this.options.updateElement(selectedElement);
            return;
        }
        var value = '';
        if (this.options.select) {
            var nodes = document.getElementsByClassName(this.options.select, selectedElement) || [];
            if (nodes.length > 0) {
                value = MochiKit.DOM.collectTextNodes(nodes[0], this.options.select);
            }
        } else {
            value = MochiKit.DOM.collectTextNodesIgnoreClass(selectedElement, 'informal');
        }
        var lastTokenPos = this.findLastToken();
        if (lastTokenPos != -1) {
            var newValue = this.element.value.substr(0, lastTokenPos + 1);
            var whitespace = this.element.value.substr(lastTokenPos + 1).match(/^\s+/);
            if (whitespace) {
                newValue += whitespace[0];
            }
            this.element.value = newValue + value;
        } else {
            this.element.value = value;
        }
        this.element.focus();

        if (this.options.afterUpdateElement) {
            this.options.afterUpdateElement(this.element, selectedElement);
        }
    },

    updateChoices: function (choices) {
        if (!this.changed && this.hasFocus) {
            this.update.innerHTML = choices;
            MochiKit.DOM.cleanWhitespace(this.update);
            MochiKit.DOM.cleanWhitespace(this.update.firstChild);

            if (this.update.firstChild && this.update.firstChild.childNodes) {
                this.entryCount = this.update.firstChild.childNodes.length;
                for (var i = 0; i < this.entryCount; i++) {
                    var entry = this.getEntry(i);
                    entry.autocompleteIndex = i;
                    this.addObservers(entry);
                }
            } else {
                this.entryCount = 0;
            }

            this.stopIndicator();

            this.index = 0;
            this.render();
        }
    },

    addObservers: function (element) {
        MochiKit.Event.observe(element, 'mouseover',
            MochiKit.DOM.bindAsEventListener(this.onHover, this));
        MochiKit.Event.observe(element, 'click',
            MochiKit.DOM.bindAsEventListener(this.onClick, this));
    },

    onObserverEvent: function () {
        this.changed = false;
        if (this.getToken().length >= this.options.minChars) {
            this.startIndicator();
            this.getUpdatedChoices();
        } else {
            this.active = false;
            this.hide();
        }
    },

    getToken: function () {
        var tokenPos = this.findLastToken();
        if (tokenPos != -1) {
            var ret = this.element.value.substr(tokenPos + 1).replace(/^\s+/,'').replace(/\s+$/,'');
        } else {
            var ret = this.element.value;
        }
        return /\n/.test(ret) ? '' : ret;
    },

    findLastToken: function () {
        var lastTokenPos = -1;

        for (var i = 0; i < this.options.tokens.length; i++) {
            var thisTokenPos = this.element.value.lastIndexOf(this.options.tokens[i]);
            if (thisTokenPos > lastTokenPos) {
                lastTokenPos = thisTokenPos;
            }
        }
        return lastTokenPos;
    }
}

Ajax.Autocompleter = function (element, update, url, options) {
    this.__init__(element, update, url, options);
};

MochiKit.Base.update(Ajax.Autocompleter.prototype, Autocompleter.Base.prototype);

MochiKit.Base.update(Ajax.Autocompleter.prototype, {
    __init__: function (element, update, url, options) {
        this.baseInitialize(element, update, options);
        this.options.asynchronous = true;
        this.options.onComplete = MochiKit.Base.bind(this.onComplete, this);
        this.options.defaultParams = this.options.parameters || null;
        this.url = url;
    },

    getUpdatedChoices: function () {
        entry = encodeURIComponent(this.options.paramName) + '=' +
            encodeURIComponent(this.getToken());

        this.options.parameters = this.options.callback ?
            this.options.callback(this.element, entry) : entry;

        if (this.options.defaultParams) {
            this.options.parameters += '&' + this.options.defaultParams;
        }
        new Ajax.Request(this.url, this.options);
    },

    onComplete: function (request) {
        this.updateChoices(request.responseText);
    }

});

/***

The local array autocompleter. Used when you'd prefer to
inject an array of autocompletion options into the page, rather
than sending out Ajax queries, which can be quite slow sometimes.

The constructor takes four parameters. The first two are, as usual,
the id of the monitored textbox, and id of the autocompletion menu.
The third is the array you want to autocomplete from, and the fourth
is the options block.

Extra local autocompletion options:
- choices - How many autocompletion choices to offer

- partialSearch - If false, the autocompleter will match entered
                                       text only at the beginning of strings in the
                                       autocomplete array. Defaults to true, which will
                                       match text at the beginning of any *word* in the
                                       strings in the autocomplete array. If you want to
                                       search anywhere in the string, additionally set
                                       the option fullSearch to true (default: off).

- fullSsearch - Search anywhere in autocomplete array strings.

- partialChars - How many characters to enter before triggering
                                    a partial match (unlike minChars, which defines
                                    how many characters are required to do any match
                                    at all). Defaults to 2.

- ignoreCase - Whether to ignore case when autocompleting.
                                Defaults to true.

It's possible to pass in a custom function as the 'selector'
option, if you prefer to write your own autocompletion logic.
In that case, the other options above will not apply unless
you support them.

***/

Autocompleter.Local = function (element, update, array, options) {
    this.__init__(element, update, array, options);
};

MochiKit.Base.update(Autocompleter.Local.prototype, Autocompleter.Base.prototype);

MochiKit.Base.update(Autocompleter.Local.prototype, {
    __init__: function (element, update, array, options) {
        this.baseInitialize(element, update, options);
        this.options.array = array;
    },

    getUpdatedChoices: function () {
        this.updateChoices(this.options.selector(this));
    },

    setOptions: function (options) {
        this.options = MochiKit.Base.update({
            choices: 10,
            partialSearch: true,
            partialChars: 2,
            ignoreCase: true,
            fullSearch: false,
            selector: function (instance) {
                var ret = [];  // Beginning matches
                var partial = [];  // Inside matches
                var entry = instance.getToken();
                var count = 0;

                for (var i = 0; i < instance.options.array.length &&
                    ret.length < instance.options.choices ; i++) {

                    var elem = instance.options.array[i];
                    var foundPos = instance.options.ignoreCase ?
                        elem.toLowerCase().indexOf(entry.toLowerCase()) :
                        elem.indexOf(entry);

                    while (foundPos != -1) {
                        if (foundPos === 0 && elem.length != entry.length) {
                            ret.push('<li><strong>' + elem.substr(0, entry.length) + '</strong>' +
                                elem.substr(entry.length) + '</li>');
                            break;
                        } else if (entry.length >= instance.options.partialChars &&
                            instance.options.partialSearch && foundPos != -1) {
                            if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos - 1, 1))) {
                                partial.push('<li>' + elem.substr(0, foundPos) + '<strong>' +
                                    elem.substr(foundPos, entry.length) + '</strong>' + elem.substr(
                                    foundPos + entry.length) + '</li>');
                                break;
                            }
                        }

                        foundPos = instance.options.ignoreCase ?
                            elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
                            elem.indexOf(entry, foundPos + 1);

                    }
                }
                if (partial.length) {
                    ret = ret.concat(partial.slice(0, instance.options.choices - ret.length))
                }
                return '<ul>' + ret.join('') + '</ul>';
            }
        }, options || {});
    }
});

/***

AJAX in-place editor

see documentation on http://wiki.script.aculo.us/scriptaculous/show/Ajax.InPlaceEditor

Use this if you notice weird scrolling problems on some browsers,
the DOM might be a bit confused when this gets called so do this
waits 1 ms (with setTimeout) until it does the activation

***/

Ajax.InPlaceEditor = function (element, url, options) {
    this.__init__(element, url, options);
};

Ajax.InPlaceEditor.defaultHighlightColor = '#FFFF99';

Ajax.InPlaceEditor.prototype = {
    __init__: function (element, url, options) {
        this.url = url;
        this.element = MochiKit.DOM.getElement(element);

        this.options = MochiKit.Base.update({
            okButton: true,
            okText: 'ok',
            cancelLink: true,
            cancelText: 'cancel',
            savingText: 'Saving...',
            clickToEditText: 'Click to edit',
            okText: 'ok',
            rows: 1,
            onComplete: function (transport, element) {
                new Effect.Highlight(element, {startcolor: this.options.highlightcolor});
            },
            onFailure: function (transport) {
                alert('Error communicating with the server: ' + transport.responseText.stripTags());
            },
            callback: function (form) {
                return MochiKit.Form.serialize(form);
            },
            handleLineBreaks: true,
            loadingText: 'Loading...',
            savingClassName: 'inplaceeditor-saving',
            loadingClassName: 'inplaceeditor-loading',
            formClassName: 'inplaceeditor-form',
            highlightcolor: Ajax.InPlaceEditor.defaultHighlightColor,
            highlightendcolor: '#FFFFFF',
            externalControl: null,
            submitOnBlur: false,
            ajaxOptions: {}
        }, options || {});

        if (!this.options.formId && this.element.id) {
            this.options.formId = this.element.id + '-inplaceeditor';
            if (MochiKit.DOM.getElement(this.options.formId)) {
                // there's already a form with that name, don't specify an id
                this.options.formId = null;
            }
        }

        if (this.options.externalControl) {
            this.options.externalControl = MochiKit.DOM.getElement(this.options.externalControl);
        }

        this.originalBackground = MochiKit.DOM.getStyle(this.element, 'background-color');
        if (!this.originalBackground) {
            this.originalBackground = 'transparent';
        }

        this.element.title = this.options.clickToEditText;

        this.onclickListener = MochiKit.DOM.bindAsEventListener(this.enterEditMode, this);
        this.mouseoverListener = MochiKit.DOM.bindAsEventListener(this.enterHover, this);
        this.mouseoutListener = MochiKit.DOM.bindAsEventListener(this.leaveHover, this);
        MochiKit.Event.observe(this.element, 'click', this.onclickListener);
        MochiKit.Event.observe(this.element, 'mouseover', this.mouseoverListener);
        MochiKit.Event.observe(this.element, 'mouseout', this.mouseoutListener);
        if (this.options.externalControl) {
            MochiKit.Event.observe(this.options.externalControl, 'click', this.onclickListener);
            MochiKit.Event.observe(this.options.externalControl, 'mouseover', this.mouseoverListener);
            MochiKit.Event.observe(this.options.externalControl, 'mouseout', this.mouseoutListener);
        }
    },

    enterEditMode: function (evt) {
        if (this.saving) {
            return;
        }
        if (this.editing) {
            return;
        }
        this.editing = true;
        this.onEnterEditMode();
        if (this.options.externalControl) {
            MochiKit.DOM.hideElement(this.options.externalControl);
        }
        MochiKit.DOM.hideElement(this.element);
        this.createForm();
        this.element.parentNode.insertBefore(this.form, this.element);
        Field.scrollFreeActivate(this.editField);
        // stop the event to avoid a page refresh in Safari
        if (evt) {
            MochiKit.Event.stop(evt);
        }
        return false;
    },

    createForm: function () {
        this.form = document.createElement('form');
        this.form.id = this.options.formId;
        MochiKit.DOM.addElementClass(this.form, this.options.formClassName)
        this.form.onsubmit = MochiKit.Base.bind(this.onSubmit, this);

        this.createEditField();

        if (this.options.textarea) {
            var br = document.createElement('br');
            this.form.appendChild(br);
        }

        if (this.options.okButton) {
            okButton = document.createElement('input');
            okButton.type = 'submit';
            okButton.value = this.options.okText;
            this.form.appendChild(okButton);
        }

        if (this.options.cancelLink) {
            cancelLink = document.createElement('a');
            cancelLink.href = '#';
            cancelLink.appendChild(document.createTextNode(this.options.cancelText));
            cancelLink.onclick = MochiKit.Base.bind(this.onclickCancel, this);
            this.form.appendChild(cancelLink);
        }
    },

    hasHTMLLineBreaks: function (string) {
        if (!this.options.handleLineBreaks) {
            return false;
        }
        return string.match(/<br/i) || string.match(/<p>/i);
    },

    convertHTMLLineBreaks: function (string) {
        return string.replace(/<br>/gi, '\n').replace(/<br\/>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<p>/gi, '');
    },

    createEditField: function () {
        var text;
        if (this.options.loadTextURL) {
            text = this.options.loadingText;
        } else {
            text = this.getText();
        }

        var obj = this;

        if (this.options.rows == 1 && !this.hasHTMLLineBreaks(text)) {
            this.options.textarea = false;
            var textField = document.createElement('input');
            textField.obj = this;
            textField.type = 'text';
            textField.name = 'value';
            textField.value = text;
            textField.style.backgroundColor = this.options.highlightcolor;
            var size = this.options.size || this.options.cols || 0;
            if (size !== 0) {
                textField.size = size;
            }
            if (this.options.submitOnBlur) {
                textField.onblur = MochiKit.Base.bind(this.onSubmit, this);
            }
            this.editField = textField;
        } else {
            this.options.textarea = true;
            var textArea = document.createElement('textarea');
            textArea.obj = this;
            textArea.name = 'value';
            textArea.value = this.convertHTMLLineBreaks(text);
            textArea.rows = this.options.rows;
            textArea.cols = this.options.cols || 40;
            if (this.options.submitOnBlur) {
                textArea.onblur = MochiKit.Base.bind(this.onSubmit, this);
            }
            this.editField = textArea;
        }

        if (this.options.loadTextURL) {
            this.loadExternalText();
        }
        this.form.appendChild(this.editField);
    },

    getText: function () {
        return this.element.innerHTML;
    },

    loadExternalText: function () {
        MochiKit.DOM.addElementClass(this.form, this.options.loadingClassName);
        this.editField.disabled = true;
        new Ajax.Request(
            this.options.loadTextURL,
            MochiKit.Base.update({
                asynchronous: true,
                onComplete: MochiKit.Base.bind(this.onLoadedExternalText, this)
            }, this.options.ajaxOptions)
        );
    },

    onLoadedExternalText: function (transport) {
        MochiKit.DOM.removeElementClass(this.form, this.options.loadingClassName);
        this.editField.disabled = false;
        this.editField.value = transport.responseText.stripTags();
    },

    onclickCancel: function () {
        this.onComplete();
        this.leaveEditMode();
        return false;
    },

    onFailure: function (transport) {
        this.options.onFailure(transport);
        if (this.oldInnerHTML) {
            this.element.innerHTML = this.oldInnerHTML;
            this.oldInnerHTML = null;
        }
        return false;
    },

    onSubmit: function () {
        // onLoading resets these so we need to save them away for the Ajax call
        var form = this.form;
        var value = this.editField.value;

        // do this first, sometimes the ajax call returns before we get a
        // chance to switch on Saving which means this will actually switch on
        // Saving *after* we have left edit mode causing Saving to be
        // displayed indefinitely
        this.onLoading();

        new Ajax.Updater(
            {
                success: this.element,
                 // dont update on failure (this could be an option)
                failure: null
            },
            this.url,
            MochiKit.Base.update({
                parameters: this.options.callback(form, value),
                onComplete: MochiKit.Base.bind(this.onComplete, this),
                onFailure: MochiKit.Base.bind(this.onFailure, this)
            }, this.options.ajaxOptions)
        );
        // stop the event to avoid a page refresh in Safari
        if (arguments.length > 1) {
            MochiKit.Event.stop(arguments[0]);
        }
        return false;
    },

    onLoading: function () {
        this.saving = true;
        this.removeForm();
        this.leaveHover();
        this.showSaving();
    },

    showSaving: function () {
        this.oldInnerHTML = this.element.innerHTML;
        this.element.innerHTML = this.options.savingText;
        MochiKit.DOM.addElementClass(this.element, this.options.savingClassName);
        this.element.style.backgroundColor = this.originalBackground;
        MochiKit.DOM.showElement(this.element);
    },

    removeForm: function () {
        if (this.form) {
            if (this.form.parentNode) {
                MochiKit.DOM.removeElement(this.form);
            }
            this.form = null;
        }
    },

    enterHover: function () {
        if (this.saving) {
            return;
        }
        this.element.style.backgroundColor = this.options.highlightcolor;
        if (this.effect) {
            this.effect.cancel();
        }
        MochiKit.DOM.addElementClass(this.element, this.options.hoverClassName)
    },

    leaveHover: function () {
        if (this.options.backgroundColor) {
            this.element.style.backgroundColor = this.oldBackground;
        }
        MochiKit.DOM.removeElementClass(this.element, this.options.hoverClassName)
        if (this.saving) {
            return;
        }
        this.effect = new Effect.Highlight(this.element, {
            startcolor: this.options.highlightcolor,
            endcolor: this.options.highlightendcolor,
            restorecolor: this.originalBackground
        });
    },

    leaveEditMode: function () {
        MochiKit.DOM.removeElementClass(this.element, this.options.savingClassName);
        this.removeForm();
        this.leaveHover();
        this.element.style.backgroundColor = this.originalBackground;
        MochiKit.DOM.showElement(this.element);
        if (this.options.externalControl) {
            MochiKit.DOM.showElement(this.options.externalControl);
        }
        this.editing = false;
        this.saving = false;
        this.oldInnerHTML = null;
        this.onLeaveEditMode();
    },

    onComplete: function (transport) {
        this.leaveEditMode();
        MochiKit.Base.bind(this.options.onComplete, this)(transport, this.element);
    },

    onEnterEditMode: function () {},

    onLeaveEditMode: function () {},

    dispose: function () {
        if (this.oldInnerHTML) {
            this.element.innerHTML = this.oldInnerHTML;
        }
        this.leaveEditMode();
        MochiKit.Event.stopObserving(this.element, 'click', this.onclickListener);
        MochiKit.Event.stopObserving(this.element, 'mouseover', this.mouseoverListener);
        MochiKit.Event.stopObserving(this.element, 'mouseout', this.mouseoutListener);
        if (this.options.externalControl) {
            MochiKit.Event.stopObserving(this.options.externalControl, 'click', this.onclickListener);
            MochiKit.Event.stopObserving(this.options.externalControl, 'mouseover', this.mouseoverListener);
            MochiKit.Event.stopObserving(this.options.externalControl, 'mouseout', this.mouseoutListener);
        }
    }
};

