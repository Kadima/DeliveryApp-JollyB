'use strict';
app.controller('AcceptJobCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite',
  function(ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite) {
    var alertPopup = null,
      dataResults = new Array();
    $scope.Search = {
      BookingNo: ''
    };
    var hmcsbk1 = new HashMap();
    var showPopup = function(title, type) {
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
    var showList = function() {
      if (is.not.empty(ACCEPTJOB_ORM.LIST.Csbk1s)) {
        dataResults = dataResults.concat(ACCEPTJOB_ORM.LIST.Csbk1s);
        $scope.jobs = dataResults;
      }
    };

    var showCsbk = function(bookingNo) {
      if (hmcsbk1.has(bookingNo)) {
        // var hsbookingNo=hmcsbk1.get(bookingNo);
        showPopup('Booking No is already exists', 'assertive');
      } else {
        hmcsbk1.set(bookingNo, bookingNo);
        if (is.not.empty(bookingNo)) {
          var strUri = '/api/tms/csbk1?BookingNo=' + bookingNo;
          ApiService.GetParam(strUri, true).then(function success(result) {
            var results = result.data.results;
            if (is.not.empty(results)) {
              var reuturnTime = '';
              if (is.equal(results[0].CollectionTimeStart, '') && is.equal(results[0].CollectionTimeEnd, '')) {
                reuturnTime = results[0].ColTimeFrom + '-' + results[0].ColTimeTo;
              } else {
                reuturnTime = results[0].CollectionTimeStart + '-' + results[0].CollectionTimeEnd;
              }
              var DLVReturntime = '';
              if (is.equal(results[0].CollectionTimeStart, '') && is.equal(results[0].CollectionTimeEnd, '')) {
                DLVReturntime = '';
              } else {
                DLVReturntime = results[0].TimeFrom + '-' + results[0].TimeTo;
              }
              // console.log(reuturnTime);
              var Csbk1 = {
                bookingNo: results[0].BookingNo,
                action: is.equal(results[0].StatusCode, 'DLV') ? 'Deliver' : 'Collect',
                amt: results[0].Pcs + ' PKG',
                //  time: is.equal(results[ 0 ].Pcs.JobType, 'DLV') ? '11:00 - 18:00' : checkDatetime(results[ 0 ].CollectionTimeStart)-checkDatetime(results[ 0 ].CollectionTimeEnd),
                time: is.equal(results[0].StatusCode, 'DLV') ? DLVReturntime : reuturnTime,
                code: results[0].PostalCode,
                customer: {
                  name: results[0].BusinessPartyName,
                  address: results[0].Address1 + results[0].Address2 + results[0].Address3 + results[0].Address4
                }
              };
              if (!ENV.fromWeb) {
                var sql = 'INSERT INTO Csbk1(TrxNo,BookingNo,JobNo,StatusCode,BookingCustomerCode,Pcs,CollectionTimeStart,CollectionTimeEnd,PostalCode,BusinessPartyCode,BusinessPartyName,Address1,Address2,Address3,Address4,CompletedFlag,TimeFrom,TimeTo,ColTimeFrom,ColTimeTo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                $cordovaSQLite.execute(db, sql, [
                    results[0].TrxNo,
                    results[0].BookingNo,
                    results[0].JobNo,
                    results[0].StatusCode,
                    results[0].BookingCustomerCode,
                    results[0].Pcs,
                    results[0].CollectionTimeStart,
                    results[0].CollectionTimeEnd,
                    results[0].PostalCode,
                    results[0].BusinessPartyCode,
                    results[0].BusinessPartyName,
                    results[0].Address1,
                    results[0].Address2,
                    results[0].Address3,
                    results[0].Address4,
                    results[0].CompletedFlag,
                    results[0].TimeFrom,
                    results[0].TimeTo,
                    results[0].ColTimeFrom,
                    results[0].ColTimeTo
                  ])
                  .then(function(result) {}, function(error) {});
              } else {
                for (var i = 0; i < results.length; i++) {
                  db_add_Csbk1_Accept(results[i]);
                }
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
          showPopup('Wrong Booking No', 'assertive');
        }
      }

    };
    $scope.deleteCsbk1 = function(index,job) {
      if (!ENV.fromWeb) {
        var sql = "delete from Csbk1 where BookingNo='" + job.bookingNo + "'";
        $cordovaSQLite.execute(db, sql, [])
          .then(function(result) {}, function(error) {});
      } else {
        db_del_Csbk1_Accept_detail(job.bookingNo);
      }
        $scope.jobs.splice( index, 1 );
    };
    $scope.returnMain = function() {
      $state.go('index.main', {}, {
        reload: true
      });
    };
    $scope.save = function() {
      if (is.not.empty($scope.jobs)) {
        $state.go('jobListingList', {}, {});
      } else {
        showPopup('No Job Accepted', 'calm');
      }
    };
    $scope.clear = function() {
      dataResults = new Array();
      $scope.jobs = dataResults;
      ACCEPTJOB_ORM.LIST._setCsbk($scope.jobs);
      $scope.Search.BookingNo = '';
    };
    $scope.openCam = function() {
      $cordovaBarcodeScanner.scan().then(function(imageData) {
        $scope.Search.BookingNo = imageData.text;
        showCsbk($scope.Search.BookingNo);
      }, function(error) {
        $cordovaToast.showShortBottom(error);
      }, {
        "formats": "CODE_39",
      });
    };
    $scope.clearInput = function() {
      if (is.not.empty($scope.Search.BookingNo)) {
        $scope.Search.BookingNo = '';
        $('#txt-bookingno').select();
      }
    };
    $('#txt-bookingno').on('keydown', function(e) {
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
