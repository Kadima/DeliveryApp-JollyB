'use strict';
app.controller('JoblistingListCtrl', ['ENV', '$scope', '$state', '$ionicLoading', '$ionicPopup', '$ionicFilterBar', '$ionicActionSheet', 'ApiService', '$ionicPlatform', '$cordovaSQLite',
  function(ENV, $scope, $state, $ionicLoading, $ionicPopup, $ionicFilterBar, $ionicActionSheet, ApiService, $ionicPlatform, $cordovaSQLite) {
    var filterBarInstance,
      dataResults = new Array();
    // $scope.Search = {
    //   BookingNo: ''
    // };
    $scope.returnMain = function() {
      $state.go('index.main', {}, {
        reload: true
      });
    };
    var getBookingNo = function() {
      $ionicPlatform.ready(function() {
        if (!ENV.fromWeb) {
          $cordovaSQLite.execute(db, 'SELECT * FROM Csbk1 ORDER BY TrxNo DESC')
            .then(
              function(results) {
                if (results.rows.length > 0) {
                  for (var i = 0; i < results.rows.length; i++) {
                    var Csbk1_acc = results.rows.item(i);
                    var reuturnTime = '';
                    if (is.equal(Csbk1_acc.CollectionTimeStart, '') && is.equal(Csbk1_acc.CollectionTimeEnd, '')) {
                      reuturnTime = Csbk1_acc.ColTimeFrom + '-' + Csbk1_acc.ColTimeTo;
                    } else {
                      reuturnTime = Csbk1_acc.CollectionTimeStart + '-' + Csbk1_acc.CollectionTimeEnd;
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
                      time: is.equal(Csbk1_acc.StatusCode, 'DLV') ? DLVReturntime : reuturnTime,
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
                } else {}
              },
              function(error) {}
            );
        } else {
          if (dbTms) {
            dbTms.transaction(function(tx) {
              dbSql = 'select * from Csbk1_Accept';
              tx.executeSql(dbSql, [], function(tx, results) {
                if (results.rows.length > 0) {
                  for (var i = 0; i < results.rows.length; i++) {
                    var Csbk1_acc = results.rows.item(i);
                    var reuturnTime = '';
                    if (is.equal(Csbk1_acc.CollectionTimeStart, '') && is.equal(Csbk1_acc.CollectionTimeEnd, '')) {
                      reuturnTime = Csbk1_acc.ColTimeFrom + '-' + Csbk1_acc.ColTimeTo;
                    } else {
                      reuturnTime = Csbk1_acc.CollectionTimeStart + '-' + Csbk1_acc.CollectionTimeEnd;
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
                      time: is.equal(Csbk1_acc.StatusCode, 'DLV') ? DLVReturntime : reuturnTime,
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
                } else {

                }
              });
            }, dbError);
          }
        }
      });
    };
    getBookingNo();
    $scope.deleteCsbk1 = function(index, job) {
      console.log(job.bookingno);
      if (!ENV.fromWeb) {
        var sql = "delete from Csbk1 where BookingNo='" + job.bookingno + "'";
        $cordovaSQLite.execute(db, sql, [])
          .then(function(result) {}, function(error) {});
      } else {
        db_del_Csbk1_Accept_detail(job.bookingno);
      }
      $scope.jobs.splice(index, 1);
    };
    $scope.showFilterBar = function() {
      filterBarInstance = $ionicFilterBar.show({
        items: $scope.jobs,
        expression: function(filterText, value, index, array) {
          return value.bookingno.indexOf(filterText) > -1;
        },
        //filterProperties: ['bookingno'],
        update: function(filteredItems, filterText) {
          $scope.jobs = filteredItems;
          if (filterText) {
            console.log(filterText);
          }
        }
      });
    };

    $scope.refreshItems = function() {
      if (filterBarInstance) {
        filterBarInstance();
        filterBarInstance = null;
      }
      $timeout(function() {
        getBookingNo();
        $scope.$broadcast('scroll.refreshComplete');
      }, 1000);
    };

    $scope.gotoDetail = function(job) {
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
  function($scope, $state, $stateParams) {
    $scope.List = {
      BookingNo: $stateParams.BookingNo
    };
    if (dbTms) {
      dbTms.transaction(function(tx) {
        dbSql = 'select * from Csbk1_Accept';
        tx.executeSql(dbSql, [], function(tx, results) {
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

    $scope.returnSearch = function() {
      $state.go('jobListing', {}, {
        reload: true
      });
    };
    $scope.gotoDetail = function(job) {
      $state.go('jobListingDetail', {}, {
        reload: true
      });
    };
  }
]);

app.controller('JoblistingDetailCtrl', ['ENV', '$scope', '$state', '$ionicActionSheet', '$cordovaSms', '$stateParams', 'ApiService', '$cordovaSQLite', '$ionicPlatform',
  function(ENV, $scope, $state, $ionicActionSheet, $cordovaSms, $stateParams, ApiService, $cordovaSQLite, $ionicPlatform) {
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
      ScanDate:"",
      csbk2s: [],
      csbk2: {}
    };

$scope.capturePhoto=function(){
  navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
       destinationType: Camera.DestinationType.FILE_URI,
       sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
  });

  function onSuccess(imageData) {
      var image = document.getElementById('myImage');
      image.src = "data:image/jpeg;base64," + imageData;
  }

  function onFail(message) {
      // alert('Failed because: ' + message);
  }

};

    var strUri = '/api/tms/rcbp1?BookingNo=' + $scope.Detail.csbk1.BookingNo;
    ApiService.GetParam(strUri, true).then(function success(result) {
      var results = result.data.results;
      if (is.not.empty(results)) {
        $scope.Detail.PhoneNumber = "tel:" + results[0].Handphone1;
        if (is.equal(results[0].Handphone1, '')) {
          $scope.Detail.PhoneNumber = "tel:" + results[0].Telephone;
        }
      }
    });
    $('#iCollectedPcs').focus(function(e) {
      console.log('====focus');
    });

    $('#iCollectedAmt').on('keydown', function(e) {
      if (e.which === 9 || e.which === 13) {
        $scope.gotoConfirm();
      }
    });

    var showTobk = function() {
      if (!ENV.fromWeb) {
        $ionicPlatform.ready(function() {
          $cordovaSQLite.execute(db, "SELECT * FROM Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "' ")
            .then(
              function(results) {
                if (results.rows.length > 0) {
                  for (var i = 0; i < results.rows.length; i++) {
                    var csbk2s = {
                      TrxNo: results.rows.item(i).TrxNo,
                      LineItemNo: results.rows.item(i).LineItemNo,
                      BoxCode: results.rows.item(i).BoxCode,
                      Pcs: results.rows.item(i).Pcs,
                      UnitRate: results.rows.item(i).UnitRate,
                      CollectedPcs: results.rows.item(i).CollectedPcs
                    };
                    $scope.Detail.csbk2s.push(csbk2s);
                  }
                  $cordovaSQLite.execute(db, "SELECT * FROM CsbkDetail  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'")
                    .then(
                      function(results) {
                        if (results.rows.length > 0) {
                          $scope.Detail.csbk1 = results.rows.item(0);
                          for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                            $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                          }
                          $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt;
                          checkStatusCode($scope.Detail.csbk1.StatusCode);
                        } else {}
                      },
                      function(error) {}
                    );

                } else {
                  if (is.not.empty($scope.Detail.csbk1.BookingNo)) {
                    var strUri = '/api/tms/csbk2?BookingNo=' + $scope.Detail.csbk1.BookingNo;
                    ApiService.GetParam(strUri, true).then(function success(result) {
                      var results = result.data.results;
                      if (is.not.empty(results)) {
                        $scope.Detail.csbk1 = results.csbk1;
                        $scope.Detail.csbk2s = results.csbk2s;
                      }
                      for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                        $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                      }
                      $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt;
                      if ($scope.Detail.csbk1.CollectedAmt <= 0) {
                        $scope.Detail.csbk1.CollectedAmt = $scope.Detail.AllBalance;
                      }
                      for (var i = 0; i < $scope.Detail.csbk2s.length; i++) {
                        console.log($scope.Detail.csbk2s.length);
                        console.log('$scope.Detail.csbk2s.length');
                        var sql = 'INSERT INTO Csbk2(TrxNo,LineItemNo, BoxCode,Pcs,UnitRate,CollectedPcs) values(?,?,?,?,?,?)';
                        $cordovaSQLite.execute(db, sql, [
                            $scope.Detail.csbk2s[i].TrxNo,
                            $scope.Detail.csbk2s[i].LineItemNo,
                            $scope.Detail.csbk2s[i].BoxCode,
                            $scope.Detail.csbk2s[i].Pcs,
                            $scope.Detail.csbk2s[i].UnitRate,
                            $scope.Detail.csbk2s[i].CollectedPcs,
                          ])
                          .then(function(result) {}, function(error) {});
                      }
                      //    for ( i = 0; i < $scope.Detail.csbk1.length; i++) {
                      var sql1 = 'INSERT INTO CsbkDetail(BookingNo,JobNo,TrxNo,StatusCode,ItemNo,DepositAmt,DiscountAmt,CollectedAmt,CompletedFlag) values(?,?,?,?,?,?,?,?,?)';
                      $cordovaSQLite.execute(db, sql1, [
                          $scope.Detail.csbk1.BookingNo,
                          $scope.Detail.csbk1.JobNo,
                          $scope.Detail.csbk1.TrxNo,
                          $scope.Detail.csbk1.StatusCode,
                          $scope.Detail.csbk1.ItemNo,
                          $scope.Detail.csbk1.DepositAmt,
                          $scope.Detail.csbk1.DiscountAmt,
                          $scope.Detail.csbk1.CollectedAmt,
                          $scope.Detail.csbk1.CompletedFlag
                        ])
                        .then(function(result) {}, function(error) {});
                      //  }
                      checkStatusCode($scope.Detail.csbk1.StatusCode);
                    });
                  }
                }
              },
              function(error) {}
            );
        });
      } else {
        if (dbTms) {
          dbTms.transaction(function(tx) {
            dbSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
            tx.executeSql(dbSql, [], function(tx, results) {
              if (results.rows.length > 0) {
                for (var i = 0; i < results.rows.length; i++) {
                  var csbk2s = {
                    TrxNo: results.rows.item(i).TrxNo,
                    LineItemNo: results.rows.item(i).LineItemNo,
                    BoxCode: results.rows.item(i).BoxCode,
                    Pcs: results.rows.item(i).Pcs,
                    UnitRate: results.rows.item(i).UnitRate,
                    CollectedPcs: results.rows.item(i).CollectedPcs
                  };
                  $scope.Detail.csbk2s.push(csbk2s);
                }
                dbTms.transaction(function(tx) {
                  dbSql = "select * from  Csbk1Detail_Accept  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                  tx.executeSql(dbSql, [], function(tx, results) {
                    if (results.rows.length > 0) {
                      var csbk1detail = '';
                      for (var i = 0; i < results.rows.length; i++) {
                        csbk1detail = results.rows.item(i);
                      }
                      $scope.Detail.csbk1 = csbk1detail;
                      for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                        $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                      }
                      $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt;
                      checkStatusCode($scope.Detail.csbk1.StatusCode);
                    }
                  });
                }, dbError);
              } else {
                if (is.not.empty($scope.Detail.csbk1.BookingNo)) {
                  var strUri = '/api/tms/csbk2?BookingNo=' + $scope.Detail.csbk1.BookingNo;
                  ApiService.GetParam(strUri, true).then(function success(result) {
                    var results = result.data.results;
                    if (is.not.empty(results)) {
                      $scope.Detail.csbk1 = results.csbk1;
                      $scope.Detail.csbk2s = results.csbk2s;
                    }
                    for (var intI = 0; intI < $scope.Detail.csbk2s.length; intI++) {
                      $scope.Detail.AllBalance = $scope.Detail.AllBalance + $scope.Detail.csbk2s[intI].Pcs * $scope.Detail.csbk2s[intI].UnitRate;
                    }
                    $scope.Detail.AllBalance = $scope.Detail.AllBalance - $scope.Detail.csbk1.DepositAmt - $scope.Detail.csbk1.DiscountAmt;
                    if ($scope.Detail.csbk1.CollectedAmt <= 0) {
                      $scope.Detail.csbk1.CollectedAmt = $scope.Detail.AllBalance;
                    }
                    for (var i = 0; i < $scope.Detail.csbk2s.length; i++) {
                      db_add_Csbk2_Accept($scope.Detail.csbk2s[i]);
                    }
                    db_add_Csbk1Detail_Accept($scope.Detail.csbk1);
                    //      }
                    checkStatusCode($scope.Detail.csbk1.StatusCode);
                  });
                }
              }
            });
          }, dbError);
        }
      }
    };

    var checkStatusCode = function(StatusCode) {
      if (is.equal(StatusCode, 'DLV')) {
        $scope.title = 'Deliver : ' + $scope.Detail.csbk1.BookingNo;
      } else {
        $scope.title = 'Collect : ' + $scope.Detail.csbk1.BookingNo;
      }
    }
    $scope.showActionSheet = function() {
      var actionSheet = $ionicActionSheet.show({
        buttons: [{

          text: '<a ng-hef="tel:08605925888865">CALL  </a>'
        }, {
          text: 'SMS'
        }],
        //destructiveText: 'Delete',
        titleText: 'Select Picture',
        cancelText: 'Cancel',
        cancel: function() {
          // add cancel code..
        },
        buttonClicked: function(index) {
          if (index === 0) {
            // ng-href="tel:08605925888865"
          } else if (index === 1) {
            SMS();
          }
          return true;
        }
      });
    };
    $scope.gotoConfirm = function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.close();
      }
      if (is.equal($scope.Detail.csbk1.StatusCode, 'DLV')) {
        var strUri = '/api/tms/csbk1/confirm?BookingNo=' + $scope.Detail.csbk1.BookingNo;
        ApiService.GetParam(strUri, true).then(function success(result) {
          $ionicPlatform.ready(function() {
            if (!ENV.fromWeb) {
              var currentDate = moment(new Date()).format('YYYYMMDD');
              console.log($scope.Detail.csbk1.CollectedAmt);
              console.log('$scope.Detail.csbk1.CollectedAmt');
              var sqlupdateCompletedFlag = "update Csbk1 set CompletedFlag=?,CompletedDate=?,DriverId=?,CollectedAmt=? where BookingNo='" + $scope.Detail.csbk1.BookingNo + "' ";
              $cordovaSQLite.execute(db, sqlupdateCompletedFlag, ["Y", currentDate, sessionStorage.getItem("strDriverId"), $scope.Detail.csbk1.CollectedAmt])
                .then(function(result) {}, function(error) {});
              var sqlupdateCompletedFlag1 = "update CsbkDetail set CompletedFlag=? ,CollectedAmt=? where BookingNo='" + $scope.Detail.csbk1.BookingNo + "' ";
              $cordovaSQLite.execute(db, sqlupdateCompletedFlag1, ["Y", $scope.Detail.csbk1.CollectedAmt])
                .then(function(result) {}, function(error) {});
              $cordovaSQLite.execute(db, "SELECT * FROM Csbk2  left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'")
                .then(
                  function(results) {
                    if (results.rows.length > 0) {
                      for (var i = 0; i < results.rows.length; i++) {
                        var Csbk2_acc = results.rows.item(i);
                        var sqlupdateCollectedPcs = "update Csbk2 set CollectedPcs=? where TrxNo=? and LineItemNo=?";
                        $cordovaSQLite.execute(db, sqlupdateCollectedPcs, [
                            $scope.Detail.csbk2s[i].CollectedPcs,
                            Csbk2_acc.TrxNo,
                            Csbk2_acc.LineItemNo
                          ])
                          .then(function(result) {}, function(error) {});
                      }
                      strUri = '/api/tms/csbk1/update?BookingNo=' + $scope.Detail.csbk1.BookingNo + '&Amount=' + $scope.Detail.csbk1.CollectedAmt;
                      ApiService.GetParam(strUri, true).then(function success(result) {
                        for (var intI = 0; intI < results.rows.length; intI++) {
                          strUri = '/api/tms/csbk2/update?CollectedPcs=' + $scope.Detail.csbk2s[intI].CollectedPcs + '&TrxNo=' + Csbk2_acc.TrxNo + '&LineItemNo=' + Csbk2_acc.LineItemNo;
                          ApiService.GetParam(strUri, true).then(function success(result) {});
                        }
                      });
                    } else {}
                  },
                  function(error) {}
                );
            } else {
              if (dbTms) {
                var Csbk1 = {
                  CompletedFlag: 'Y',
                  CollectedAmt: $scope.Detail.csbk1.CollectedAmt,
                  BookingNo: $scope.Detail.csbk1.BookingNo
                };
                //  db_update_Csbk1_Accept(Csbk1);
                db_update_Csbk1Detail_Accept(Csbk1);
                db_update_Csbk1_Accept(Csbk1);
                dbTms.transaction(function(tx) {
                  //    dbSql = "select * from Csbk2_Accept where BookingNo='" + $scope.BookingNo + "'";
                  dbSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                  tx.executeSql(dbSql, [], function(tx, results) {
                    if (results.rows.length > 0) {
                      var Csbk2_acc = results.rows.item(i);
                      for (var i = 0; i < results.rows.length; i++) {
                        var jobs = {
                          CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                          TrxNo: Csbk2_acc.TrxNo,
                          LineItemNo: Csbk2_acc.LineItemNo,
                        };
                        db_update_Csbk2_Accept(jobs);
                      }
                      dbTms.transaction(function(tx) {
                        dbSql = "select * from Csbk1_Accept where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'";
                        tx.executeSql(dbSql, [], function(tx, results) {
                          if (results.rows.length > 0) {
                            for (var i = 0; i < results.rows.length; i++) {
                              var Csbk1_acc = results.rows.item(i);
                           $scope.Detail.ScanDate = Csbk1_acc.ScanDate;
                           console.log($scope.Detail.ScanDate );
                            }
                          }
                        });});

                      strUri = '/api/tms/csbk1/update?BookingNo=' + $scope.Detail.csbk1.BookingNo + '&Amount=' + $scope.Detail.csbk1.CollectedAmt+'&ActualDeliveryDate='+$scope.Detail.ScanDate ;
                      ApiService.GetParam(strUri, true).then(function success(result) {
                        for (var intI = 0; intI < results.rows.length; intI++) {
                          strUri = '/api/tms/csbk2/update?CollectedPcs=' + $scope.Detail.csbk2s[intI].CollectedPcs + '&TrxNo=' + Csbk2_acc.TrxNo + '&LineItemNo=' + Csbk2_acc.LineItemNo;
                          ApiService.GetParam(strUri, true).then(function success(result) {});
                        }
                      });

                    }
                  });
                }, dbError);
              }
            }
          });
          $state.go('jobListingList', {}, {});
        });
      } else {
        $ionicPlatform.ready(function() {
          if (!ENV.fromWeb) {
            console.log($scope.Detail.csbk1.CollectedAmt);
            console.log($scope.Detail.csbk1.BookingNo);
            console.log('$scope.Detail.csbk1.CollectedAmt');
            var sqlupdateCompletedFlag = "update Csbk1 set CollectedAmt=? where BookingNo=?";
            $cordovaSQLite.execute(db, sqlupdateCompletedFlag, [$scope.Detail.csbk1.CollectedAmt, $scope.Detail.csbk1.BookingNo])
              .then(function(result) {}, function(error) {});
            var sqlupdateCompletedFlag1 = "update CsbkDetail set CollectedAmt=? where BookingNo='" + $scope.Detail.csbk1.BookingNo + "' ";
            $cordovaSQLite.execute(db, sqlupdateCompletedFlag1, [$scope.Detail.csbk1.CollectedAmt])
              .then(function(result) {}, function(error) {});
            $cordovaSQLite.execute(db, "SELECT * FROM Csbk2  left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'")
              .then(
                function(results) {
                  if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                      var Csbk1_acc = results.rows.item(i);
                      var sqlupdateCollectedPcs = "update Csbk2 set CollectedPcs=? where TrxNo=? and LineItemNo=?";
                      $cordovaSQLite.execute(db, sqlupdateCollectedPcs, [
                          $scope.Detail.csbk2s[i].CollectedPcs,
                          Csbk1_acc.TrxNo,
                          Csbk1_acc.LineItemNo
                        ])
                        .then(function(result) {}, function(error) {});
                    }
                    $state.go('jobListingConfirm', {
                      'BookingNo': $scope.Detail.csbk1.BookingNo,
                      'JobNo': $stateParams.JobNo,
                      'CollectedAmt': $scope.Detail.csbk1.CollectedAmt,
                      'Collected': ""
                    }, {
                      reload: true
                    });

                  } else {

                  }
                },
                function(error) {

                }
              );
          } else {

            if (dbTms) {
              var Csbk1 = {
                CollectedAmt: $scope.Detail.csbk1.CollectedAmt,
                BookingNo: $scope.Detail.csbk1.BookingNo
              };
              db_update_Csbk1DetailAmount_Accept(Csbk1);
              dbTms.transaction(function(tx) {
                dbSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on  Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.csbk1.BookingNo + "'"; //dbSql = 'select * from Csbk2_Accept where';
                tx.executeSql(dbSql, [], function(tx, results) {
                  if (results.rows.length > 0) {
                    for (var i = 0; i < results.rows.length; i++) {
                      var Csbk2_acc = results.rows.item(i);
                      var jobs = {
                        CollectedPcs: $scope.Detail.csbk2s[i].CollectedPcs,
                        TrxNo: Csbk2_acc.TrxNo,
                        LineItemNo: Csbk2_acc.LineItemNo,
                      };
                      db_update_Csbk2_Accept(jobs);
                    }
                    $state.go('jobListingConfirm', {
                      'BookingNo': $scope.Detail.csbk1.BookingNo,
                      'JobNo': $stateParams.JobNo,
                      'CollectedAmt': $scope.Detail.csbk1.CollectedAmt,
                      'Collected': ''
                    }, {
                      reload: true
                    });
                  }
                });
              }, dbError);
            }

          }
        });
      }
    };
    $scope.returnList = function() {
      $state.go('jobListingList', {}, {});
    };
    var SMS = function() {
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
      var success = function() {};
      var error = function(e) {};
      $cordovaSms.send($scope.PhoneNumber, $scope.message, options, success, error);
    }
    showTobk();
  }
]);

