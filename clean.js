const fs = require('fs');
const path = require('path');
const process = require('process');

exports.clean = function(directory) {
    directory = process.cwd() + `/${directory}`;
    console.log(`Cleaning up the ${directory} directory...`);

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            if (file !== '.gitignore') {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        }
    });
};