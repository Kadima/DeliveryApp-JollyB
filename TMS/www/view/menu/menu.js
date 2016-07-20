'use strict';
app.controller( 'IndexCtrl', [ 'ENV', '$ionicPlatform', '$scope', '$state', '$rootScope', '$http',
  '$ionicLoading', '$ionicPopup', '$ionicSideMenuDelegate', '$cordovaAppVersion', '$cordovaFile', '$cordovaToast', '$cordovaSQLite', 'ApiService','SqlService','PopupService',
  function ( ENV, $ionicPlatform, $scope, $state, $rootScope, $http, $ionicLoading, $ionicPopup,
        $ionicSideMenuDelegate, $cordovaAppVersion, $cordovaFile, $cordovaToast, $cordovaSQLite, ApiService,SqlService,PopupService ) {
        $scope.Status = {
            Login: false
        };
        var showQRcode = function(){
        var qrcode = new QRCode(document.getElementById('qrcode'), {
            // text: ENV.website + '/' + ENV.apkName + '.apk',
            text:ApiService.Url(ApiService.Uri( false, '/' + ENV.apkName + '.apk')),
            width: 174,
            height: 174,
            colorDark : '#000000',
            colorLight : '#ffffff',
            correctLevel : QRCode.CorrectLevel.H
        });
    };
        var deleteLogin = function () {
          SqlService.Del('Users','','')
          .then(function (res)
           {
             $rootScope.$broadcast( 'logout' );
             $state.go( 'index.login', {}, {} );
          });

        };
    $scope.logout = function () {
      PopupService.Confirm(null,'','Log Out','Are you sure to log out?').then(function(res){
          if(res){
            console.log(res);
              deleteLogin();
          }
      });
         };
        $scope.gotoSetting = function () {
            $state.go( 'index.setting', {}, {
                reload: true
            } );
        };
        $scope.gotoUpdate = function () {
  var url = ApiService.Url(ApiService.Uri( false, '/' + ENV.updateFile));
            if ( !ENV.fromWeb ) {
                  var url = ApiService.Url(ApiService.Uri( false, '/' + ENV.updateFile));
                $http.get(url)
                    .success( function ( res ) {
                        var serverAppVersion = res.version;
                        $cordovaAppVersion.getVersionNumber().then( function ( version ) {
                            if ( version != serverAppVersion ) {
                                $ionicSideMenuDelegate.toggleLeft();
                                $state.go( 'index.update', {
                                    'Version': serverAppVersion
                                } );
                            } else {
                                PopupService.Alert(null,'Already the Latest Version!');
                            }
                        } );
                    } )
                    .error( function ( res ) {
                          PopupService.Alert(null,'Connect Update Server Error!');
                    } );
            } else {
              PopupService.Info(null,'No Updates!');
            }
        };
        $rootScope.$on( 'logout', function () {
            $scope.Status.Login = false;
            $ionicSideMenuDelegate.toggleLeft();
        } );
        $rootScope.$on( 'login', function () {
            $scope.Status.Login = true;
        } );
        //
        var writeFile = function ( path, file, data ) {
            $cordovaFile.writeFile( path, file, data, true )
                .then( function ( success ) {
                    ApiService.Init(true);
                      showQRcode();
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                    console.error( error );
                } );
        };
        $ionicPlatform.ready( function () {
            console.log( 'ionicPlatform.ready' );
            if ( !ENV.fromWeb ) {
                var data = 'website=' + ENV.website + '##' +
                    'api=' + ENV.api + '##' +
                    'port=' + ENV.port;
                var path = cordova.file.externalRootDirectory,
                    directory = ENV.rootPath,
                    file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.createDir( path, directory, false )
                    .then( function ( success ) {
                        writeFile( path, file, data );
                    }, function ( error ) {
                        // If an existing directory exists
                        $cordovaFile.checkFile( path, file )
                            .then( function ( success ) {
                                $cordovaFile.readAsText( path, file )
                                    .then( function ( success ) {
                                        var arConf = success.split( '##' );
                                        if ( arConf.length == 3 ) {
                                            var arWebServiceURL = arConf[ 0 ].split( '=' );
                                            if ( is.not.empty( arWebServiceURL[ 1 ] ) ) {
                                                ENV.website = arWebServiceURL[ 1 ];
                                            }
                                            var arWebSiteURL = arConf[ 1 ].split( '=' );
                                            if ( is.not.empty( arWebSiteURL[ 1 ] ) ) {
                                                ENV.api = arWebSiteURL[ 1 ];
                                            }
                                            var arWebPort = arConf[ 2 ].split( '=' );
                                            if ( is.not.empty( arWebPort[ 1 ] ) ) {
                                                ENV.port = arWebPort[ 1 ];
                                            }
                                            ApiService.Init(true);
                                              showQRcode();
                                        } else {
                                            $cordovaFile.removeFile( path, file )
                                                .then( function ( success ) {
                                                    writeFile( path, file, data );
                                                }, function ( error ) {
                                                    $cordovaToast.showShortBottom( error );
                                                } );
                                        }
                                    }, function ( error ) {
                                        $cordovaToast.showShortBottom( error );
                                        console.error( error );
                                    } );
                            }, function ( error ) {
                                // If file not exists
                                writeFile( path, file, data );
                            } );
                    } );
            } else {
                ENV.ssl = 'https:' === document.location.protocol ? true : false;
                ApiService.Init(true);
                  showQRcode();
            }
        } );
  }
] );
