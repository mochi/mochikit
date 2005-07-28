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
        "MochiKit.DOM"
    ]
});
dojo.hostenv.moduleLoaded("MochiKit.*");
