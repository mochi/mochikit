if (typeof(dojo) != 'undefined') { dojo.require('MochiKit.Signal'); }
if (typeof(JSAN) != 'undefined') { JSAN.use('MochiKit.Signal'); }
if (typeof(tests) == 'undefined') { tests = {}; }

tests.test_Signal = function (t) {
    
    var hasNoSignals = {};
    
    var hasSignals = {someVar: 1};
    register_signals(hasSignals, ['signalOne', 'signalTwo']);

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
    
    aObject.bMethod = function() {
        i++;
    };
    
    var bObject = {};
    bObject.bMethod = function() {
        i++;
    };

    connect(hasSignals, 'signalOne', aFunction);
    signal(hasSignals, 'signalOne');
    t.is(i, 2, 'Connecting function');

    disconnect(hasSignals, 'signalOne', aFunction);
    signal(hasSignals, 'signalOne');
    t.is(i, 2, 'Disconnecting function');

    connect(hasSignals, 'signalOne', aObject, aObject.aMethod);
    signal(hasSignals, 'signalOne');
    t.is(i, 3, 'Connecting obj-function');

    disconnect(hasSignals, 'signalOne', aObject, aObject.aMethod);
    signal(hasSignals, 'signalOne');
    t.is(i, 3, 'Disconnecting obj-function');

    connect(hasSignals, 'signalTwo', aObject, 'aMethod');
    signal(hasSignals, 'signalTwo');
    t.is(i, 4, 'Connecting obj-string');

    disconnect(hasSignals, 'signalTwo', aObject, 'aMethod');
    signal(hasSignals, 'signalTwo');
    t.is(i, 4, 'Disconnecting obj-string');

    var shouldRaise = function() {
      return undefined.attr;
    };

    try {
        connect(hasSignals, 'signalOne', shouldRaise);
        signal(hasSignals, 'signalOne');
        disconnect(hasSignals, 'signalOne', shouldRaise);
        t.ok(false, 'An exception was not raised');
    } catch (e) {
        t.ok(true, 'An exception was raised');
    }
    
    connect('submit', 'onclick', aFunction);
    $('submit').click();
    t.is(i, 5, 'HTML onclick event can be connected to a function');

    disconnect('submit', 'onclick', aFunction);
    $('submit').click();
    t.is(i, 5, 'HTML onclick can be disconnected from a function');

    var submit = $('submit');

    connect(submit, 'onclick', aFunction);
    submit.click();
    t.is(i, 6, 'Checking that a DOM element can be connected to a function');

    disconnect(submit, 'onclick', aFunction);
    submit.click();
    t.is(i, 6, '...and then disconnected');

    // FIXME: The rest of the tests fail.
    connect(hasSignals, 'signalOne', aObject, 'aMethod');
    connect(hasSignals, 'signalOne', aObject, 'bMethod');
    signal(hasSignals, 'signalOne');
    t.is(i, 8, 'Connecting one signal to two slots in one object');
    
    disconnect(hasSignals, 'signalOne', aObject, 'aMethod');
    disconnect(hasSignals, 'signalOne', aObject, 'bMethod');
    signal(hasSignals, 'signalOne');
    t.is(i, 8, 'Disconnecting one signal to two slots in one object');

    connect(hasSignals, 'signalOne', aObject, 'aMethod');
    connect(hasSignals, 'signalOne', bObject, 'bMethod');
    signal(hasSignals, 'signalOne');
    t.is(i, 10, 'Connecting one signal to two slots in two different objects');

    disconnect(hasSignals, 'signalOne', aObject, 'aMethod');
    disconnect(hasSignals, 'signalOne', bObject, 'bMethod');
    signal(hasSignals, 'signalOne');
    t.is(i, 10, 'Disconnecting one signal to two slots in two different objects');
    
    // FIXME: need tests for the Event object.

};
