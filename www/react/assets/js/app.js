var psApp = angular.module('psApp', ['ng','ngAnimate','ngAria','ui.router','ngSanitize','ngCookies', 'ngMaterial']);

psApp.config(function($httpProvider) {

  var logsOutUserOn401 = function($location, $q, SessionService, FlashService) {
  var success = function(response) {
  	return response;
    };

    var error = function(response) {
      if(response.status === 401) {
        SessionService.unset('authenticated');
        $location.path('/');
        FlashService.show(response.data.flash);
      }
      return $q.reject(response);
    };

    return function(promise) {
      return promise.then(success, error);
    };
  };

  // $httpProvider.responseInterceptors.push(logsOutUserOn401);

});

var loginRequired = function(FlashService, AuthenticationService, $location, $q) {  
    var deferred = $q.defer();
    
    if(! AuthenticationService.isLoggedIn()) {
        $q.reject('User not logged in!')
        $location.path('/');
        FlashService.show('User not logged in!');
    } else {
        deferred.resolve();
    }

    return deferred.promise;
}

psApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $urlRouterProvider.otherwise('/');
    
    $stateProvider
        
        // Login Page ========================================
        .state('login', {
            url: '/',
            templateUrl: 'templates/login.html',
            controller: 'LoginController'
          })
           
        // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
        .state('setup',{
          url: '/setup',
          views:{
            '' : {templateUrl: 'templates/home.html',
                  controller: 'HomeController'},

            'toolbar@setup' : {
              templateUrl: 'templates/toolbar.html',
            },

            'mainpage@setup' : {
              templateUrl: 'templates/setup.html',
              controller: 'SetupController'
            },

            'newpaper@setup' : {
              templateUrl: 'templates/newpaper.html',
              controller: 'NewPaperController'
            },

            'leftsidenav@setup': {
              template: ""
            }
          }
        })

        .state('setpaper',{
          url: '/setpaper',
          views:{
            '': {
              templateUrl: 'templates/home.html',
              controller: 'HomeController',
            },
            'toolbar@setpaper' : {
              templateUrl: 'templates/toolbar.html',
            },

            'mainpage@setpaper' : {
              templateUrl: 'templates/setpaper.html',
              controller: 'SetpaperController'
            },

            'leftsidenav@setpaper': {
              templateUrl: 'templates/leftsidenav.html',
              controller: 'LeftCtrl'
            }

          }
        })

        .state('setup1', {
            url: '/setup1',
            views: {
              '' : {templateUrl: 'templates/home.html'},

              'sidebar@setup' : {
                templateUrl: 'templates/sidebar.html',
                // controller: 'SidebarController'
              },
              'mainpage@setup' :{
                templateUrl: 'templates/setup.html',
                controller: 'SetupController',
                resolve: {
                  booklist : function(FetchService){
                    return FetchService.getBooks();
                  }
                }
              },
            },
            resolve: { loginRequired: loginRequired }
        })

        .state('type', {
          url: '/type',
          views: {
            '' : {templateUrl: 'templates/home.html'},

            'sidebar@type' : {
                templateUrl: 'templates/sidebar.html',
                // controller: 'SidebarController'
              },

              'mainpage@type' : {
                templateUrl: 'templates/type.html',
                controller: 'TypingController',
                resolve: {
                  topiclist : function(FetchService){
                    return FetchService.getTopics();
                  },
                  examlist: function(FetchService){
                    return FetchService.getExams();
                  }
                }
              }
          },
          resolve: {loginRequired: loginRequired,
        }
        })

         $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
          });
        
});

psApp.factory("FetchService", function($http) {
  return {
    getBooks: function() {
      return $http.get('/getBooks');
    },
    getTopics: function() {
      return $http.get('/getTopics');
    },
    getExams: function(){
      return $http.get('/getExams')
    }
  };
});

psApp.factory("SessionService", function() {
  return {
    get: function(key) {
      return sessionStorage.getItem(key);
    },
    set: function(key, val) {
      return sessionStorage.setItem(key, val);
    },
    unset: function(key) {
      return sessionStorage.removeItem(key);
    }
  }
});

psApp.factory("FlashService", function($rootScope) {
  return {
    show: function(message) {
      $rootScope.flash = message;
    },
    clear: function() {
      $rootScope.flash = "";
    }
  }
});

psApp.factory("AuthenticationService", function($location, $http, $sanitize, SessionService, FlashService, $cookieStore, CSRF_TOKEN) {

  var cacheSession   = function() {
    SessionService.set('authenticated', true);
  };

  var uncacheSession = function() {
    SessionService.unset('authenticated');
  };

  var loginError = function(response) {
    FlashService.show(response.flash);
  };

  var sanitizeCredentials = function(credentials) {
    return {
      email: $sanitize(credentials.email),
      password: $sanitize(credentials.password),
      csrf_token: CSRF_TOKEN
    };
  };

  return {
    login: function(credentials) {
      var login = $http.post("/auth/login", sanitizeCredentials(credentials));
      login.success(cacheSession);
      login.success(FlashService.clear);
      login.success(function(data, status, headers, config) {
                    $cookieStore.put('firstname', data.firstname);
                    FlashService.show('Welcome ' + $cookieStore.get('firstname') + '!' );
                });
      login.error(loginError);
      return login;
    },
    logout: function() {
      var logout = $http.get("/auth/logout");
      $location.path('/');
      return logout;
    },
    isLoggedIn: function() {
      return SessionService.get('authenticated');
    }
  };
});

