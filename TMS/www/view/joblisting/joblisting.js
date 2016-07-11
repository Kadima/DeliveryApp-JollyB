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
                // var strSql = "select * from Csbk1 where DriverCode='" + sessionStorage.getItem("strDriverId") + "'";
                var strSqlFilter="DriverCode='" + sessionStorage.getItem("strDriverId") + "'";
                SqlService.Select('Csbk1','*',strSqlFilter).then(function (results) {
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
            SqlService.Del('Csbk1', 'BookingNo', job.bookingNo).then(function (result) {
                $scope.jobs.splice(index, 1);
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
        if (db_websql) {
            db_websql.transaction(function (tx) {
                db_strSql = 'select * from Csbk1_Accept';
                tx.executeSql(db_strSql, [], function (tx, results) {
                    if (results.rows.length > 0) {
                        for (var i = 0; i < results.rows.length; i++) {
                            if ($scope.List.BookingNo === results.rows.item(i).BookingNo) {
                                var UomCode = is.undefined(results.rows.item(i).UOMCode) ? '' : results.rows.item(i).UOMCode;
                                $scope.jobs = [{
                                    action: 'Collect',
                                    amt: results.rows.item(i).TotalPcs + ' ' + UomCode,
                                    time: moment(results.rows.item(i).DeliveryEndDateTime).format('DD-MMM-YYYY'),
                                    code: results.rows.item(i).CustomerCode,
                                    customer: {
                                        name: results.rows.item(i).CustomerName,
                                        address: results.rows.item(i).ToAddress1 + results.rows.item(i).ToAddress2 + results.rows.item(i).ToAddress3 + results.rows.item(i).ToAddress4
                                    },
                                    status: {
                                        inprocess: false,
                                        success: true,
                                        failed: false
                                    }
                                }]

                            }
                        }
                    }
                });
            }, dbError);
        }

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

app.controller('JoblistingDetailCtrl', ['ENV', '$scope', '$state', '$ionicActionSheet', '$cordovaSms', '$stateParams', 'ApiService', '$cordovaSQLite', '$ionicPlatform', '$ionicPopup', '$ionicModal', '$ionicLoading', '$cordovaCamera', '$cordovaBarcodeScanner', '$cordovaImagePicker', '$cordovaFile', '$cordovaFileTransfer', 'SqlService',
    function (ENV, $scope, $state, $ionicActionSheet, $cordovaSms, $stateParams, ApiService, $cordovaSQLite, $ionicPlatform, $ionicPopup, $ionicModal, $ionicLoading, $cordovaCamera, $cordovaBarcodeScanner, $cordovaImagePicker, $cordovaFile, $cordovaFileTransfer, SqlService) {
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
        var alertPopup = null;
        var showPopup = function (title, type, callback) {
            if (alertPopup !== null) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert({
                title: title,
                okType: 'button-' + type
            });
            alertPopup.then(function (res) {
                if (typeof (callback) == 'function') callback(res);
            });
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
                    //  var url = ENV.api + '/api/tms/upload/img?BookingNo=' + $scope.Detail.csbk1.BookingNo;
                    // var url = ApiService.Uri('/api/tms/upload/img').addSearch('BookingNo', $scope.Detail.BookingNo);
console.log(url);
console.log('url');
                    var filePath = imageUri,
                        trustHosts = true,
                        options = {
                            fileName: moment().format('YYYY-MM-DD-HH-mm-ss').toString() + '.jpg'
                        };
                    $cordovaFileTransfer.upload(url, filePath, options, trustHosts)
                        .then(function (result) {
                            $ionicLoading.hide();
                            showPopup('Upload Successfully', 'calm');
                        }, function (err) {
                            $ionicLoading.hide();
                            console.error(err);
                            showPopup(err.message, 'assertive');
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
          var strSqlFilter="BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                SqlService.Select('Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo','*',strSqlFilter).then(function (results) {
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
                        $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                        checkStatusCode($scope.Detail.csbk1.StatusCode);

                        /*
                        $cordovaSQLite.execute(db, "SELECT * FROM CsbkDetail  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'")
                            .then(
                                function (results) {
                                    if (results.rows.length > 0) {
                                        $scope.Detail.csbk1 = results.rows.item(0);
                                        for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                                            $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                                        }
                                        $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
                                        checkStatusCode($scope.Detail.csbk1.StatusCode);
                                    } else {}
                                },
                                function (error) {}
                            );
                            */
                    } else {
                        if (is.not.empty($scope.Detail.csbk1.BookingNo)) {
                          console.log('aaaa');
                            var objUri = ApiService.Uri('/api/tms/csbk2').addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                            ApiService.Get(objUri, true).then(function success(result) {
                                var results = result.data.results;
                                if (is.not.empty(results)) {
                                    $scope.Detail.csbk1 = results.csbk1;
                                    $scope.Detail.csbk2s = results.csbk2s;
                                }
                                for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                                    $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                                }
                                $scope.Detail.CashAmt = $scope.Detail.AllBalance - $scope.Detail.csbk1.DiscountAmt - $scope.Detail.csbk1.PaidAmt;
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
                                checkStatusCode($scope.Detail.csbk1.StatusCode);
                            });
                        }
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
        }
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
            var objUri = ApiService.Uri('/api/tms/upload/img').addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
            ApiService.Post( objUri, jsonData, true ).then( function success( result ) {
          showPopup('Upload Successfully','calm', function(res){
              $scope.closeModal();
          });
      } );
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
                    SqlService.Select('Csbk1','*',"BookingNo='" + $scope.Detail.csbk1.BookingNo + "'").then(
                        function (results) {
                            if (results.rows.length > 0) {
                                var Csbk1_acc = results.rows.item(0);
                                $scope.Detail.ScanDate = Csbk1_acc.ScanDate;
                                var objUri = ApiService.Uri('/api/tms/csbk1/update');
                                objUri.addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                                objUri.addSearch('Amount', $scope.Detail.csbk1.CollectedAmt);
                                objUri.addSearch('ActualDeliveryDate', $scope.Detail.ScanDate);
                                ApiService.Get(objUri, false).then(function success(result) {
                                    for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                                        var objUri = ApiService.Uri('/api/tms/csbk2/update');
                                        objUri.addSearch('CollectedPcs', $scope.Detail.csbk2s[intI].CollectedPcs);
                                        objUri.addSearch('AddQty', $scope.Detail.csbk2s[intI].AddQty);
                                        objUri.addSearch('TrxNo', $scope.Detail.csbk2s[intI].TrxNo);
                                        objUri.addSearch('LineItemNo', $scope.Detail.csbk2s[intI].LineItemNo);
                                        ApiService.Get(objUri, false).then(function success(result) {});
                                    }
                                });
                            } else {}
                        },
                        function (error) {}
                    );

                    objUri = ApiService.Uri('/api/tms/csbk1/confirm');
                    objUri.addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
                    ApiService.Get(objUri, true).then(function success(result) {
                        /*
                                      $ionicPlatform.ready(function () {
                                          if (!ENV.fromWeb) {

                                          } else {
                                              if (db_websql) {
                                                  var Csbk1 = {
                                                      CompletedFlag: 'Y',
                                                      CollectedAmt: $scope.Detail.csbk1.CollectedAmt,
                                                      BookingNo: $scope.Detail.csbk1.BookingNo
                                                  };
                                                  //  db_update_Csbk1_Accept(Csbk1);
                                                  db_update_Csbk1Detail_Accept(Csbk1);
                                                  db_update_Csbk1_Accept(Csbk1);
                                                  db_websql.transaction(function (tx) {
                                                      //    db_strSql = "select * from Csbk2_Accept where BookingNo='" + $scope.BookingNo + "'";
                                                      db_strSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                                                      tx.executeSql(db_strSql, [], function (tx, results) {
                                                          if (results.rows.length > 0) {
                                                              var Csbk2_AcceptResultsLength = results.rows.length;
                                                              for (var i = 0; i < results.rows.length; i++) {
                                                                  var Csbk2_acc = results.rows.item(i);
                                                                  var jobs = {
                                                                      CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                                                                      AddQty: $scope.Detail.csbk2s[i].AddQty,
                                                                      TrxNo: Csbk2_acc.TrxNo,
                                                                      LineItemNo: Csbk2_acc.LineItemNo,
                                                                  };
                                                                  db_update_Csbk2_Accept(jobs);
                                                              }
                                                              db_websql.transaction(function (tx) {
                                                                  db_strSql = "select * from Csbk1_Accept where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                                                                  tx.executeSql(db_strSql, [], function (tx, results) {
                                                                      if (results.rows.length > 0) {
                                                                          var Csbk1_acc = results.rows.item(0);
                                                                          $scope.Detail.ScanDate = Csbk1_acc.ScanDate;
                                                                          strUri = '/api/tms/csbk1/update?BookingNo=' + $scope.Detail.csbk1.BookingNo + '&Amount=' + $scope.Detail.csbk1.CollectedAmt + '&ActualDeliveryDate=' + $scope.Detail.ScanDate;
                                                                          ApiService.Get(strUri, true).then(function success(result) {
                                                                              for (var intI = 0; intI < Csbk2_AcceptResultsLength; intI++) {
                                                                                  strUri = '/api/tms/csbk2/update?CollectedPcs=' + $scope.Detail.csbk2s[intI].CollectedPcs + '&AddQty=' + $scope.Detail.csbk2s[intI].AddQty + '&TrxNo=' + $scope.Detail.csbk2s[intI].TrxNo + '&LineItemNo=' + $scope.Detail.csbk2s[intI].LineItemNo;
                                                                                  ApiService.Get(strUri, true).then(function success(result) {});
                                                                              }
                                                                          });
                                                                      }
                                                                  });
                                                              });
                                                          }
                                                      });
                                                  }, dbError);
                                              }
                                          }
                                      });
                                      */
                        $state.go('jobListingList', {}, {});
                    });
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
                        'Collected': $scope.Detail.CashAmt
                    }, {
                        reload: true
                    });

                    //
                    // if (!ENV.fromWeb) {
                    //
                    //     // var sqlupdateCompletedFlag = "update Csbk1 set CollectedAmt=? where BookingNo=?";
                    //     // $cordovaSQLite.execute(db, sqlupdateCompletedFlag, [$scope.Detail.csbk1.CollectedAmt, $scope.Detail.csbk1.BookingNo])
                    //     //     .then(function (result) {}, function (error) {});
                    //     // var sqlupdateCompletedFlag1 = "update CsbkDetail set CollectedAmt=? where BookingNo='" + $scope.Detail.csbk1.BookingNo + "' ";
                    //     // $cordovaSQLite.execute(db, sqlupdateCompletedFlag1, [$scope.Detail.csbk1.CollectedAmt])
                    //     //     .then(function (result) {}, function (error) {});
                    //
                    //     $cordovaSQLite.execute(db, "SELECT * FROM Csbk2  left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'")
                    //         .then(
                    //             function (results) {
                    //                 if (results.rows.length > 0) {
                    //                     for (var i = 0; i < results.rows.length; i++) {
                    //                         var Csbk1_acc = results.rows.item(i);
                    //                         var sqlupdateCollectedPcs = "update Csbk2 set CollectedPcs=?,AddQty=? where TrxNo=? and LineItemNo=?";
                    //                         $cordovaSQLite.execute(db, sqlupdateCollectedPcs, [
                    //                                 $scope.Detail.csbk2s[i].CollectedPcs,
                    //                                 $scope.Detail.csbk2s[i].AddQty,
                    //                                 Csbk1_acc.TrxNo,
                    //                                 Csbk1_acc.LineItemNo
                    //                             ])
                    //                             .then(function (result) {}, function (error) {});
                    //                     }
                    //                     $state.go('jobListingConfirm', {
                    //                         'BookingNo': $scope.Detail.csbk1.BookingNo,
                    //                         'JobNo': $stateParams.JobNo,
                    //                         'CollectedAmt': $scope.Detail.csbk1.CollectedAmt,
                    //                         'Collected': $scope.Detail.CashAmt
                    //                     }, {
                    //                         reload: true
                    //                     });
                    //                 } else {}
                    //             },
                    //             function (error) {}
                    //         );
                    // } else {
                    //     if (db_websql) {
                    //         var Csbk1 = {
                    //             CollectedAmt: $scope.Detail.csbk1.CollectedAmt,
                    //             BookingNo: $scope.Detail.csbk1.BookingNo
                    //         };
                    //         db_update_Csbk1DetailAmount_Accept(Csbk1);
                    //         db_websql.transaction(function (tx) {
                    //             db_strSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on  Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'"; //db_strSql = 'select * from Csbk2_Accept where';
                    //             tx.executeSql(db_strSql, [], function (tx, results) {
                    //                 if (results.rows.length > 0) {
                    //                     for (var i = 0; i < results.rows.length; i++) {
                    //                         var Csbk2_acc = results.rows.item(i);
                    //                         var jobs = {
                    //                             CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                    //                             AddQty: $scope.Detail.csbk2s[i].AddQty,
                    //                             TrxNo: Csbk2_acc.TrxNo,
                    //                             LineItemNo: Csbk2_acc.LineItemNo,
                    //                         };
                    //                         db_update_Csbk2_Accept(jobs);
                    //                     }
                    //                     $state.go('jobListingConfirm', {
                    //                         'BookingNo': $scope.Detail.csbk1.BookingNo,
                    //                         'JobNo': $stateParams.JobNo,
                    //                         'CollectedAmt': $scope.Detail.csbk1.CollectedAmt,
                    //                         'Collected': $scope.Detail.CashAmt,
                    //                     }, {
                    //                         reload: true
                    //                     });
                    //                 }
                    //             });
                    //         }, dbError);
                    //     }
                    //
                    // }
                });
            }
        };
        $scope.returnList = function () {
            $state.go('jobListingList', {}, {});
        };
        $scope.checkQty = function (csbk2) {
            if (csbk2.CollectedPcs > csbk2.Pcs) {
                showPopup('Collected Qty Limited', 'assertive', function (res) {});
                csbk2.CollectedPcs = Pcs;
            }
        };

        var objUri = ApiService.Uri('/api/tms/rcbp1').addSearch('BookingNo', $scope.Detail.csbk1.BookingNo);
        ApiService.Get(objUri, true).then(function success(result) {
            var results = result.data.results;
            if (is.not.empty(results)) {
                $scope.Detail.PhoneNumber = "tel:" + results[0].Handphone1;
                if (is.equal(results[0].Handphone1, '')) {
                    $scope.Detail.PhoneNumber = "tel:" + results[0].Telephone;
                }
            }
        });
        $('#iCollectedAmt').on('keydown', function (e) {
            if (e.which === 9 || e.which === 13) {
                $scope.gotoConfirm();
                console.log('gotoConfirm');
            }
        });
        showTobk();
    }
]);

