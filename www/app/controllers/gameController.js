var temp;
game325.controller('gameController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','authService', 'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog', function ($rootScope, $http, $scope, $state, $stateParams, authService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog){
    $scope.gameId = $stateParams.id;
    $scope.gameType = $stateParams.type;
    $scope.waiting = true;
    $scope.ready = false;
    $scope.chatMsg = '';
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
    $rootScope.left;
    $rootScope.top;
    $scope.bottomPlayerCards = [];
    $scope.leftPlayerCards = [];
    $scope.rightPlayerCards = [];
    $scope.bottomPlayerWidth;
    $scope.gameWindow = {x : 800, y : 600};//px
    $scope.cardSize = {x: 72, y : 90};//px
    $scope.cardLeftMargin = $scope.cardSize.x*1/3;
    $scope.fullWidth = $scope.cardSize.x + (9*($scope.cardLeftMargin));
    $scope.withDrawEnabled = false;
    $scope.disconnectedPlayerId;
    $scope.bottomPlayerWidth;
    $scope.showScores = false;
    $scope.cssConsts = {
        centre: [160,240],
        playerareadia : 50,
        firstplayerY: 10,
        radiusplayer: 155
    }
    //
    // $scope.game325 = new $scope.Game325();
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
    socket.removeAllListeners();
    socket.emit('JOIN_ROOM', {roomId : $scope.gameId});
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
        if(data.status == 'closed'){
            $scope.waiting = false;
            $scope.ready = true;
        };
    });
    $scope.closeScores = function (){
        $scope.showScores = false;
    }
    $scope.arrangeCard = function(array){
        var s = [];var h = []; var c = []; var d = [];
        for (var i = array.length - 1; i >= 0; i--) {
            var suit = array[i].suit;
            switch(suit){
                case 'S':
                    for (var j = 0; j < s.length; j++){
                        if(s.length == 0){
                            s.push(array[i]);
                        }
                        else if(j < s.length && s[j+1].rank > array[i].rank){
                            s.splice(j, 0, array[i]);
                        }else{
                            s.plice(s.length-1, 0, array[i]);
                        }
                    };
                    break;
                case 'H':
                    for (var j = 0; j < s.length; j++){
                        if(h.length == 0){
                            h.push(array[i]);
                        }
                        else if(j < h.length && h[j+1].rank > array[i].rank){
                            h.splice(j, 0, array[i]);
                        }else{
                            h.plice(s.length-1, 0, array[i]);
                        }
                    };
                    break;
                case 'C':
                    for (var j = 0; j < s.length; j++){
                        if(c.length == 0){
                            c.push(array[i]);
                        }
                        else if(j < c.length && c[j+1].rank > array[i].rank){
                            c.splice(j, 0, array[i]);
                        }else{
                            c.plice(s.length-1, 0, array[i]);
                        }
                    };
                    break;
                case 'D':
                    for (var j = 0; j < d.length; j++){
                        if(d.length == 0){
                            d.push(array[i]);
                        }
                        else if(j < d.length && d[j+1].rank > array[i].rank){
                            d.splice(j, 0, array[i]);
                        }else{
                            d.plice(s.length-1, 0, array[i]);
                        }
                    };
                    break;
            }
        };
    }
    $scope.getMsgTemplate = function (content){
        var x ='<md-item>'+
                    '<md-item-content>'+
                      '<div class="md-tile-left ball" style="background: #fff url('+content.userPic+') no-repeat center center; background-size: cover;">'+
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
    socket.on('msgRecieved', function (data) {
        console.log(data);
        data.player.user = JSON.parse(data.player.user);
        console.log(data);
        if(data.player.user){
        $scope.msg = {
            body : data.msg.msg,
            userName : data.player.user.name,
            userId : data.player.id,
            userPic : data.player.user.img
        }
        }else{
            $scope.msg = {
                body : data.msg.msg,
                userName: "Devansh",
                userId : data.player.id,
                userPic : "../../assets/img/devd.jpg"
            }
        }

        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.msg.userId){
                if(i==1) var playerclass='left-player-profile';
                if(i==2) var playerclass='right-player-profile';
                if($('.'+playerclass).hasClass('anim-end')){
                        angular.element('.'+playerclass).toggleClass('anim-end');    
                    }
                    temp = i;
                    var x = function(){
                    angular.element('.'+playerclass).toggleClass('anim-end'); 
                    if($('.'+playerclass).hasClass('anim-start')){
                        angular.element('.'+playerclass).toggleClass('anim-start');    
                    }
                    $scope.arrPlayers[temp].msg = '';                  
                    }
                    var animpromise = $timeout(x,3000);
                    if(!$('.'+playerclass).hasClass('anim-start')){
                        angular.element('.'+playerclass).toggleClass('anim-start');    
                    }else{
                        xxx = $timeout.cancel(animpromise);
                        console.log(xxx);
                    }
                    $scope.arrPlayers[temp].msg = $scope.msg.body;

            }
        };
        var e = $scope.getMsgTemplate($scope.msg);
        angular.element('.chat-box').append(e);
        $location.hash('bottomscroll');
        $anchorScroll();
        $location.hash('');
    })
    socket.on('START', function (data){
        console.log('started');
        $scope.gameState = data.data.gameState;
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.playerIds = data.data.playerIds;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.gameTurn = data.data.gameTurn;
        $scope.assignPlayers();    
        $scope.updateCards();
    });
    $scope.sendChat = function(){
        var msg = $scope.chatMsg;
        if(msg.length > 0){
            socket.emit('sendMsg', {msg : msg});
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
    $scope.initPlayers = function(players){
        for (var i = 0; i < $scope.playerArray.length; i++) {
            var id = $scope.playerArray[i].id;
            $scope.players[id] = $scope.playerArray[i];
        }
        
    }
    // initialize players
    $scope.getPlayer = function(){
        return {
            id : '',
            position : '',
            cards : [],
            handsToMake : '',
            handsMade : 0,
            cardPlayed : '',
            scores : [],
            msg : ''
        }
    }
    $scope.isAllowedCard = function(){
        if (true) {
            return true;
        }else{
            return false;
        }
    }
    $scope.getWidth = function (n) {
        // if(n==1){
        //         angular.element('.left-player-profile').toggleClass('player-active');
        //         if($('.right-player-profile').hasClass('player-active')) angular.element('.right-player-profile').toggleClass('player-active');
        //     } 
        // if(n==2){
        //         angular.element('.right-player-profile').toggleClass('player-active');
        //         if($('.right-player-profile').hasClass('player-active')) angular.element('.left-player-profile').toggleClass('player-active');
        //     }
        var x = 80;
        var t = 113.44;
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
                'height' : t
            }    
        }else if(n == 1){
            return {
                'width': w,
                'height' : t,
                'left' : c
           }
        }else{
            return {
                'width': w,
                'height' : t,
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
        console.log($scope.playerIds);
        for (var i = $scope.playerIds.length - 1; i >= 0; i--) {
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
        $scope.arrPlayers = Array();
        while($scope.playerIds.indexOf($scope.playerId)!==0){
            var s = $scope.playerIds.pop();
            $scope.playerIds.unshift(s);
        }
        var pos = 360/($scope.playerIds.length);
        for (var i = 0; i < $scope.playerIds.length; i++) {
            var player = $scope.getPlayer();
            player.id = $scope.playerIds[i];
            $scope.playerArray = $scope.players;
            $scope.initPlayers();
            player.name = $scope.players[$scope.playerIds[i]]['name'];
            player.img = $scope.players[$scope.playerIds[i]]['img'];
            player.cards = $scope.players[$scope.playerIds[i]]['cards'];
            player.handsToMake = $scope.players[$scope.playerIds[i]]['handsToMake'];
            player.scores = $scope.players[$scope.playerIds[i]]['scores'];
            player.position = i*pos;
            $scope.arrPlayers.push(player);
        }
        $rootScope.arrPlayers = $scope.arrPlayers;
    }
    $scope.if15distributed = false;
    $scope.distributeCardsFlag = false;
    $scope.updateCards = function(){
        for (var i = 0; i < $scope.playerIds.length; i++){
            $scope.arrPlayers[i].cards = $scope.players[$scope.playerIds[i]]['cards'];
        }
        var x = $scope.arrPlayers[0].cards.length + $scope.arrPlayers[1].cards.length + $scope.arrPlayers[2].cards.length;
        if(x == 15 && ($scope.gameState!="withdrawCard" && $scope.gameState!="returnCard")){
            $scope.distributeCardsFlag = true;
            $scope.if15distributed = true;
        }
        if(x == 30 && ($scope.gameState!="withdrawCard" && $scope.gameState!="returnCard") && $scope.if15distributed){
            $scope.distributeCardsFlag = true;
        }
        console.log($scope.gameTurn)
        if(x!=15 && x!=30){
            $scope.if15distributed = false;
            $scope.distributeCardsFlag = false;
        }
        console.log($scope.gameTurn);
        if($scope.gameTurn%30 == 1 && $scope.distributeCardsFlag){
            $scope.leftPlayerDeck = [];
            $scope.bottomPlayerDeck = [];
            $scope.rightPlayerDeck = [];
            for (var i = 0; i < 5; i++) {
                var b = $scope.arrPlayers[0].cards.pop();
                $scope.bottomPlayerDeck.push(b);
                var l = $scope.arrPlayers[1].cards.pop();
                $scope.leftPlayerDeck.push(l);
                var r = $scope.arrPlayers[2].cards.pop();
                $scope.rightPlayerDeck.push(r);
            };
        }
        $scope.leftPlayerId = $scope.arrPlayers[1].id;
        $scope.rightPlayerId = $scope.arrPlayers[2].id;
        if($scope.distributeCardsFlag){
            $scope.distributeCards(x);
        }else{
            $scope.bottomPlayerCards = $scope.arrPlayers[0].cards;
            $scope.leftPlayerCards = $scope.arrPlayers[1].cards;
            $scope.rightPlayerCards = $scope.arrPlayers[2].cards;
        }
    }
    $scope.distributeBottomPlayer = function(){
        for (var i = $scope.bottomPlayerDeck.length - 1; i >= 0; i--) {
            var a = $scope.bottomPlayerDeck.pop();
            $scope.bottomPlayerCards.push(a);
        }
    }
    $scope.distributeLeftPlayer = function(){
        for (var i = $scope.leftPlayerDeck.length - 1; i >= 0; i--) {
            var a = $scope.leftPlayerDeck.pop();
            $scope.leftPlayerCards.push(a);
        }
        
    }
    $scope.distributeRightPlayer = function(){
        for (var i = $scope.rightPlayerDeck.length - 1; i >= 0; i--) {
            var a = $scope.rightPlayerDeck.pop();
            $scope.rightPlayerCards.push(a);
        }
    }
    $scope.distributeCards = function(totalcards){
        if(totalcards==30 && $scope.if15distributed==false){
            $scope.bottomPlayerCards = $scope.arrPlayers[0].cards;
            $scope.leftPlayerCards = $scope.arrPlayers[1].cards;
            $scope.rightPlayerCards = $scope.arrPlayers[2].cards;
            return false;
        }
        var m = 0;
        var n = 0;
        var o = 0;
        for (var i = 1; i <= 15; i++){
            if(i%3 == 0){
                var x = function(){
                    n++;
                    var topY = angular.element('.bottom-player ul').offset().top - angular.element('.bottom-player ul').offset().top;
                    if($scope.bottomPlayerCards.length > 0){
                        var leftX = $('.bottom-player ul li:last-child').offset().left - angular.element('.game-body').offset().left;    
                    }else{
                        var leftX = $('.bottom-player ul').offset().left - angular.element('.game-body').offset().left-7*80/6;

                    }
                    leftX+= (n)*($scope.cardLeftMargin);
                    angular.element('.bottomPlayerDeck:nth-child('+n+')').css({
                        'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
                    });
                    angular.element('.bottomPlayerDeck:nth-child('+n+') .front').addClass('frontRotated');
                    angular.element('.bottomPlayerDeck:nth-child('+n+') .back').addClass('backRotated');
                    //  var a = $scope.bottomPlayerDeck.pop();
                    // $scope.bottomPlayerCards.push(a);
                }
                delayService.asyncTask(50, x);
            }
            if((i%3)-1 == 0){
                var x = function(){
                    m++;
                    var topY = angular.element('.left-player ul').offset().top  - angular.element('.bottom-player ul').offset().top;
                    if($scope.leftPlayerCards.length > 0){
                        var leftX = angular.element('.left-player ul li:last-child').offset().left - angular.element('.game-body').offset().left;    
                    }else{
                        var leftX = angular.element('.left-player ul').offset().left - angular.element('.game-body').offset().left-7*80/6;
                    }
                    leftX+= (m)*($scope.cardLeftMargin);
                    angular.element('.leftPlayerDeck:nth-child('+m+')').css({
                        'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
                    });
                }
                delayService.asyncTask(50, x);
            }
            if((i%3)-2 == 0){
                var x = function(){
                    o++;
                    var topY = angular.element('.right-player ul').offset().top  - angular.element('.bottom-player ul').offset().top;
                    if($scope.rightPlayerCards.length > 0){
                        var leftX = angular.element('.right-player ul li:last-child').offset().left - angular.element('.game-body').offset().left;
                    }else{
                        var leftX = angular.element('.right-player ul').offset().left - angular.element('.game-body').offset().left-7*80/6;
                    }
                    leftX+= (o)*($scope.cardLeftMargin);
                    angular.element('.rightPlayerDeck:nth-child('+o+')').css({
                        'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
                    });
                }
                delayService.asyncTask(50, x);
            }
        }
        var fn = function(){
            $scope.distributeBottomPlayer();
            $scope.distributeRightPlayer();
            $scope.distributeLeftPlayer();
        }
        delayService.asyncTask(50, fn);
        if(totalcards==30){
            $scope.if15distributed = false;
            $scope.distributeCardsFlag = false;
        }
    }
    $scope.withDrawEnabled = false;
    $scope.moveWithdrawnCard = function(){
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.otherPlayerId){
                $scope.arrPlayers[i].cards.pop();
                var initialClass = $scope.getInitialPosition($scope.arrPlayers[i].position);    
            }
        };
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.activePlayerId){
                var finalClass = $scope.getFinalPosition($scope.arrPlayers[i].position);    
            }
        }
        $scope.movingCard = $scope.cardWithdrawn;
        $('.movingCard').addClass(initialClass);
        angular.element('.movingCard').removeClass('rightMovedCard leftMovedCard bottomMovedCard');
        $timeout(function(){
            $('.movingCard').removeClass(initialClass);
            $('.movingCard').addClass(finalClass);
                
        },60);
        delayService.asyncTask(60, $scope.updateCards);
    }
    $scope.moveReturnedCard = function(){
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.activePlayerId){
                $scope.arrPlayers[i].cards.pop();
                var initialClass = $scope.getInitialPosition($scope.arrPlayers[i].position);    
            }
        }
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.otherPlayerId){
                var finalClass = $scope.getFinalPosition($scope.arrPlayers[i].position);    
            }
        }
        $scope.movingCard = $scope.cardReturned;
        angular.element('.movingCard').removeClass('rightmovingCard leftmovingCard bottommovingCard');
        $('.movingCard').addClass(initialClass);
        $timeout(function(){
            $('.movingCard').removeClass(initialClass);
            $('.movingCard').addClass(finalClass);
        },60);
        delayService.asyncTask(60, $scope.updateCards);
        if($scope.gameState == 'playCard'){
            for (var i = $scope.arrPlayers.length - 1; i >= 0; i--){
                if($scope.arrPlayers[i].handsToMake == 5){
                    $scope.activePlayerId = $scope.arrPlayers[i].id;
                }
            }
        }
    }
    $scope.getDeckTop = function(){
        var x = angular.element('.bottom-player ul').offset().top;
        var y = angular.element('.game-body').offset().top;
        var z = x-y 
        return z;
    }
    $scope.getPosition = function(position){
        if(position == 0){
            // return 'zeroInitial';
        }if(position == 120){
            return 'leftInitial';
        }
        if(position == 240){
            return 'rightInitial';
        }
    }
    $scope.getPlayedPosition = function(position){
        if(position == 0){
            return 'zeroFinal';
        }if(position == 120){
            return 'leftFinal';
        }
        if(position == 240){
            return 'rightFinal';
        }
    }
    //get initial and final position to calculate move  withdrawn/return card 
    $scope.getInitialPosition = function(i){
        if(i == 0){
            return 'bottomMovingCard';
        }
        if(i == 120){
            return 'leftMovingCard';
        }
        if(i == 240){
            return 'rightMovingCard';
        }
    }
    $scope.getFinalPosition = function(i){
        if(i == 0){
            return 'bottomMovedCard';
        }
        if(i == 120){
            return 'leftMovedCard';
        }
        if(i == 240){
            return 'rightMovedCard';
        }   
    }
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
    $scope.getTrumpDivCSS = function(){
        var position = 'absolute';
        var top = $scope.gameWindow.y/2 - $scope.cardSize.y/2;
        var width = $scope.cardSize.x*4+4;
        return {
            'position' : position,
            'top' : top,
            'width' : width,
            'margin' : '0 auto'
        }
    }
    $scope.getPlayedCardsDivCSS = function(){
        var position = 'absolute';
        var h = angular.element('.bottom-player ul').offset().top -angular.element('.left-player ul').offset().top  - angular.element('.game-body').offset().top + $scope.cardSize.y;
        var w = $scope.gameWindow.x;
        var top = angular.element('.left-player ul').offset().top - angular.element('.game-body').offset().top;
        return {
            'position' : position,
            'top' : top,
            'width' : w,
            'height' : h,
            'padding' : 0,
            'margin' : '0 auto'
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
                'top' : top
            }
        }
    }
    $scope.placeCardOnBoard = function(){
        //check for allowed suit 
        // if($scope.gameState == 'playedCard' && ($scope.gameTurn-2)%3 == 0){
        //     // $scope.checkAllowedSuit();
        // }
        $scope.cardToPLay = $scope.cardPlayed;
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.otherPlayerId){
                $scope.arrPlayers[i].cardPlayed = $scope.cardPlayed;
                var e = $scope.arrPlayers[i].position;
            }
        }
        var initialClass = $scope.getPosition(e);
        var finalClass = $scope.getPlayedPosition(e);
        if(e == 0){
            console.log(45454);
            var top = $scope.gameWindow.y*5/9;
            var left = $scope.gameWindow.x/2 - $scope.cardSize.x/2;
            $timeout(function (){
                angular.element('.played-cards').css('z-index',9);
                $('.moveCard').animate({
                    left : left,
                    top : top
                }, function(){
                    angular.element('.played-cards').css('z-index',0);
                    $('.moveCard').addClass('zeroFinal');
                    // $('.moveCard').css({
                    //             left : '',
                    //             top : ''
                    //         });
                });
            }, 20);
        }
        if(e!= 0){
            $timeout(function (){
                $('.'+initialClass).addClass(finalClass);
                $('.'+finalClass).removeClass(initialClass);
            }, 60);
        }
        if(e!=0){
            $timeout(function (){
                $('.'+finalClass+' .front').addClass('frontRotated');
                $('.'+finalClass+' .back').addClass('backRotated');
                // $('.'+finalClass).removeClass(initialClass);
            }, 200);
        }
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
        if(x == 0){
            var l = angular.element('.game-body').width()/2 - angular.element('.card').width()/2;
            var t = angular.element('.bottom-player ul').offset().top - angular.element('.played-cards').offset().top;
        }else if(x == 120){
            var l = angular.element('.left-player ul').offset().left - angular.element('.game-body').offset().left  + angular.element('.left-player ul').width()/2;
            var t = angular.element('.left-player ul').offset().top - angular.element('.played-cards').offset().top;
        }else if(x == 240){
            var l = angular.element('.right-player ul').offset().left - angular.element('.game-body').offset().left + angular.element('.right-player ul').width()/2;
            var t = angular.element('.right-player ul').offset().top - angular.element('.played-cards').offset().top;
        }
        angular.element('.played-cards-ul li').animate({
                'left' : l,
                'top' : t
            })
        delayService.asyncTask(1200, $scope.refreshCardsPlayed);
        // if(($scope.gameTurn-1)%30 == 0){
        //     delayService.asyncTask(1200, $scope.nextRound);
        // }else{
        //     delayService.asyncTask(1200, $scope.updateStats);
        // }
    }
    $scope.refreshCardsPlayed = function(){
        angular.element('.played-cards-ul li').removeClass('zeroInitial leftInitial rightInitial');
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            $scope.arrPlayers[i].cardPlayed = '';
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
            socket.emit('GAME', {data : data});
        }
    }
    // $scope.nextRound = function(){
    //         var data = {
    //             gameState : 'endRound'
    //         }
    //         GameStateService.play(data).success(function(data){
    //             $scope.players = data['players'];
    //             $scope.gameState = data['gameState'];
    //             $scope.activePlayerId = data['activePlayerId'];
    //             $scope.otherPlayerId = data['otherPlayerId'];
    //             $scope.activePlayerType = data['players'][$scope.activePlayerId]['type'];
    //             $scope.gameTurn = data['game_turn'];
    //             $scope.cardPlayed = '';
    //             $scope.updatePlayerInfo();
    //             $scope.updateCards();
    //             for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
    //                 $scope.arrPlayers[i].cardPlayed = '';
    //             }
    //             if($scope.activePlayerType == 'bot'){
    //                 //computer withdraws card no 1.//hard coded
    //                 var data = {
    //                     gameState : 'setTrump',
    //                 }
    //                 GameStateService.play(data).success(function(data){
    //                     $scope.gameState = data['gameState'];
    //                     $scope.activePlayerId = data['activePlayerId'];
    //                     $scope.otherPlayerId = data['otherPlayerId'];
    //                     $scope.trump = data['trump'];
    //                     $scope.players = data['players'];
    //                     $scope.updateCards();
    //                     $scope.activePlayerType = data['players'][$scope.activePlayerId]['type'];
    //                     if($scope.activePlayerType == 'bot'){
    //                         delayService.asyncTask(20, $scope.playBot);
    //                     }
    //                 });
    //             }
    //         });
    //     }
    $scope.play = function(card, player, $event){
        $scope.cardLeft = angular.element($event.currentTarget.parentElement).offset().left - angular.element('.played-cards').offset().left;
        $rootScope.left = $scope.cardLeft;
        if($scope.gameState == 'WITHDRAW_CARD'){
            if(($scope.activePlayerId == $scope.playerId) && ($scope.otherPlayerId == player)){
                if(card == $scope.cardSelected){
                    var data = {
                        gameState : 'WITHDRAW_CARD',
                        gameEvent : 'WITHDRAW_CARD',
                        card : card,
                    }
                    console.log(data);
                    socket.emit('GAME', {data : data});
                }else{
                    $scope.cardSelected = card;
                }
            }
        }
        if($scope.gameState == 'RETURN_CARD'){
            for (var i = $scope.arrPlayers.length - 1; i >= 0; i--){
                if($scope.arrPlayers[i].id == $scope.activePlayerId){
                    var x = $scope.arrPlayers[i].cards.indexOf(card);
                    if(x > -1){
                        $scope.arrPlayers[i].cards.splice(x, 1);
                        var data = {
                            gameState : 'RETURN_CARD',
                            gameEvent : 'RETURN_CARD',
                            card : x,
                        }
                        socket.emit('GAME', {data : data});
                    }
                }
            }
        }
        if($scope.gameState == 'PLAY_CARD'){
            if($scope.playerId == $scope.activePlayerId){
                var data = {
                    gameState : 'PLAY_CARD',
                    gameEvent : 'PLAY_CARD',
                    cardPlayed : card,
                    activePlayerId : $scope.activePlayerId
                }
                socket.emit('GAME', {data : data});
            }
        }
    }
    $scope.assignActivePlayer = function(){
        $scope.activePlayerId = $scope.temp;
    }
    socket.on('GAME', function (data){
        console.log(data);
        $scope.game325 = data.data;
        var gameEvent = $scope.game325.gameEvent;
        switch(gameEvent){
            case 'SET_TRUMP':
                $scope.game325 = data.data;
                $scope.gameState = data.data.gameState;
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.playerIds = data.data.playerIds;
                $scope.gameState = data.data.gameState;
                $scope.players = data.data.players;
                $scope.gameTurn = data.data.gameTurn; //nv add
                $scope.playerArray = $scope.players;
                $scope.assignPlayers();
                $scope.updateCards();
                break;
            case 'RETURN_CARD':
                console.log(data);
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.gameState = 'RETURN_CARD';
                $scope.gameState = data.data.gameState;
                $scope.cardReturned = data.data.cardPlayed;
                $scope.moveReturnedCard();
                break;
            case 'WITHDRAW_CARD':
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.cardWithdrawn = data.data.cardPlayed;
                $scope.gameState = data.data.gameState;
                $scope.moveWithdrawnCard();
                break;
            case 'RETURN':
                console.log(data);
                $scope.players = data.data.players;
                $scope.playerArray = $scope.players;
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.gameState = 'RETURN_CARD';
                $scope.cardWithdrawn = data.data.cardPlayed;
                $scope.initPlayers();
                $scope.moveWithdrawnCard();
                delayService.asyncTask(100, $scope.updateCards);
                break;
            case 'WITHDRAW':
                $scope.players = data.data.players;
                $scope.playerArray = $scope.players;
                $scope.initPlayers();
                $scope.updateCards();
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.gameState = 'WITHDRAW_CARD';
                break;
            case 'PLAY_CARD':
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.cardsPlayed = data.data.cardsPlayed;
                $scope.gameState = data.data.gameState;
                $scope.players = data.data.players;
                $scope.playerArray = $scope.players;
                $scope.initPlayers();
                $scope.updateCards();
                break;
            case 'CARD_PLAYED':
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.temp = $scope.activePlayerId;
                $scope.cardsPlayed = data.data.cardsPlayed;
                $scope.cardPlayed = data.data.cardPlayed;
                $scope.gameState = data.data.gameState;
                $scope.players = data.data.players;
                $scope.playerArray = $scope.players;
                $scope.initPlayers();
                $scope.updateCards();
                $scope.placeCardOnBoard();
                $scope.activePlayerId = data.data.activePlayerId;
                delayService.asyncTask(300, $scope.assignActivePlayer);
                break;
            case 'DECLARE_WINNER':
                $scope.activePlayerId = data.data.activePlayerId;
                $scope.otherPlayerId = data.data.otherPlayerId;
                $scope.cardsPlayed = data.data.cardsPlayed;
                $scope.cardPlayed = data.data.cardPlayed;
                $scope.gameState = data.data.gameState;
                $scope.players = data.data.players;
                $scope.playerArray = $scope.players;
                $scope.gameTurn = data.data.gameTurn;
                $scope.placeCardOnBoard();
                $scope.initPlayers();
                $scope.updateCards();
                $scope.winnerId = data.data.winnerId;
                delayService.asyncTask(1600, $scope.updateBoard);
                delayService.asyncTask(12, $scope.updateScores);
                break;
        }
    });
    socket.on('DISCONNECTED', function (data){
        $scope.disconnectedPlayerId = data.id;
    });
    socket.on('RECONNECTED', function (data){
        var id = data.id;
        $scope.changePlayerId(id);
    });
    socket.on('CONNECTED_2', function (data){
        $scope.playerId = data.id;
        $scope.gameState = data.data.gameState;
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.playerIds = data.data.playerIds;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.gameTurn = data.data.gameTurn;
        $scope.gameState = data.data.gameState;
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.playerIds = data.data.playerIds;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.gameTurn = data.data.gameTurn;
        $scope.playerArray = $scope.players;
        $scope.initPlayers();
        $scope.assignPlayers();    
        $scope.updateCards();
    });
