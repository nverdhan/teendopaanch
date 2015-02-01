var game325 = angular.module('game325', ['ui.router', 'btford.socket-io','ngAnimate']);

game325.config(['$httpProvider', '$locationProvider', function ($httpProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
}]);
game325.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});

game325.factory('socket', function(socketFactory){
    return socketFactory({ioSocket : io.connect('http://127.0.0.1:3000')});
});
game325.run(['$rootScope', '$state', '$location', 'socket', function($rootScope, $state, $location, socket){
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
}]);

game325.controller('gameCtrl', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){
    $scope.title = 'GameApp';
}]);
game325.directive('showScores', ['$compile', function($compile){
    var a = function(content){
        var content = content.content;
        var x = '<div class="col-md-2"><div class="text-center h4">'+content.id+'</div>';
        var y = '<div ng-repeat = "game in content.scores">{{ game.handsMade }} / {{ game.handsToMake }} &nbsp; ( {{ game.handsMade - game.handsToMake }} )</div>';
        var z = x+y+'<div class="text-center h5">{{ content.total }}</div></div>';
        return z;
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
game325.service('createPrivateRoomService', ['$http', function ($http){
    return {
        create : function (req) {
            return $http.post(apiPrefix+'create', {data : req});
        }
    }
}]);
game325.service('joinPrivateRoomService', ['$http', function ($http){
    return {
        create : function (req) {
            return $http.post(apiPrefix+'create', {data : req});
        }
    }
}]);
game325.controller('crateController', ['$http', '$scope', 'cratePrivateRoomService', function ($http, $scope, cratePrivateRoomService) {
    
}]);
game325.animation('.moveCardX', ['$rootScope', function ($rootScope){
    var a = $rootScope.left;
    var b = '16em';
    var c = '15em';
    return {
        enter : function (element, done){
            element.css({
                left : a,
                top : '28em'
            });
             $(element).animate({
                    left : '22em',
                    top : b
                }, function(){
                    element.css({
                        left : '',
                        top : ''
                    });
                    element.addClass('zeroFinal');
                });
            return function (cancelled){
                // if(cancelled){
                //     jQuery(element).stop();
                // }else{
                //     // completeTheAnimation();
                // }
            }
        },
        leave : function (element, done){

        },
        move : function (element, done){},
        beforeAddClass : function (element, className, done){},
        addClass : function (element, className, done){
            // if(className == 'done'){
            //     $(element).animate({
            //         left : a,
            //         top : b
            //     });
            // }
            // else{
            //     runTheAnimation(element, done);
            // }
            return function onEnd (element, done){};
        },
        allowCancel : function (element, event, className){}
        
    }
}]);
// game325.controller('FirstPersonController', function($scope, $rootScope){
//     $scope.cardlist = $rootScope.cardlistplayer0;
//     console.log($scope.cardlist);

//     $scope.assignClass = function(card){
//         return ['rank-'+card.rank, card.suit];
//     }

//     $scope.getFirstPersonStyle = function(){
//         return {
//             'position': 'fixed',
//             'bottom' : '10em',
//             'left' : $rootScope.cssConsts.centre[0]-$rootScope.cardlistplayer0.length*1.8*16/2-3.3/2*16+ 'px'
//         }   
//     }
// })
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