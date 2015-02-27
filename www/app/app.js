// var game325 = angular.module('game325', ['ng','ui.router','ngAria','ngMaterial','ngAnimate','btford.socket-io','ngAnimate','alAngularHero']);

var game325 = angular.module('game325', ['ng','ui.router','ngAria','ngMaterial','ngAnimate','btford.socket-io','ngAnimate', 'ngCookies']);
// var game325 = angular.module('game325', ['ng','ui.router','ngAr?ia','ngMaterial','ngAnimate','btford.socket-io','ngAnimate', 'ngCookies']);

game325.constant('AUTH_EVENTS', {
    loginSuccess    :   'auth-login-success',
    loginFailed     :   'auth-login-failed',
    logoutSuccess   :   'auth-logout-success',
    SessionTimeout  :   'auth-session-timeout',
    notAuthenticated    :   'auth-not-authenticated',
    notAuthorized   :   'auth-not-authorized',
    internalServerError : 'internal-server-error'
});

game325.constant('USER_ROLES', {
    all     :   '*',
    admin   :   'admin',
    editor  :   'editor',
    guest   :   'guest'
});
// game325.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
//     $locationProvider.html5Mode(true).hashPrefix('!');
// }]);
game325.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
game325.factory('socket', function(socketFactory){
    return socketFactory({ioSocket : io.connect('http://127.0.0.1:3000')});
});
game325.run(['$rootScope', '$state', 'socket', function($rootScope, $state, socket){
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if(fromState.name == 'game/:id'){
            console.log(fromParams.id);
            socket.emit('leaveRoom', {'roomId' : fromParams.id});
        }
    });
}]);
game325.factory('delayService', ['$q', '$timeout', function ($q, $timeout){
    var _fact = {};
    var _initvalue = 1;
    var waitPromise = $q.when(true);
    var _asyncTask = function(time, fn){
        waitPromise = waitPromise.then(function (){
            return $timeout(function (){
                fn();
            }, time);
        });
        return waitPromise;
    }
    _fact.asyncTask = _asyncTask;
    return _fact;
}])
game325.controller('gameCtrl', ['$rootScope', '$scope', '$http', '$state', 'AuthService', 'Session', '$cookieStore','$mdDialog','AUTH_EVENTS', function ($rootScope, $scope, $http, $state, AuthService, Session, $cookieStore, $mdDialog, AUTH_EVENTS){
    $scope.title = 'GameApp';
    var credentials = {
        id : $cookieStore.get('userId')
    }
    if(!credentials.id){
        $cookieStore.put('userId','anon');
    }
    if(credentials.id && credentials.id != 'anon'){
        var user = JSON.parse(credentials.id);
        Session.create(user.name, user.image, user.type);
    }
    AuthService.get(credentials).then(function(res){
        if(res.status == 200 && res.data.user){
            var user = {
                name : res.data.user.name,
                image : res.data.user.img,
                type : 'fb'
            }
            Session.create(user.name, user.image, user.type);
            console.log(Session);
            var id = JSON.stringify(user);
            $cookieStore.put('userId',id);
            // $scope.currentUser = res.user;
            // Session.create(res.status, res.userId)
        }else if(res.status == 'error'){
            $scope.currentUser = null
            Session.destroy();
        }
    });
    $scope.setCurrentUser = function (user){
        $scope.currentUser = user;
        if($cookieStore.get('userId') == 'anon'){
            $cookieStore.put('userId',user.id);
        }
    }
    $scope.signOut = function(){
        $scope.currentUser = null;
        $cookieStore.put('userId','anon');
        AuthService.logout().then(function(res){
            if($state.current.data.requiresAuth && (!$scope.currentUser.id)){
                $state.go('home');
            }
            $scope.showLoginDialog = true;
        })
    }
    $scope.OverlayVisible = false;
    $scope.loginRequired = function(){
        $scope.OverlayVisible = true;
    }
    $scope.exitLogin = function(){
        // if($state.current.data.requiresAuth && (!$scope.currentUser.id)){
        //     $state.go('home');
        // }
        $scope.OverlayVisible = false;
    }
    $scope.showLogin = function(){      
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    }
    $scope.uiRouterState = $state;
    $scope.$on(AUTH_EVENTS.internalServerError, $scope.showInternalServerError);
    $scope.$on(AUTH_EVENTS.notFound, $scope.shownotFound);
    $scope.$on(AUTH_EVENTS.notAuthenticated, $scope.loginRequired);
    $scope.$on(AUTH_EVENTS.sessionTimeout, $scope.loginRequired);
    $scope.$on(AUTH_EVENTS.loginSuccess, $scope.exitLogin);
}]);
game325.run( ['$rootScope', '$state', 'AUTH_EVENTS', 'AuthService', 'Session', '$location', function ($rootScope, $state, AUTH_EVENTS, AuthService, Session, $location){
    //$rootScope.$on('$stateChangeStart', ['event', 'next', 'toState', 'toParams', 'fromState', 'fromParams', function (event, next, toState, toParams, fromState, fromParams){
    $rootScope.$on('$stateChangeStart', function (event, next, toState, toParams, fromState, fromParams){
        // ngProgress.start();
        var authorizedRoles = next.data.authorizedRoles;
        var requiresAuth = next.data.requiresAuth;
        var a = AuthService.isAuthenticated();
        if(requiresAuth == true && a == false){
            $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            event.preventDefault;
        }
        // if(!AuthService.isAuthorized(authorizedRoles)){
        //     if(AuthService.isAuthenticated()){
        //         $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
        //     }
        // }
    });
    // $rootScope.$on('$stateChangeSuccess', 
    //     function(event, toState, toParams, fromState, fromParams){
    //         var pageUrl = $location.path();
    //         ga('send', 'pageview', pageUrl);
    //         ngProgress.complete();
    //     });
}]);

