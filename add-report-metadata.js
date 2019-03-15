let fs = require('fs');
let process = require('process');
let argv = require('minimist')(process.argv.slice(2));

console.log(`Adding report metadata to cucumber output file ${argv.file}`);

let platforms = [
    'windows',
    'osx',
    'linux',
    'ubuntu',
    'android',
    'ios'
];

if (platforms.indexOf(argv.os) < 0) {
    throw new Error('os needs to be one of ' + platforms.toString());
}

let metadata = {
    "browser": {
        "name": argv.browser,
        "version": argv.browserVersion
    },
    "device": argv.device || 'Unknown',
    "platform": {
        "name": argv.os,
        "version": argv.osVersion
    }
};

let filePath = process.cwd() + '/' + argv.file;
filePath = filePath.replace(/\\/g,"/");
let file = require(filePath);
file[0].metadata = metadata;

fs.writeFile(filePath, JSON.stringify(file), function (err) {
    if (err) return console.log(err);
});