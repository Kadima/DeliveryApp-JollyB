'use strict';
app.controller('JoblistingListCtrl', ['ENV', '$scope', '$state', '$ionicLoading', '$ionicPopup', '$ionicFilterBar', '$ionicActionSheet', 'ApiService', '$ionicPlatform', '$cordovaSQLite', 'SqlService',
    function (ENV, $scope, $state, $ionicLoading, $ionicPopup, $ionicFilterBar, $ionicActionSheet, ApiService, $ionicPlatform, $cordovaSQLite, SqlService) {
        var filterBarInstance = null,
            dataResults = new Array();
        $scope.returnMain = function () {
            $state.go('index.main', {}, {
                reload: true
            });
        };
        var getBookingNo = function () {
            $ionicPlatform.ready(function () {
                var strSqlFilter = "DriverCode='" + sessionStorage.getItem("strDriverId") + "'";
                SqlService.Select('Csbk1', '*', strSqlFilter).then(function (results) {
                    for (var i = 0; i < results.rows.length; i++) {
                        var Csbk1_acc = results.rows.item(i);
                        var COLRuturnTime = '';
                        if (is.equal(Csbk1_acc.CollectionTimeStart, '') && is.equal(Csbk1_acc.CollectionTimeEnd, '')) {
                            COLRuturnTime = Csbk1_acc.ColTimeFrom + '-' + Csbk1_acc.ColTimeTo;
                        } else {
                            COLRuturnTime = Csbk1_acc.CollectionTimeStart + '-' + Csbk1_acc.CollectionTimeEnd;
                        }
                        var DLVReturntime = '';
                        if (is.equal(Csbk1_acc.TimeFrom, '') && is.equal(Csbk1_acc.TimeFrom, '')) {
                            DLVReturntime = '';
                        } else {
                            DLVReturntime = Csbk1_acc.TimeFrom + '-' + Csbk1_acc.TimeTo;
                        }
                        var jobs = [{
                           TrxNo: Csbk1_acc.TrxNo,
                            bookingno: Csbk1_acc.BookingNo,
                            JobNo: Csbk1_acc.JobNo,
                            action: is.equal(Csbk1_acc.StatusCode, 'DLV') ? 'Deliver' : 'Collect',
                            amt: Csbk1_acc.Pcs + ' PKG',
                            time: is.equal(Csbk1_acc.StatusCode, 'DLV') ? DLVReturntime : COLRuturnTime,
                            code: Csbk1_acc.PostalCode,
                            customer: {
                                name: Csbk1_acc.BusinessPartyName,
                                address: Csbk1_acc.Address1 + Csbk1_acc.Address2 + Csbk1_acc.Address3 + Csbk1_acc.Address4
                            },
                            status: {
                                inprocess: is.equal(Csbk1_acc.CompletedFlag, 'Y') ? false : true,
                                success: is.equal(Csbk1_acc.CompletedFlag, 'Y') ? true : false,
                                failed: false
                            }
                        }];
                        dataResults = dataResults.concat(jobs);
                        $scope.jobs = dataResults;
                    }
                });
            });
        };
        getBookingNo();

        $scope.deleteCsbk1 = function (index, job) {
            SqlService.Del('Csbk2', 'TrxNo', job.TrxNo).then(function (result) {
                SqlService.Del('CsbkDetail', 'BookingNo', job.bookingno).then(function (result) {
                    SqlService.Del('Slcr1', 'BookingNo', job.bookingno).then(function (result) {
                        SqlService.Del('Csbk1', 'BookingNo', job.bookingno).then(function (result) {
                            $scope.jobs.splice(index, 1);
                        });
                    });
                });
            });
        };
        $scope.showFilterBar = function () {
            filterBarInstance = $ionicFilterBar.show({
                items: $scope.jobs,
                expression: function (filterText, value, index, array) {
                    return value.bookingno.indexOf(filterText) > -1;
                },
                //filterProperties: ['bookingno'],
                update: function (filteredItems, filterText) {
                    $scope.jobs = filteredItems;
                    if (filterText) {
                        console.log(filterText);
                    }
                }
            });
        };

        $scope.refreshItems = function () {
            if (filterBarInstance) {
                filterBarInstance();
                filterBarInstance = null;
            }
            $timeout(function () {
                getBookingNo();
                $scope.$broadcast('scroll.refreshComplete');
            }, 1000);
        };

        $scope.gotoDetail = function (job) {
            $state.go('jobListingDetail', {
                'BookingNo': job.bookingno,
                'JobNo': job.JobNo
            }, {
                reload: true
            });
        };
    }
]);