app.controller('JoblistingConfirmCtrl', ['ENV', '$scope', '$state', '$stateParams', 'ApiService', '$ionicPopup', '$ionicPlatform', '$cordovaSQLite',
  function(ENV, $scope, $state, $stateParams, ApiService, $ionicPopup, $ionicPlatform, $cordovaSQLite) {

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
      Packages: 0,
      csbk2s: [],
      Csbk2ReusltLength: 0
    };
    $ionicPlatform.ready(function() {
      if (!ENV.fromWeb) {
        $cordovaSQLite.execute(db, "SELECT * FROM Csbk2 left join CsbkDetail on Csbk2.TrxNo = CsbkDetail.TrxNo  where BookingNo='" + $scope.Detail.BookingNo + "' ")
          .then(
            function(results) {
              if (results.rows.length > 0) {
                $scope.Detail.Csbk2ReusltLength = results.rows.length;
                for (var i = 0; i < results.rows.length; i++) {
                  var Csbk2_acc = results.rows.item(i);
                  var Csbk2s = {
                    TrxNo: Csbk2_acc.TrxNo,
                    LineItemNo: Csbk2_acc.LineItemNo,
                    CollectedPcs: Csbk2_acc.CollectedPcs,
                  };
                  $scope.Detail.csbk2s.push(Csbk2s);
                  $scope.Detail.Packages = $scope.Detail.Packages + Csbk2_acc.CollectedPcs;
                }
              } else {}
            },
            function(error) {}
          );
      } else {
        if (dbTms) {
          dbTms.transaction(function(tx) {
            dbSql = "select * from Csbk2_Accept left join Csbk1Detail_Accept on Csbk2_Accept.TrxNo = Csbk1Detail_Accept.TrxNo  where BookingNo='" + $scope.Detail.BookingNo + "'"; //dbSql = 'select * from Csbk2_Accept where';
            tx.executeSql(dbSql, [], function(tx, results) {
              if (results.rows.length > 0) {
                $scope.Detail.Csbk2ReusltLength = results.rows.length;
                for (var i = 0; i < results.rows.length; i++) {
                  var Csbk2_acc = results.rows.item(i);
                  var Csbk2s = {
                    TrxNo: Csbk2_acc.TrxNo,
                    LineItemNo: Csbk2_acc.LineItemNo,
                    CollectedPcs: Csbk2_acc.CollectedPcs,
                  };
                  $scope.Detail.csbk2s.push(Csbk2s);
                  $scope.Detail.Packages = $scope.Detail.Packages + Csbk2_acc.CollectedPcs;
                }
              }
            });
          }, dbError);
        }
      }
    });




    function resizeCanvas() {
      var ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth - 50;
      canvas.height = screen.height / 3;
    };
    var showPopup = function(title, type, callback) {
      if (alertPopup !== null) {
        alertPopup.close();
        alertPopup = null;
      }
      alertPopup = $ionicPopup.alert({
        title: title,
        okType: 'button-' + type
      });
      alertPopup.then(function(res) {
        if (typeof(callback) == 'function') callback(res);
      });
    };
    var getSignature = function() {
      var strUri = '/api/tms/csbk1/attach?BookingNo=' + $stateParams.BookingNo;
      console.log(strUri);
      ApiService.GetParam(strUri, true).then(function success(result) {
        if (is.not.undefined(result.data.results)) {
          $scope.signature = 'data:image/png;base64,' + result.data.results;
        }
      });
    };
    $scope.returnList = function() {
      $state.go('jobListingList', {}, {});
    };
    $scope.returnDetail = function() {
      $state.go('jobListingDetail', {
        BookingNo: $stateParams.BookingNo
      }, {
        reload: true
      });
    };
    $scope.clearCanvas = function() {
      $scope.signature = null;
      signaturePad.clear();
    }
    $scope.saveCanvas = function() {
      var sigImg = signaturePad.toDataURL();
      $scope.signature = sigImg;
    }
    $scope.confirm = function() {

      var strUri = '/api/tms/csbk1/confirm?BookingNo=' + $stateParams.BookingNo;
      ApiService.GetParam(strUri, true).then(function success(result) {
        var Csbk1 = {
          CompletedFlag: 'Y',
          BookingNo: $scope.Detail.BookingNo
        };
        if (!ENV.fromWeb) {
          var currentDate = moment(new Date()).format('YYYYMMDD');
          var sqlupdateCompletedFlag = "update Csbk1 set CompletedFlag=?,CompletedDate=? ,DriverId=? ,CollectedAmt=? where BookingNo='" + $scope.Detail.BookingNo + "' ";
          $cordovaSQLite.execute(db, sqlupdateCompletedFlag, ["Y", currentDate, sessionStorage.getItem("strDriverId"), $scope.Detail.Amount])
            .then(function(result) {}, function(error) {});
        } else {
          db_update_Csbk1_Accept(Csbk1);
        }
        var jsonData = {
          'Base64': $scope.signature,
          'FileName': 'signature.Png'
        };
        var strUri = '/api/tms/upload/img?BookingNo=' + $scope.Detail.BookingNo;
        ApiService.Post(strUri, jsonData, true).then(function success(result) {
          if ($scope.Detail.Amount > 0) {
            if (is.null($scope.signature)) {
              showPopup('Please Signature', 'calm', function(res) {});
            } else {
              showPopup('Confirm Success', 'calm', function(res) {
                $scope.returnList();
              });
            }
          } else {
            showPopup('Confirm Success', 'calm', function(res) {
              $scope.returnList();
            });
          }
        });


        strUri = '/api/tms/csbk1/update?BookingNo=' + $scope.Detail.BookingNo + '&Amount=' + $scope.Detail.Amount;
        ApiService.GetParam(strUri, true).then(function success(result) {
          for (var intI = 0; intI < $scope.Detail.Csbk2ReusltLength; intI++) {
            strUri = '/api/tms/csbk2/update?CollectedPcs=' + $scope.Detail.csbk2s[intI].CollectedPcs + '&TrxNo=' + $scope.Detail.csbk2s[intI].TrxNo + '&LineItemNo=' + $scope.Detail.csbk2s[intI].LineItemNo;
            ApiService.GetParam(strUri, false).then(function success(result) {});
          }
        });
        strUri = '/api/tms/slcr1/complete?BookingNo=' + $scope.Detail.BookingNo + '&JobNo=' + $scope.Detail.JobNo + '&CashAmt=' + $scope.Detail.Amount + '&UpdateBy=' + sessionStorage.getItem("strDriverId");
        ApiService.GetParam(strUri, true).then(function success(result) {});


      });
    };
    getSignature();
    resizeCanvas();
  }
]);
