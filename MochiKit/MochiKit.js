/***

MochiKit.MochiKit 1.5

See <http://mochikit.com/> for documentation, downloads, license, etc.

(c) 2005 Bob Ippolito.  All rights Reserved.

***/
//Must be precise with Rollup. It doesn't understand /(index.js) shorthand afaik.
import * as async from './async/index.js';
import * as base from './base/index.js';
import * as color from './color/index.js';
import * as dom from './dom/index.js';
import * as func from './func/index.js';
import * as logging from './logging/index.js';
import * as repr from './repr/index.js';

//Collect the variables in MochiKit.
let MochiKit = { async, base, color, dom, func, logging, repr };
MochiKit.version = {
    /*major:x, minor:x, patch:x*/
};

//Full build meaning all packages have been imported:
MochiKit.name = '[MochiKit full-build]';
export default MochiKit;

//Also export the submodules.
export {
    async,
    dom,
    repr
};