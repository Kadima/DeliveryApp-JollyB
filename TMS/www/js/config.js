'use strict';
var appConfig = angular.module( 'TMS.config', [] );
appConfig.constant( 'ENV', {
    website: 'www.sysfreight.net/app/tms/jollyb',
      api: 'www.sysfreight.net/apis/tms/jollyb',
    //  api:  'localhost:9679',
    reset: {
        'website': 'www.sysfreight.net/app/tms/jollyb',
        'api': 'www.sysfreight.net/apis/tms/jollyb',
        'port': '8081'
    },


    websql: {
      name: 'TmsDB',
      version: '1.0',
      displayName: 'TMS Database',
      estimatedSize: 10 * 11024 * 1024
        },
        sqlite: {
          name: 'AppTms.db',
          location: 'default'
        },
    port: '8081', // http port no
    ssl: false,
    debug: true,
    mock: false,
    fromWeb: true,
    wifi:true,
    appId: '9CBA0A78-7D1D-49D3-BA71-C72E93F9E48F',
    apkName: 'TMS-JollyB',
    updateFile: 'update.json',
    rootPath: 'JollyB',
    configFile: 'config.txt',
    version: '1.0.2.33',
    apiMap: {
        login: {
            check : '/api/tms/login/check'
        }
    }
} );