/*
    socket.on('RETURN', function (data){
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.gameState = 'RETURN_CARD';
        $scope.cardWithdrawn = data.data.cardPlayed;
        $scope.initPlayers();
        $scope.moveWithdrawnCard();
        delayService.asyncTask(100, $scope.updateCards);
    });
    socket.on('WITHDRAW', function (data){
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.initPlayers();
        $scope.updateCards();
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.gameState = 'WITHDRAW_CARD';
    });
    socket.on('PLAY_CARD', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.cardsPlayed = data.data.cardsPlayed;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.initPlayers();
        $scope.updateCards();
    });
    $scope.temp;
    socket.on('CARD_PLAYED', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.temp = $scope.activePlayerId;
        $scope.cardsPlayed = data.data.cardsPlayed;
        $scope.cardPlayed = data.data.cardPlayed;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.initPlayers();
        $scope.updateCards();
        $scope.placeCardOnBoard();
        $scope.activePlayerId = data.data.activePlayerId;
        delayService.asyncTask(300, $scope.assignActivePlayer);
    });
    socket.on('DECLARE_WINNER', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.cardsPlayed = data.data.cardsPlayed;
        $scope.cardPlayed = data.data.cardPlayed;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.gameTurn = data.data.gameTurn;
        $scope.placeCardOnBoard();
        $scope.initPlayers();
        $scope.updateCards();
        $scope.winnerId = data.data.winnerId;
        delayService.asyncTask(1600, $scope.updateBoard);
        delayService.asyncTask(12, $scope.updateScores);
    })
    socket.on('WITHDRAWN_CARD', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.cardWithdrawn = data.data.cardPlayed;
        $scope.gameState = data.data.gameState;
        $scope.moveWithdrawnCard();

    });
    socket.on('RETURN_CARD', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.gameState = 'RETURN_CARD';
        $scope.gameState = data.data.gameState;
        $scope.cardReturned = data.data.cardPlayed;
        $scope.moveReturnedCard();
    });
*/
    socket.on('PlayerLeft', function(data){
        $state.go('home');
    });
    $scope.sendMsg = function(){
        socket.emit('sendMsg', {data : 'LOLMAX'});
    }
    // socket.on('recieveMsg', function(data){
    //     var userId = data.data.userId;
    //     var userPic = data.data.userPic;
    //     var userMsg = data.data.userMsg;
    //     var msg = userPic+''+userId+''+userMsg;
    //     console.log(msg);
    //     console.log(data);
    //     angular.element('.chat-container').append(msg);
    // });
    
    $scope.closeRight = function() {
    $mdSidenav('right').close()
    };

    $scope.toggleRight = function() {
    $mdSidenav('right').toggle();
    };
    $scope.getCardPic = function(card){
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
                'width' : '80',
                'height' : 80*1.418,
                'background-size' : '1200px',
                'background-position' : posx+'px '+posy};
    return x;

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
        var x = {'background-image' : 'url(assets/img/cardpic.jpg)',
                'width' : '80',
                'height' : 80*1.418,
                'background-size' : '1200px',
                'background-position' : posx+'px '+posy};
    return x;

    }
    $scope.getProfilePic = function(playerindex){
        if (typeof $scope.arrPlayers[playerindex] !== 'undefined') {
            var picurl = $scope.arrPlayers[playerindex].img;
            var x = {'background': '#fff url('+picurl+') no-repeat center center',
                    'background-size': 'cover!important'};
            return x;
        }
    }
    $scope.getProfile = function(id){
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == id){
                return {
                        name: $scope.arrPlayers[i].name,
                        img: $scope.arrPlayers[i].img
                    };
            };
        }
    }
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
game325.controller('scoreDialogController',['$scope', '$mdDialog', '$rootScope', function($scope, $mdDialog, $rootScope){
    $scope.closeDialog = function(){
            $mdDialog.hide();
        };
    $scope.arrPlayers = $rootScope.arrPlayers;
    // $scope.getColorClass = function(handsMade,handsToMake){
    //     console.log('here');
    //     if(handsMade == handsToMake){
    //         return 'blue-theme';
    //     }
    //     if(handsMade < handsToMake){
    //         return 'red-theme';
    //     }
    //     if(handsMade > handsToMake){
    //         return 'green-theme';
    //     }
    // }
}])
