app.controller( 'UpdateCtrl', [ 'ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'DownloadFileService','ApiService',
    function ( ENV, $scope, $state, $stateParams, $ionicPopup, DownloadFileService ,ApiService) {
        var alertPopup = null,
            alertPopupTitle = '';
        $scope.strVersion = $stateParams.Version;
        $scope.return = function () {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        };
        var onDownloadError = function () {
            alertPopupTitle = 'Dowload Failed';
            alertPopup = $ionicPopup.alert( {
                title: alertPopupTitle,
                okType: 'button-assertive'
            } );
            alertPopup.then( function ( res ) {
                $scope.return();
            } );
        };
        $scope.upgrade = function () {
          // ApiService.Url(ApiService.Uri( false, '/' + ENV.apkName + '.apk')),
          var  url=  ApiService.Url(ApiService.Uri( false, '/' + ENV.apkName + '.apk'));

            DownloadFileService.Download( url, ENV.apkName + '.apk', 'application/vnd.android.package-archive', null, null, onDownloadError );
            // DownloadFileService.Download( ENV.website + '/' + ENV.apkName + '.apk', ENV.apkName + '.apk', 'application/vnd.android.package-archive', null, null, onDownloadError );
        };
    }
] );
