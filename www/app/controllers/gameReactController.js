var temp;
game325.controller('gameReactController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','Session','errService', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, Session, errService){
    $scope.gameId = $stateParams.id;
    $scope.gameType = $stateParams.type;
    $scope.waiting = true;
    $scope.ready = false;
    $scope.chatMsg = '';
    $scope.player = 0;
    $scope.profilepicsize = 50 + 10;
    $scope.showScores = false;
    $scope.withDrawEnabled = false;
    $scope.chatMsg;
    $scope.user = Session;
    if(!Session.name){
        $state.go('home');
    }
    $(window).resize(function() {
          $scope.$digest();
          $scope.reactRender();
    });
    $scope.closeScores = function (){
        $scope.showScores = false;
    }
    $scope.getMsgTemplate = function (content){
        var x ='<md-item>'+
                    '<md-item-content>'+
                      '<div class="md-tile-left ball" style="background: #fff url('+content.userPic+');background-position:'+content.backgroundPosition+'; background-size: cover; margin-right: 0;">'+
                      '</div>'+
                      '<div class="md-tile-content">'+
                        '<h4>' + content.userName +'</h4>'+
                        '<p>'+
                          content.body+
                        '</p>'+
                      '</div>'+
                    '</md-item-content>'+
                  '  <md-divider></md-divider>'+
                  '</md-item>';             
        return x;
    }
    if($scope.gameId){
        $scope.gameType = 'LIVE';
    }else{
        $scope.gameType = 'BOTS';
    }
    $scope.startGame = function(){
        if(($scope.gameType == 'LIVE' && $scope.game325 && $scope.game325.players.length == 3) || ($scope.gameType == 'BOTS')){
            return true;
        }
    }
    $scope.sendEvent = function(data){
        if($scope.gameType == 'LIVE'){
            console.log(data);
            socket.emit('GAME', {data : data});  
        }else{
            $scope.gameEvent(data);
        }
    }
    $scope.initPlayers = function(){
        $scope.players =  Array();
        for (var i = 0; i < gameVars.noOfPlayers; i++) {
            var player = new Player(i);
            player.position = i;
            if(i == 0){
                player.type = 'you'
                player.name = 'You';
                player.img = Session.image;
            }else{
                player.type = 'bot';
                player.name = gameVars.botsName[i];
                player.img = i;
            }
            $scope.players.push(player);
        }
    }
    $scope.updateScores = function (players){
        $rootScope.arrPlayers = players;
    }
    $scope.showScores = false;
    $scope.toggleScores = function(ev){
        console.log(ev);
         $mdDialog.show({
            templateUrl: 'app/templates/scoredialog.html',
            controller: 'scoreDialogController'
        });
         $('.fracscore').each(function(key, value) {
            $this = $(this)
            var split = $this.html().split("/")
            if( split.length == 2 ){
                $this.html('<span class="fracscore-top">'+split[0]+'</span>'+
                    '<span class="fracscore-bottom">'+split[1]+'</span>');
            }    
        });
    }
    $scope.startNewGame = function(){
        gameData = new Game();
        $scope.playerId = 0;
        $scope.waiting = false;
        $scope.ready = true;
        gameData.gameTurn = 1;
        $scope.initPlayers();
        gameData.players = $scope.players;
        gameData.activePlayerId = gameData.players[0].id;
        $rootScope.arrPlayers = gameData.players;
        gameData.gameEvent = 'START_GAME';
        $scope.game325 = gameData;
        var data = {
            gameEvent : 'START_GAME'
        }
        $scope.gameEvent(data);
    }
    $scope.reactRender = function(){
        var game = $scope.game325;
        var playerId = $scope.playerId;
        var type = $scope.gameType;
        var a = React.createFactory(Game325Component);
        var x = a({scope : $scope, game : game, playerId : playerId, type : type});
        React.render(x, document.getElementById('gameRender'));
    }
    $scope.gameEvent = function(data){
        var gameEvent = data.gameEvent;
        var gameData = $scope.game325;
        var fnCall;
        switch(gameEvent){
            case "START_GAME":
                Game.prototype.initDeck.call(gameData);
                Game.prototype.distributeCards.call(gameData);
                Game.prototype.updateHandsToMake.call(gameData);
                gameData.gameTurn = 1;
                gameData.gameState  ='SET_TRUMP';
                gameData.gameEvent  ='SET_TRUMP';
                // Game.prototype.assignPlayerIds.call(gameData);
                break;
            case "NEXT_ROUND":
                Game.prototype.initDeck.call(gameData);
                Game.prototype.distributeCards.call(gameData);
                Game.prototype.nextRound.call(gameData);
                gameData.gameState  ='SET_TRUMP';
                gameData.gameEvent  ='SET_TRUMP';
                break;
            case "SET_TRUMP":
                gameData.trump = data.trump;
                Game.prototype.distributeCards.call(gameData);
                gameData.gameState  ='PLAY_CARD';
                gameData.gameEvent  ='PLAY_CARD';
                var y = Game.prototype.withdrawCards.call(gameData);
                if(y){
                    gameData.gameState  ='WITHDRAW_CARD';
                    gameData.gameEvent  ='WITHDRAW';
                }
                break;
            case "WITHDRAW_CARD":
                fnCall = 'WITHDRAW_CARD';
                gameData.cardIndex = data.card;
                Game.prototype.moveWithdrawCard.call(gameData);
                //Game.prototype.withdrawCard.call(gameData);
                gameData.gameState  = 'RETURN_CARD';
                gameData.gameEvent ='RETURN';
                break;
            case "RETURN_CARD":
                fnCall = 'RETURN_CARD';
                gameData.cardIndex = data.card;
                Game.prototype.moveReturnCard.call(gameData);
                gameData.returnCard = true;
                var self = this;
                var y = Game.prototype.withdrawCards.call(gameData);
                if(y){
                    gameData.gameState  = 'WITHDRAW_CARD';
                    gameData.gameEvent = 'WITHDRAW';
                    var x = JSON.stringify(gameData);
                }
                else{
                    gameData.gameState  ='PLAY_CARD';
                    gameData.gameEvent = 'PLAY_CARD';
                }
                break;
            case "PLAY_CARD":
                gameData.cardPlayed = data.cardPlayed;
                Game.prototype.playCard.call(gameData);
                if((gameData.gameTurn % 3) == 1){
                    gameData.turnSuit = gameData.cardPlayed.suit;
                }
                if((gameData.gameTurn % 3) == 0){
                    Game.prototype.nextTurn.call(gameData);
                    Game.prototype.getTurnWinner.call(gameData);
                    gameData.gameState  ='PLAY_CARD';
                    gameData.gameEvent  = 'DECLARE_WINNER';
                }else{
                    Game.prototype.nextTurn.call(gameData);
                    gameData.gameState  ='PLAY_CARD';
                    gameData.gameEvent  = 'CARD_PLAYED';
                }
                break;
            default:
                break;
            }
            $scope.game325 = gameData;
            if($scope.gameType == 'BOTS'){
                 // localStorage.setItem('gameData', JSON.stringify($scope.game325));
            }
            $scope.reactRender();
    }
    if($scope.gameType == 'LIVE'){
        //Register Events Only When Game Mode Is Live Type
        socket.removeAllListeners();
        socket.emit('JOIN_ROOM', {roomId : $scope.gameId, user : $scope.user});
        socket.on('CONNECTED', function(data){
            $scope.playerId = data.id;
            if (data.start == 'closed') {
                var x = {
                    gameEvent : 'START_GAME'
                }
                socket.emit('GAME', {data : x});
            };
        });
        socket.on('GAME_STATUS', function(data){
            $scope.connectedPlayers  = [];
            for (var i = data.data.players.length - 1; i >= 0; i--) {
                $scope.connectedPlayers.push(data.data.players[i]);
            }
            var n = 3-$scope.connectedPlayers.length;
            $scope.PlayersToJoinMsg = 'Waiting for '+n+' more player(s) to connect';
            if(data.data.status == 'closed'){
                $scope.waiting = false;
                $scope.ready = true;
            };
        });
        socket.on('GAME', function (data){
            console.log('here');
            $scope.game325 = data.data;
            $scope.reactRender();
            
        });
        socket.on('INVALID', function (data){
            alert('Invalid Room');
            $state.go('home');
        });
        socket.on('DISCONNECTED', function (data){
            $scope.disconnectedPlayerId = data.id;
        });
        socket.on('CONNECTED_2', function (data){
            $scope.playerId = data.id;
            $scope.game325 = data.data;
        });
        socket.on('NO_PLAYER_LEFT', function (data) {
            // body...
            $state.go('home');
        })
        socket.on('msgRecieved', function (data){
            if(data.player.user){
                if(data.player.user.type == 'local'){
                    userPic = '/assets/img/avatars.png';
                    backgroundPosition = 45*data.player.user.image+'px 0px';
                }else{
                    userPic = data.player.user.image;
                    backgroundPosition = '50% 50%';
                }
                $scope.msg = {
                    body : data.msg.msg,
                    userName : data.player.user.name,
                    userId : data.player.id,
                    userPic : userPic,
                    backgroundPosition : backgroundPosition
                }
            }
            for (var i = $scope.game325.players.length - 1; i >= 0; i--){
                if($scope.game325.players[i].id == data.player.id){
                    $scope.game325.players[i].msg = data.msg;
                }
            }
            $scope.reactRender();
            var e = $scope.getMsgTemplate($scope.msg);
            angular.element('.chat-box').append(e);
            $location.hash('bottomscroll');
            $anchorScroll();
            $location.hash('');
        });
        socket.on('PlayerLeft', function (data){
            $state.go('home');
        });
    }else{
        //BOTS PLAY MODE
        var gameData = localStorage.getItem("gameData");
        var gameData = JSON.parse(gameData);
        var txt = "Do you want to continue with previously saved Game ?";
        if(gameData){
            $mdDialog.show({
              template:
                '<md-dialog>' +
                '  <md-content> <h2 class="md-title"> Continue Previously Saved Game? </h2> <p> You are about to be disconnected from other players.'+
                 '  <div class="md-actions">' +
                 '<md-button ng-click="loadGame()"> Yes. </md-button>'+
                 '<md-button ng-click="newGame()"> No Start New Game </md-button>'+
                 '  </div>' +
                '</md-content></md-dialog>',
                controller: 'errDialogController'
            });
        }else{
            $scope.startNewGame()
        }
    }
    $scope.$on('LOAD_GAME', function(){
        $scope.loadGame();
        $scope.reactRender();
      });
    $scope.$on('NEW_GAME', function(){
        $scope.startNewGame();
      });
    $scope.loadGame = function(){
        $scope.playerId = 0;
        $scope.waiting = false;
        $scope.ready = true;
        $rootScope.arrPlayers = gameData.players;
        $scope.game325 = gameData;
    }
    $scope.sendChat = function(){
        var msg = $scope.chatMsg;
        if(msg.length > 0){
            socket.emit('sendMsg', {msg : msg, user : $scope.user});
            $scope.chatMsg = '';
        }
    }
    //other player cards will not be shown
    $scope.hiddenCard = function(){
        return {
            card : {
                suit : 0,
                rank : 0
            }
        }
    }
    $scope.closeRight = function() {
        $mdSidenav('right').close()
    };
    $scope.toggleRight = function() {
        $mdSidenav('right').toggle();
    };
    $scope.exitGame = function(){
        $mdDialog.show({
              template:
                '<md-dialog>' +
                '  <md-content> <h2 class="md-title"> Exit Game? </h2> <p> You are about to be disconnected from other players.'+
                ' Other players will lose their game too.' +
                 '  <div class="md-actions">' +
                 '<md-button ng-click="goToHome()"> Yes exit game. </md-button>'+
                 '<md-button ng-click="closeDialog()"> Continue playing </md-button>'+
                 '  </div>' +
                '</md-content></md-dialog>',
                controller: 'errDialogController'
            });
    }
    // Prevent to use the back button.
    $scope.$on('$locationChangeStart', function(event) {
        if(!$scope.waiting && !$scope.gameType == 'LIVE'){
            event.preventDefault();
            $scope.exitGame();        
        }
    });
    

}])
game325.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });
                    event.preventDefault();
                }
            });
        };
    });
game325.controller('scoreDialogController',['$scope', '$mdDialog', '$rootScope', function ($scope, $mdDialog, $rootScope){
    $scope.closeDialog = function(){
            $mdDialog.hide();
        };
    $scope.arrPlayers = $rootScope.arrPlayers;
}]);
/*game325.directive('gameBody', function (){
    return {
        restrict : 'A',
        scope : {
            data : '=',
            game : '=',
            playerId : '=',
            type : '='
        },
        link : function (scope, elem, attrs){
                scope.gameEvent = function(evt){
                    console.log(scope);
                    scope.$parent.sendEvent(evt);
                },
                scope.updateScores = function(players){
                    scope.$parent.updateScores(players);
                },
                scope.$watch('game', function (){
                    var game = scope.$parent.game325;
                    var playerId = scope.$parent.playerId;
                    var type = scope.$parent.gameType;
                    var a = React.createFactory(Game325Component);
                    var x = a({scope : scope, game : game, playerId : playerId, type : type});
                    React.render(x, elem[0]);
                })
        }
    }
})
*/