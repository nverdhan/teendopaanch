//polyfill
if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}
var Player = function(){
    return {
     id : '',
     name : '',
     img : '',
     cards : [],
     scores : [{
        handsMade : 0,
        handsToMake : 0
     }],
     cardsToBeWithdrawn : 0,
     handsToMake : 0,
     handsMade : 0,
     handsToMakeInLR : 0,
     cardPlayed : {}
    }
}

var getNumericValue = function(z){
    console.log(z);
    var x = z.split('px');
    return x[0];
}
var temp;
game325.controller('game325Controller', ['$rootScope', '$http', '$scope', '$state', '$stateParams','AuthService', 'gameService',  '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog','Session', function ($rootScope, $http, $scope, $state, $stateParams, AuthService, gameService, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog, Session){
    $scope.gameState = '';
    $scope.mySelf = '';
    $scope.playerId = 0;
    $scope.activePlayerId;
    $scope.cards = Array();
    $scope.trumps = ['S', 'H', 'C', 'D'];
    $scope.trump = '';
    $scope.arrPlayers = Array();
    $scope.nextPlayerType = '';
    $scope.allowedSuit = '';
    $scope.player = 0;
    $scope.players;
    $scope.playerArray;
    $scope.cardLeft;
    $scope.bottomPlayerCards = [];
    $scope.leftPlayerCards = [];
    $scope.rightPlayerCards = [];
    $scope.bottomPlayerWidth;
    $scope.gameWindow = {x : 800, y : 600, padding : 10};//px
    $scope.cardSize = {x: 80, y : 113.4};//px
    $scope.cardLeftMargin = $scope.cardSize.x*1/3;
    $scope.fullWidth = $scope.cardSize.x + (9*($scope.cardLeftMargin));
    $scope.withDrawEnabled = false;
    $scope.disconnectedPlayerId;
    $scope.bottomPlayerWidth;
    $scope.profilepicsize = 50 + 10;
    $scope.showScores = false;
    $scope.scalefactor = 1;
    $scope.ready = true;
    $scope.cssConsts = {
        centre: [160,240],
        playerareadia : 50,
        firstplayerY: 10,
        radiusplayer: 155
    }
    $scope.botsName = ['dUmMy', 'aNk', 'eNVy'];
    $scope.withDrawEnabled = false;
    $scope.user = Session;
    $scope.game = {
        'state' : '',
        'activePlayerId' : '',
        'cards' : [],
        'trumps' : ['spade','hearts','clubs', 'diamond'],
        'trump' : '',
        'players' : '',
        'arrPlayers' : [],
        'allowedSuit'  : '',
    }
    $scope.gameStateEvents = {
        'START' : 'START',
        'SET_TRUMP' : 'SET_TRUMP',
        'PLAY_CARD' : 'PLAY_CARD',
        'GET_WINNER' : 'GET_WINNER',
        'WITHDRAW_CARD' : 'WITHDRAW_CARD',
        'RETURN_CARD' : 'RETURN_CARD',
    }
    $scope.msgEvents = {
        'SEND' : 'SEND',
        'RECIEVE' : 'RECIEVE',
        'MSG_RECIEVED' : 'MSG_RECIEVED'
    }
    $scope.scaleGameBody = function(){
        var win_w = window.innerWidth;
        var effh = window.innerHeight;
        if(win_w > 960){
            var effw = win_w - 340 - 60;
        }else{
            var effw = win_w - 60;
        }
        if(effw/effh < $scope.gameWindow.x/$scope.gameWindow.y){
            $scope.scalefactor = effw/$scope.gameWindow.x;
            var leftshift = $scope.gameWindow.x*($scope.scalefactor-1)/2;
            var topshift = $scope.gameWindow.y*($scope.scalefactor-1)/2 + + (effh-$scope.gameWindow.y*$scope.scalefactor)/2;
            return {
                '-webkit-transform' : 'scale('+$scope.scalefactor+','+$scope.scalefactor+')',
                '-ms-transform' : 'scale('+$scope.scalefactor+','+$scope.scalefactor+')',
                'transform' : 'scale('+$scope.scalefactor+','+$scope.scalefactor+')',
                'left' : leftshift+'px',
                'top': topshift + 'px'
            }
        }
        if(effw/effh > $scope.gameWindow.x/$scope.gameWindow.y){
            $scope.scalefactor = effh/$scope.gameWindow.y;
            var leftshift = $scope.gameWindow.x*($scope.scalefactor-1)/2 + (effw-$scope.gameWindow.x*$scope.scalefactor)/2;
            var topshift = $scope.gameWindow.y*($scope.scalefactor-1)/2;
            return {
                '-webkit-transform' : 'scale('+$scope.scalefactor+','+$scope.scalefactor+')',
                '-ms-transform' : 'scale('+$scope.scalefactor+','+$scope.scalefactor+')',
                'transform' : 'scale('+$scope.scalefactor+','+$scope.scalefactor+')',
                'left' : leftshift+'px',
                'top': topshift + 'px'
            }
        }
    }
    $scope.closeScores = function (){
        $scope.showScores = false;
    }
    $scope.sortDeck = function (array){
        array.sort(function (a,b){
           if (a.order > b.order){
                return 1;
            }
            if (a.order < b.order){
                return -1;
            }
            return 0;
        });
        return array;
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
    $scope.hiddenCard = function(){
        return {
            card : {
                suit : 0,
                rank : 0
            }
        }
    }
    $scope.game =  new Game();
    $scope.playerId = 0;
    $scope.playerIds = Array();
    $scope.initPlayers = function(){
        for (var i = 0; i <3; i++) {
            var player = new Player();
            player.id = i;
            if(i == 0){
                player.name = Session.name;
                player.image = Session.image;
                player.type = Session.type;
                player.bot = 'human'
            }else{
                player.name = $scope.botsName[i];
                player.image = i;
                player.type = 'local';
                player.bot = 'bot'
            }
            $scope.game.players.push(player);
            $scope.playerIds.push(i);
        }
        $scope.arrPlayers = $scope.game.players;
        console.log($scope.players);
        $scope.players = $scope.game.players;
    }
    
    $scope.initCards = function(){
        for (var i = 0; i < $scope.playerIds.length; i++){
            $scope.arrPlayers[i].cards = $scope.players[$scope.playerIds[i]]['cards'];
        }
    }
    // initialize players
    $scope.getPlayer = function(){
        return {
            id : '',
            name : '',
            image : '',
            type : '',
            position : '',
            cards : [],
            handsToMake : '',
            handsMade : 0,
            cardPlayed : '',
            scores : [],
            msg : ''
        }
    }
    $scope.card = function(suit, rank, order){
        return {
            suit : suit,
            rank : rank,
            order : order,
            currentOrder : order,
            probability : null
        }
    }

    $scope.gameEvent = function(data){
        var gameEvent = data.gameEvent;
        switch(gameEvent){
            case "START_GAME":
                Game.prototype.initDeck.call($scope.game);
                Game.prototype.distributeCards.call($scope.game);
                Game.prototype.updateHandsToMake.call($scope.game);
                $scope.game.gameTurn = 1;
                $scope.game.gameState  ='SET_TRUMP';
                $scope.game.gameEvent  ='SET_TRUMP';
                Game.prototype.assignPlayerIds.call($scope.game);
                break;
            case "NEXT_ROUND":
                Game.prototype.initDeck.call($scope.game);
                Game.prototype.distributeCards.call($scope.game);
                Game.prototype.nextRound.call($scope.game);
                $scope.game.gameState  ='SET_TRUMP';
                $scope.game.gameEvent  ='SET_TRUMP';
                break;
            case "SET_TRUMP":
                $scope.game.trump = data.trump;
                Game.prototype.distributeCards.call($scope.game);
                $scope.game.gameState  ='PLAY_CARD';
                $scope.game.gameEvent  ='PLAY_CARD';
                var y = Game.prototype.withdrawCards.call($scope.game);
                if(y){
                    $scope.game.gameState  ='WITHDRAW_CARD';
                    $scope.game.gameEvent  ='WITHDRAW';
                }
                break;
            case "WITHDRAW_CARD":
                $scope.game.cardIndex = data.card;
                Game.prototype.withdrawCard.call($scope.game);
                $scope.game.gameState  = 'RETURN_CARD';
                $scope.game.gameEvent ='RETURN';
                break;
            case "RETURN_CARD":
                $scope.game.card = data.card;
                Game.prototype.returnCard.call($scope.game);
                var y = Game.prototype.withdrawCards.call($scope.game);
                if(y){
                    $scope.game.gameState  = 'WITHDRAW_CARD';
                    $scope.game.gameEvent = 'WITHDRAW';
                    var x = JSON.stringify($scope.game);
                }
                else{
                    $scope.game.gameState  ='PLAY_CARD';
                    $scope.game.gameEvent = 'PLAY_CARD';
                }
                break;
            case "PLAY_CARD":
                $scope.game.cardPlayed = data.cardPlayed;
                Game.prototype.playCard.call($scope.game);
                if(($scope.game.gameTurn % 3) == 1){
                    $scope.game.turnSuit = $scope.game.cardPlayed.suit;
                }
                if(($scope.game.gameTurn % 3) == 0){
                    Game.prototype.nextTurn.call($scope.game);
                    Game.prototype.getTurnWinner.call($scope.game);
                    $scope.game.gameState  ='PLAY_CARD';
                    $scope.game.gameEvent  = 'DECLARE_WINNER';
                }else{
                    Game.prototype.nextTurn.call($scope.game);
                    $scope.game.gameState  ='PLAY_CARD';
                    $scope.game.gameEvent  = 'CARD_PLAYED';
                }
            break;
            default:
                null
            }
            var game = Object.assign($scope.game)
            $scope.next(game);
    }
    $scope.isBestCard = function(){

    }
    $scope.playBot = function(e){
        switch(e){
            case 1:
                var deck = $scope.leftPlayerDeck;
                break;
            case 2:
                var deck = $scope.rightPlayerDeck;
                break;
        }
        var playableCards = Array();
        var trumpCards = Array();
        for (var i = 0; i < deck.length; i++) {
            if(deck[i].suit == $scope.game.turnSuit){
                var a = deck[i];
                playableCards.push(a);
            }
            if(deck[i].suit == $scope.trump){
                var a = deck[i];
                trumpCards.push(a);
            }
        }
        if(playableCards.length > 0){
            var card = playableCards[0];
        }else if(trumpCards.length > 0){
            var card =  trumpCards[0];
        }else{
            var card = $scope.getSmallestCard(deck);
        }
        // var i = deck.indexOf(card);
        // var card = deck[0];
        console.log(card);
        return card;
    }
    $scope.getSmallestCard = function(deck){
        var card = deck[0];
        return card;
    }
    $scope.isAllowedCard = function(){
        if (true) {
            return true;
        }else{
            return false;
        }
    }
    $scope.getPlayerCardsCSS = function(n){
        var x = $scope.cardSize.x;
        var t = $scope.cardSize.y;
        var top = $scope.gameWindow.y - $scope.cardSize.y;
        $scope.fullWidth = 4*x;
        if(n == 0){
            var i = $scope.bottomPlayerCards.length;
        }
        if(n == 1){
            var i = $scope.leftPlayerCards.length;
            var left = $scope.fullWidth/2 - w/2;
        }
        if(n == 2){
            var i = $scope.rightPlayerCards.length;
            var left = $scope.gameWindow.x - ($scope.fullWidth/2 + w/2);
        }
        var w = x + (i-1)*(x/3);
        var c = left;
        if(n == 0){
            return {
                'width': w,
                'height' : t,
                'top' : top
            }    
        }else if(n == 1){
            return {
                'width': w,
                'height' : t + $scope.profilepicsize,
                'left' : c
           }
        }else{
            return {
                'width': w,
                'height' : t + $scope.profilepicsize,
                'left' : c
            }
        }   
    }
    $scope.getCardWidth = function (){
        var w = angular.element('.card').width();
        return w;
    }
    $scope.getMargin = function (argument) {
        var c = ($scope.gameTurn%3)-1;
        var x = angular.element('.card').width();
        var y = 0.5*(5)*0.6*x;
        return {
            'padding-left' : y+'px',
            'padding-right' : y+'px'
        }
    }
    $scope.changePlayerId = function(id){
        for (var i = $scope.playerIds.length - 1; i >= 0; i--){
            if($scope.playerIds[i] == $scope.disconnectedPlayerId){
                $scope.playerIds[i] = id;
            }
        }
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.disconnectedPlayerId){
                $scope.arrPlayers[i].id = id;
            }
        }
        if($scope.playerId == $scope.disconnectedPlayerId){
            $scope.playerId = id;
        }
        if($scope.leftPlayerId == $scope.disconnectedPlayerId){
            $scope.leftPlayerId = id;
        }
        if($scope.rightPlayerId == $scope.disconnectedPlayerId){
            $scope.rightPlayerId = id;
        }
        if($scope.activePlayerId == $scope.disconnectedPlayerId){
            $scope.activePlayerId = id;
        }
        if($scope.otherPlayerId == $scope.disconnectedPlayerId){
            $scope.otherPlayerId = id;
        }
    }
    $scope.assignPlayers = function(){
        $scope.arrPlayers = [];
        var pos = 360/($scope.playerIds.length);
        for (var i = 0; i < $scope.playerIds.length; i++) {
            var player = $scope.getPlayer();
            player.id = $scope.playerIds[i];
            $scope.playerArray = $scope.players;
            player.name = $scope.players[$scope.playerIds[i]]['name'];
            player.image = $scope.players[$scope.playerIds[i]]['image'];
            player.type = $scope.players[$scope.playerIds[i]]['type'];
            player.cards = $scope.players[$scope.playerIds[i]]['cards'];
            player.handsToMake = $scope.players[$scope.playerIds[i]]['handsToMake'];
            player.scores = $scope.players[$scope.playerIds[i]]['scores'];
            player.cardPlayed = $scope.players[$scope.playerIds[i]]['cardPlayed'];
            player.position = i*pos;
            $scope.arrPlayers.push(player);
        }
        $rootScope.arrPlayers = $scope.arrPlayers;
    }
    $scope.distributeCardsFlag = false;
    $scope.leftPlayerDeck = [];
    $scope.bottomPlayerDeck = [];
    $scope.rightPlayerDeck = [];
    $scope.updateCards = function(){
        for (var i = 0; i < $scope.playerIds.length; i++){
            $scope.arrPlayers[i].cards = $scope.players[$scope.playerIds[i]]['cards'];
        }
        $scope.leftPlayerId = $scope.arrPlayers[1].id;
        $scope.rightPlayerId = $scope.arrPlayers[2].id;
        if($scope.lastGameState == 'SET_TRUMP' || $scope.gameState == 'SET_TRUMP'){
            $scope.distributeCardsFlag = true;
        }else{
            $scope.distributeCardsFlag = false;
        }
        if($scope.distributeCardsFlag){
            for (var i = 0; i < 5; i++){
                var b = $scope.arrPlayers[0].cards.pop();
                $scope.bottomPlayerDeck.push(b);
                var l = $scope.arrPlayers[1].cards.pop();
                $scope.leftPlayerDeck.push(l);
                var r = $scope.arrPlayers[2].cards.pop();
                $scope.rightPlayerDeck.push(r);
            };
            $scope.distributeCards();
        }else if($scope.lastGameState == 'RETURN_CARD' || $scope.lastGameState == 'RETURN_CARD'){
            // console.log('here');
            // $scope.bottomPlayerDeck = $scope.sortDeck($scope.arrPlayers[0].cards);
            // $scope.leftPlayerDeck = $scope.sortDeck($scope.arrPlayers[1].cards);
            // $scope.rightPlayerDeck = $scope.sortDeck($scope.arrPlayers[2].cards);
        }
    }
    // $scope.reinitDeck = function(){
    //     console.log($scope.arrPlayers[0].cards);
    //     $scope.bottomPlayerDeck = $scope.sortDeck($scope.arrPlayers[0].cards);
    //     $scope.leftPlayerDeck = $scope.sortDeck($scope.arrPlayers[1].cards);
    //     $scope.rightPlayerDeck = $scope.sortDeck($scope.arrPlayers[2].cards);
    //     $timeout(function() {
    //         $scope.refreshDeckStyle(0);
    //         $scope.refreshDeckStyle(120);
    //         $scope.refreshDeckStyle(240);    
    //     }, 10);
    // }
    $scope.distributeBottomPlayer = function(){
        for (var i = $scope.bottomPlayerDeck.length - 1; i >= 0; i--) {
            var a = $scope.bottomPlayerDeck.pop();
            $scope.bottomPlayerCards.unshift(a);
        }
    }
    $scope.distributeLeftPlayer = function(){
        for (var i = $scope.leftPlayerDeck.length - 1; i >= 0; i--) {
            var a = $scope.leftPlayerDeck.pop();
            $scope.leftPlayerCards.unshift(a);
        }
    }
    $scope.distributeRightPlayer = function(){
        for (var i = $scope.rightPlayerDeck.length - 1; i >= 0; i--) {
            var a = $scope.rightPlayerDeck.pop();
            $scope.rightPlayerCards.unshift(a);
        }
    }
    $scope.getCardClass = function(e){
        if(!$scope.distributeCardsFlag){
            if(e == 'front'){
                return 'frontRotated';
            }
            if(e == 'back'){
                return 'backRotated';
            }
        }
    }
    $scope.distributeCards = function(){
        if(!$scope.distributeCardsFlag){
            return false;
        }
        var fullDeckWidth = 9*($scope.cardLeftMargin) + $scope.cardSize.x;
        var bottomPlayerY = 0;
        var leftPlayerY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
        var rightPlayerY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
        var a = 1,m=0,n=0,o=0;
        var b = 3*$scope.bottomPlayerDeck.length;
        for (var i = a; i <= b; i++){
            if(i%3 == 0){
                var x = function(){
                    n++;
                    var bottomPlayerX = 0.5*($scope.gameWindow.x - ($scope.bottomPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                    bottomPlayerX+= (n-1)*($scope.cardLeftMargin);
                    angular.element('.bottomPlayerDeck:nth-child('+n+')').css({
                        'transform' : 'translateX('+bottomPlayerX+'px) translateY('+bottomPlayerY+'px)'
                    });
                    if (!angular.element('.bottomPlayerDeck:nth-child('+n+')').hasClass('movedCard')) {    
                        angular.element('.bottomPlayerDeck:nth-child('+n+') .front').addClass('frontRotated');
                        angular.element('.bottomPlayerDeck:nth-child('+n+') .back').addClass('backRotated');
                        angular.element('.bottomPlayerDeck:nth-child('+n+')').addClass('movedCard');
                    }
                }
                delayService.asyncTask(100, x);
            }
            if((i%3)-1 == 0){
                var x = function(){
                    m++;
                    var leftPlayerX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                    leftPlayerX+= (m-1)*($scope.cardLeftMargin);
                    angular.element('.leftPlayerDeck:nth-child('+m+')').css({
                        'transform' : 'translateX('+leftPlayerX+'px) translateY('+leftPlayerY+'px)'
                    });
                    angular.element('.leftPlayerDeck:nth-child('+m+')').addClass('movedCard');
                }
                delayService.asyncTask(100, x);
            }
            if((i%3)-2 == 0){
                var x = function(){
                    o++;
                    var rightPlayerX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
                    rightPlayerX+= (o-1)*($scope.cardLeftMargin);
                    angular.element('.rightPlayerDeck:nth-child('+o+')').css({
                        'transform' : 'translateX('+rightPlayerX+'px) translateY('+rightPlayerY+'px)'
                    });
                    angular.element('.rightPlayerDeck:nth-child('+o+')').addClass('movedCard');
                }
                delayService.asyncTask(100, x);
            }
        }
    }
    $scope.getInitialCardCSS = function (position, index, card){
        var playerIndex, cardIndex;
        var fullDeckWidth = 9*($scope.cardLeftMargin) + $scope.cardSize.x;
        if(position == 0){
            var topY = 0;
            var leftX = 0.5*($scope.gameWindow.x - ($scope.bottomPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
            leftX+= (index-1)*($scope.cardLeftMargin);
        }
        if (position == 1){
            var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
            var leftX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
            leftX+= (index-1)*($scope.cardLeftMargin);
        }
        if(position == 2){
            var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
            var leftX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
            leftX+= (index-1)*($scope.cardLeftMargin);
        }
        if($scope.gameState == 'RETURN_CARD' && $scope.cardMoved == false && card.suit == $scope.cardWithdrawn.suit && card.rank == $scope.cardWithdrawn.rank){
            for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
                for (var j = $scope.arrPlayers[i].cards.length - 1; j >= 0; j--) {
                    if($scope.arrPlayers[i].cards.length == 9){
                        playerIndex = i;
                    }
                }
            }
            if(playerIndex == 0){
                for (var i = $scope.bottomPlayerDeck.length - 1; i >= 0; i--) {
                    if($scope.bottomPlayerDeck[i].suit == $scope.cardWithdrawn.suit && $scope.bottomPlayerDeck[i].rank == $scope.cardWithdrawn.rank){
                        cardIndex = i;
                    }
                }
                var topY = 0;
                var leftX = 0.5*($scope.gameWindow.x - ($scope.bottomPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                leftX+= (cardIndex-1)*($scope.cardLeftMargin);
            }
            if(playerIndex == 1){
                for (var i = $scope.leftPlayerDeck.length - 1; i >= 0; i--) {
                    if($scope.leftPlayerDeck[i].suit == $scope.cardWithdrawn.suit && $scope.leftPlayerDeck[i].rank == $scope.cardWithdrawn.rank){
                        cardIndex = i;
                    }
                }
                var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
                var leftX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                leftX+= (cardIndex-1)*($scope.cardLeftMargin);
            }
            if(playerIndex == 2){
                for (var i = $scope.rightPlayerDeck.length - 1; i >= 0; i--) {
                    if($scope.rightPlayerDeck[i].suit == $scope.cardWithdrawn.suit && $scope.rightPlayerDeck[i].rank == $scope.cardWithdrawn.rank){
                        cardIndex = i;
                    }
                }
                var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
                var leftX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
                leftX+= (cardIndex-1)*($scope.cardLeftMargin);
            }
            return {
                'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)',
                'visibility' : 'hidden'
            }
        }
        else if($scope.gameState == 'WITHDRAW_CARD' && $scope.cardMoved == false && card.suit == $scope.cardWithdrawn.suit && card.rank == $scope.cardWithdrawn.rank){
            for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
                for (var j = $scope.arrPlayers[i].cards.length - 1; j >= 0; j--) {
                    if($scope.arrPlayers[i].id == $scope.cardMoveTo){
                        playerIndex = i;
                    }
                }
            }
            if(playerIndex == 0){
                for (var i = $scope.bottomPlayerDeck.length - 1; i >= 0; i--) {
                    if($scope.bottomPlayerDeck[i].suit == $scope.cardWithdrawn.suit && $scope.bottomPlayerDeck[i].rank == $scope.cardWithdrawn.rank){
                        cardIndex = i;
                    }
                }
                var topY = 0;
                var leftX = 0.5*($scope.gameWindow.x - ($scope.bottomPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                leftX+= (cardIndex-1)*($scope.cardLeftMargin);
            }
            if(playerIndex == 1){
                for (var i = $scope.leftPlayerDeck.length - 1; i >= 0; i--) {
                    if($scope.leftPlayerDeck[i].suit == $scope.cardWithdrawn.suit && $scope.leftPlayerDeck[i].rank == $scope.cardWithdrawn.rank){
                        cardIndex = i;
                    }
                }
                var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
                var leftX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                leftX+= (cardIndex-1)*($scope.cardLeftMargin);
            }
            if(playerIndex == 2){
                for (var i = $scope.rightPlayerDeck.length - 1; i >= 0; i--) {
                    if($scope.rightPlayerDeck[i].suit == $scope.cardWithdrawn.suit && $scope.rightPlayerDeck[i].rank == $scope.cardWithdrawn.rank){
                        cardIndex = i;
                    }
                }
                var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
                var leftX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
                leftX+= (cardIndex-1)*($scope.cardLeftMargin);
            }
            return {
                'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)',
                'visibility' : 'hidden'
            }
        }
        else if(!$scope.distributeCardsFlag){
            return {
                'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
            }
        }
    }
    $scope.moveWithdrawnCard = function(){
        var fullDeckWidth = 9*($scope.cardLeftMargin) + $scope.cardSize.x;
        var initialP, finalP, cardIndex, playerDeck, cssFinal;
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.otherPlayerId){
                initialP = i;
            }
        }
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.activePlayerId){
                finalP = i;
            }
        }
        if(initialP == 0){
            playerDeck = Object.assign($scope.bottomPlayerDeck);
        }
        if(initialP == 1){
            playerDeck = Object.assign($scope.leftPlayerDeck);
        }
        if(initialP == 2){
            playerDeck = Object.assign($scope.rightPlayerDeck);
        }
        for (var i = 0; i < playerDeck.length;  i++){
            if(playerDeck[i].suit == $scope.cardWithdrawn.suit && playerDeck[i].rank == $scope.cardWithdrawn.rank){
                cardIndex = i;
            }
        }
        var finalCardIndex;
        if(finalP == 0){
            var x = $scope.sortDeck($scope.arrPlayers[0].cards);
            for (var i = x.length - 1; i >= 0; i--) {
                if(x[i].suit == $scope.cardWithdrawn.suit && x[i].rank == $scope.cardWithdrawn.rank){
                    finalCardIndex = i;
                }
            }
            $scope.bottomPlayerDeck.splice(finalCardIndex, 0, $scope.cardWithdrawn);
            n = finalCardIndex;
            var leftX = 0.5*($scope.gameWindow.x - ($scope.bottomPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
            leftX+= (n-1)*($scope.cardLeftMargin);
            var leftY = 0;
        }
        if(finalP == 1){
            var x = $scope.sortDeck($scope.arrPlayers[1].cards);
            for (var i = x.length - 1; i >= 0; i--) {
                if(x[i].suit == $scope.cardWithdrawn.suit && x[i].rank == $scope.cardWithdrawn.rank){
                    finalCardIndex = i;
                }
            }
            n = finalCardIndex;
            $scope.leftPlayerDeck.splice(finalCardIndex, 0, $scope.cardWithdrawn);
            var leftX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
            leftX+= (n-1)*($scope.cardLeftMargin);
            var leftY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
        }
        if(finalP == 2){
            var x = $scope.sortDeck($scope.arrPlayers[2].cards);
            for (var i = x.length - 1; i >= 0; i--) {
                if(x[i].suit == $scope.cardWithdrawn.suit && x[i].rank == $scope.cardWithdrawn.rank){
                    finalCardIndex = i;
                }
            }
            n = finalCardIndex;
            $scope.rightPlayerDeck.splice(finalCardIndex, 0, $scope.cardWithdrawn);
            var leftX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
            leftX+= (n-1)*($scope.cardLeftMargin);
            var leftY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
        }
        cssFinal = {
                'transform' : 'translate3d('+leftX+'px '+leftY+'px 0px)'
            }
        if(initialP == 0){
            $scope.bottomPlayerDeck.splice(cardIndex, 1);
        }
        if(initialP == 1){
            $scope.leftPlayerDeck.splice(cardIndex, 1);
        }
        if(initialP == 2){
            $scope.rightPlayerDeck.splice(cardIndex, 1);
        }
        cardIndex = cardIndex+1;
        finalCardIndex = finalCardIndex+1;
        if(initialP == 0){
            var moveInitialCard = function(){
                angular.element('.bottomPlayerDeck:nth-child('+cardIndex+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                });
                switch(finalP){
                    case 1:
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                }
            }
            var toggleCards = function(){
                angular.element('.bottomPlayerDeck:nth-child('+cardIndex+')').css({
                    'visibility' : 'hidden'
                });
                switch(finalP){
                    case 1:
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                }   
            }
        }
        if(initialP == 1){
            var moveInitialCard = function(){
                angular.element('.leftPlayerDeck:nth-child('+cardIndex+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                });
                switch(finalP){
                    case 0:
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                }
            }
            var toggleCards = function(){
                angular.element('.leftPlayerDeck:nth-child('+cardIndex+')').css({
                    'visibility' : 'hidden'
                });
                switch(finalP){
                    case 0:
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .front').addClass('frontRotated');
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .back').addClass('backRotated');
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                }   
            }
        }
        if(initialP == 2){
            var moveInitialCard = function(){
                angular.element('.rightPlayerDeck:nth-child('+cardIndex+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                });
                switch(finalP){
                    case 0:
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                    case 1:
                        console.log(initialP+'--'+finalP);
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                }
            }
            var toggleCards = function(){
                angular.element('.rightPlayerDeck:nth-child('+cardIndex+')').css({
                    'visibility' : 'visible'
                });
                switch(finalP){
                    case 0:
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .front').addClass('frontRotated');
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .back').addClass('backRotated');
                        break;
                    case 1:
                        console.log(initialP+'--'+finalP);
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                }   
            }
        }
         $scope.cardMoved == true;
        delayService.asyncTask(20, moveInitialCard);
        delayService.asyncTask(20, toggleCards);
        // delayService.asyncTask(200, splice);
        // delayService.asyncTask(500, $scope.reinitDeck);
    }
    $scope.moveReturnCard = function(){
        var fullDeckWidth = 9*($scope.cardLeftMargin) + $scope.cardSize.x;
        var initialP, finalP, cardIndex, playerDeck, cssFinal;
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.cardMoveFrom){
                initialP = i;
            }
        }
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.cardMoveTo){
                finalP = i;
            }
        }
        var Card = function(suit, rank, order){
            return {
                'suit' : suit,
                'rank' : rank,
                'order' : order
            }
        }
        if(initialP == 0){
            playerDeck = Object.assign($scope.bottomPlayerDeck);
        }
        if(initialP == 1){
            playerDeck = Object.assign($scope.leftPlayerDeck);
        }
        if(initialP == 2){
            playerDeck = Object.assign($scope.rightPlayerDeck);
        }
        for (var i = 0; i < playerDeck.length;  i++){
            if(playerDeck[i].suit == $scope.cardWithdrawn.suit && playerDeck[i].rank == $scope.cardWithdrawn.rank){
                cardIndex = i;
            }
        }
        if(!$scope.cardWithdrawn){
            return false;
        }
        var card = new Card($scope.cardWithdrawn.suit, $scope.cardWithdrawn.rank, $scope.cardWithdrawn.order);
        var finalCardIndex;
        if(finalP == 0){
            var x = $scope.sortDeck($scope.arrPlayers[0].cards);
            for (var i = x.length - 1; i >= 0; i--) {
                if(x[i].suit == $scope.cardWithdrawn.suit && x[i].rank == $scope.cardWithdrawn.rank){
                    finalCardIndex = i;
                }
            }
            $scope.bottomPlayerDeck.splice(finalCardIndex, 0, card);
            n = finalCardIndex;
            var leftX = 0.5*($scope.gameWindow.x - ($scope.bottomPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
            leftX+= (n-1)*($scope.cardLeftMargin);
            var leftY = 0;
        }
        if(finalP == 1){
            var x = $scope.sortDeck($scope.arrPlayers[1].cards);
            for (var i = x.length - 1; i >= 0; i--) {
                if(x[i].suit == $scope.cardWithdrawn.suit && x[i].rank == $scope.cardWithdrawn.rank){
                    finalCardIndex = i;
                }
            }
            n = finalCardIndex;
            $scope.leftPlayerDeck.splice(finalCardIndex, 0, card);
            var leftX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
            leftX+= (n-1)*($scope.cardLeftMargin);
            var leftY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
        }
        if(finalP == 2){
            var x = $scope.sortDeck($scope.arrPlayers[2].cards);
            for (var i = x.length - 1; i >= 0; i--) {
                if(x[i].suit == $scope.cardWithdrawn.suit && x[i].rank == $scope.cardWithdrawn.rank){
                    finalCardIndex = i;
                }
            }
            n = finalCardIndex;
            $scope.rightPlayerDeck.splice(finalCardIndex, 0, card);
            var leftX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
            leftX+= (n-1)*($scope.cardLeftMargin);
            var leftY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
        }
        cssFinal = {
            'transform' : 'translate3d('+leftX+'px '+leftY+'px 0px)'
        }
        if(initialP == 0){
            $scope.bottomPlayerDeck.splice(cardIndex, 1);
        }
        if(initialP == 1){
            $scope.leftPlayerDeck.splice(cardIndex, 1);
        }
        if(initialP == 2){
            $scope.rightPlayerDeck.splice(cardIndex, 1);
        } 
        cardIndex = cardIndex+1;
        finalCardIndex = finalCardIndex+1;
        if(initialP == 0){
            var moveInitialCard = function(){
                angular.element('.bottomPlayerDeck:nth-child('+cardIndex+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                });
                switch(finalP){
                    case 1:
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                }
            }
            var toggleCards = function(){
                angular.element('.bottomPlayerDeck:nth-child('+cardIndex+')').css({
                    'visibility' : 'hidden'
                });
                switch(finalP){
                    case 1:
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                }   
            }
        }
        if(initialP == 1){
            var moveInitialCard = function(){
                angular.element('.leftPlayerDeck:nth-child('+cardIndex+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                });
                switch(finalP){
                    case 0:
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                }
            }
            var toggleCards = function(){
                angular.element('.leftPlayerDeck:nth-child('+cardIndex+')').css({
                    'visibility' : 'hidden'
                });
                switch(finalP){
                    case 0:
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .front').addClass('frontRotated');
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .back').addClass('backRotated');
                        break;
                    case 2:
                        angular.element('.rightPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        break;
                }   
            }
        }
        if(initialP == 2){
            var moveInitialCard = function(){
                angular.element('.rightPlayerDeck:nth-child('+cardIndex+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                });
                switch(finalP){
                        
                    case 0:
                        console.log(initialP+'--'+finalP);
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                    case 1:
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'transform' : 'translateX('+leftX+'px) translateY('+leftY+'px)'
                        });
                        break;
                }
            }
            var toggleCards = function(){
                angular.element('.rightPlayerDeck:nth-child('+cardIndex+')').css({
                    'visibility' : 'visible'
                });
                switch(finalP){
                    case 0:
                        console.log(initialP+'--'+finalP);
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'visibility' : 'visible'
                        });
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .front').addClass('frontRotated');
                        angular.element('.bottomPlayerDeck:nth-child('+finalCardIndex+') .back').addClass('backRotated');
                        break;
                    case 1:
                        angular.element('.leftPlayerDeck:nth-child('+finalCardIndex+')').css({
                            'display' : 'block'
                        });
                        break;
                }   
            }
        }
        $scope.cardMoved == true;
        delayService.asyncTask(20, moveInitialCard);
        delayService.asyncTask(20, toggleCards);
        // delayService.asyncTask(0, splice);
        // delayService.asyncTask(500, $scope.reinitDeck);
    }
    $scope.getDeckPosition = function(){
        var y  = $scope.gameWindow.y - $scope.cardSize.y - $scope.gameWindow.padding; 
        return {
            'top' : y,
            'z-index' : 10
        }

    }
    //get initial and final position to calculate move  withdrawn/return card
    $scope.showScores = false;
    $scope.toggleScores = function(ev){
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

    //NV
    $scope.cssConsts = {
        centre: [160,240],
        playerareadia : 50,
        firstplayerY: 10,
        radiusplayer: 155
    }

    $scope.assignClass = function(card){
        return ['rank-'+card.rank, card.suit];
    }
    $scope.assignClass2 = function(card, position){
        var front = '';
        if(position != 0){
            front = 'front';
        }
        return ['rank-'+card.rank, card.suit, front];   
    }

    $scope.getFirstPersonStyle = function(){
        return {
            'position': 'absolute',
            'bottom' : '10em',
            'left' : 0,
            'right' : 0,
            'margin' : '0 auto'
        }   
    }
    $scope.getSuitForHTML = function(card){
        if(card.suit == 'H')
            return 'hearts';
        if(card.suit == 'S')
            return 'spades';
        if(card.suit == 'D')
            return 'diams';
        if(card.suit == 'C')
            return 'clubs';
    }
    $scope.getRankForHTML = function(card){
        if(card.rank == 13){
            return 'A';
        }else if(card.rank == 12){
            return 'K';
        }else if(card.rank == 11){
            return 'Q';
        }else if(card.rank == 10){
            return 'J';
        }else{
            return card.rank;
        }
    }
    $scope.updatePlayerInfo = function(){
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            $scope.arrPlayers[i].handsToMake = $scope.players[$scope.playerIds[i]]['handsMade'];
            if($scope.arrPlayers[i].handsToMake == 5){
                $scope.activePlayerId = $scope.arrPlayers[i].id;
            }
            $scope.arrPlayers[i].handsMade = 0;
        };
    }
    $scope.checkAllowedSuit = function(){
        var activePlayerId = $scope.activePlayerId;
        var i = $scope.playerIds.indexOf($scope.activePlayerId);
        if(i == 0){
            var lastPlayerIndex = 2;
        }else{
            var lastPlayerIndex = i-1;
        }
        var lastPlayerId = $scope.playerIds[lastPlayerIndex];
        var card = $scope.cardsPlayed[lastPlayerId];
        $scope.allowedSuit = card['suit'];
    }
    $scope.getCardInitialStyle = function(e){
        if(e==0){
            var c = $rootScope.left;
            var top = angular.element('.bottom-player ul').offset().top - angular.element('.played-cards ul').offset().top;
            return {
                'left' : c,
                'top' : top/$scope.scalefactor
            }
        }
    }
    $scope.reAlignDeck = function(e){
        if(e == 0){
            var topY = -(2*$scope.cardSize.y + 20);
            var leftX = $scope.gameWindow.x/2 - $scope.cardSize.x/2;
        }
    }
    $scope.getCardInitialPosition = function(e){
        var n = 0;
        if(e == 0){
            n = 0;
            var topY = -($scope.cardSize.y + 40);
            var leftX = $scope.gameWindow.x/2 - $scope.cardSize.x/2;
        }
        if(e == 120){
            n = 1;
            var topY = -(2*$scope.cardSize.y + 40);
            var leftX = $scope.gameWindow.x/3 - $scope.cardSize.x/2;
        }
        if(e == 240){
            n = 2;
            var topY = -(2*$scope.cardSize.y + 40);
            var leftX = 2*$scope.gameWindow.x/3 - $scope.cardSize.x/2;
        }
        return{
             'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)',
             'display' : 'none'
        }
    }
    $scope.showPlayedCard = function(){
        $scope.cardToPLay = $scope.cardPlayed;
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.otherPlayerId){
                $scope.arrPlayers[i].cardPlayed = $scope.cardPlayed;
                var e = $scope.arrPlayers[i].position;
            }
        }
        var index = ''; 
        var n = 0;
        if(e == 0){
            n = 1;
            var topY = -($scope.cardSize.y + 20);
            var leftX = $scope.gameWindow.x/2 - $scope.cardSize.x/2;
            angular.element('.playedCard:nth-child('+n+')').css({
                'display' : 'block'
            });
            for (var i = 0; i < $scope.bottomPlayerDeck.length; i++) {
                if($scope.bottomPlayerDeck[i].rank == $scope.game.cardPlayed.rank && $scope.bottomPlayerDeck[i].suit == $scope.game.cardPlayed.suit){
                    index = i;
                }
            }
            $scope.bottomPlayerDeck.splice(index, 1);
        }
        if(e == 120){
            n = 2;
            var topY = -(2*$scope.cardSize.y + 20);
            var leftX = $scope.gameWindow.x/3 - $scope.cardSize.x/2;
            angular.element('.playedCard:nth-child('+n+')').css({
                'display' : 'block'
            });
            for (var i = 0; i < $scope.leftPlayerDeck.length; i++) {
                if($scope.leftPlayerDeck[i].rank == $scope.game.cardPlayed.rank && $scope.leftPlayerDeck[i].suit == $scope.game.cardPlayed.suit){
                    index = i;
                }
            }
            // if(index == 0){
            //     console.log($scope.leftPlayerDeck);
            // }else{
                $scope.leftPlayerDeck.splice(index, 1);    
            // }
        }
        if(e == 240){
            n = 3;
            var topY = -(2*$scope.cardSize.y + 20);
            var leftX = 2*$scope.gameWindow.x/3 - $scope.cardSize.x/2;
            angular.element('.playedCard:nth-child('+n+')').css({
                'display' : 'block'
            });
            for (var i = 0; i < $scope.rightPlayerDeck.length; i++) {
                if($scope.rightPlayerDeck[i].rank == $scope.game.cardPlayed.rank && $scope.rightPlayerDeck[i].suit == $scope.game.cardPlayed.suit){
                    index = i;
                }
            }
            // if(index == 0){
            //     console.log($scope.rightPlayerDeck);
            // }else{
                $scope.rightPlayerDeck.splice(index, 1);    
            // }
        }
        // $scope.refreshDeckStyle(e);
        $timeout(function() {
            $scope.refreshDeckCards(e);
        }, 20);
        
    }
    $scope.refreshDeckCards = function(e){
        if(e == 0){
            var array  = Object.assign($scope.sortDeck($scope.bottomPlayerDeck));
            $scope.bottomPlayerDeck = Array();
            $scope.bottomPlayerDeck = Object.assign(array);
        }
        if(e == 120){
            var array  = Object.assign($scope.sortDeck($scope.leftPlayerDeck));
            $scope.leftPlayerDeck = Array();
            $scope.leftPlayerDeck = Object.assign(array)
        }
        if(e == 240){
            var array  = Object.assign($scope.sortDeck($scope.rightPlayerDeck));
            $scope.rightPlayerDeck = Array();
            $scope.rightPlayerDeck = Object.assign(array)
            // $scope.rightPlayerDeck = $scope.sortDeck($scope.rightPlayerDeck);
        }
        delete array;
    }
    $scope.refreshDeckStyle = function (e){
        var fullDeckWidth = 9*($scope.cardLeftMargin) + $scope.cardSize.x;
        if(e == 0){
            var bottomPlayerY = 0;
            var n = $scope.bottomPlayerDeck.length;
            var x = (n-1)*$scope.cardLeftMargin + $scope.cardSize.x;
            var c = 0.5*($scope.gameWindow.x - x);
            for (var i = 1; i <= n; i++) {
                var leftX = c + (i-1)*($scope.cardLeftMargin);
                angular.element('.bottomPlayerDeck:nth-child('+i+')').css({
                    'transform' : 'translateX('+leftX+'px) translateY('+bottomPlayerY+'px)'
                });
                angular.element('.bottomPlayerDeck:nth-child('+i+') .front').addClass('frontRotated');
                angular.element('.bottomPlayerDeck:nth-child('+i+') .back').addClass('backRotated');
            }
        }
        if(e == 120){
            var leftPlayerY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
            var n = $scope.leftPlayerDeck.length;
            for (var m = 1; m <= n; m++) {
                var leftPlayerX = 0.5*(fullDeckWidth -  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) - $scope.cardSize.x);
                leftPlayerX+= (m-1)*($scope.cardLeftMargin);
                angular.element('.leftPlayerDeck:nth-child('+m+')').css({
                    'transform' : 'translateX('+leftPlayerX+'px) translateY('+leftPlayerY+'px)'
                });
            }
        }
        if(e == 240){
            var rightPlayerY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
            var n = $scope.rightPlayerDeck.length;
            for (var m = 1; m <= n; m++) {
                var rightPlayerX = $scope.gameWindow.x -0.5*(fullDeckWidth +  ($scope.leftPlayerDeck.length - 1)*($scope.cardLeftMargin) + $scope.cardSize.x);
                rightPlayerX+= (m-1)*($scope.cardLeftMargin);
                angular.element('.rightPlayerDeck:nth-child('+m+')').css({
                    'transform' : 'translateX('+rightPlayerX+'px) translateY('+rightPlayerY+'px)'
                });
            }
        }
    }
    $scope.placeCardOnBoard = function(){
        $scope.cardToPLay = $scope.cardPlayed;
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.otherPlayerId){
                $scope.arrPlayers[i].cardPlayed = $scope.cardPlayed;
                var e = $scope.arrPlayers[i].position;
            }
        }
        var index = 0;
        if(e == 0){
            var topY = -($scope.cardSize.y + 40);
            var leftX = $scope.gameWindow.x/2 - $scope.cardSize.x/2;
            for (var i = 0; i < $scope.bottomPlayerDeck.length; i++) {
                if($scope.bottomPlayerDeck[i].rank == $scope.cardPlayed.rank && $scope.bottomPlayerDeck[i].suit == $scope.cardPlayed.suit){
                    index = i;
                }
            };
            index = index+1;
            angular.element('.bottomPlayerDeck:nth-child('+index+')').css({
                'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
            });
        }
        if(e == 120){
            var topY = -(2*$scope.cardSize.y + 40);
            var leftX = $scope.gameWindow.x/3 - $scope.cardSize.x/2;
            for (var i = 0; i < $scope.leftPlayerDeck.length; i++) {
                if($scope.leftPlayerDeck[i].rank == $scope.cardPlayed.rank && $scope.leftPlayerDeck[i].suit == $scope.cardPlayed.suit){
                    index = i;
                }
            };
            index = index+1;
            angular.element('.leftPlayerDeck:nth-child('+index+')').css({
                'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
            });
            angular.element('.leftPlayerDeck:nth-child('+index+') .front').addClass('frontRotated');
            angular.element('.leftPlayerDeck:nth-child('+index+') .back').addClass('backRotated');
        }
        if(e == 240){
            var topY = -(2*$scope.cardSize.y + 40);
            var leftX = 2*$scope.gameWindow.x/3 - $scope.cardSize.x/2;
            for (var i = 0; i < $scope.rightPlayerDeck.length; i++) {
                if($scope.rightPlayerDeck[i].rank == $scope.cardPlayed.rank && $scope.rightPlayerDeck[i].suit == $scope.cardPlayed.suit){
                    index = i;
                }
            };
            index = index+1;
            angular.element('.rightPlayerDeck:nth-child('+index+')').css({
                'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
            });
            angular.element('.rightPlayerDeck:nth-child('+index+') .front').addClass('frontRotated');
            angular.element('.rightPlayerDeck:nth-child('+index+') .back').addClass('backRotated');
        }
        delayService.asyncTask(10, $scope.showPlayedCard)
        // delayService.asyncTask(20, $scope.playNext);
    }
    $scope.assignClasses  = function(class1, class2){
        angular.element('.'+class1).addClass(class2);
        angular.element('.'+class2).addClass(class1);
    }
    $scope.updateScores = function(){
        for (var i = 0; i < $scope.playerIds.length; i++) {
            $scope.arrPlayers[i].handsMade = $scope.players[$scope.playerIds[i]]['handsMade'];
            $scope.arrPlayers[i].scores = $scope.players[$scope.playerIds[i]].scores;
        }
        $rootScope.arrPlayers = $scope.arrPlayers;
        var data;
        if ($scope.gameState == 'nextRound') {
            socket.emit('nextRound', {data : data})
        }
        if($scope.gameTurn%30 == 1){
            if($scope.activePlayerId == $scope.playerId){
                var data = {
                    gameEvent : 'NEXT_ROUND'
                }
                socket.emit('GAME', {data : data});    
            }
        }
    }
    $scope.updateBoard = function(){
        var i = $scope.playerIds.indexOf($scope.winnerId);
        var x;
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.winnerId){
                x = $scope.arrPlayers[i].position;
            }
        }
        $scope.moveHand(x);
    }
    $scope.moveHand = function(x){
        var fullDeckWidth = 9*($scope.cardLeftMargin) + $scope.cardSize.x;
        if(x == 0){
            var topY = 0;
            var leftX = 0.5*($scope.gameWindow.x - $scope.cardSize.x);
        }else if(x == 120){
            var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
            var leftX = 0.5*(fullDeckWidth - $scope.cardSize.x);
        }else if(x == 240){
            var topY = -($scope.gameWindow.y - $scope.cardSize.y - 60 - 2*$scope.gameWindow.padding);
            var leftX = $scope.gameWindow.x - 0.5*(fullDeckWidth - $scope.cardSize.x);
        }
        angular.element('.playedCard').css({
            'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
        });
        $scope.refreshDeckCards();
        delayService.asyncTask(10, $scope.refreshCardsPlayed);
    }
    $scope.refreshCardsPlayed = function(){
        var n = $scope.arrPlayers.length;
        for (var i = 0; i < n; i++) {
            $scope.arrPlayers[i].cardPlayed = '';
        }
        for (var i = 0; i < n; i++) {
            var m = 120*i;
            var x = $scope.getCardInitialPosition(m);
            var k = i+1;
            angular.element('.playedCard:nth-child('+k+')').css(x);
        };
        $scope.activePlayerId = $scope.winnerId;
    }
    $scope.setTrumpCard = function(trump){
        if($scope.playerId == $scope.activePlayerId){
            var data = {
                gameState : 'SET_TRUMP',
                gameEvent : 'SET_TRUMP',
                trump : trump,
                activePlayerId : $scope.activePlayerId
            }
            $scope.gameEvent(data);
        }
    }
    $scope.play = function(card, player, $event){
        switch($scope.gameState){
            case 'WITHDRAW_CARD':
                if(($scope.activePlayerId == $scope.playerId) && ($scope.otherPlayerId == player)){
                    var data = {
                        gameState : 'WITHDRAW_CARD',
                        gameEvent : 'WITHDRAW_CARD',
                        card : card,
                    }
                }
                break;
            case 'RETURN_CARD':
                for (var i = $scope.arrPlayers.length - 1; i >= 0; i--){
                    if($scope.arrPlayers[i].id == $scope.activePlayerId){
                            var data = {
                                gameState : 'RETURN_CARD',
                                gameEvent : 'RETURN_CARD',
                                card : card,
                            }
                    }
                }
                break;
            case 'PLAY_CARD':
                if($scope.players[player].bot == 'bot' || $scope.playerId == $scope.activePlayerId){
                    var data = {
                        gameState : 'PLAY_CARD',
                        gameEvent : 'PLAY_CARD',
                        cardPlayed : card,
                        activePlayerId : $scope.activePlayerId
                    }
                }
                break;
        }
        $scope.gameEvent(data);
    }
    $scope.assignActivePlayer = function(){
        $scope.activePlayerId = $scope.temp;
    }
    $scope.moveSetTrumpCard = function(){
        angular.element('.trump-cards').each(function(){
            var xFinal = $scope.gameWindow.x - $scope.cardSize.x - $scope.gameWindow.padding;
            var yFinal = $scope.gameWindow.y - $scope.cardSize.y - $scope.gameWindow.padding;
            angular.element(this).animate({
                'left' : xFinal,
                'top' : yFinal
            })
        })
    }
    $scope.next = function (data){
        var gameEvent = data.gameEvent;
        if($scope.gameState == 'SET_TRUMP'){
            $scope.moveSetTrumpCard();
        }
        // $scope.trump = data.trump;
        switch(gameEvent){
            case 'SET_TRUMP':
                $scope.lastGameState = $scope.gameState;
                // $scope.game325 = data;
                $scope.trump = data.trump;
                $scope.gameState = data.gameState;
                $scope.activePlayerId = data.activePlayerId;
                $scope.playerIds = data.playerIds;
                $scope.gameState = data.gameState;
                $scope.players = data.players;
                $scope.gameTurn = data.gameTurn; //nv add
                $scope.playerArray = $scope.players;
                $scope.assignPlayers();
                // $scope.updateCards();
                delayService.asyncTask(500, $scope.updateCards);
                break;
            case 'RETURN_CARD':
                $scope.lastGameState = $scope.gameState;
                console.log('return-card');
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.gameState = 'RETURN_CARD';
                $scope.gameState = data.gameState;
                $scope.cardReturned = data.cardPlayed;
                $scope.moveReturnedCard();
                break;
            case 'WITHDRAW_CARD':
                $scope.lastGameState = $scope.gameState;
                console.log('withdraw-card');
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.cardWithdrawn = data.cardPlayed;
                $scope.gameState = data.gameState;
                $scope.moveWithdrawnCard();
                break;
            case 'RETURN':
                console.log('return');
                $scope.lastGameState = $scope.gameState;
                $scope.players = data.players;
                $scope.playerArray = $scope.players;
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.gameState = 'RETURN_CARD';
                $scope.cardWithdrawn = data.cardPlayed;
                $scope.cardMoved == false;
                $scope.initPlayers();
                $scope.updateCards();
                $scope.moveWithdrawnCard();
                break;
            case 'WITHDRAW':
                $scope.lastGameState = $scope.gameState;
                $scope.players = data.players;
                $scope.playerArray = $scope.players;
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.gameState = 'WITHDRAW_CARD';
                $scope.initPlayers();
                $scope.initCards();
                $scope.cardMoved == false;
                // $scope.updateCards();
                if($scope.lastGameState == 'SET_TRUMP'){
                    $scope.updateCards();
                }
                if($scope.lastGameState && $scope.lastGameState!='SET_TRUMP'){
                    $scope.cardWithdrawn = data.card;
                    if($scope.lastGameState == 'RETURN_CARD'){
                        $scope.cardIndex = data.cardIndex;
                        $scope.cardMoveTo = data.cardMoveTo;
                        $scope.cardMoveFrom = data.cardMoveFrom;
                        $scope.moveReturnCard();
                    }
                }else{
                    $scope.cardWithdrawn = '';
                }
                break;
            case 'PLAY_CARD':
                console.log('played');
                $scope.lastGameState = $scope.gameState;
                $scope.trump = data.trump;
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.cardsPlayed = data.cardsPlayed;
                $scope.gameState = data.gameState;
                $scope.players = data.players;
                $scope.playerArray = $scope.players;
                // $scope.assignPlayers();
                // $scope.initPlayers();
                // $scope.updateCards();
                delayService.asyncTask(100, $scope.updateCards);
                break;
            case 'CARD_PLAYED':
                $scope.lastGameState = $scope.gameState;
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.temp = $scope.activePlayerId;
                $scope.cardsPlayed = data.cardsPlayed;
                $scope.cardPlayed = data.cardPlayed;
                $scope.gameState = data.gameState;
                $scope.players = data.players;
                $scope.playerArray = data.players;
                $scope.updateCards();
                $scope.placeCardOnBoard();
                
                $scope.activePlayerId = data.activePlayerId;
                // delayService.asyncTask(800, $scope.showPlayedCard)
                delayService.asyncTask(300, $scope.assignActivePlayer);
                
                break;
            case 'DECLARE_WINNER':
                $scope.lastGameState = $scope.gameState;
                $scope.activePlayerId = data.activePlayerId;
                $scope.otherPlayerId = data.otherPlayerId;
                $scope.cardsPlayed = data.cardsPlayed;
                $scope.cardPlayed = data.cardPlayed;
                $scope.gameState = data.gameState;
                $scope.players = data.players;
                $scope.playerArray = $scope.players;
                $scope.gameTurn = data.gameTurn;
                $scope.placeCardOnBoard();
                // delayService.asyncTask(800, $scope.showPlayedCard)
                // $scope.initPlayers();
                $scope.updateCards();
                $scope.winnerId = data.winnerId;
                delayService.asyncTask(1200, $scope.updateBoard);
                // delayService.asyncTask(600, $scope.refreshCardsPlayed);
                delayService.asyncTask(10, $scope.updateScores);
                break;
        }
        delayService.asyncTask(2000, $scope.ifBotTurn);
    }
    $scope.turn = 0;
    $scope.ifBotTurn = function(){
        if(($scope.gameState == 'PLAY_CARD' || $scope.gameState == 'DECLARE_WINNER') && $scope.game.players[$scope.game.activePlayerId].bot == 'bot'){
            $scope.turn++;
            var card = $scope.playBot($scope.game.activePlayerId);
            $scope.play(card, $scope.game.activePlayerId, null)
        }
    }
    $scope.start = function(){
        $scope.initPlayers();
        $scope.game.activePlayerId = 0;
        var data  = {
            gameEvent : 'START_GAME'
        }
        $scope.gameEvent(data);
        $scope.activePlayerId = 0;
    }
    $scope.start();
    $scope.closeRight = function() {
    $mdSidenav('right').close()
    };

    $scope.toggleRight = function() {
    $mdSidenav('right').toggle();
    };
    $scope.getCardPic = function(card){
        if(card === null){
            return {};
        }else{
        if(card.suit == 'H')
            var posy = '-226.88px';
        if(card.suit == 'S')
            var posy = '-340.32px';
        if(card.suit == 'D')
            var posy = '0px';
        if(card.suit == 'C')
            var posy = '-113.44px';
        var posx = ((card.rank-1)*80*-1);
        var x = {'background-image' : 'url(assets/img/cardpic.jpg)',
                'width' : $scope.cardSize.x,
                'height' : $scope.cardSize.y,
                'background-size' : '1200px',
                'background-position' : posx+'px '+posy};
    return x;
        }
    }
    $scope.getTrumpPic = function(trump){
        if(trump == 'H')
            var posy = '-226.88px';
        if(trump == 'S')
            var posy = '-340.32px';
        if(trump == 'D')
            var posy = '0px';
        if(trump == 'C')
            var posy = '-113.44px';
        var posx = -1040;
        var x = {'position' : 'relative !important',
                'float' : 'left',
                'background-image' : 'url(assets/img/cardpic.jpg)',
                'width' : $scope.cardSize.x,
                'height' : $scope.cardSize.y,
                'background-size' : '1200px',
                'background-position' : posx+'px '+posy
            };

            return x;
    }
    $scope.getTrumpStyle = function (trump, index){
            if(trump == 'H')
            var posy = '-226.88px';
            if(trump == 'S')
                var posy = '-340.32px';
            if(trump == 'D')
                var posy = '0px';
            if(trump == 'C')
                var posy = '-113.44px';
            var posx = -1040;
        if($scope.gameState == 'SET_TRUMP'){
            var left = ($scope.gameWindow.x - ($scope.trumps.length)*($scope.cardSize.x))/2 + $scope.cardSize.x*index;
            var top = $scope.gameWindow.y/2;
            var zIndex = 99;
        }else{
            var zIndex = 0
            if(trump == $scope.trump)
                zIndex = 1;
            var left = $scope.gameWindow.x - $scope.cardSize.x - $scope.gameWindow.padding;
            var top = $scope.gameWindow.y - $scope.cardSize.y - $scope.gameWindow.padding;
        }
        var x = {'background-image' : 'url(assets/img/cardpic.jpg)',
                    'width' : $scope.cardSize.x,
                    'height' : $scope.cardSize.y,
                    'background-size' : '1200px',
                    'background-position' : posx+'px '+posy,
                    'left' : left,
                    'top' : top,
                    'z-index' : zIndex
                };
        return x;
    }
    $scope.getProfilePic = function(playerindex){
        if (typeof $scope.arrPlayers[playerindex] !== 'undefined') {
            if($scope.arrPlayers[playerindex].type == 'local'){
                var picurl = '  /assets/img/avatars.png';
                var index = $scope.arrPlayers[playerindex].image;
                var backgroundPosition = index*45+'px 0px';
            }else{
                var picurl = $scope.arrPlayers[playerindex].image;
                var backgroundPosition = '50% 50%';
            }
            var x = {
                    'background': '#fff url('+picurl+')',
                    'background-position' : backgroundPosition
                };
            return x;
        }
    }
    $scope.getProfile = function(id){
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == id){
                return {
                        name: $scope.arrPlayers[i].name,
                        image: $scope.arrPlayers[i].image
                    };
            };
        }
    }
    $scope.exitGame = function(){
        console.log('exit game request!');
    }
}]);
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
game325.controller('scoreDialogController',['$scope', '$mdDialog', '$rootScope', function($scope, $mdDialog, $rootScope){
    $scope.closeDialog = function(){
            $mdDialog.hide();
        };
    $scope.arrPlayers = $rootScope.arrPlayers;
    // $scope.getColorClass = function(handsMade,handsToMake){
    //     console.log('here');
    //     if(handsMade == handsToMake){
    //         return {classval: 'blue-theme'};
    //     }
    //     if(handsMade < handsToMake){
    //         return {classval: 'red-theme'};
    //     }
    //     if(handsMade > handsToMake){
    //         return {classval: 'green-theme'};
    //     }
    // }
}]);
game325.directive('playerDeck', ['$compile', function ($compile){
    var cardLeft = 28;
    var cardHTML = '<li></li>';
}])
