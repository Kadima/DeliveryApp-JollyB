'use strict';
app.controller('LoginCtrl', ['ENV', '$scope', '$http', '$state', '$stateParams', '$ionicPopup', '$timeout', '$cordovaToast', '$cordovaFile', '$cordovaAppVersion', 'ApiService', 'SqlService', '$ionicPlatform', '$cordovaSQLite', '$rootScope', 'PopupService',
    function (ENV, $scope, $http, $state, $stateParams, $ionicPopup, $timeout, $cordovaToast, $cordovaFile, $cordovaAppVersion, ApiService, SqlService, $ionicPlatform, $cordovaSQLite, $rootScope, PopupService) {
        var alertPopup = null;
        $scope.logininfo = {
            strDriverId: ''
        };
        $scope.funcLogin = function (blnDemo) {
            if (blnDemo) {
                ENV.mock = true;
            } else {
                ENV.mock = false;
            }
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
            if (ENV.mock) {
                sessionStorage.clear();
                sessionStorage.setItem('strDriverId', $scope.logininfo.strDriverId);
                // sessionStorage.setItem('strDriverName', 'Mr. Driver');
                $state.go('index.main', {}, {
                    reload: true
                });
            } else {
                if ($scope.logininfo.strDriverId === '') {
                    PopupService.Alert(null, 'Please Enter Driver ID.');
                } else {
                    var objUri = ApiService.Uri(true,ENV.apiMap.login.check).addSearch('DriverCode', $scope.logininfo.strDriverId);
                    ApiService.Get(objUri, true).then(function success(result) {
                        var results = result.data.results;
                        if (is.not.empty(results)) {
                            sessionStorage.clear();
                            sessionStorage.setItem('strDriverId', $scope.logininfo.strDriverId);
                            sessionStorage.setItem('strDriverCode', $scope.logininfo.strDriverId);
                            sessionStorage.setItem('strDriverName', results[0].DriverName);
                            sessionStorage.setItem('strVehicleNo', results[0].VehicleNo);
                            var objUser = {
                                DriverId: $scope.logininfo.strDriverId,
                                DriverCode:  $scope.logininfo.strDriverId,
                                DriverName: results[0].DriverName,
                                VehicleNo:results[0].VehicleNo
                            };

                            SqlService.Insert('Users', objUser).then(function (res) {});
                            $state.go('index.main', {}, {
                                reload: true
                            });
                            $rootScope.$broadcast('login');
                        } else {
                            PopupService.Alert(null, 'Invalid Driver ID.', '');
                        }
                    });
                }
            }
        };

        $scope.goDriverCode = function () {
            $state.go('driverCodeCtrl', {}, {
                reload: true
            });
        }
        $('#iDriverId').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                if (alertPopup === null) {
                    $scope.funcLogin(false);
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        });
        $ionicPlatform.ready(function () {
            // var strSql = 'SELECT * FROM Users';
            SqlService.Select('Users', '*').then(function (res) {
                    if (res.rows.length > 0 && is.not.undefined(res.rows.item(0).DriverId)) {
                        var value = res.rows.item(0).DriverId;
                        $rootScope.$broadcast('login');
                        sessionStorage.clear();
                        sessionStorage.setItem('strDriverId', value);
                        $state.go('index.main', {}, {
                            reload: true
                        });
                    }
                },
                function (error) {}
            );
        });
    }
]);
