'use strict';
app.controller( 'driverCodeCtrl', [ '$scope', '$state', 'ApiService', '$cordovaSms', '$cordovaToast',
    function ( $scope, $state, ApiService, $cordovaSms, $cordovaToast ) {
        $scope.Search = {
            driverPhoneNumber: '',
            message: ''
        };
        $scope.returnMain = function () {
            $state.go( 'index.login', {}, {
                reload: true
            } );
        };
        $scope.getDriverCode = function () {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
            var strUri = '' + $scope.Search.driverPhoneNumber;
            ApiService.Get( strUri, true ).then( function success( result ) {
                $scope.driverId = result.data.results;
            } );
            $state.go( 'index.main', {}, {
                reload: true
            } );
        };
        $scope.sendSMS = function () {
            if ( window.cordova && window.cordova.plugins.Keyboard ) {
                cordova.plugins.Keyboard.close();
            }
            //  $cordovaToast.showShortBottom($scope.Search.driverPhoneNumber);
            //    $cordovaToast.showShortBottom($scope.Search.message);
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: 'INTENT' // send SMS with the native android SMS messaging
                        //intent: '' // send SMS without open any other app
                }
            };
            var success = function () {};
            var error = function ( e ) {};
            $cordovaSms.send( $scope.Search.driverPhoneNumber, $scope.Search.message, options, success, error );
        };
  } ] );
