'use strict';
app.controller( 'MainCtrl', [ '$scope', '$state', '$ionicPopup','PopupService',
    function ( $scope, $state, $ionicPopup,PopupService ) {
            var strDriverName = sessionStorage.getItem( 'strDriverName' );
        if ( is.not.empty( strDriverName ) ) {
            $scope.strName = strDriverName;
        } else {
            $scope.strName = 'Driver';
        }
        $scope.func_Dashboard = function () {
            PopupService.Info(null ,'Stay Tuned' );
        };
        $scope.func_AJ = function () {
            $state.go( 'acceptJob', {}, {} );
        };
        $scope.func_JL = function () {
            $state.go( 'jobListingList', {}, {} );
        };
        $scope.func_DC = function () {
            $state.go( 'dailycompleted', {}, {} );
        };
        $scope.func_Reports = function () {
              PopupService.Info( null,'Stay Tuned' );
        };
        $scope.func_Setting = function () {
            PopupService.Info( null,'Stay Tuned' );
        };
    } ] );
