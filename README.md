### BrowserStack/cucumber-js/typescript Utils

This package will dynamically generate npm scripts to run cucumber-tsflow tests against cucumber feature definitions based on
device configuration files located in the devices directory. Each feature will be tested against each device.

Note: If a feature file ends in .mobile.feature it will only run against mobile devices. If a feature file ends in .desktop.feature it
will only run against desktop devices (osx/windows).

After installing this package, add the following npm scripts:

```json
"cucumber": "./node_modules/.bin/cucumber-js",
"test": "npm-run-all --continue-on-error generate-feature-scripts test-features generate-report",
"test-features": "npm-run-all --continue-on-error feature:*",
"generate-feature-scripts": "./node_modules/.bin/generate-feature-scripts",
"generate-report": "node ./node_modules/@ucr/cucumber-browserstack-utils/generate-html-report --openReportInBrowser=false --saveCollectedJSON=true --disableLog=true --pageTitle=\"Report Name\" --displayDuration=true --jsonDir=./out/ --reportPath=./reports/ --projectVersion=1.0.0 --projectName=\"Project Name\""
```

Expected dir structure:
```
- conf
  - devices
    - windows10-chrome.conf.js
    - other-device-config.conf.js
- features
  - step-definitions
    - def1.steps.ts
    - def2.steps.ts
  - support
    - shared-state.ts
    - step-base.ts
  - test1.feature
  - test2.feature
```