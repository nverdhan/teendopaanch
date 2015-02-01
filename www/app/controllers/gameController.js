// angular.directive('chatDiv', ['$compile', function ($compile){
//     var t = function(content){
//         var content = content.content;
//         var x = '<div class="media comment-box"><a class="pull-left comment-body-pic" href="#"><img src="'+content.userPic+'" width="100%" height="100%"/></a>'+
//                 '<div class="media-body" style="display:line-height:0px;"><h6 class="media-heading color-1 comment-body-h">'+
//                 '<a class="comment-user-title" href="user/{{ comment.user.id }}">'+content.userId+'</a><small></small></h6>'+
//                 '<p class="comment-body-p">'+content.body+'</p></div></div>';
//         return x;

//     };
//     var linker = function(scope, element, attrs){
//         element.html(t(scope)).show();
//         $(compile(element.contents()))(scope);
//     }
//     return {
//         restrict : 'E',
//         replace : true,
//         link : linker,
//         scope : {
//             content : '='
//         }
//     }
// }]);
game325.controller('gameController', ['$rootScope', '$http', '$scope', '$state', '$stateParams', 'gameService', 'socket', '$timeout', 'delayService', function ($rootScope, $http, $scope, $state, $stateParams, gameService, socket, $timeout ,delayService){
    $scope.gameId = $stateParams.id;
    $scope.gameType = $stateParams.type;
    socket.removeAllListeners();
    socket.emit('joinRoom', {roomId : $scope.gameId});
    socket.on('message', function(data){
        $scope.playerId = data.id;
        if (data.start == 'closed') {
            socket.emit('startGame', {data : 'start'});
        };
    });
    $scope.waiting = true;
    $scope.ready = false;
    socket.on('status', function(data){
        if(data.status == 'closed'){
            $scope.waiting = false;
            $scope.ready = true;
        };
    });
    $scope.closeScores = function (){
        $scope.showScores = false;
    }
    $scope.getMsgTemplate = function (content){
        console.log(content);
        var x = '<div class="media comment-box"><a class="pull-left comment-body-pic" href="#"><img src="'+content.userPic+'" width="100%" height="100%"/></a>'+
                '<div class="media-body" style="display:line-height:0px;"><h6 class="media-heading color-1 comment-body-h">'+
                '<a class="comment-user-title" href="user/{{ comment.user.id }}">'+content.userId+'</a><small></small></h6>'+
                '<p class="comment-body-p">'+content.body+'</p></div></div>';
        return x;
    }
    socket.on('msgRecieved', function (data) {
        console.log(data);
        $scope.msg = {
            body : data.msg.msg,
            userId : data.player.id,
            userPic : data.player.img
        }
        var e = $scope.getMsgTemplate($scope.msg);
        angular.element('.chat-box').append(e);
    })
    socket.on('start', function (data){
        console.log(data);
        $scope.gameState = data.data.gameState;
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.playerIds = data.data.playerIds;
        $scope.gameState = data.data.gameState;
        $scope.players = data.data.players;
        $scope.gameTurn = data.data.gameTurn;
        $scope.assignPlayers();    
        $scope.updateCards();
    });
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
        };
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
            scores : []
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
        if(n == 0){
            var i = $scope.bottomPlayerCards.length;
        }
        if(n == 1){
            var i = $scope.leftPlayerCards.length;
        }
        if(n == 2){
            var i = $scope.rightPlayerCards.length;
        }
        console.log(i);
        var x = angular.element('.card').width();
        var c = ($scope.gameTurn%3)-1;
        var c = 0.5*(c)*x*0.6;
        var y = x*3/5;
        y = (i)*y + x;
        var w =  y+'px';
        if(n == 0){
            return {
                'width': w,
            }    
        }else if(n == 1){
            return {
                'width': w,
                'left' : c+'px'
           }
        }else{
            return {
                'width': w,
                'right' : c+'px'
            }
        }
        
    }
    $scope.getCardWidth = function (){
        var w = angular.element('.card').width();
        return w+'px';
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
    $scope.bottomPlayerWidth;
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
    }
    $scope.updateCards = function(){
        for (var i = 0; i < $scope.playerIds.length; i++) {
            $scope.arrPlayers[i].cards = $scope.players[$scope.playerIds[i]]['cards'];
        }
        $scope.bottomPlayerCards = [];
        // $scope.bottomPlayerCards = $scope.arrPlayers[0].cards;
        $scope.bottomPlayerDeck  = $scope.arrPlayers[0].cards;

        $scope.leftPlayerId = $scope.arrPlayers[1].id;
        // $scope.leftPlayerCards = $scope.arrPlayers[1].cards;
        $scope.leftPlayerCards = [];
        $scope.leftPlayerDeck = $scope.arrPlayers[1].cards;
        $scope.rightPlayerId = $scope.arrPlayers[2].id;
        // $scope.rightPlayerCards = $scope.arrPlayers[2].cards;
        $scope.rightPlayerCards = [];
        $scope.rightPlayerDeck = $scope.arrPlayers[2].cards;
        $scope.distributeCards();
    }
    $scope.distributeBottomPlayer = function(){
        var a = $scope.bottomPlayerDeck.pop();
        $scope.bottomPlayerCards.push(a);
    }
    $scope.distributeLeftPlayer = function(){
        var a = $scope.leftPlayerDeck.pop();
        $scope.leftPlayerCards.push(a);
    }
    $scope.distributeRightPlayer = function(){
        var a = $scope.rightPlayerDeck.pop();
        $scope.rightPlayerCards.push(a);
    }
    $scope.distributeCards = function(){
        var m = 0;
        var n = 0;
        var o = 0;
        for (var i = 1; i <= 15; i++){
            if(i%3 == 0){
                var x = function(){
                    n++;
                    var topY = $('.bottom-player').offset().top;
                    var leftX = $('.bottom-player').offset().left;
                    $('.bottomPlayerDeck:nth-child('+n+')').animate({
                        'left' : leftX+'px',
                        'top' : topY+'px'
                    }, $scope.distributeBottomPlayer());
                }
                delayService.asyncTask(i*50, x);
            }
            if((i%3)-1 == 0){
                var x = function(){
                    m++;
                    var topY = $('.left-player').offset().top;
                    var leftX = $('.left-player').offset().left;
                    $('.leftPlayerDeck:nth-child('+m+')').animate({
                        'left' : leftX+'px',
                        'top' : topY+'px'
                    }, $scope.distributeLeftPlayer());
                }
                delayService.asyncTask(i*50, x);
            }
            if((i%3)-2 == 0){
                var x = function(){
                    o++;
                    var topY = $('.right-player').offset().top;
                    var leftX = $('.right-player').offset().left;
                    $('.rightPlayerDeck:nth-child('+o+')').animate({
                        'left' : leftX+'px',
                        'top' : topY+'px'
                    }, $scope.distributeRightPlayer());
                }
                delayService.asyncTask(i*50, x);
            }
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
        // if($scope.players[$scope.activePlayerId].type == 'bot'){
        //     delayService.asyncTask(2000, $scope.playBot);
        // }
        // socket.emit('')

    }
    $scope.moveReturnedCard = function(){
        for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
            if($scope.arrPlayers[i].id == $scope.activePlayerId){
                $scope.arrPlayers[i].cards.pop();
                var initialClass = $scope.getInitialPosition($scope.arrPlayers[i].position);    
            }
        };
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
        // if($scope.players[$scope.activePlayerId].type == 'bot'){
        //     delayService.asyncTask(2000, $scope.playBot);
        // }
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
    $scope.toggleScores = function(){
        if($scope.showScores == false){
            $scope.showScores = true;
        }else{
            $scope.showScores = false;
        }
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
    
    //NV
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
    // $scope.deckBottom;
    // $scope.deckLeft;
    // $scope.deckRight;
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
            $timeout(function (){
                var a = $rootScope.left;
                var b = '16em';
                var c = '15em';
                $('.moveCard').css({
                    left : a,
                    top : '28em'
                });
                 $('.moveCard').animate({
                        left : '22em',
                        top : b
                    }, function(){
                        $('.moveCard').css({
                            left : '',
                            top : ''
                        });
                        $('.moveCard').addClass('zeroFinal');
                    });
             }, 60);
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
            }, 300);
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
            console.log($scope.arrPlayers[i]);
        }
        var data;
        if ($scope.gameState == 'nextRound') {
            socket.emit('nextRound', {data : data})
        };
        if($scope.gameTurn%30 == 1){
            var data = 123;
            if($scope.activePlayerId == $scope.playerId){
                socket.emit('nextRound', {data : data});    
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
            angular.element('.played-cards-ul li').addClass('zeroInitial').removeClass('zeroFinal rightFinal leftFinal');
        }else if(x == 120){
            angular.element('.played-cards-ul li').addClass('leftInitial').removeClass('zeroFinal rightFinal leftFinal');
        }else if(x == 240){
            angular.element('.played-cards-ul li').addClass('rightInitial').removeClass('zeroFinal rightFinal leftFinal');
        }
        delayService.asyncTask(1600, $scope.refreshCardsPlayed);
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
        console.log($scope.arrPlayers);
        // $compile($scope.arrPlayers);
        $scope.activePlayerId = $scope.winnerId;
    }
    $scope.setTrumpCard = function(trump){
        console.log($scope.activePlayerId);
        if($scope.playerId == $scope.activePlayerId){
            var data = {
                gameState : 'setTrump',
                trump : trump,
                activePlayerId : $scope.activePlayerId
            }
            console.log(data);
            socket.emit('setTrump', {data : data});
            // GameStateService.play(data).success(function(data){
            //     $scope.gameState = data['gameState'];
            //     $scope.activePlayerId = data['activePlayerId'];
            //     $scope.otherPlayerId = data['otherPlayerId'];
            //     $scope.trump = data['trump'];
            //     $scope.players = data['players'];
            //     $scope.updateCards();
            // });
        }
    }
    $scope.nextRound = function(){
            var data = {
                gameState : 'endRound'
            }
            GameStateService.play(data).success(function(data){
                $scope.players = data['players'];
                $scope.gameState = data['gameState'];
                $scope.activePlayerId = data['activePlayerId'];
                $scope.otherPlayerId = data['otherPlayerId'];
                $scope.activePlayerType = data['players'][$scope.activePlayerId]['type'];
                $scope.gameTurn = data['game_turn'];
                $scope.cardPlayed = '';
                $scope.updatePlayerInfo();
                $scope.updateCards();
                for (var i = $scope.arrPlayers.length - 1; i >= 0; i--) {
                    $scope.arrPlayers[i].cardPlayed = '';
                }
                if($scope.activePlayerType == 'bot'){
                    //computer withdraws card no 1.//hard coded
                    var data = {
                        gameState : 'setTrump',
                    }
                    GameStateService.play(data).success(function(data){
                        $scope.gameState = data['gameState'];
                        $scope.activePlayerId = data['activePlayerId'];
                        $scope.otherPlayerId = data['otherPlayerId'];
                        $scope.trump = data['trump'];
                        $scope.players = data['players'];
                        $scope.updateCards();
                        $scope.activePlayerType = data['players'][$scope.activePlayerId]['type'];
                        if($scope.activePlayerType == 'bot'){
                            delayService.asyncTask(20, $scope.playBot);
                        }
                    });
                }
            });
        }
    $scope.play = function(card, player, $event){
        $scope.cardLeft = angular.element($event.currentTarget.parentElement).css('left');
        console.log($scope.cardLeft);
        var q = $scope.cardLeft;
        var c = q.split('px');
        var x = $('.game-body').width();
        var y = $('.bottom-player').width();
        var z = (x-y)/2;
        $rootScope.left = (parseInt(z)+parseInt(c[0]))+'px';
        if($scope.gameState == 'withdrawCard'){
            if(($scope.activePlayerId == $scope.playerId) && ($scope.otherPlayerId == player)){
                if(card == $scope.cardSelected){
                    console.log(card);
                    var data = {
                        gameState : 'withdrawCard',
                        cardWithdrawn : card,
                    }
                    // GameStateService.play(data).success(function(data){
                    //     $scope.activePlayerId = data['activePlayerId'];
                    //     $scope.otherPlayerId = data['otherPlayerId'];
                    //     $scope.players = data['players'];
                    //     $scope.gameState = data['gameState'];
                    //     $scope.cardWithdrawn = data['cardWithdrawn'];
                    //     $scope.moveWithdrawnCard();
                    // });
                    socket.emit('withdrawCard', {data : data});
                }else{
                    $scope.cardSelected = card;
                }
            }
        }
        if($scope.gameState == 'returnCard'){
            for (var i = $scope.arrPlayers.length - 1; i >= 0; i--){
                if($scope.arrPlayers[i].id == $scope.activePlayerId){
                    var x = $scope.arrPlayers[i].cards.indexOf(card);
                    if(x > -1){
                        $scope.arrPlayers[i].cards.splice(x, 1);
                        var data = {
                            gameState : 'returnCard',
                            cardReturned : x,
                        }
                        // GameStateService.play(data).success(function(data){
                        //     $scope.activePlayerId = data['activePlayerId'];
                        //     $scope.otherPlayerId = data['otherPlayerId'];
                        //     $scope.players = data['players'];
                        //     $scope.gameState = data['gameState'];
                        //     $scope.cardReturned = data['cardReturned'];
                        //     $scope.moveReturnedCard();
                        // });
                        socket.emit('returnCard', {data : data});
                    }
                }
            };
        }
        if($scope.gameState == 'setTrump'){
            return;
        }
        if($scope.gameState == 'playCard'){
            if($scope.playerId == $scope.activePlayerId){
                var data = {
                    gameState : 'playCard',
                    cardPlayed : card,
                    activePlayerId : $scope.activePlayerId
                }
                // GameStateService.play(data).success(function(data){
                //     $scope.gameState = data['gameState'];
                //     $scope.players = data['players'];
                //     $scope.cardsPlayed = data['cardsPlayed'];
                //     $scope.activePlayerId = data['activePlayerId'];
                //     $scope.nextPlayerType = data['players'][$scope.activePlayerId]['type'];
                //     $scope.gameTurn = data['game_turn'];
                //     $scope.placeCardOnBoard();
                //     $scope.updateCards();
                // });
                socket.emit('playCard', {data : data});
            }     
        }
    }
    socket.on('return', function (data){
        console.log(data);
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.gameState = 'returnCard';
        $scope.cardWithdrawn = data.data.cardPlayed;
        $scope.initPlayers();
        $scope.moveWithdrawnCard();
        delayService.asyncTask(100, $scope.updateCards);
    });
    socket.on('withdraw', function (data){
        $scope.players = data.data.players;
        $scope.playerArray = $scope.players;
        $scope.initPlayers();
        $scope.updateCards();
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.gameState = 'withdrawCard';
    });
    socket.on('playCard', function(data){
        console.log(data);
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
    socket.on('cardPlayed', function(data){
        console.log(data);
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
    
    $scope.assignActivePlayer = function(){
        console.log($scope.temp);
        console.log($scope.activePlayerId);
        $scope.activePlayerId = $scope.temp;
        console.log($scope.activePlayerId);
    }
    socket.on('declareWinner', function(data){
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
    socket.on('withdrawnCard', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.cardWithdrawn = data.data.cardPlayed;
        $scope.gameState = data.data.gameState;
        $scope.moveWithdrawnCard();

    });
    socket.on('returnCard', function(data){
        $scope.activePlayerId = data.data.activePlayerId;
        $scope.otherPlayerId = data.data.otherPlayerId;
        $scope.gameState = 'returnCard';
        $scope.gameState = data.data.gameState;
        $scope.cardReturned = data.data.cardPlayed;
        $scope.moveReturnedCard();
    });
    socket.on('PlayerLeft', function(data){
        $state.go('home');
    });
    socket.on('id', function(data){
        console.log(data.id);
    })
//    socket.on('gameData', function(data){
//        var gameData = data.gameData;
//        console.log(gameData);
//    })
    $scope.sendMsg = function(){
        socket.emit('sendMsg', {data : 'LOLMAX'});
    }
    socket.on('recieveMsg', function(data){
        var userId = data.data.userId;
        var userPic = data.data.userPic;
        var userMsg = data.data.userMsg;
        var msg = userPic+''+userId+''+userMsg;
        angular.element('.chat-container').append(msg);
    });
    
}]);

