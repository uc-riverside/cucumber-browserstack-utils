const report = require('multiple-cucumber-html-reporter');
let argv = require('minimist')(process.argv.slice(2));

report.generate({
    openReportInBrowser: argv.openReportInBrowser || true,
    saveCollectedJSON: argv.saveCollectedJSON || true,
    disableLog: argv.disableLog || true,
    pageTitle: argv.pageTitle || 'Cucumber HTML Report',
    displayDuration: argv.displayDuration || true,
    jsonDir: argv.jsonDir || './out/',
    reportPath: argv.reportPath || './reports/',
    customData: {
        title: 'Run info',
        data: [
            {label: 'Project', value: argv.projectName || 'Unknown Project'},
            {label: 'Release', value: argv.projectVersion || 'Unknown Version'}
        ]
    }
});