game325.config(['$httpProvider', function ($httpProvider){
    $httpProvider.interceptors.push(['$injector', function ($injector){
        return $injector.get('AuthInterceptor');
    }]);
}]);
game325.factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function ($rootScope, $q, AUTH_EVENTS){
    return {
        responseError : function(response){
            $rootScope.$broadcast({
                401 : AUTH_EVENTS.notAuthenticated,
                404 : AUTH_EVENTS.notFound,
                403 : AUTH_EVENTS.notAuthorized,
                419 : AUTH_EVENTS.sessionTimeout,
                440 : AUTH_EVENTS.sessionTimeout,
                500 : AUTH_EVENTS.internalServerError
            }[response.status], response);
            return $q.reject(response);
        }
    }
}]);

game325.config(['$httpProvider', function ($httpProvider) {
    var $http;
    var interceptor = ['$q', '$injector', function ($q, $injector) {
            var notificationChannel;
            function success(response) {
                $http = $http || $injector.get('$http');
                // don't send notification until all requests are complete
                if ($http.pendingRequests.length < 1) {
                    // get requestNotificationChannel via $injector because of circular dependency problem
                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                    // send a notification requests are complete
                    notificationChannel.requestEnded();
                }
                return response;
            }
            function error(response) {
                // get $http via $injector because of circular dependency problem
                $http = $http || $injector.get('$http');
                // don't send notification until all requests are complete
                if ($http.pendingRequests.length < 1) {
                    // get requestNotificationChannel via $injector because of circular dependency problem
                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                    // send a notification requests are complete
                    notificationChannel.requestEnded();
                }
                return $q.reject(response);
            }
            return function (promise) {
                // get requestNotificationChannel via $injector because of circular dependency problem
                notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                // send a notification requests are complete
                notificationChannel.requestStarted();
                return promise.then(success, error);
            }
        }];

    $httpProvider.interceptors.push(interceptor);
}])
.factory('requestNotificationChannel', ['$rootScope', function($rootScope){
    // private notification messages
    var _START_REQUEST_ = '_START_REQUEST_';
    var _END_REQUEST_ = '_END_REQUEST_';
    // publish start request notification
    var requestStarted = function() {
        $rootScope.$broadcast(_START_REQUEST_);
        $rootScope.appLoading = true;
    };
    // publish end request notification
    var requestEnded = function() {
        $rootScope.$broadcast(_END_REQUEST_);
        $rootScope.appLoading = false;
    };
    // subscribe to start request notification
    var onRequestStarted = function($scope, handler){
        $scope.$on(_START_REQUEST_, function(event){
            handler();
        });
    };
    // subscribe to end request notification
    var onRequestEnded = function($scope, handler){
        $scope.$on(_END_REQUEST_, function(event){
            handler();
        });
    };
    return {
        requestStarted:  requestStarted,
        requestEnded: requestEnded,
        onRequestStarted: onRequestStarted,
        onRequestEnded: onRequestEnded
    };
// game325.controller('gameCtrl', ['$rootScope', '$scope', '$http', '$state', function($rootScope, $scope, $http, $state){
    // $scope.title = 'GameApp';
    // $scope.uiRouterState = $state;
}]);

