game325.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider){
//$locationProvider.html5mode(true).hashPrefix('!');
    $stateProvider
        // .state('login', {
        //     url: '/',
        //     controller: 'loginController',
        //     templateUrl: 'app/templates/login.html',
        //         data: {
        //             requiresAuth: true
        //         }
        // })
        .state('home', {
            url : '/home', // this was / nv
            controller : 'startController',
            templateUrl : 'app/templates/homenew.html',
                data : {
                    requiresAuth : true
                }
            })
        .state('cover', {
            url : '/', // this was / nv
            controller : 'coverController',
            templateUrl : 'app/templates/cover.html',
                data : {
                    requiresAuth : true
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
        .state('game325', {
            url : '/game325',
            controller : 'game325Controller',
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
                    requiresAuth : true
                }
        });
        
     $urlRouterProvider.otherwise("/");

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);