app.controller('JoblistingCtrl', ['$scope', '$state', '$stateParams',
    function ($scope, $state, $stateParams) {

        $scope.List = {
            BookingNo: $stateParams.BookingNo
        };
        $scope.returnSearch = function () {
            $state.go('jobListing', {}, {
                reload: true
            });
        };
        $scope.gotoDetail = function (job) {
            $state.go('jobListingDetail', {}, {
                reload: true
            });
        };
    }
]);

app.controller('JoblistingDetailCtrl', ['ENV', '$scope', '$state', '$ionicActionSheet', '$cordovaSms', '$stateParams', 'ApiService', '$cordovaSQLite', '$ionicPlatform', '$ionicPopup', '$ionicModal', '$ionicLoading', '$cordovaCamera', '$cordovaBarcodeScanner', '$cordovaImagePicker', '$cordovaFile', '$cordovaFileTransfer', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $ionicActionSheet, $cordovaSms, $stateParams, ApiService, $cordovaSQLite, $ionicPlatform, $ionicPopup, $ionicModal, $ionicLoading, $cordovaCamera, $cordovaBarcodeScanner, $cordovaImagePicker, $cordovaFile, $cordovaFileTransfer, SqlService, PopupService) {
        var canvas = null,
            context = null;
        $scope.capture = null;
        $scope.modal_camera = null;
        var dataResults = new Array();
        $scope.Detail = {
            csbk1: {
                BookingNo: $stateParams.BookingNo,
            },
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
        var showCamera = function (type) {
            $ionicLoading.show();
            var sourceType = Camera.PictureSourceType.CAMERA;
            if (is.equal(type, 1)) {
                sourceType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            }
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                //targetWidth: 768,
                //targetHeight: 1024,
                mediaType: Camera.MediaType.PICTURE,
                cameraDirection: Camera.Direction.BACK,
                //popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY),
                saveToPhotoAlbum: true
                    //correctOrientation:true
            };
            try {
                $cordovaCamera.getPicture(options).then(function (imageUri) {
                    var uri = ApiService.Uri(true, '/api/tms/upload/img');
                    uri.addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                    // var url = ENV.api + '/api/tms/upload/img?BookingNo=' + $scope.Detail.csbk1.BookingNo;
                    var url = ApiService.Url(uri);
                    var filePath = imageUri,
                        trustHosts = true,
                        options = {
                            fileName: moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
                        };
                    $cordovaFileTransfer.upload(url, filePath, options, trustHosts)
                        .then(function (result) {
                            $ionicLoading.hide();
                            PopupService.Info(null, 'Upload Successfully');
                        }, function (err) {
                            $ionicLoading.hide();
                            console.error(err);
                            PopupService.Alert(null, err.message);
                        }, function (progress) {});
                }, function (err) {
                    $ionicLoading.hide();
                });
            } catch (e) {
                $ionicLoading.hide();
                console.error(e);
            }
        };
        var showTobk = function () {
            $ionicPlatform.ready(function () {
                //  var strSql = "SELECT * FROM Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "' ";
                var strSqlFilter = "BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                SqlService.Select('Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo', '*', strSqlFilter).then(function (results) {
                    if (results.rows.length > 0) {
                        $scope.Detail.csbk1 = results.rows.item(0);
                        for (var i = 0; i < results.rows.length; i++) {
                            var csbk2s = {
                                TrxNo: results.rows.item(i).TrxNo,
                                LineItemNo: results.rows.item(i).LineItemNo,
                                BoxCode: results.rows.item(i).BoxCode,
                                Pcs: results.rows.item(i).Pcs,
                                UnitRate: results.rows.item(i).UnitRate,
                                CollectedPcs: results.rows.item(i).CollectedPcs,
                                AddQty: results.rows.item(i).AddQty
                            };
                            $scope.Detail.csbk2s.push(csbk2s);
                            $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[i].Pcs * $scope.Detail.csbk2s[i].UnitRate;
                        }
                        // $scope.Detail.CashAmt = $scope.Detail.AllBalance - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                        $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                        checkStatusCode($scope.Detail.csbk1.StatusCode);

                    } else {
                        // if (is.not.empty($scope.Detail.csbk1.BookingNo)) {
                        //     var objUri = ApiService.Uri(true, '/api/tms/csbk2').addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                        //     ApiService.Get(objUri, true).then(function success(result) {
                        //         var results = result.data.results;
                        //         if (is.not.empty(results)) {
                        //             $scope.Detail.csbk1 = results.csbk1;
                        //             $scope.Detail.csbk2s = results.csbk2s;
                        //         }
                        //         for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                        //             $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                        //         }
                        //         $scope.Detail.CashAmt = $scope.Detail.AllBalance - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                        //         $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                        //         if ($scope.Detail.csbk1.CollectedAmt <= 0) {
                        //             $scope.Detail.csbk1.CollectedAmt = $scope.Detail.AllBalance;
                        //         }
                        //         for (var i = 0; i < $scope.Detail.csbk2s.length; i++) {
                        //             var obj = {
                        //                 TrxNo: $scope.Detail.csbk2s[i].TrxNo,
                        //                 LineItemNo: $scope.Detail.csbk2s[i].LineItemNo,
                        //                 BoxCode: $scope.Detail.csbk2s[i].BoxCode,
                        //                 Pcs: $scope.Detail.csbk2s[i].Pcs,
                        //                 UnitRate: $scope.Detail.csbk2s[i].UnitRate,
                        //                 CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                        //                 AddQty: $scope.Detail.csbk2s[i].AddQty
                        //             };
                        //             SqlService.Insert('Csbk2', obj).then(function (res) {
                        //
                        //             });
                        //         }
                        //         var objDetail = {
                        //             BookingNo: $scope.Detail.csbk1.BookingNo,
                        //             JobNo: $scope.Detail.csbk1.JobNo,
                        //             TrxNo: $scope.Detail.csbk1.TrxNo,
                        //             StatusCode: $scope.Detail.csbk1.StatusCode,
                        //             ItemNo: $scope.Detail.csbk1.ItemNo,
                        //             DepositAmt: $scope.Detail.csbk1.DepositAmt,
                        //             DiscountAmt: $scope.Detail.csbk1.DiscountAmt,
                        //             CollectedAmt: $scope.Detail.csbk1.CollectedAmt,
                        //             CompletedFlag: $scope.Detail.csbk1.CompletedFlag,
                        //             PaidAmt: $scope.Detail.csbk1.PaidAmt
                        //         };
                        //         SqlService.Insert('CsbkDetail', objDetail).then(function (res) {
                        //
                        //         });
                        //         checkStatusCode($scope.Detail.csbk1.StatusCode);
                        //     });
                        // }
                    }
                });
            });
        };
        var checkStatusCode = function (StatusCode) {
            if (is.equal(StatusCode, 'DLV')) {
                $scope.title = 'Deliver : ' + $scope.Detail.csbk1.BookingNo;
            } else {
                $scope.title = 'Collect : ' + $scope.Detail.csbk1.BookingNo;
            }
        }
        var SMS = function () {
            $scope.PhoneNumber = '08605925888865'; //default PhoneNumber
            $scope.message = 'sms'; //default sms message
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: 'INTENT' // send SMS with the native android SMS messaging
                        //intent: '' // send SMS without open any other app
                }
            };
            var success = function () {};
            var error = function (e) {};
            $cordovaSms.send($scope.PhoneNumber, $scope.message, options, success, error);
        };
        $scope.myChannel = {
            // the fields below are all optional
            videoHeight: 480,
            videoWidth: 320,
            video: null // Will reference the video element on success
        };
        $ionicModal.fromTemplateUrl('camera.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal_camera = modal;
        });
        $scope.$on('$destroy', function () {
            if (is.not.null($scope.modal_camera)) {
                $scope.modal_camera.remove();
            }
        });
        $scope.takePhoto = function () {
            var video = document.getElementById('videoS');
            context.drawImage(video, 0, 0, 320, 480);
            $scope.capture = canvas.toDataURL();
        };
        $scope.reCapture = function () {
            context.clearRect(0, 0, 320, 480);
            $scope.capture = null;
        };
        $scope.uploadPhoto = function () {
            var jsonData = {
                'Base64': $scope.capture,
                'FileName': moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
            };
            var objUri = ApiService.Uri(true, '/api/tms/upload/img').addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
            ApiService.Post(objUri, jsonData, true).then(function success(result) {
                PopupService.Info(null, 'Upload Successfully', '').then(function () {
                    $scope.closeModal();
                });
            });
        };
        $scope.showActionSheet = function () {
            var actionSheet = $ionicActionSheet.show({
                buttons: [{
                    text: 'Camera'
                }, {
                    text: 'From Gallery'
                }],
                //destructiveText: 'Delete',
                titleText: 'Select Picture',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        if (!ENV.fromWeb) {
                            showCamera(0);
                        } else {
                            $scope.modal_camera.show();
                            canvas = document.getElementById('canvas1');
                            context = canvas.getContext('2d');
                            $scope.reCapture();
                        }
                    } else if (index === 1) {
                        if (!ENV.fromWeb) {
                            showCamera(1);

                        } else {
                            $state.go('upload', {
                                'BookingNo': $scope.Detail.csbk1.BookingNo,
                                'JobNo': 1
                            }, {});
                        }
                    }
                    return true;
                }
            });
        };
        $scope.closeModal = function () {
            $scope.modal_camera.hide();
        };
        $scope.showActionSheet1 = function () {
            var actionSheet = $ionicActionSheet.show({
                buttons: [{

                    text: '<a ng-hef="tel:08605925888865">CALL  </a>'
                }, {
                    text: 'SMS'
                }],
                //destructiveText: 'Delete',
                titleText: 'Select Picture',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    if (index === 0) {
                        // ng-href="tel:08605925888865"
                    } else if (index === 1) {
                        SMS();
                    }
                    return true;
                }
            });
        };
        $scope.gotoConfirm = function () {
            if (is.equal($scope.Detail.csbk1.StatusCode, 'DLV')) {
                if (!ENV.fromWeb) {
                    if (is.not.equal($cordovaNetwork.getNetwork(), 'wifi')) {
                        ENV.wifi = false;
                    } else {
                        ENV.wifi = true;
                    }
                }
                $ionicPlatform.ready(function () {
                    var strSql = '';
                    for (var i = 0; i < $scope.Detail.csbk2s.length; i++) {
                        var Csbk2 = {
                            CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                            AddQty: $scope.Detail.csbk2s[i].AddQty,
                        };
                        var Csbk2Filter = 'TrxNo=' + $scope.Detail.csbk2s[i].TrxNo +
                            ' and LineItemNo=' + $scope.Detail.csbk2s[i].LineItemNo;
                        SqlService.Update('Csbk2', Csbk2, Csbk2Filter).then(function (res) {});
                    }

                    var Csbk1Filter = " BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                    var Csbk1 = {
                        CompletedFlag: 'Y',
                        CompletedDate: moment(new Date()).format('YYYYMMDD'),
                        DriverId: sessionStorage.getItem("strDriverId"),
                        CollectedAmt: $scope.Detail.csbk1.CollectedAmt
                    };
                    SqlService.Update('Csbk1', Csbk1, Csbk1Filter).then(function (res) {});

                    var CsbkDetail = {
                        CompletedFlag: 'Y',
                        CollectedAmt: $scope.Detail.csbk1.CollectedAmt
                    };
                    SqlService.Update('CsbkDetail', CsbkDetail, Csbk1Filter).then(function (res) {});
                    // select ActualDeliveryDate
                    // strSql = "SELECT * FROM Csbk1  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                    if (ENV.wifi) {
                        SqlService.Select('Csbk1', '*', "BookingNo='" + $scope.Detail.csbk1.BookingNo + "'").then(
                            function (results) {
                                if (results.rows.length > 0) {
                                    var Csbk1_acc = results.rows.item(0);
                                    $scope.Detail.ScanDate = Csbk1_acc.ScanDate;

                                    var objUri = ApiService.Uri(true, '/api/tms/csbk1/update');
                                    objUri.addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                                    objUri.addSearch('Amount', $scope.Detail.csbk1.CollectedAmt);
                                    objUri.addSearch('ActualDeliveryDate', $scope.Detail.ScanDate);
                                    ApiService.Get(objUri, false).then(function success(result) {
                                        for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                                            var objUri = ApiService.Uri(true, '/api/tms/csbk2/update');
                                            objUri.addSearch('CollectedPcs', $scope.Detail.csbk2s[intI].CollectedPcs);
                                            objUri.addSearch('AddQty', $scope.Detail.csbk2s[intI].AddQty);
                                            objUri.addSearch('TrxNo', $scope.Detail.csbk2s[intI].TrxNo);
                                            objUri.addSearch('LineItemNo', $scope.Detail.csbk2s[intI].LineItemNo);
                                            ApiService.Get(objUri, false).then(function success(result) {
                                                $state.go('jobListingList', {}, {});
                                            });
                                        }
                                    });
                                } else {

                                }
                            },
                            function (error) {}
                        );
                    } else {
                        PopupService.Info(null, 'Confirm Success', 'The current state of no wifi, please in a wifi to DailyCompleted confirm').then(function (res) {
                            $scope.returnList();
                        });
                    }
                    // objUri = ApiService.Uri( true, '/api/tms/csbk1/confirm');
                    // objUri.addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                    // ApiService.Get(objUri, true).then(function success(result) {
                    //     $state.go('jobListingList', {}, {});
                    // });
                });
            } else {
                $ionicPlatform.ready(function () {
                    for (var i = 0; i < $scope.Detail.csbk2s.length; i++) {
                        var Csbk2 = {
                            CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                            AddQty: $scope.Detail.csbk2s[i].AddQty,
                        };
                        var Csbk2Filter = 'TrxNo=' + $scope.Detail.csbk2s[i].TrxNo +
                            ' and LineItemNo=' + $scope.Detail.csbk2s[i].LineItemNo;
                        SqlService.Update('Csbk2', Csbk2, Csbk2Filter).then(function (res) {});
                    }

                    var Csbk1Filter = " BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                    var Csbk1 = {
                        CollectedAmt: $scope.Detail.csbk1.CollectedAmt
                    };
                    SqlService.Update('Csbk1', Csbk1, Csbk1Filter).then(function (res) {});

                    var CsbkDetail = {
                        CollectedAmt: $scope.Detail.csbk1.CollectedAmt
                    };
                    SqlService.Update('CsbkDetail', CsbkDetail, Csbk1Filter).then(function (res) {});
                    $state.go('jobListingConfirm', {
                        'BookingNo': $scope.Detail.csbk1.BookingNo,
                        'JobNo': $stateParams.JobNo,
                        'CollectedAmt': $scope.Detail.csbk1.CollectedAmt,
                        'Collected': $scope.Detail.csbk1.CollectedAmt
                    }, {
                        reload: true
                    });
                });
            }
        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {});
        };
        $scope.checkQty = function (csbk2) {
            if (csbk2.CollectedPcs > csbk2.Pcs) {
                PopupService.Alert(null, 'Collected Qty Limited', '');
                csbk2.CollectedPcs = csbk2.Pcs;
            }
        };

        $('#iCollectedAmt').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                $scope.gotoConfirm();
                console.log('gotoConfirm');
            }
        });
        showTobk();
    }
]);