game325.directive('showScores', ['$compile', function($compile){
    var a = function(content){
        var content = content.content;
        var x = '<md-item>'+
        '<md-item-content>'+
          '<div class="md-tile-left ball" style="background: #fff url('+content.img+') no-repeat center center; background-size: cover; margin-right:10px;">'+
          '</div>'+
          '<div class="md-tile-content">'+
            '<div layout="horizontal">'+
            '<h3>'+content.name+'</h3>'+
            '<h4 class="total-score">Total 3 out of 7 hands made</h4>'+
            '</div>'+
            '<div flex layout="horizontal" class="progress-container" ng-repeat = "game in content.scores"'+
                'ng-class=\'{"red-theme":game.handsMade<game.handsToMake,"blue-theme":game.handsMade==game.handsToMake,"green-theme":game.handsMade>game.handsToMake}\'>'
        var y ='<md-progress-linear mode="determinate" value="{{game.handsMade/game.handsToMake*100}}" style="width:80%;">'+ 
                '</md-progress-linear>'
        var z ='<div class="fracscore">'+
            '{{game.handsMade}}/{{game.handsToMake}}'+
            '</div>'+
            '</div>'+
          '</div>'+
        '</md-item-content>'+
        '<md-divider></md-divider>'+
       '</md-item>';
        var w = x+y+z;
       return w;
    }
    var linker = function (scope, element, attrs){
        scope.$watch('content', function (argument) {
            element.html(a(scope)).show();
            $compile(element.contents())(scope);
        });
    }
    return {
        restrict : 'E',
        replace : true,
        link : linker,
        scope : {
            content : '='
        }
    }
}]);
game325.directive('profileInfo', ['$compile', function ($compile){
  var x = function(content){
    var content = content.content;
    console.log(content);
    if(content.type == 'local'){
        content.backgroundPosition = 45*content.image+'px 0px';
        content.image = '/assets/img/avatars.png';
    }else if(content.type == 'fb'){
        content.image = content.image;
        content.backgroundPosition = '50% 50%';
        // $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
    }
    var y = '<div class="ball center" style="background-image:url('+content.image+'); background-position : '+ content.backgroundPosition+'; margin: 0 auto;"></div>'+
          '<h4>'+content.name+'</h4>';
      return y;
  }
  var linker = function(scope, element, attrs){
    scope.$watch('content', function (argument){
      element.html(x(scope)).show();
      $compile(element.contents())(scope);
    })
  }
  return {
    restrict : 'E',
    replace : true,
    link : linker,
    scope : {
      content : '='
    }
  }
}]);
game325.service('createPrivateRoomService', ['$http', function ($http){
    return {
        create : function (req) {
            return $http.post(apiPrefix+'create', {data : req});
        }
    }
}])
game325.service('joinPrivateRoomService', ['$http', function ($http){
    return {
        create : function (req) {
            return $http.post(apiPrefix+'create', {data : req});
        }
    }
}]);
// game325.controller('crateController', ['$http', '$scope', 'cratePrivateRoomService', function ($http, $scope, cratePrivateRoomService) {
    
