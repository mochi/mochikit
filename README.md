# MochiKit

[![Build Status](https://travis-ci.org/w0298i/mochikit.svg?branch=master)](https://travis-ci.org/w0298i/mochikit)

## A quick warning ⚠
This library is undergoing a **huge** change, for consistent tested behaviour, use the /packed/MochiKit.legacy.js in deployment. This new version has been "read-tested" by me, meaning it **should** work but proper testing has not yet been implemented. Think of this as a new major version of MochiKit that is still in the dev stage. The current state of this new redo is `UNSTABLE_USABLE`. Please do not use the .js files in the top dir of MochiKit either, as when methods are converted to es6, the older method is removed to keep up.

## Making JavaScript better and easier.

## What MochiKit is
MochiKit is a highly documented, maintained and well-tested library that consists of "submodules" which all provide the shit that goes into MochiKit. The end result is a modular, customizable library that is great for the web and the server. I have refactored this library to use es6 modules, which are great for being modular, especially with Rollup's tree-shaking feature, meaning only the required modules are bundled, meaning a faster client-side experience.

## Demos
You can see how MochiKit works by checking out our suite of demos, at http://mochi.github.io/mochikit/demos.html.
See http://mochi.github.com/mochikit/about.html for more information about MochiKit, and http://mochi.github.io/mochikit/doc/html/MochiKit/index.html for documentation.

## Issues
Find a bug? Throw us a line, submit an issue request! 
To contribute to this project, make a pull request, more info on making a GitHub pull request here: https://services.github.com/on-demand/github-cli/open-pull-request-github
