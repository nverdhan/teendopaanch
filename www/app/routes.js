game325.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider){
//$locationProvider.html5mode(true).hashPrefix('!');
    $stateProvider
        .state('login', {
            url: '/',
            controller: 'loginController',
            templateUrl: 'app/templates/login.html',
                data: {
                    requiresAuth: false
                }
        })
        .state('home', {
            url : '/home', // this was / nv
            controller : 'startController',
            templateUrl : 'app/templates/home.html',
                data : {
                    requiresAuth : false
                }
            })
        .state('start', {
            url : '/start',
            controller : 'startController',
            templateUrl : 'app/templates/start.html',
                data : {
                    requiresAuth : true
                }
            
        })
        .state('create', {
            url : '/create',
            controller : 'startController',
            templateUrl : 'app/templates/start.html',
                data : {
                    requiresAuth : true
                }
            
        })
        .state('join', {
            url : '/join',
            controller : 'startController',
            templateUrl : 'app/templates/start.html',
                data : {
                    requiresAuth : true
                }
            
        })
        .state('game/:id', {
            url : '/game/:id',
            controller : 'gameController',
            templateUrl : 'app/templates/game.html',
                data : {
                    requiresAuth : false
                }
        })
        .state('game/:id/:type', {
            url : '/game/:id/:type',
            controller : 'gameController',
            templateUrl : 'app/templates/game.html',
                data : {
                    requiresAuth : false
                }
        })
        .state('dummygame', {
            url : '/dummygame',
            controller : 'gameController',
            templateUrl : 'app/templates/dummygame.html',
            data : {
                    requiresAuth : false
            }
        });
        
     $urlRouterProvider.otherwise("/");

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);