// }]);
$(function() {
    $('.toggle-nav').click(function() {
        $('body').toggleClass('show-nav');
        return false;
    });
});
$(document).keyup(function(e) {
    if (e.keyCode == 27) {
        $('body').toggleClass('show-nav');
    }
});

game325.controller('loginController',['$rootScope', '$location', '$scope', '$http','$window', function($rootScope, $location ,$scope, $http,$window){
    $scope.twitterAuth = function(){
        $window.location.href = "http://127.0.0.1:3000/auth/twitter"
    }

    $scope.homepage = function(){
        $location.path('home');
    };
}]);
game325.directive('loginDialog', function (AUTH_EVENTS) {
    var register = "'app/templates/register.html'";
  return {
    restrict: 'A',
    template: '<div ng-if="registerVisible" ng-include src="'+register+'"></div>',
    link: function (scope) {
      var showRegisterDialog = function () {
        scope.registerVisible = true;
      };
      var hideRegisterDialog = function () {
        scope.registerVisible = false;
      };
      scope.close = function(){
        scope.$parent.hideOverlay();
      }
      scope.hideAll = function(){
        scope.loginVisible = false;
        scope.registerVisible = false;
        scope.forgotPwdVisible = false;  
      }
      scope.hideAll();
      scope.$on(AUTH_EVENTS.notAuthenticated, showRegisterDialog);
      scope.$on(AUTH_EVENTS.sessionTimeout, showRegisterDialog);
      scope.$on(AUTH_EVENTS.loginSuccess, hideRegisterDialog);
    }
  };
});
game325.controller('registerCtrl', ['$rootScope', '$scope','$cookieStore','$window', 'AUTH_EVENTS','Session', function ($rootScope, $scope, $cookieStore, $window, AUTH_EVENTS, Session){
    // var id = $cookieStore.get('userId');
    $scope.showLoggedInProfile = false;
    $scope.loginFB = true;
    $scope.loginAnon = false;
    $scope.user = {
        type : 'local',
        name : '',
        image : null
    }
    if(Session.name){
        $scope.showLoggedInProfile = true;
        $scope.user.name = Session.name;
        $scope.loginFB = false;
        $scope.loginAnon = false;
        if(Session.type == 'local'){
            $scope.user.image = '/assets/img/avatars.png';
            $scope.user.backgroundPosition = 44*Session.image+'px 0px';
        }else if(Session.type == 'fb'){
            $scope.user.image = Session.image;
            $scope.user.backgroundPosition = '50% 50%';
            // $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        }
    }else{
        $scope.showLoggedInProfile = false;
        $scope.loginFB = true;
        $scope.loginAnon = false;
    }
    $scope.startGame = function(){
        $scope.loginFB = false;
        $scope.loginAnon = true;
    }
    $scope.avatars = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
    $scope.selectedimage = null;
    $scope.showUserError = false;
    $scope.twitterAuth = function(){
        $window.location.href = "http://127.0.0.1:3000/auth/twitter"
    }

    $scope.homepage = function(){
        $location.path('home');
    };
    $scope.selectAvatar = function(index){
        $scope.showUserImageError = false;
        $scope.user.image = index;
    }
    $scope.getAvatar = function(index){
        return {
            'background-position' : index*64+'px 0px',
        }
    }
    $scope.showNameTooltip = false;
    $scope.register = function (){
        if($scope.user.name.length == ''){
            $scope.showUserError = true;
        }
        if($scope.avatars.indexOf($scope.user.image) == -1){
            $scope.showUserImageError = true;
        }
        if($scope.showUserError || $scope.showUserImageError){
           return false; 
        }else{
            var user = JSON.stringify($scope.user);
            $cookieStore.put('userId',user);
            Session.create($scope.user.name, $scope.user.image, 'local');
            $window.location.href = '/';
        }
    }
    $scope.enterName = function(){
        if($scope.user.name.length > 0){
            $scope.showUserError = false;   
        }
    }
    $scope.logOut = function(){
        Session.destroy();
        $cookieStore.put('userId', 'anon');
        $window.location.href = '/';
    }
}])
