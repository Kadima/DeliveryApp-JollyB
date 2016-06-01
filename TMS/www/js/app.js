'use strict';
var app = angular.module('TMS', [
  'ionic',
  'ngCordova',
  'ionic-datepicker',
  'jett.ionic.filter.bar',
  'ionic.ion.headerShrink',
  'ionMdInput',
  'ngMessages',
  'TMS.config',
  'TMS.services',
  'TMS.factories'
]);
app.run(['ENV', '$ionicPlatform', '$rootScope', '$state', '$location', '$timeout', '$ionicHistory', '$ionicLoading', '$cordovaToast', '$cordovaKeyboard', '$cordovaFile', '$cordovaSQLite',
  function(ENV, $ionicPlatform, $rootScope, $state, $location, $timeout, $ionicHistory, $ionicLoading, $cordovaToast, $cordovaKeyboard, $cordovaFile, $cordovaSQLite) {
    if (window.cordova) {
      ENV.fromWeb = false;
    } else {
      ENV.fromWeb = true;
    }
    $ionicPlatform.ready(function() {
      if (!ENV.fromWeb) {
        $cordovaKeyboard.hideAccessoryBar(true);
        $cordovaKeyboard.disableScroll(true);
        try {
          db = $cordovaSQLite.openDB({
            name: 'AppTms.db',
            location: 'default'
          });
        } catch (error) {
          console.error(error);
        }
        $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT)');
        $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Csbk1(TrxNo INTEGER,BookingNo TEXT, JobNo TEXT, StatusCode TEXT,BookingCustomerCode TEXT,Pcs INTEGER,CollectionTimeStart TEXT,CollectionTimeEnd TEXT,PostalCode TEXT,BusinessPartyCode TEXT,BusinessPartyName TEXT,Address1 TEXT,Address2 TEXT,Address3 TEXT,Address4 TEXT,CompletedFlag TEXT,TimeFrom TEXT,TimeTo TEXT,ColTimeFrom TEXT,ColTimeTo TEXT)');
        $cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS Csbk2 (TrxNo INTEGER,LineItemNo INTEGER, BoxCode TEXT, StatusCode TEXT,Pcs INTEGER,UnitRate TEXT,Volume TEXT,GrossWeight TEXT,CollectedPcs INTEGER,CollectedAmt TEXT,DepositAmt TEXT,DiscountAmt TEXT,AttachmentFlag TEXT,ItemNo INTEGER,BookingNo TEXT)');
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
    $ionicPlatform.registerBackButtonAction(function(e) {
      e.preventDefault();
      // Is there a page to go back to?  $state.include ??
      if ($state.includes('index.main') || $state.includes('index.login') || $state.includes('splash')) {
        if ($rootScope.backButtonPressedOnceToExit) {
          ionic.Platform.exitApp();
        } else {
          $rootScope.backButtonPressedOnceToExit = true;
          $cordovaToast.showShortBottom('Press again to exit.');
          setTimeout(function() {
            $rootScope.backButtonPressedOnceToExit = false;
          }, 2000);
        }
      } else if (
        $state.includes('acceptJob') ||
        $state.includes('jobListingList')
      ) {
        $state.go('index.main', {}, {
          reload: true
        });
      } else if (
        $state.includes('jobListingDetail')
      ) {
        $state.go('jobListingList', {}, {});
      } else if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else {
        // This is the last page: Show confirmation popup
        $rootScope.backButtonPressedOnceToExit = true;
        $cordovaToast.showShortBottom('Press again to exit.');
        setTimeout(function() {
          $rootScope.backButtonPressedOnceToExit = false;
        }, 2000);
      }
      return false;
    }, 101);
  }
]);
app.config(['ENV', '$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$ionicFilterBarConfigProvider',
  function(ENV, $stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicFilterBarConfigProvider) {
    $ionicConfigProvider.backButton.previousTitleText(false);
    $stateProvider
      .state('index', {
        url: '',
        abstract: true,
        templateUrl: 'view//menu/menu.html',
        controller: 'IndexCtrl'
      })
      .state('splash', {
        url: '/splash',
        cache: 'false',
        templateUrl: 'view/splash/splash.html',
        controller: 'SplashCtrl'
      })
      .state('index.login', {
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'view/login/login.html',
            controller: 'LoginCtrl'
          }
        }
      })
      .state('index.main', {
        url: '/main',
        views: {
          'menuContent': {
            templateUrl: "view/main/main.html",
            controller: 'MainCtrl'
          }
        }
      })
      .state('index.setting', {
        url: '/setting/setting',
        views: {
          'menuContent': {
            templateUrl: 'view/setting/setting.html',
            controller: 'SettingCtrl'
          }
        }
      })
      .state('acceptJob', {
        url: '/acceptjob/search',
        cache: 'false',
        templateUrl: 'view/acceptjob/search.html',
        controller: 'AcceptJobCtrl'
      })
      .state('jobListing', {
        url: '/joblisting/search',
        cache: 'false',
        templateUrl: 'view/joblisting/search.html',
        controller: 'JoblistingCtrl'
      })
      .state('jobListingList', {
        url: '/joblisting/list',
        cache: 'false',
        templateUrl: 'view/joblisting/list.html',
        controller: 'JoblistingListCtrl'
      })
      .state('jobListingDetail', {
        url: '/joblisting/detail/:BookingNo/:JobNo/:CollectedAmt/:Collected',
        cache: 'false',
        templateUrl: 'view/joblisting/detail.html',
        controller: 'JoblistingDetailCtrl'
      })

    .state('goDriverCodeCtrl', {
        url: '/login',
        views: {
          'menuContent': {
            templateUrl: 'view/login/login.html',
            controller: 'goDriverCodeCtrl'
          }
        }
      })
      .state('driverCodeCtrl', {
        url: '/driverCode/driverCode',
        cache: 'false',
        templateUrl: 'view/driverCode/driverCode.html',
        controller: 'driverCodeCtrl'
      })
      .state('jobListingConfirm', {
        url: '/joblisting/confirm/:BookingNo/:JobNo/:CollectedAmt/:Collected',
        cache: 'false',
        templateUrl: 'view/joblisting/confirm.html',
        controller: 'JoblistingConfirmCtrl'
      });
    $urlRouterProvider.otherwise('/splash');
    /*
    $ionicFilterBarConfigProvider.theme('calm');
    $ionicFilterBarConfigProvider.clear('ion-close');
    $ionicFilterBarConfigProvider.search('ion-search');
    $ionicFilterBarConfigProvider.backdrop(false);
    $ionicFilterBarConfigProvider.transition('vertical');
    $ionicFilterBarConfigProvider.placeholder('Filter');
    */
  }
]);
app.constant('$ionicLoadingConfig', {
  template: '<div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg></div>'
});
