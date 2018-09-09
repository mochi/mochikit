//Must be precise with Rollup. It doesn't understand /(index.js) shorthand afaik.
import * as async from './async/index.js';
import * as asyncnet from './asyncnet/index.js';
import * as base from './base/index.js';
import * as color from './color/index.js';
import * as data from './data/index.js';
import * as datetime from './datetime/index.js';
import * as dom from './dom/index.js';
import * as func from './func/index.js';
import * as iter from './iter/index.js';
import * as logging from './logging/index.js';
import * as repr from './repr/index.js';

//Collect the variables in MochiKit.
let MochiKit = { 
    async, 
    asyncnet,
    base, 
    color, 
    data,
    datetime,
    dom, 
    func, 
    iter, 
    logging, 
    repr 
};
MochiKit.version = {
    /*major:x, minor:x, patch:x*/
};

//Full build meaning all packages have been imported:
MochiKit.name = '[MochiKit full-build]';
export default MochiKit;
