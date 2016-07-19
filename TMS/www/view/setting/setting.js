app.controller( 'SettingCtrl', [ 'ENV', '$scope', '$state', '$ionicHistory', '$ionicPopup', '$cordovaToast', '$cordovaFile', 'ApiService',
  function ( ENV, $scope, $state, $ionicHistory, $ionicPopup, $cordovaToast, $cordovaFile, ApiService ) {
        $scope.Setting = {
            Version: ENV.version,
            WebApiURL: ENV.api,
            WebSiteUrl: ENV.website,
            WebPort: ENV.port,
            SSL: {
                checked: ENV.ssl
            },
            blnWeb: ENV.fromWeb
        };
        var writeFile = function ( path, file, data ) {
            $cordovaFile.writeFile( path, file, data, true )
                .then( function ( success ) {
                    ApiService.Init(true);
                    $scope.return();
                }, function ( error ) {
                    $cordovaToast.showShortBottom( error );
                    console.error( error );
                } );
        };
        $scope.return = function () {
            if ( $ionicHistory.backView() ) {
                $ionicHistory.goBack();
            } else {
                $state.go( 'index.login', {}, {
                    reload: true
                } );
            }
        };
        $scope.save = function () {
            ENV.ssl = $scope.Setting.SSL.checked;
            if ( is.not.empty( $scope.Setting.WebPort ) ) {
                ENV.port = $scope.Setting.WebPort;
            } else {
                $scope.Setting.WebPort = ENV.port;
            }
            if ( is.not.empty( $scope.Setting.WebApiURL ) ) {
                ENV.api = $scope.Setting.WebApiURL;
            } else {
                $scope.Setting.WebApiURL = ENV.api;
            }
            if ( is.not.empty( $scope.Setting.WebSiteUrl ) ) {
                ENV.website = $scope.Setting.WebSiteUrl;
            } else {
                $scope.Setting.WebSiteUrl = ENV.website;
            }
            if ( !ENV.fromWeb ) {
                var data = 'website=' + ENV.website +
                    '##api=' + ENV.api +
                    '##port=' + ENV.port;
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                writeFile( path, file, data );
            } else {
                ApiService.Init(true);
                $scope.return();
            }
        };
        $scope.reset = function () {
            $scope.Setting.WebApiURL = ENV.reset.api;
            $scope.Setting.WebSiteUrl = ENV.reset.website;
            $scope.Setting.WebPort = ENV.reset.port;
            if ( !ENV.fromWeb ) {
                var path = cordova.file.externalRootDirectory;
                var file = ENV.rootPath + '/' + ENV.configFile;
                $cordovaFile.removeFile( path, file )
                    .then( function ( success ) {
                        ApiService.Init(true);
                        $scope.save();
                    }, function ( error ) {
                        $cordovaToast.showShortBottom( error );
                    } );
            }else{
                ApiService.Init(true);
            }
        };
  }
] );
