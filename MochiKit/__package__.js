dojo.hostenv.conditionalLoadModule({
    "common": [
        "MochiKit.Base",
        "MochiKit.Iter",
        "MochiKit.Logging",
        "MochiKit.DateTime",
        "MochiKit.Format",
        "MochiKit.Async",
        "MochiKit.Visual"
    ],
    "browser": [
        "MochiKit.DOM",
        "MochiKit.LoggingPane"
    ]
});
dojo.hostenv.moduleLoaded("MochiKit.*");
