/**
 * This file is basically a "folder module",
 * meaning all the files in the folder
 * are being exported from this module,
 * so you can do:
 * @example
 * import { all, chain, Deferred } from 'mochikit/async';
 *
 * This should work with modern-day module bundlers
 * like Rollup, because it uses a technique called
 * 'tree shaking' which basically means only the needed
 * modules are included in the bundles.
 */

export { default as asyncCatch } from './asyncCatch';
export { default as asyncThen } from './asyncThen';
export { default as callLater } from './callLater';
export { default as catchSilent } from './catchSilent';
export { default as chain } from './chain';
export { default as defer } from './defer';
export { default as double } from './double';
export { default as failAfter } from './failAfter';
export { default as getArrayBuffer } from './getArrayBuffer';
export { default as getBlob } from './getBlob';
export { default as getForm } from './getForm';
export { default as getJSON } from './getJSON';
export { default as getText } from './getText';
export { default as isAsync } from './isAsync';
export { default as isPromise } from './isPromise';
export { default as isThenable } from './isThenable';
export { default as prevent } from './prevent';
export { default as simpleXHR } from './simpleXHR';
export { default as succeedAfter } from './succeedAfter';
export { default as tap } from './tap';
export { default as tapFinally } from './tapFinally';
export { default as whenSettled } from './whenSettled';

export const __repr__ = '[MochiKit.Async]';
