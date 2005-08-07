XXXX-XX-XX      v0.80

- Added lstrip, rstrip, strip to MochiKit.Format
- Added updateNodeAttributes, appendChildNodes, replaceChildNodes to
  MochiKit.DOM
- MochiKit.Iter.iextend now has a fast-path for array-like objects
- Added HSV color space support to MochiKit.Visual
- Fixed a bug in the sortable_tables example, it now converts types
  correctly
- Fixed a bug where MochiKit.DOM referenced MochiKit.Iter.next from global
  scope

2005-08-04      v0.70

- New ajax_tables example, which shows off XMLHttpRequest, ajax, json, and
  a little TAL-ish DOM templating attribute language.
- sendXMLHttpRequest and functions that use it (loadJSONDoc, etc.) no longer
  ignore requests with status == 0, which seems to happen for cached or local
  requests
- Added sendXMLHttpRequest to MochiKit.Async.EXPORT, d'oh.
- Changed scrapeText API to return a string by default.  This is API-breaking!
  It was dumb to have the default return value be the form you almost never
  want.  Sorry.
- Added special form to swapDOM(dest, src).  If src is null, dest is removed
  (where previously you'd likely get a DOM exception).
- Added three new functions to MochiKit.Base for dealing with URL query
  strings: urlEncode, queryString, parseQueryString
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
