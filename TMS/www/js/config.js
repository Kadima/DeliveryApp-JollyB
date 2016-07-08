'use strict';
var appConfig = angular.module( 'TMS.config', [] );
appConfig.constant( 'ENV', {
    website: 'www.sysfreight.net/app/tms/jollyb',
     api: 'www.sysfreight.net/apis/tms/jollyb',
    // api:  'localhost:9679',
    reset: {
        'website': 'www.sysfreight.net/app/tms/jollyb',
        'api': 'www.sysfreight.net/apis/tms/jollyb',
        'port': '8081'
    },
    port: '8081', // http port no
    ssl: false,
    debug: true,
    mock: false,
    fromWeb: true,
    appId: '9CBA0A78-7D1D-49D3-BA71-C72E93F9E48F',
    apkName: 'TMS',
    updateFile: 'update.json',
    rootPath: 'JollyB',
    configFile: 'config.txt',
    version: '1.0.2.27',
    apiMap: {
        login: {
            check : '/api/tms/login/check'
        }
    }
} );
