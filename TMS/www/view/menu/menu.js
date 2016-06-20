'use strict';
app.controller('IndexCtrl', ['ENV', '$scope', '$state', '$rootScope', '$http',
  '$ionicLoading', '$ionicPopup', '$ionicSideMenuDelegate', '$cordovaAppVersion', '$cordovaFile', '$cordovaToast', '$cordovaSQLite',
  function(ENV, $scope, $state, $rootScope, $http, $ionicLoading, $ionicPopup,
    $ionicSideMenuDelegate, $cordovaAppVersion, $cordovaFile, $cordovaToast, $cordovaSQLite) {
    var alertPopup = null;
    var alertPopupTitle = '';
    $scope.Status = {
      Login: false
    };
    $scope.logout = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Log Out',
        template: 'Are you sure to log out?'
      });
      confirmPopup.then(function(res) {
        if (res) {
          deleteLogin();
        }
      });
      // $rootScope.$broadcast( 'logout' );
      // $state.go( 'index.login', {}, {} );
    };
    $scope.gotoSetting = function() {
      $state.go('index.setting', {}, {
        reload: true
      });
    };
    $scope.gotoUpdate = function() {
      if (!ENV.fromWeb) {
        var url = ENV.website + '/' + ENV.updateFile;
        $http.get(url)
          .success(function(res) {
            var serverAppVersion = res.version;
            $cordovaAppVersion.getVersionNumber().then(function(version) {
              if (version != serverAppVersion) {
                $ionicSideMenuDelegate.toggleLeft();
                $state.go('index.update', {
                  'Version': serverAppVersion
                });
              } else {
                alertPopupTitle = 'Already the Latest Version!';
                alertPopup = $ionicPopup.alert({
                  title: alertPopupTitle,
                  okType: 'button-assertive'
                });
              }
            });
          })
          .error(function(res) {
            alertPopupTitle = 'Connect Update Server Error!';
            alertPopup = $ionicPopup.alert({
              title: alertPopupTitle,
              okType: 'button-assertive'
            });
          });
      } else {
        alertPopupTitle = 'No Updates!';
        alertPopup = $ionicPopup.alert({
          title: alertPopupTitle,
          okType: 'button-calm'
        });
      }
    }
    var deleteLogin = function() {
      if (!ENV.fromWeb) {
        $cordovaSQLite.execute(db, 'DELETE FROM Users')
          .then(
            function(res) {
              console.log('Delete LoginInfo');
              $rootScope.$broadcast('logout');
              $state.go('index.login', {}, {});
            },
            function(error) {}
          );
      } else {
        $state.go('index.login', {}, {});
        $rootScope.$broadcast('logout');
      }
    };
    $rootScope.$on('logout', function() {
      $scope.Status.Login = false;
      $ionicSideMenuDelegate.toggleLeft();
    });
    $rootScope.$on('login', function() {
      $scope.Status.Login = true;
    });
    //
    if (window.cordova) {
      //  ENV.fromWeb = false;
      //  $cordovaKeyboard.hideAccessoryBar(true);
      //    $cordovaKeyboard.disableScroll(true);
      //
      var data = 'website=' + ENV.website + '##api=' + ENV.api + '##ssl=' + ENV.ssl;
      var path = cordova.file.externalRootDirectory;
      var directory = ENV.rootPath;
      var file = directory + '/' + ENV.configFile;
      $cordovaFile.createDir(path, directory, false)
        .then(function(success) {
          $cordovaFile.writeFile(path, file, data, true)
            .then(function(success) {
              var blnSSL = ENV.ssl === 0 ? false : true;
              ENV.website = appendProtocol(ENV.website, blnSSL, ENV.port);
              ENV.api = appendProtocol(ENV.api, blnSSL, ENV.port);
            }, function(error) {
              $cordovaToast.showShortBottom(error);
            });
        }, function(error) { // If an existing directory exists
          $cordovaFile.checkFile(path, file)
            .then(function(success) {
              $cordovaFile.readAsText(path, file)
                .then(function(success) {
                  var arConf = success.split('##');
                  if (is.not.empty(arConf[0])) {
                    var arWebServiceURL = arConf[0].split('=');
                    if (is.not.empty(arWebServiceURL[1])) {
                      ENV.website = arWebServiceURL[1];
                    }
                  }
                  if (is.not.empty(arConf[1])) {
                    var arWebSiteURL = arConf[1].split('=');
                    if (is.not.empty(arWebSiteURL[1])) {
                      ENV.api = arWebSiteURL[1];
                    }
                  }
                  if (is.not.empty(arConf[2])) {
                    var arSSL = arConf[2].split('=');
                    if (is.not.empty(arSSL[1])) {
                      ENV.ssl = arSSL[1];
                    }
                  }
                  var blnSSL = ENV.ssl === 0 ? false : true;
                  ENV.website = appendProtocol(ENV.website, blnSSL, ENV.port);
                  ENV.api = appendProtocol(ENV.api, blnSSL, ENV.port);
                  //
                }, function(error) {
                  $cordovaToast.showShortBottom(error);
                });
            }, function(error) {
              // If file not exists
              $cordovaFile.writeFile(path, file, data, true)
                .then(function(success) {
                  var blnSSL = ENV.ssl === 0 ? false : true;
                  ENV.website = appendProtocol(ENV.website, blnSSL, ENV.port);
                  ENV.api = appendProtocol(ENV.api, blnSSL, ENV.port);
                }, function(error) {
                  $cordovaToast.showShortBottom(error);
                });
            });
        });
    } else {
      var blnSSL = 'https:' === document.location.protocol ? true : false;
      ENV.ssl = blnSSL ? '1' : '0';
      ENV.website = appendProtocol(ENV.website, blnSSL, ENV.port);
      ENV.api = appendProtocol(ENV.api, blnSSL, ENV.port);
    }

  }
]);