psApp.controller("LoginController", function($rootScope, $scope, $location, AuthenticationService, FlashService, ngProgress) {
  ngProgress.color('#A3E0FF');
  ngProgress.start();
  $scope.credentials = { email: "", password: "" };
  $scope.loginButtonName = 'Login';
  ngProgress.complete();
  $scope.login = function() {
      ngProgress.start();
      $scope.loginButtonName = 'Logging in...'
      AuthenticationService.login($scope.credentials).success(function() {
      FlashService.show("Successfully logged in!");
      // $rootScope.userfullname = 
      $location.path('setup');
    });
    AuthenticationService.login($scope.credentials).error(function() {
      $scope.loginButtonName = 'Login';
    });
  };
});



psApp.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});

psApp.controller('SetupController', function($scope, $filter){
  $scope.prevexamdata = [{name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "09/09/2014", status: "Completed"},
  {name: "Rotational Motion", subject: "Physics", date: "08/02/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/08/2014", status: "Completed"},
  {name: "Electricity", subject: "Physics", date: "08/02/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/03/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "28/04/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/04/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "18/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "17/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "28/04/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/04/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "18/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "17/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "28/04/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/04/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "18/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "17/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "28/04/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/04/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "18/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "17/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "28/04/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/04/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "18/06/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "17/06/2014", status: "Draft"},
  {name: "Human Health and Diseases", subject: "Biology", date: "28/06/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/04/2014", status: "Draft"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Draft"},
  {name: "Electrochemistry", subject: "Chemistry", date: "08/02/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Completed"},
  {name: "Differentiation and AOI", subject: "Mathematics", date: "08/05/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "18/06/2014", status: "Completed"},
  {name: "Electrochemistry", subject: "Chemistry", date: "17/06/2014", status: "Completed"}];


    $scope.selectedIndex = 0
    $scope.next = function() {
      $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 1) ;
    };
    $scope.previous = function() {
      $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
    };

});

psApp.controller('NewPaperController', function($scope, $mdDialog){
  $scope.userName = $scope.userName || 'Bobby';
  $scope.showGreeting = function ($event) {
        $mdDialog.show({
          targetEvent: $event,
          templateUrl: 'templates/selectsubjectdialog.html',
            // '<md-dialog>' +
            // '  <md-content>Hello {{ employee }}!</md-content>' +
            // '  <div class="md-actions">' +
            // '    <md-button ng-click="closeDialog()">' +
            // '      Close Greeting' +
            // '    </md-button>' +
            // '  </div>' +
            // '</md-dialog>',
          controller: 'GreetingController',
          onComplete: afterShowAnimation,
          locals: { employee: $scope.userName }
        });
        // When the 'enter' animation finishes...
        function afterShowAnimation(scope, element, options) {
           // post-show code here: DOM element focus, etc.
        }
    }
})

psApp.controller('GreetingController', function($scope, $rootScope, $state, $http, $mdDialog, employee, $cookieStore){
  $scope.subjects = [{id: 1, name: 'Physics', shortname: 'Phy', icon: 'assets/img/phyicon.png'},
                      {id: 2, name: 'Chemistry', shortname: 'Che', icon: 'assets/img/cheicon.png'},
                      {id: 3, name: 'Mathematics', shortname: 'Mat', icon: 'assets/img/maticon.png'},
                      {id: 4, name: 'Biology', shortname: 'Bio', icon: 'assets/img/bioicon.png'}]
      // Assigned from construction <code>locals</code> options...
    $scope.employee = employee;
    $scope.closeDialog = function() {
      // Easily hides most recent dialog shown...
      // no specific instance reference is needed.
      $mdDialog.hide();
    };

    $scope.getTopicList = function(subjectid){
      $http.post('getTopics',{'subjectid':subjectid}).success(function(data, status, headers, config) {
          $cookieStore.put('topics', data);
          $rootScope.selectedtopic = new Array(data[0].topic.length)
          $state.go('setpaper');
        });
    }
})
psApp.controller('HomeController', function($scope, $mdSidenav, $state, $stateParams){
  $scope.toggleLeft = function() {
    $mdSidenav('left').toggle();
  };

  $scope.hideSideNav = function(){
    if($state.includes('setup')){
      return true;
    }else{
      return false;
    }
  }


})

psApp.controller('SetpaperController',function($http, $scope, $rootScope, $mdSidenav){
  var size = 12;
  $scope.questions = new Array(size);
  while(size--) $scope.questions[size] = size;
  console.log($scope.questions);
})

psApp.controller('LeftCtrl', function($scope, $timeout, $mdSidenav, $rootScope, $cookieStore){
  // $rootScope.selectedtopic = [];
  $scope.closeleftsidenav = function() {
      $mdSidenav('left').close();
  };

    $rootScope.topics = $cookieStore.get('topics');
    // $rootScope.selectedtopic = $scope.selectedtopic;
    
  // $scope.updateSelectedTopic = function(){
  //   $rootScope.selectedtopic = [];
  //   console.log('a');
  //   for(i = 0; i < $rootScope.topics[0].topic.length; i++){
  //     var topicnow = $rootScope.topics[0].topic[i];
  //     if(topicnow.topicselected == true){
  //       $rootScope.selectedtopic.push(topicnow);
  //     }
  //   }
  // }
})