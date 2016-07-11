'use strict';
app.controller('AcceptJobCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', '$cordovaSQLite', 'ACCEPTJOB_ORM', 'TABLE_DB', 'ApiService', 'SqlService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, $cordovaSQLite, ACCEPTJOB_ORM, TABLE_DB, ApiService, SqlService) {
        var alertPopup = null,
            dataResults = new Array();
        $scope.Search = {
            BookingNo: ''
        };
        var hmcsbk1 = new HashMap();
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
        var showList = function () {
            if (is.not.empty(ACCEPTJOB_ORM.LIST.Csbk1s)) {
                dataResults = dataResults.concat(ACCEPTJOB_ORM.LIST.Csbk1s);
                $scope.jobs = dataResults;
                for (var i = 0; i < dataResults.length; i++) {
                    hmcsbk1.set(dataResults[i].bookingNo, dataResults[i].bookingNo);
                }
            }
        };
        var showCsbk = function (bookingNo) {
            if (hmcsbk1.has(bookingNo)) {
                showPopup('Booking No is already exists', 'assertive');
            } else {
                if (is.not.empty(bookingNo)) {
                    var objUri = ApiService.Uri('/api/tms/csbk1').addSearch('BookingNo', bookingNo);
                    ApiService.Get(objUri, true).then(function success(result) {
                        var results = result.data.results;
                        if (is.not.empty(results)) {
                            hmcsbk1.set(bookingNo, bookingNo);
                            var COLRuturnTime = '';
                            if (is.equal(results[0].CollectionTimeStart, '') && is.equal(results[0].CollectionTimeEnd, '')) {
                                COLRuturnTime = results[0].ColTimeFrom + '-' + results[0].ColTimeTo;
                            } else {
                                COLRuturnTime = results[0].CollectionTimeStart + '-' + results[0].CollectionTimeEnd;
                            }
                            var DLVReturntime = '';
                            if (is.equal(results[0].CollectionTimeStart, '') && is.equal(results[0].CollectionTimeEnd, '')) {
                                DLVReturntime = '';
                            } else {
                                DLVReturntime = results[0].TimeFrom + '-' + results[0].TimeTo;
                            }
                            var Csbk1 = {
                                bookingNo: results[0].BookingNo,
                                action: is.equal(results[0].StatusCode, 'DLV') ? 'Deliver' : 'Collect',
                                amt: results[0].Pcs + ' PKG',
                                time: is.equal(results[0].StatusCode, 'DLV') ? DLVReturntime : COLRuturnTime,
                                code: results[0].PostalCode,
                                customer: {
                                    name: results[0].BusinessPartyName,
                                    address: results[0].Address1 + results[0].Address2 + results[0].Address3 + results[0].Address4
                                }
                            };
                            for (var i = 0; i < results.length; i++) {
                                var objCsbk1 = results[i];
                                // var newCsbk1 = TABLE_DB.Csbk1;
                                // objClone(sobjCsbk1, newCsbk1);
                                objCsbk1.DriverCode = sessionStorage.getItem('strDriverId').toString();
                                SqlService.Insert('Csbk1', objCsbk1).then(function (result) {});
                          }
                            dataResults = dataResults.concat(Csbk1);
                            $scope.jobs = dataResults;
                            ACCEPTJOB_ORM.LIST._setCsbk($scope.jobs);
                        } else {
                            showPopup('Wrong Booking No', 'assertive');
                        }
                        $scope.Search.BookingNo = '';
                        $('#div-list').focus();
                    });
                } else {
                    showPopup('Booking No Is Not Null', 'assertive');
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
                showPopup('No Job Accepted', 'calm');
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
                if (alertPopup === null) {
                    showCsbk($scope.Search.BookingNo);
                } else {
                    alertPopup.close();
                    alertPopup = null;
                }
            }
        });
        showList();
    }
]);
