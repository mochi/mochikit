/***

MochiKit.MochiKit 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
//Must be precise with Rollup. It doesn't understand /(index.js) shorthand afaik.
import * as async from './async/index.js';
import * as dom from './dom/index.js';
import * as repr from './repr/index.js';
import * as base from './base/index.js';

//Collect the variables in MochiKit.
let MochiKit = { async, dom, repr, base };
MochiKit.version = {
    /*major:x, minor:x, patch:x*/
};

//Full build meaning all packages have been imported:
MochiKit.name = '[MochiKit full-build]';

if (typeof console.log === 'function') {
    let {
        version: { major, minor, patch }
    } = MochiKit;
    console.log(`MochiKit version ${major}.${minor}.${patch} loaded!`);
}

export default MochiKit;

//Also export the submodules.
export {
    async,
    dom,
    repr
};