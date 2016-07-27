'use strict';
app.controller('AcceptJobCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', '$cordovaSQLite', '$cordovaToast', 'ACCEPTJOB_ORM', 'TABLE_DB', 'ApiService', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, $cordovaSQLite, $cordovaToast, ACCEPTJOB_ORM, TABLE_DB, ApiService, SqlService, PopupService) {
        var dataResults = new Array();
        $scope.Search = {
            BookingNo: ''
        };
        $scope.Detail = {
            csbk1: {},
            AllBalance: 0,
            CollectedAmt: 0,
            CollectedPcs: 0,
            SumPcs: 0,
            PhoneNumber: "",
            ScanDate: "",
            CashAmt: 0,
            csbk2s: [],
            csbk2: {}
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
                TrxNo: obj.TrxNo,
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
                                // =====
                                if (is.not.empty(objCsbk1.BookingNo)) {
                                    var objUri = ApiService.Uri(true, '/api/tms/csbk2').addSearch('BookingNo', objCsbk1.BookingNo);
                                    ApiService.Get(objUri, true).then(function success(result) {
                                        var results = result.data.results;
                                        if (is.not.empty(results)) {
                                            $scope.Detail.csbk1 = results.csbk1;
                                            $scope.Detail.csbk2s = results.csbk2s;
                                        }
                                        for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                                            $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                                        }
                                        // $scope.Detail.CashAmt = $scope.Detail.AllBalance - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                                        $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                                        if ($scope.Detail.csbk1.CollectedAmt <= 0) {
                                            $scope.Detail.csbk1.CollectedAmt = $scope.Detail.AllBalance;
                                        }
                                        for (var i = 0; i < $scope.Detail.csbk2s.length; i++) {
                                            var obj = {
                                                TrxNo: $scope.Detail.csbk2s[i].TrxNo,
                                                LineItemNo: $scope.Detail.csbk2s[i].LineItemNo,
                                                BoxCode: $scope.Detail.csbk2s[i].BoxCode,
                                                Pcs: $scope.Detail.csbk2s[i].Pcs,
                                                UnitRate: $scope.Detail.csbk2s[i].UnitRate,
                                                CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                                                AddQty: $scope.Detail.csbk2s[i].AddQty
                                            };
                                            SqlService.Insert('Csbk2', obj).then(function (res) {

                                            });
                                        }
                                        var objDetail = {
                                            BookingNo: $scope.Detail.csbk1.BookingNo,
                                            JobNo: $scope.Detail.csbk1.JobNo,
                                            TrxNo: $scope.Detail.csbk1.TrxNo,
                                            StatusCode: $scope.Detail.csbk1.StatusCode,
                                            ItemNo: $scope.Detail.csbk1.ItemNo,
                                            DepositAmt: $scope.Detail.csbk1.DepositAmt,
                                            DiscountAmt: $scope.Detail.csbk1.DiscountAmt,
                                            CollectedAmt: $scope.Detail.csbk1.CollectedAmt,
                                            CompletedFlag: $scope.Detail.csbk1.CompletedFlag,
                                            PaidAmt: $scope.Detail.csbk1.PaidAmt
                                        };
                                        SqlService.Insert('CsbkDetail', objDetail).then(function (res) {

                                        });

                                    });
                                }
                                // =====
                                if (is.not.empty(objCsbk1.BookingNo)) {
                                    var objUri = ApiService.Uri(true, '/api/tms/slcr1').addSearch('BookingNo', objCsbk1.BookingNo);
                                    ApiService.Get(objUri, true).then(function success(result) {
                                        var results = result.data.results;
                                        if (is.not.empty(results)) {
                                            for (var i = 0; i < results.length; i++) {
                                                var obj = {
                                                    BookingNo: results[i].BookingNo,
                                                    ReceiptAmt: results[i].ReceiptAmt,
                                                };
                                                SqlService.Insert('Slcr1', obj).then(function (res) {});
                                            }
                                        }
                                    });
                                }
                                // =====
                                var objUri = ApiService.Uri(true, '/api/tms/csbk1/attach').addSearch('BookingNo', objCsbk1.BookingNo);
                                ApiService.Get(objUri, true).then(function success(result) {
                                    if (is.not.undefined(result.data.results)) {

                                        $scope.signature = result.data.results;
                                        var Csbk1Filter = " BookingNo='" + objCsbk1.BookingNo + "'";
                                        var Csbk1 = {
                                            Base64: $scope.signature
                                        };
                                        SqlService.Update('Csbk1', Csbk1, Csbk1Filter).then(function (res) {});

                                    }
                                });
                                // =====
                                var objUri = ApiService.Uri(true, '/api/tms/rcbp1').addSearch('BookingNo', objCsbk1.BookingNo);
                                ApiService.Get(objUri, true).then(function success(result) {
                                    var results = result.data.results;
                                    if (is.not.empty(results)) {
                                        $scope.Detail.PhoneNumber = "tel:" + results[0].Handphone1;
                                        if (is.equal(results[0].Handphone1, '')) {
                                            $scope.Detail.PhoneNumber = "tel:" + results[0].Telephone;
                                        }
                                        var CsbkDetailFilter = " BookingNo='" + objCsbk1.BookingNo + "'";
                                        var CsbkDetail = {
                                            Rcbp1PhoneNumber: $scope.Detail.PhoneNumber
                                        };
                                        SqlService.Update('CsbkDetail', CsbkDetail, CsbkDetailFilter).then(function (res) {});

                                    }
                                });
                                //=====
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
            SqlService.Del('Csbk2', 'TrxNo', job.TrxNo).then(function (result) {
                SqlService.Del('CsbkDetail', 'BookingNo', job.bookingNo).then(function (result) {
                    SqlService.Del('Slcr1', 'BookingNo', job.bookingNo).then(function (result) {
                        SqlService.Del('Csbk1', 'BookingNo', job.bookingNo).then(function (result) {
                            $scope.jobs.splice(index, 1);
                            hmcsbk1.remove(job.bookingNo);
                        });
                    });
                });
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
            PopupService.Confirm(null, '', 'Log Out', 'Are you sure clear list jobs?').then(function (res) {
                if (res) {
                    dataResults = new Array();
                    $scope.jobs = dataResults;
                    ACCEPTJOB_ORM.LIST._setCsbk($scope.jobs);
                    $scope.Search.BookingNo = '';
                    SqlService.Del('Csbk2').then(function (result) {});
                    SqlService.Del('CsbkDetail').then(function (result) {});
                    SqlService.Del('Slcr1').then(function (result) {});
                    SqlService.Del('Csbk1').then(function (result) {});
                    hmcsbk1.clear();
                }
            });
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
