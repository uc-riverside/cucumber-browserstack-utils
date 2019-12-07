let fs = require('fs');
let path = require('path');
let process = require('process');

exports.generateFeatureScripts = function() {
    // List all files in a directory in Node.js recursively in a synchronous fashion
    let getDirFileList = function (dir, filelist, filterPattern) {
        files = fs.readdirSync(dir);
        filelist = filelist || [];
        files.forEach(function (file) {
            if (fs.statSync(path.join(dir, file)).isDirectory()) {
                filelist = getDirFileList(path.join(dir, file), filelist, filterPattern);
            }
            else if (file.indexOf(filterPattern) >= 0) {
                filelist.push(path.join(dir, file).replace('\\', '/'));
            }
        });
        return filelist;
    };

    let getFeatureFileList = function (dir) {
        return getDirFileList(dir, null, '.feature');
    };

    let generateFeatureScripts = function (featureFile, featureDir, testDevices) {
        let testMobile = featureFile.indexOf('.mobile.feature') >= 0;
        let testDesktop = featureFile.indexOf('.desktop.feature') >= 0;

        //If neither desktop or mobile is specifically called out, then generate tests for both
        if (!testDesktop && !testMobile) {
            testMobile = true;
            testDesktop = true;
        }

        let devicesToAdd = testDevices.filter((device) => {
            if (testMobile && device.isMobile) {
                return true;
            }
            else if (testDesktop && !device.isMobile) {
                return true;
            }
            else {
                return false;
            }
        });

        let featureFilePathParts = featureFile.replace(/\\/g,"/").split('/');
        let featureFileNoPath = featureFilePathParts[featureFilePathParts.length - 1];
        let featureName = featureFileNoPath.replace('.desktop', '').replace('.mobile', '').replace('.feature', '');

        let featureScripts = [
            {key: `feature:${featureName}`, value: `npm-run-all --continue-on-error test:${featureName}:* metadata:${featureName}:*`}
        ];

        devicesToAdd.forEach((device) => {
            let configFilePathParts = device.configFile.replace(/\\/g,"/").split('/');
            let configFileNoPath = configFilePathParts[configFilePathParts.length - 1];
            let configName = configFileNoPath;
            let jsonFilePath = `out/${featureName}-${configName}.json`;

            featureScripts.push({
                key: `test:${featureName}:${configName}`,
                value: `cross-env CONFIG_FILE=${configFileNoPath} ./node_modules/.bin/cucumber-js --require-module ts-node/register --require features/step-definitions/**/*.ts --format json > ${jsonFilePath} ${featureDir}/${featureFileNoPath}`
            });

            featureScripts.push({
                key: `metadata:${featureName}:${configName}`,
                value: `node ./node_modules/@ucr/cucumber-browserstack-utils/add-report-metadata --file=${jsonFilePath} --browser=${device.browser} --browserVersion=${device.browserVersion} --os=${device.os} --osVersion=${device.osVersion} --device="${device.deviceDesc}"`
            });
        });

        return featureScripts;
    };

    let generateDeviceConfigurations = function (confDir) {
        let testDevices = [];
        let confFiles = getDirFileList(confDir, null, '.conf.js');

        confFiles.forEach((confFile) => {
            let file = require(confFile);
            let capabilities = file.config.capabilities[0];

            let confPathParts = confFile.split('/');
            let confFileNoPath = confPathParts[confPathParts.length - 1];
            let configFileName = confFileNoPath.replace('.conf.js', '');
            let isMobile = capabilities.real_mobile ? capabilities.real_mobile.toString() === 'true' : false;
            let os = capabilities.os || '';
            if (os === '') {
                if (capabilities.device) {
                    os = capabilities.device.toLowerCase().indexOf('iphone') >= 0 ? 'ios' : 'android';
                }
            }
            os = os.toLowerCase().replace(' ', '');
            let osVersion = capabilities.os_version || capabilities.osVersion;

            let device = {
                isMobile: isMobile,
                configFile: configFileName, //'windows10-chrome',
                jsonFile: `${configFileName}.json`, //'desktop-windows-chrome.json',
                browser: capabilities.browser_name || capabilities.browserName,
                browserVersion: capabilities.browser_version || capabilities.browserVersion,
                os: os,
                osVersion: osVersion,
                deviceDesc: capabilities.name
            };
            testDevices.push(device);
        });

        return testDevices;
    };

    let featureDir = 'features';
    let confDir = 'conf/devices';
    let featureFiles = getFeatureFileList(process.cwd() + '/' + featureDir);
    let testDevices = generateDeviceConfigurations(process.cwd() + '/' + confDir);

    let featureScripts = [];
    featureFiles.forEach((file) => {
        generateFeatureScripts(file, featureDir, testDevices).forEach((n) => {
            if (!featureScripts.find(m => m.key === n.key)) {
                featureScripts.push(n);
            }
        });
    });

    let file = process.cwd() + '/package.json';
    let packageJson = require(file);

    for (const key in packageJson.scripts) {
        if (packageJson.scripts.hasOwnProperty(key) && (key.indexOf('feature:') >= 0 || key.indexOf('test:') >= 0 || key.indexOf('metadata:') >= 0)) {
            delete packageJson.scripts[key];
        }
    }

    featureScripts.forEach((n) => {
        packageJson.scripts[n.key] = n.value;
    });

    fs.writeFile(file, JSON.stringify(packageJson, null, 2), function (err) {
        if (err) return console.log(err);
    });

    console.log('package.json has been updated with feature test scripts');
};