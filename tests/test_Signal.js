if (typeof(dojo) != 'undefined') { dojo.require('MochiKit.Signal'); }
if (typeof(JSAN) != 'undefined') { JSAN.use('MochiKit.Signal'); }
if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Signal = function (t) {
    
    var submit = MochiKit.DOM.getElement('submit');
    var ident = null;
    var i = 0;
    var aFunction = function() {
        i++;
        if (typeof(this.someVar) != 'undefined') {
            i += this.someVar;
        }
    };
    
    var aObject = {};
    aObject.aMethod = function() {
        i++;
    };

    ident = connect('submit', 'onclick', aFunction);
    MochiKit.DOM.getElement('submit').click();
    t.is(i, 1, 'HTML onclick event can be connected to a function');

    disconnect(ident);
    MochiKit.DOM.getElement('submit').click();
    t.is(i, 1, 'HTML onclick can be disconnected from a function');

    var submit = MochiKit.DOM.getElement('submit');

    ident = connect(submit, 'onclick', aFunction);
    submit.click();
    t.is(i, 2, 'Checking that a DOM element can be connected to a function');

    disconnect(ident);
    submit.click();
    t.is(i, 2, '...and then disconnected');    
    
    if (MochiKit.DOM.getElement('submit').fireEvent || 
        (document.createEvent && 
        (typeof(document.createEvent('MouseEvents').initMouseEvent) == 'function'))) {
        
        /* 
        
            Adapted from: 
            http://www.devdaily.com/java/jwarehouse/jforum/tests/selenium/javascript/htmlutils.js.shtml
            License: Apache
            Copyright: Copyright 2004 ThoughtWorks, Inc
            
        */
        var triggerMouseEvent = function(element, eventType, canBubble) {
            element = MochiKit.DOM.getElement(element);
            canBubble = (typeof(canBubble) == 'undefined') ? true : canBubble;
            if (element.fireEvent) {
                var newEvt = document.createEventObject();
                newEvt.clientX = 1;
                newEvt.clientY = 1;
                newEvt.button = 1;
                element.fireEvent('on' + eventType, newEvt);
            } else if (document.createEvent && (typeof(document.createEvent('MouseEvents').initMouseEvent) == 'function')) {
                var evt = document.createEvent('MouseEvents');
                evt.initMouseEvent(eventType, canBubble, true, // event, bubbles, cancelable
                    document.defaultView, 1, // view, # of clicks
                    1, 0, 0, 0, // screenX, screenY, clientX, clientY
                    false, false, false, false, // ctrlKey, altKey, shiftKey, metaKey
                    0, null); // buttonCode, relatedTarget
                element.dispatchEvent(evt);
            }
        };

        var eventTest = function(e) {
            i++;
            t.ok((typeof(e.event()) === 'object'), 'checking that event() is an object');
            t.ok((typeof(e.type()) === 'string'), 'checking that type() is a string');
            t.ok((e.target() === MochiKit.DOM.getElement('submit')), 'checking that target is "submit"');
            t.ok((typeof(e.modifier()) === 'object'), 'checking that modifier() is an object');
            t.ok(e.modifier().alt === false, 'checking that modifier().alt is defined, but false');
            t.ok(e.modifier().ctrl === false, 'checking that modifier().ctrl is defined, but false');
            t.ok(e.modifier().meta === false, 'checking that modifier().meta is defined, but false');
            t.ok(e.modifier().shift === false, 'checking that modifier().shift is defined, but  false');
            t.ok((typeof(e.mouse()) === 'object'), 'checking that mouse() is an object');
            t.ok((typeof(e.mouse().button) === 'object'), 'checking that mouse().button is an object');
            t.ok(e.mouse().button.left === true, 'checking that mouse().button.left is true');
            t.ok(e.mouse().button.middle === false, 'checking that mouse().button.middle is false');
            t.ok(e.mouse().button.right === false, 'checking that mouse().button.right is false');
            t.ok((typeof(e.mouse().page) === 'object'), 'checking that mouse().page is an object');
            t.ok((typeof(e.mouse().page.x) === 'number'), 'checking that mouse().page.x is a number');
            t.ok((typeof(e.mouse().page.y) === 'number'), 'checking that mouse().page.y is a number');
            t.ok((typeof(e.mouse().client) === 'object'), 'checking that mouse().client is an object');
            t.ok((typeof(e.mouse().client.x) === 'number'), 'checking that mouse().client.x is a number');
            t.ok((typeof(e.mouse().client.y) === 'number'), 'checking that mouse().client.y is a number');

            /* these should not be defined */
            t.ok((typeof(e.relatedTarget()) === 'undefined'), 'checking that relatedTarget() is undefined');
            t.ok((typeof(e.key()) === 'undefined'), 'checking that key() is undefined');
        };

        
        ident = connect('submit', 'onmousedown', eventTest);
        triggerMouseEvent('submit', 'mousedown', false);
        t.is(i, 3, 'Connecting an event to an HTML object and firing a synthetic event');

        disconnect(ident);
        triggerMouseEvent('submit', 'mousedown', false);
        t.is(i, 3, 'Disconnecting an event to an HTML object and firing a synthetic event');
        
    }    
};