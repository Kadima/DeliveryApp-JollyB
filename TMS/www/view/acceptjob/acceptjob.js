'use strict';
app.controller('AcceptJobCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', '$cordovaSQLite', '$cordovaToast', 'ACCEPTJOB_ORM', 'TABLE_DB', 'ApiService', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, $cordovaSQLite, $cordovaToast, ACCEPTJOB_ORM, TABLE_DB, ApiService, SqlService, PopupService) {
        var dataResults = new Array();
        $scope.Search = {
            BookingNo: ''
        };
        var hmcsbk1 = new HashMap();
        var getObjCsbk1 = function (obj) {
            var COLRuturnTime = '';
            if (is.equal(obj.CollectionTimeStart, '') && is.equal(obj.CollectionTimeEnd, '')) {
                COLRuturnTime = obj.ColTimeFrom + '-' + obj.ColTimeTo;
            } else {
                COLRuturnTime = obj.CollectionTimeStart + '-' + obj.CollectionTimeEnd;
            }
            var DLVReturntime = '';
            if (is.equal(obj.CollectionTimeStart, '') && is.equal(obj.CollectionTimeEnd, '')) {
                DLVReturntime = '';
            } else {
                DLVReturntime = obj.TimeFrom + '-' + obj.TimeTo;
            }
            var csbk1 = {
                bookingNo: obj.BookingNo,
                TempBookingNo: obj.TempBookingNo,
                action: is.equal(obj.StatusCode, 'DLV') ? 'Deliver' : 'Collect',
                amt: obj.Pcs + ' PKG',
                time: is.equal(obj.StatusCode, 'DLV') ? DLVReturntime : COLRuturnTime,
                code: obj.PostalCode,
                customer: {
                    name: obj.BusinessPartyName,
                    address: obj.Address1 + obj.Address2 + obj.Address3 + obj.Address4
                }
            };
            return csbk1;
        };
        var showList = function () {
            var strSqlFilter = "DriverCode='" + sessionStorage.getItem('strDriverId').toString() + "'";
            SqlService.Select('Csbk1', '*', strSqlFilter).then(function (results) {
                for (var i = 0; i < results.rows.length; i++) {
                    var csbk1 = getObjCsbk1(results.rows.item(i));
                    dataResults = dataResults.concat(csbk1);
                }
                $scope.jobs = dataResults;
                for (var i = 0; i < dataResults.length; i++) {
                    hmcsbk1.set(dataResults[i].bookingNo, dataResults[i].bookingNo);
                    hmcsbk1.set(dataResults[i].TempBookingNo, dataResults[i].TempBookingNo);
                }
            });
        };
        var showCsbk = function (bookingNo) {
            if (hmcsbk1.has(bookingNo)) {
                PopupService.Alert(null, 'Booking No is already exists');
            } else {
                if (is.not.empty(bookingNo)) {
                    var objUri = ApiService.Uri(true, '/api/tms/csbk1').addSearch('BookingNo', bookingNo);
                    ApiService.Get(objUri, true).then(function success(result) {
                        var results = result.data.results;
                        if (is.not.empty(results)) {
                            hmcsbk1.set(results[0].BookingNo, results[0].BookingNo);
                            hmcsbk1.set(bookingNo, bookingNo);
                            for (var i = 0; i < results.length; i++) {
                                var objCsbk1 = results[i];
                                objCsbk1.TempBookingNo = bookingNo;
                                objCsbk1.DriverCode = sessionStorage.getItem('strDriverId').toString();
                                SqlService.Insert('Csbk1', objCsbk1).then(function (result) {});
                            }
                            var csbk1 = getObjCsbk1(results[0]);
                            dataResults = dataResults.concat(csbk1);
                            $scope.jobs = dataResults;
                        } else {
                            PopupService.Alert(null, 'Wrong Booking No');
                        }
                        $scope.Search.BookingNo = '';
                        $('#div-list').focus();
                    });
                } else {
                    PopupService.Alert(null, 'Booking No Is Not Null');
                }
            }
        };

        $scope.deleteCsbk1 = function (index, job) {
            SqlService.Del('Csbk1', 'BookingNo', job.bookingNo).then(function (result) {
                $scope.jobs.splice(index, 1);
            });
        };

        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };
        $scope.save = function () {
            if (is.not.empty($scope.jobs)) {
                $state.go('jobListingList', {}, {});
            } else {
                PopupService.Info(null, 'No Job Accepted');
            }
        };
        $scope.clear = function () {
            dataResults = new Array();
            $scope.jobs = dataResults;
            ACCEPTJOB_ORM.LIST._setCsbk($scope.jobs);
            $scope.Search.BookingNo = '';
        };
        $scope.openCam = function () {
            $cordovaBarcodeScanner.scan().then(function (imageData) {
                $scope.Search.BookingNo = imageData.text;
                showCsbk($scope.Search.BookingNo);
            }, function (error) {
                $cordovaToast.showShortBottom(error);
            }, {
                'formats': 'CODE_39',
            });
        };
        $scope.clearInput = function () {
            if (is.not.empty($scope.Search.BookingNo)) {
                $scope.Search.BookingNo = '';
                $('#txt-bookingno').select();
            }
        };
        $('#txt-bookingno').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                if (window.cordova) {
                    $cordovaKeyboard.close();
                }
                showCsbk($scope.Search.BookingNo);
                // var alertPopup=null;
                // if (alertPopup === null) {
                //     showCsbk($scope.Search.BookingNo);
                // } else {
                //     alertPopup.close();
                //     alertPopup = null;
                // }
            }
        });
        showList();
    }
]);