app.controller('JoblistingConfirmCtrl', ['ENV', '$scope', '$state', '$stateParams', 'ApiService', '$ionicPopup', '$ionicPlatform', '$cordovaSQLite', '$cordovaNetwork', '$ionicLoading', 'SqlService', 'PopupService',
    function (ENV, $scope, $state, $stateParams, ApiService, $ionicPopup, $ionicPlatform, $cordovaSQLite, $cordovaNetwork, $ionicLoading, SqlService, PopupService) {
        var canvas = document.getElementById('signatureCanvas'),
            signaturePad = new SignaturePad(canvas),
            strEemptyBase64 = '';
        //signaturePad.backgroundColor = "white";
        //signaturePad.minWidth = 2;
        //signaturePad.maxWidth = 4.5;
        $scope.signature = null;
        $scope.Detail = {
            BookingNo: $stateParams.BookingNo,
            Amount: $stateParams.CollectedAmt,
            JobNo: $stateParams.JobNo,
            CashAmt: $stateParams.Collected,
            Packages: 0,
            csbk2s: [],
            csbk1: {},
            CompletedFlag: '',
            Csbk2ReusltLength: 0,
            VehicleNo: '',
            Base64: '',
        };
        var showCsbk1 = function () {
            SqlService.Select('Csbk1', '*', "BookingNo='" + $scope.Detail.BookingNo + "'").then(
                function (results) {
                    if (results.rows.length > 0) {
                        var Csbk1_acc = results.rows.item(0);
                        $scope.Detail.ScanDate = Csbk1_acc.ScanDate;
                    } else {}
                },
                function (error) {}
            );
        };
        if (!ENV.fromWeb) {
            if (is.not.equal($cordovaNetwork.getNetwork(), 'wifi')) {
                ENV.wifi = false;
            } else {
                ENV.wifi = true;
            }
        }
        var showUser = function () {
            var strSqlFilter = "DriverCode='" + sessionStorage.getItem('strDriverId').toString() + "'";
            SqlService.Select('Users', '*', strSqlFilter).then(
                function (results) {
                    if (results.rows.length > 0) {
                        var Users = results.rows.item(0);
                        $scope.Detail.VehicleNo = Users.VehicleNo;
                    }
                },
                function (error) {}
            );
        };
        $ionicPlatform.ready(function () {
            SqlService.Select('Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo', '*', "BookingNo='" + $scope.Detail.BookingNo + "'").then(function (results) {
                    if (results.rows.length > 0) {
                        $scope.Detail.Csbk2ReusltLength = results.rows.length;
                        $scope.Detail.CompletedFlag = results.rows.item(0).CompletedFlag;
                        for (var i = 0; i < results.rows.length; i++) {
                            var Csbk2_acc = results.rows.item(i);
                            var Csbk2s = {
                                TrxNo: Csbk2_acc.TrxNo,
                                LineItemNo: Csbk2_acc.LineItemNo,
                                CollectedPcs: Csbk2_acc.CollectedPcs,
                                AddQty: Csbk2_acc.AddQty,
                            };
                            $scope.Detail.csbk2s.push(Csbk2s);
                            $scope.Detail.Packages = $scope.Detail.Packages + Csbk2_acc.CollectedPcs;
                        }
                    } else {}
                },
                function (error) {}
            );

        });

        function resizeCanvas() {
            var ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth - 50;
            canvas.height = screen.height / 3;
        }
        var getSignature = function () {
            SqlService.Select('Csbk1', '*', "BookingNo='" + $scope.Detail.BookingNo + "'").then(
                function (results) {
                    if (results.rows.length > 0) {
                        var Csbk1_acc = results.rows.item(0);
                        $scope.Detail.ScanDate = Csbk1_acc.ScanDate;
                        $scope.Detail.Base64 = Csbk1_acc.Base64;
                        if (Csbk1_acc.Base64 !== null && is.not.empty(Csbk1_acc.Base64)) {
                            if (is.not.equal(strEemptyBase64, $scope.Detail.Base64)) {
                                $scope.signature = 'data:image/png;base64,' + $scope.Detail.Base64;
                            }
                        }
                    } else {}
                },
                function (error) {}
            );
            // var objUri = ApiService.Uri(true, '/api/tms/csbk1/attach').addSearch('BookingNo', $stateParams.BookingNo);
            // ApiService.Get(objUri, true).then(function success(result) {
            //     if (is.not.undefined(result.data.results)) {
            //             $scope.signature = 'data:image/png;base64,' + result.data.results;
            //         }
            //     }
            // });
        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {});
        };
        $scope.returnDetail = function () {
            $state.go('jobListingDetail', {
                BookingNo: $stateParams.BookingNo
            }, {
                reload: true
            });
        };
        $scope.clearCanvas = function () {
            $scope.signature = null;
            signaturePad.clear();
        };
        $scope.saveCanvas = function () {
            var sigImg = signaturePad.toDataURL();
            if (is.not.equal(strEemptyBase64, sigImg)) {
                $scope.signature = sigImg;
            }
        };
        $scope.confirm = function () {
            $scope.saveCanvas();

            if ($scope.Detail.Amount > 0 && is.null($scope.signature)) {
                PopupService.Alert(null, 'Please Signature', '');
            } else {
                if (is.not.null($scope.signature)) {
                    var signature = $scope.signature.split(',')[1];
                }
                var Csbk1Filter = " BookingNo='" + $scope.Detail.BookingNo + "'";
                var Csbk1 = {
                    CompletedFlag: 'Y',
                    CompletedDate: moment(new Date()).format('YYYYMMDD'),
                    DriverId: sessionStorage.getItem("strDriverId"),
                    CollectedAmt: $scope.Detail.Amount,
                    CashAmt: $scope.Detail.CashAmt,
                    Csbk2CollectedPcs: $scope.Detail.Packages,
                    Base64: signature
                };
                var CsbkDetail = {
                    CompletedFlag: 'Y',
                };
                SqlService.Update('Csbk1', Csbk1, Csbk1Filter).then(function (res) {});
                SqlService.Update('CsbkDetail', CsbkDetail, Csbk1Filter).then(function (res) {});
                if (ENV.wifi) {
                    if ($scope.Detail.CompletedFlag !== 'Y') {
                        var objUri = ApiService.Uri(true, '/api/tms/csbk1/confirm');
                        objUri.addSearch('BookingNo', $scope.Detail.BookingNo);
                        objUri.addSearch('JobNo', $scope.Detail.JobNo);
                        objUri.addSearch('CashAmt', $scope.Detail.CashAmt);
                        objUri.addSearch('UpdateBy', sessionStorage.getItem("strDriverId").toString());
                        objUri.addSearch('CollectBy', $scope.Detail.VehicleNo);
                        objUri.addSearch('Amount', $scope.Detail.Amount);
                        objUri.addSearch('ActualCollectionDate', $scope.Detail.ScanDate);
                        ApiService.Get(objUri, true).then(function success(result) {
                            //In the insert slcr1 logic updated paidAmt

                            var objUri = ApiService.Uri(true, '/api/tms/csbk2').addSearch('BookingNo', $scope.Detail.BookingNo);
                            ApiService.Get(objUri, true).then(function success(result) {
                                var results = result.data.results;
                                if (is.not.empty(results)) {
                                    $scope.Detail.csbk1 = results.csbk1;
                                    var CsbkDetail = {
                                        PaidAmt: $scope.Detail.csbk1.PaidAmt,
                                    };
                                    SqlService.Update('CsbkDetail', CsbkDetail, Csbk1Filter).then(function (res) {});
                                }
                            });

                            //In the insert slcr1 logic updated paidAmt
                        });
                    } else {
                        var objUri = ApiService.Uri(true, '/api/tms/csbk1/update');
                        objUri.addSearch('BookingNo', $scope.Detail.BookingNo);
                        objUri.addSearch('Amount', $scope.Detail.Amount);
                        objUri.addSearch('ActualCollectionDate', $scope.Detail.ScanDate);
                        ApiService.Get(objUri, false).then(function success(result) {});
                    }
                    var jsonData = {
                        'Base64': $scope.signature,
                        'FileName': 'signature.Png'
                    };
                    if ($scope.signature !== null) {
                        var objUri = ApiService.Uri(true, '/api/tms/upload/img').addSearch('BookingNo', $scope.Detail.BookingNo);
                        ApiService.Post(objUri, jsonData, true).then(function success(result) {});
                    }
                    // updae ActualCollectionDate
                    var strSql = "SELECT * FROM Csbk1  where BookingNo='" + $scope.Detail.BookingNo + "'";
                    // $cordovaSQLite.execute(db, "SELECT * FROM Csbk1  where BookingNo='" + $scope.Detail.BookingNo + "'")
                    for (var intI = 0; intI < $scope.Detail.Csbk2ReusltLength; intI++) {
                        var objUri = ApiService.Uri(true, '/api/tms/csbk2/update');
                        objUri.addSearch('CollectedPcs', $scope.Detail.csbk2s[intI].CollectedPcs);
                        objUri.addSearch('AddQty', $scope.Detail.csbk2s[intI].AddQty);
                        objUri.addSearch('TrxNo', $scope.Detail.csbk2s[intI].TrxNo);
                        objUri.addSearch('LineItemNo', $scope.Detail.csbk2s[intI].LineItemNo);
                        ApiService.Get(objUri, false).then(function success(result) {});
                    }

                    PopupService.Info(null, 'Confirm Success', '').then(function (res) {
                        $scope.returnList();
                    });
                } else {
                    SqlService.Select('Csbk1', '*', "BookingNo='" + $scope.Detail.BookingNo + "'").then(
                        function (results) {
                            if (results.rows.length > 0) {
                                var objTemCsbk1 = results.rows.item(0);
                                SqlService.Insert('TemCsbk1', objTemCsbk1).then(function (res) {});
                            } else {}
                        },
                        function (error) {}
                    );
                    PopupService.Info(null, 'Confirm Success', 'The current state of no wifi, please in a wifi to DailyCompleted confirm').then(function (res) {
                        $scope.returnList();
                    });
                }

            }
        };
        getSignature();
        resizeCanvas();
        showCsbk1();
        showUser();
        strEemptyBase64 = signaturePad.toDataURL();

    }
]);

app.controller('UploadCtrl', ['ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'FileUploader', 'ApiService', 'PopupService',
    function (ENV, $scope, $state, $stateParams, $ionicPopup, FileUploader, ApiService, PopupService) {
        $scope.Detail = {
            BookingNo: $stateParams.BookingNo,
            JobNo: $stateParams.JobNo
        };
        $scope.returnDoc = function () {
            $state.go('jobListingDetail', {
                BookingNo: $stateParams.BookingNo,
            }, {});
        };
        var uri = ApiService.Uri(true, '/api/tms/upload/img');
        uri.addSearch('BookingNo', $scope.Detail.BookingNo);
        var uploader = $scope.uploader = new FileUploader({
            url: ApiService.Url(uri)
                //url: 'http://www.sysfreight.net:8081/apis/tms/jollyb' + '/api/tms/upload/img?BookingNo=' + $scope.Detail.BookingNo
        });
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
            PopupService.Info(null, 'Upload Successfully', '').then(function (res) {
                $scope.returnDoc();
            });
        };
    }
]);