app.controller('JoblistingConfirmCtrl', ['ENV', '$scope', '$state', '$stateParams', 'ApiService', '$ionicPopup', '$ionicPlatform', '$cordovaSQLite', 'SqlService',
    function (ENV, $scope, $state, $stateParams, ApiService, $ionicPopup, $ionicPlatform, $cordovaSQLite, SqlService) {

        var alertPopup = null,
            canvas = document.getElementById('signatureCanvas'),
            signaturePad = new SignaturePad(canvas);
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
            Csbk2ReusltLength: 0
        };
        $ionicPlatform.ready(function () {
            SqlService.Select('Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo','*',"BookingNo='" + $scope.Detail.BookingNo + "'").then(function (results) {
                    if (results.rows.length > 0) {
                        $scope.Detail.Csbk2ReusltLength = results.rows.length;
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

            // if (!ENV.fromWeb) {
            //     $cordovaSQLite.execute(db, "SELECT * FROM Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.BookingNo + "' ")
            //         .then(
            //             function (results) {
            //                 if (results.rows.length > 0) {
            //                     $scope.Detail.Csbk2ReusltLength = results.rows.length;
            //                     for (var i = 0; i < results.rows.length; i++) {
            //                         var Csbk2_acc = results.rows.item(i);
            //                         var Csbk2s = {
            //                             TrxNo: Csbk2_acc.TrxNo,
            //                             LineItemNo: Csbk2_acc.LineItemNo,
            //                             CollectedPcs: Csbk2_acc.CollectedPcs,
            //                             AddQty: Csbk2_acc.AddQty,
            //                         };
            //                         $scope.Detail.csbk2s.push(Csbk2s);
            //                         $scope.Detail.Packages = $scope.Detail.Packages + Csbk2_acc.CollectedPcs;
            //                     }
            //                 } else {}
            //             },
            //             function (error) {}
            //         );
            // } else {
            //     if (db_websql) {
            //         db_websql.transaction(function (tx) {
            //             db_strSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.BookingNo + "'"; //db_strSql = 'select * from Csbk2_Accept where';
            //             tx.executeSql(db_strSql, [], function (tx, results) {
            //                 if (results.rows.length > 0) {
            //                     $scope.Detail.Csbk2ReusltLength = results.rows.length;
            //                     for (var i = 0; i < results.rows.length; i++) {
            //                         var Csbk2_acc = results.rows.item(i);
            //                         var Csbk2s = {
            //                             TrxNo: Csbk2_acc.TrxNo,
            //                             LineItemNo: Csbk2_acc.LineItemNo,
            //                             CollectedPcs: Csbk2_acc.CollectedPcs,
            //                             AddQty: Csbk2_acc.AddQty
            //                         };
            //                         $scope.Detail.csbk2s.push(Csbk2s);
            //                         $scope.Detail.Packages = $scope.Detail.Packages + Csbk2_acc.CollectedPcs;
            //                     }
            //                 }
            //             });
            //         }, dbError);
            //     }
            // }
        });

        function resizeCanvas() {
            var ratio = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth - 50;
            canvas.height = screen.height / 3;
        };
        var showPopup = function (title, type, callback) {
            if (alertPopup !== null) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert({
                title: title,
                okType: 'button-' + type
            });
            alertPopup.then(function (res) {
                if (typeof (callback) == 'function') callback(res);
            });
        };
        var getSignature = function () {
            var objUri = ApiService.Uri('/api/tms/csbk1/attach').addSearch('BookingNo', $stateParams.BookingNo);
            // var strUri = '/api/tms/csbk1/attach?BookingNo=' + $stateParams.BookingNo;
            ApiService.Get(objUri, true).then(function success(result) {
                if (is.not.undefined(result.data.results)) {
                    $scope.signature = 'data:image/png;base64,' + result.data.results;
                }
            });
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
            $scope.signature = sigImg;
        };
        $scope.confirm = function () {
            var Csbk1Filter = " BookingNo='" + $scope.Detail.BookingNo + "'";
            var Csbk1 = {
                CompletedFlag: 'Y',
                CompletedDate: moment(new Date()).format('YYYYMMDD'),
                DriverId: sessionStorage.getItem("strDriverId"),
                CollectedAmt: $scope.Detail.Amount
            };
            SqlService.Update('Csbk1', Csbk1, Csbk1Filter).then(function (res) {});

            $scope.signature = signaturePad.toDataURL();
            var objUri = ApiService.Uri('/api/tms/csbk1/confirm').addSearch('BookingNo', $stateParams.BookingNo);
            // var strUri = '/api/tms/csbk1/confirm?BookingNo=' + $stateParams.BookingNo;
            ApiService.Get(objUri, true).then(function success(result) {
                // var Csbk1 = {
                //     CompletedFlag: 'Y',
                //     BookingNo: $scope.Detail.BookingNo
                // };
                // if (!ENV.fromWeb) {
                //     var currentDate = moment(new Date()).format('YYYYMMDD');
                //     var sqlupdateCompletedFlag = "update Csbk1 set CompletedFlag=?,CompletedDate=? ,DriverId=? ,CollectedAmt=? where BookingNo='" + $scope.Detail.BookingNo + "' ";
                //     $cordovaSQLite.execute(db, sqlupdateCompletedFlag, ["Y", currentDate, sessionStorage.getItem("strDriverId"), $scope.Detail.Amount])
                //         .then(function (result) {}, function (error) {});
                // } else {
                //     db_update_Csbk1_Accept(Csbk1);
                // }
                var jsonData = {
                    'Base64': $scope.signature,
                    'FileName': 'signature.Png'
                };
                // var strUri = '/api/tms/upload/img?BookingNo=' + $scope.Detail.BookingNo;
                var objUri = ApiService.Uri('/api/tms/upload/img').addSearch('BookingNo', $scope.Detail.BookingNo);
                ApiService.Post(objUri, jsonData, true).then(function success(result) {
                    if ($scope.Detail.Amount > 0) {
                        if (is.null($scope.signature)) {
                            showPopup('Please Signature', 'calm', function (res) {});
                        } else {
                            showPopup('Confirm Success', 'calm', function (res) {
                                var objUri = ApiService.Uri('/api/tms/slcr1/complete');
                                objUri.addSearch('BookingNo', $scope.Detail.BookingNo);
                                objUri.addSearch('JobNo', $scope.Detail.JobNo);
                                objUri.addSearch('CashAmt', $scope.Detail.CashAmt);
                                objUri.addSearch('UpdateBy', sessionStorage.getItem("strDriverId"));
                                objUri.addSearch('CollectBy', sessionStorage.getItem("strVehicleNo"));
                                ApiService.Get(objUri, true).then(function success(result) {});
                                $scope.returnList();
                            });
                        }
                    } else {
                        showPopup('Confirm Success', 'calm', function (res) {
                            // strUri = '/api/tms/slcr1/complete?BookingNo=' + $scope.Detail.BookingNo + '&JobNo=' + $scope.Detail.JobNo + '&CashAmt=' + $scope.Detail.CashAmt + '&UpdateBy=' + sessionStorage.getItem("strDriverId") + '&CollectBy=' + sessionStorage.getItem("strVehicleNo");
                            var objUri = ApiService.Uri('/api/tms/slcr1/complete');
                            objUri.addSearch('BookingNo', $scope.Detail.BookingNo);
                            objUri.addSearch('JobNo', $scope.Detail.JobNo);
                            objUri.addSearch('CashAmt', $scope.Detail.CashAmt);
                            objUri.addSearch('UpdateBy', sessionStorage.getItem("strDriverId"));
                            objUri.addSearch('CollectBy', sessionStorage.getItem("strVehicleNo"));
                            ApiService.Get(objUri, true).then(function success(result) {});
                            $scope.returnList();
                        });
                    }
                });

                // updae ActualCollectionDate
                var strSql = "SELECT * FROM Csbk1  where BookingNo='" + $scope.Detail.BookingNo + "'";
                // $cordovaSQLite.execute(db, "SELECT * FROM Csbk1  where BookingNo='" + $scope.Detail.BookingNo + "'")
                SqlService.Select('Csbk1','*',"BookingNo='" + $scope.Detail.BookingNo + "'").then(
                    function (results) {
                        if (results.rows.length > 0) {
                            var Csbk1_acc = results.rows.item(0);
                            $scope.Detail.ScanDate = Csbk1_acc.ScanDate;
                            var objUri = ApiService.Uri('/api/tms/csbk1/update');
                            objUri.addSearch('BookingNo', $scope.Detail.BookingNo);
                            objUri.addSearch('Amount', $scope.Detail.Amount);
                            objUri.addSearch('ActualCollectionDate', $scope.Detail.ScanDate);
                            ApiService.Get(objUri, true).then(function success(result) {
                                for (var intI = 0; intI < $scope.Detail.Csbk2ReusltLength; intI++) {
                                    var objUri = ApiService.Uri('/api/tms/csbk2/update');
                                    objUri.addSearch('CollectedPcs', $scope.Detail.csbk2s[intI].CollectedPcs);
                                    objUri.addSearch('AddQty', $scope.Detail.csbk2s[intI].AddQty);
                                    objUri.addSearch('TrxNo', $scope.Detail.csbk2s[intI].TrxNo);
                                    objUri.addSearch('LineItemNo', $scope.Detail.csbk2s[intI].LineItemNo);
                                    ApiService.Get(objUri, false).then(function success(result) {});
                                }
                            });
                        } else {}
                    },
                    function (error) {}
                );

            });
        };
        getSignature();
        resizeCanvas();
    }
]);

app.controller('UploadCtrl', ['ENV', '$scope', '$state', '$stateParams', '$ionicPopup', 'FileUploader', 'ApiService',
    function (ENV, $scope, $state, $stateParams, $ionicPopup, FileUploader, ApiService) {
        var alertPopup = null;
        $scope.Detail = {
            BookingNo: $stateParams.BookingNo,
            JobNo: $stateParams.JobNo
        };
        var showPopup = function (title, type, callback) {
            if (alertPopup != null) {
                alertPopup.close();
                alertPopup = null;
            }
            alertPopup = $ionicPopup.alert({
                title: title,
                okType: 'button-' + type
            });
            alertPopup.then(function (res) {
                if (typeof (callback) == 'function') callback(res);
            });
        };
        $scope.returnDoc = function () {
            $state.go('jobListingDetail', {
                BookingNo: $stateParams.BookingNo,
            }, {});
        };
        var uploader = $scope.uploader = new FileUploader({
              url: ENV.api + '/api/tms/upload/img?BookingNo=' + $scope.Detail.BookingNo

        });

        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            showPopup('Upload Successfully', 'calm', function (res) {
                $scope.returnDoc();
            });
        };
    }
]);
