'use strict';
app.controller('dailycompletedCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite', '$ionicPlatform', 'ionicDatePicker', 'SqlService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite, $ionicPlatform, ionicDatePicker, SqlService) {
        var dataResults = new Array();
        $scope.Csbk1s = [];
        $scope.Detail = {
            Packages: 0,
        };
        $scope.Search = {
            CompletedDate: moment(new Date()).format('YYYYMMDD'),
        };

        var ShowDailyCompleted = function () {
            $ionicPlatform.ready(function () {
                SqlService.Select('Csbk2 left join Csbk1 on Csbk2.TrxNo = Csbk1.TrxNo', '*', "DriverId='" + sessionStorage.getItem("strDriverId") + "' and CompletedDate='" + $scope.Search.CompletedDate + "' ").then(function (results) {
                    $scope.Csbk1s = new Array();
                    if (results.rows.length > 0) {
                        var jobs = '';
                        for (var i = 0; i < results.rows.length; i++) {
                            var Csbk1_acc = results.rows.item(i);
                            jobs = {
                                bookingno: Csbk1_acc.BookingNo,
                                JobNo: Csbk1_acc.JobNo,
                                CollectedAmt: Csbk1_acc.CollectedAmt,
                                TotalBoxes: Csbk1_acc.CollectedPcs
                            };
                            $scope.Csbk1s.push(jobs);
                        }
                    }
                });
            });
        };
        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };
        $scope.OnDatePicker = function () {
            var ipObj1 = {
                callback: function (val) { //Mandatory
                    // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
                    $scope.Search.CompletedDate = moment(new Date(val)).format('YYYYMMDD');
                    ShowDailyCompleted();
                },
                to: new Date(),
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        ShowDailyCompleted();
    }
]);
