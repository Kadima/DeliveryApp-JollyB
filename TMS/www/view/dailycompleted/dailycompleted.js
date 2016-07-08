'use strict';
app.controller('dailycompletedCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite', '$ionicPlatform', 'ionicDatePicker', 'SqlService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite, $ionicPlatform, ionicDatePicker, SqlService) {
        var alertPopup = null,
            dataResults = new Array();
        $scope.Csbk1s = [];
        $scope.Detail = {
            Packages: 0,
        };
        $scope.Search = {
            CompletedDate: moment(new Date()).format('YYYYMMDD'),
            allCompletedDates: []
        };
        var showPopup = function (title, type) {
            if (alertPopup === null) {
                alertPopup = $ionicPopup.alert({
                    title: title,
                    okType: 'button-' + type
                });
            } else {
                alertPopup.close();
                alertPopup = null;
            }
        };
        var sumBoxes = function (bookingNo) {
            var strSql = "SELECT * FROM Csbk2 left join Csbk1 on Csbk2.TrxNo = Csbk1.TrxNo  where BookingNo='" + bookingNo + "'";
            if (!ENV.fromWeb) {
                SqlService.Exec(strSql).then(function (results) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var Csbk2_acc = results.rows.item(i);
                        $scope.Detail.Packages = $scope.Detail.Packages + Csbk2_acc.CollectedPcs;
                    }
                });
            }
        };

        var ShowDailyCompleted = function () {
            $ionicPlatform.ready(function () {
                if (!ENV.fromWeb) {
                    var strSql = "SELECT * FROM Csbk1  where  DriverId='" + sessionStorage.getItem("strDriverId") + "' and CompletedDate='" + $scope.Search.CompletedDate + "' ";
                    SqlService.Exec(strSql).then(function (results) {
                        $scope.Csbk1s = new Array();
                        if (results.rows.length > 0) {
                            var jobs = '';
                            for (var i = 0; i < results.rows.length; i++) {
                                var Csbk1_acc = results.rows.item(i);
                                jobs = {
                                    bookingno: Csbk1_acc.BookingNo,
                                    JobNo: Csbk1_acc.JobNo,
                                    CollectedAmt: Csbk1_acc.CollectedAmt,
                                    TotalBoxes: $scope.Detail.Packages
                                };
                                $scope.Csbk1s.push(jobs);
                            }
                        }
                    });
                }
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
                }
            };
            ionicDatePicker.openDatePicker(ipObj1);
        };
        ShowDailyCompleted();
    }
]);
