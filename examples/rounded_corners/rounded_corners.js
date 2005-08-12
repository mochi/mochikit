var roundedCornersOnLoad = function () {
    swapDOM("visual_version", SPAN(null, MochiKit.Visual.VERSION));
    roundClass("h1", null);
    roundClass("h2", null, {corners: "bottom"});
    syntaxHighlight();
};
