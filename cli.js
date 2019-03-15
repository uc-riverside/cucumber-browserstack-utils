#!/usr/bin/env node

let argv = require('minimist')(process.argv.slice(2));
let gfs = require('./generate-feature-scripts');
let clean = require('./clean');

gfs.generateFeatureScripts();

if (argv.clean) {
    clean.clean(argv.clean || './out');
}