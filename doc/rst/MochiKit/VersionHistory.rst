XXXX-XX-XX      v0.70

- MochiKit.DOM.createDOM will now use attr[k] = v for all browsers if the name
  starts with "on" (e.g. "onclick").  If v is a string, it will set it to
  new Function(v).
- Another workaround for Internet "worst browser ever" Explorer's setAttribute
  usage in MochiKit.DOM.createDOM (checked -> defaultChecked).
- Added UL, OL, LI convenience createDOM aliases to MochiKit.DOM
- Packing is now done by Dojo's custom Rhino interpreter, so it's much smaller
  now!

2005-07-29      v0.60

- Beefed up the MochiKit.DOM test suite
- Fixed return value for MochiKit.DOM.swapElementClass, could return
  false unexpectedly before
- Added an optional "parent" argument to
  MochiKit.DOM.getElementsByTagAndClassName
- Added a "packed" version in packed/MochiKit/MochiKit.js
- Changed build script to rewrite the URLs in tests to account for the
  JSAN-required reorganization
- MochiKit.Compat to potentially work around IE 5.5 issues
  (5.0 still not supported).  Test.Simple doesn't seem to work there,
  though.
- Several minor documentation corrections

2005-07-27      v0.50

- Initial Release
