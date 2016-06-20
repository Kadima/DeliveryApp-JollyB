'use strict';
app.controller('dailycompletedCtrl', ['ENV', '$scope', '$state', '$ionicPopup', '$cordovaKeyboard', '$cordovaBarcodeScanner', 'ACCEPTJOB_ORM', 'ApiService', '$cordovaSQLite', '$ionicPlatform',
  function(ENV, $scope, $state, $ionicPopup, $cordovaKeyboard, $cordovaBarcodeScanner, ACCEPTJOB_ORM, ApiService, $cordovaSQLite, $ionicPlatform) {
    var alertPopup = null,
      dataResults = new Array();
    $scope.Search = {
      CompletedDate: '',
      allCompletedDates: []

    };
    $scope.Csbk1s = [];
    for (var i = 0; i < 7; i++) {
      var CompletedDates = {
        CompletedDate: moment(moment().subtract(i, 'day')).format('YYYYMMDD')
      };
      $scope.Search.allCompletedDates.push(CompletedDates);
    }

    $scope.refreshCompleteDate = function(CompleteDate) {
      console.log(CompleteDate);
      console.log('refreshCompleteDate');
      if (is.not.undefined(CompleteDate) && is.not.empty(CompleteDate)) {}
    };
$scope.Search.CompletedDate=moment(new Date).format('YYYYMMDD');
console.log($scope.Search.CompletedDate);
  //  $scope.ShowDailyCompleted = function(CompletedDate) {
  //      if (is.not.undefined(CompletedDate) && is.not.empty(CompletedDate)) {
        $ionicPlatform.ready(function() {
          if (!ENV.fromWeb) {
            $cordovaSQLite.execute(db, "SELECT * FROM Csbk1  where  DriverId='" + sessionStorage.getItem("strDriverId") + "' and CompletedDate='" + $scope.Search.CompletedDate + "' ")
              .then(
                function(results) {
                  if (results.rows.length > 0) {
                    console.log(results);
                    // $scope.Csbk1s=results;
                    var jobs = '';
                    for (var i = 0; i < results.rows.length; i++) {
                      var Csbk1_acc = results.rows.item(i);
                            console.log(Csbk1_acc.CollectedAmt);
                      jobs = {
                        bookingno: Csbk1_acc.BookingNo,
                        JobNo: Csbk1_acc.JobNo,
                        CollectedAmt: Csbk1_acc.CollectedAmt

                      };
                      $scope.Csbk1s.push(jobs);

                    }
                    console.log($scope.Csbk1s.bookingno);

                    if ( window.cordova && window.cordova.plugins.Keyboard ) {
                                          cordova.plugins.Keyboard.close();
                                      }
                  } else {}
                },
                function(error) {}
              );
          } else {}
        });
    //   }
    // };

    $scope.Search.CompletedDate = moment(new Date()).format('YYYYMMDD');
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
    var showList = function() {};
    // $ionicPlatform.ready(function() {
    //   if (!ENV.fromWeb) {
    //     $cordovaSQLite.execute(db, "SELECT * FROM Csbk1  where  DriverId='"+sessionStorage.getItem("strDriverId")+"' and CompletedDate='" + $scope.Search.CompletedDate + "' ")
    //       .then(
    //         function(results) {
    //           if (results.rows.length > 0) {
    //             for (var i = 0; i < results.rows.length; i++) {
    //               var Csbk1_acc = results.rows.item(i);
    //                   var jobs = [{
    //                 bookingno: Csbk1_acc.BookingNo,
    //                 JobNo: Csbk1_acc.JobNo,
    //                 CollectedAmt:Csbk1_acc.CollectedAmt
    //               }];
    //               dataResults = dataResults.concat(jobs);
    //               $scope.jobs = dataResults;
    //             }
    //
    //           } else {}
    //         },
    //         function(error) {}
    //       );
    //   } else {
    //
    //   }
    // });

    $scope.returnMain = function() {
      $state.go('index.main', {}, {
        reload: true
      });
    };
    $scope.save = function() {
      // if (is.not.empty($scope.jobs)) {
      //   $state.go('jobListingList', {}, {});
      // } else {
      //   showPopup('No Job Accepted', 'calm');
      // }
      $state.go('index.main', {}, {
        reload: true
      });
    };
    $scope.clear = function() {
      // dataResults = new Array();
      // $scope.jobs = dataResults;
      // ACCEPTJOB_ORM.LIST._setCsbk($scope.jobs);
      // $scope.Search.BookingNo = '';
    };
    var ipObj1 = {
      callback: function (val) {  //Mandatory
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
      }
    };
    $scope.OnDatePicker = function() {
      // ionicDatepicker.openDatePicker(ipObj1);
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
