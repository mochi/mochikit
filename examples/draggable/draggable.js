/*

    Drag: A Really Simple Drag Handler
    
*/
Drag = {
    start: function(e) {
        e.stop();
        
        // We need to remember what we're dragging.
        Drag._target = e.target();
        
        /*
            There's no cross-browser way to get offsetX and offsetY, so we
            have to do it ourselves. For performance, we do this once and
            cache it.
        */
        Drag._offset = Drag._diff(
            e.mouse().page,
            MochiKit.DOM.elementPosition(Drag._target));
        
        MochiKit.Signal.connect(document, 'onmousemove', Drag._drag);
        MochiKit.Signal.connect(document, 'onmouseup', Drag._stop);
    },

    _offset: null,
    _target: null,
    
    _diff: function(lhs, rhs) {
        return new MochiKit.DOM.Coordinates(lhs.x - rhs.x, lhs.y - rhs.y);
    },
        
    _drag: function(e) {
        e.stop();
        MochiKit.DOM.setElementPosition(
            Drag._target,
            Drag._diff(e.mouse().page, Drag._offset));
    },
    
    _stop: function(e) {
        MochiKit.Signal.disconnect(document, 'onmousemove', Drag._drag);
        MochiKit.Signal.disconnect(document, 'onmouseup', Drag._stop);
    }
};

MochiKit.Signal.connect(window, 'onload',   
    function() {
        /*
            Find all DIVs tagged with the draggable class, and connect them to
            the Drag handler.
        */
        var d = MochiKit.DOM.getElementsByTagAndClassName('DIV', 'draggable');
        MochiKit.Iter.forEach(d,
            function(elem) {
                MochiKit.Signal.connect(elem, 'onmousedown', Drag.start);
            });
    });
    
// rewrite the view-source links
addLoadEvent(function () {
    var elems = getElementsByTagAndClassName("A", "view-source");
    var page = "draggable/";
    for (var i = 0; i < elems.length; i++) {
        var elem = elems[i];
        var href = elem.href.split(/\//).pop();
        elem.target = "_blank";
        elem.href = "../view-source/view-source.html#" + page + href;
    }
});
