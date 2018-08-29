/***

MochiKit.MochiKit 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
//Must be precise with Rollup. It doesn't understand /(index.js) shorthand afaik.
import * as async from './async/index.js';
import * as dom from './dom/index.js';
import * as repr from './repr/index.js';

//Collect the variables in MochiKit.
let MochiKit = { async, dom, repr };
MochiKit.version = {
    /*major:x, minor:x, patch:x*/
};
MochiKit.name = '[MochiKit full-build]';

if (typeof console.log === 'function') {
    let {
        version: { major, minor, patch }
    } = MochiKit;
    console.log(`MochiKit version ${major}.${minor}.${patch} loaded!`);
}

export default MochiKit;
