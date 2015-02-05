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
game325.controller('gameController', ['$rootScope', '$http', '$scope', '$state', '$stateParams','authService', 'gameService', 'socket', '$timeout', 'delayService', '$mdSidenav', '$anchorScroll', '$location', '$mdDialog', function ($rootScope, $http, $scope, $state, $stateParams, authService, gameService, socket, $timeout ,delayService, $mdSidenav, $anchorScroll, $location, $mdDialog){
    $scope.gameId = $stateParams.id;
    $scope.gameType = $stateParams.type;
    socket.removeAllListeners();
    //check auth
    //authService.get().then(function (data) {
    //    if(data.data.error){
    //        console.log(123);
    //    }else{
    //        socket.emit('joinRoom', {roomId : $scope.gameId});        
    //    }
    //});
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
        // var x = '<div class="media comment-box"><a class="pull-left comment-body-pic" href="#"><img src="'+content.userPic+'" width="100%" height="100%"/></a>'+
        //         '<div class="media-body" style="display:line-height:0px;"><h6 class="media-heading color-1 comment-body-h">'+
        //         '<a class="comment-user-title" href="user/{{ comment.user.id }}">'+content.userId+'</a><small></small></h6>'+
        //         '<p class="comment-body-p">'+content.body+'</p></div></div>';
        var x ='<md-item>'+
                    '<md-item-content>'+
                      '<div class="md-tile-left">'+
                        '<img ng-src="'+content.userPic +'" class="face" >'+
                      '</div>'+
                      '<div class="md-tile-content">'+
                        '<h4>' + content.userId +'</h4>'+
                        '<p>'+
                          content.body+
                        '</p>'+
                      '</div>'+
                    '</md-item-content>'+
                  '  <md-divider inset></md-divider>'+
                  '</md-item>';             
        return x;
    }
    socket.on('msgRecieved', function (data) {
        $scope.msg = {
            body : data.msg.msg,
            userId : data.player.id,
            userPic : data.player.img
        }
        var e = $scope.getMsgTemplate($scope.msg);
        angular.element('.chat-box').append(e);
        $location.hash('bottomscroll');
        $anchorScroll();
        $location.hash('');
    })
    socket.on('start', function (data){
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
    $scope.bottomPlayerCards = [];
    $scope.leftPlayerCards = [];
    $scope.rightPlayerCards = [];
    $scope.gameWindow = {x : 800, y : 600};//px
    $scope.cardSize = {x: 72, y : 90};//px
    $scope.cardLeftMargin = 20;
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
        $rootScope.arrPlayers = $scope.arrPlayers;
    }
    $scope.updateCards = function(){
        for (var i = 0; i < $scope.playerIds.length; i++){
            $scope.arrPlayers[i].cards = $scope.players[$scope.playerIds[i]]['cards'];
        }
        var x = $scope.arrPlayers[0].cards.length + $scope.arrPlayers[1].cards.length + $scope.arrPlayers[2].cards.length;
        if(x == 15 || x == 30){
            $scope.distributeCardsFlag = true;
        }else{
            $scope.distributeCardsFlag = false;
        }
        if($scope.gameTurn%30 == 1 && $scope.distributeCardsFlag){
            $scope.leftPlayerDeck = [];
            $scope.bottomPlayerDeck = [];
            $scope.rightPlayerDeck = [];
            for (var i = 0; i < 5; i++) {
                var b = $scope.arrPlayers[0].cards[i];
                $scope.bottomPlayerDeck.push(b);
                var l = $scope.arrPlayers[1].cards[i];
                $scope.leftPlayerDeck.push(l);
                var r = $scope.arrPlayers[2].cards[i];
                $scope.rightPlayerDeck.push(r);
            };
        }
        $scope.leftPlayerId = $scope.arrPlayers[1].id;
        $scope.rightPlayerId = $scope.arrPlayers[2].id;
        if($scope.distributeCardsFlag){
            $scope.distributeCards();
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
    $scope.distributeCards = function(){
        var m = 0;
        var n = 0;
        var o = 0;
        for (var i = 1; i <= 15; i++){
            if(i%3 == 0){
                var x = function(){
                    n++;
                    var topY = angular.element('.bottom-player ul').offset().top - angular.element('.bottom-player ul').offset().top;
                    var leftX = $('.bottom-player ul').offset().left - angular.element('.game-body').offset().left;
                    leftX = leftX+(n-1)*$scope.cardLeftMargin;
                    angular.element('.bottomPlayerDeck:nth-child('+n+')').css({
                        'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
                    });
                    angular.element('.bottomPlayerDeck:nth-child('+n+') .front').addClass('frontRotated');
                    angular.element('.bottomPlayerDeck:nth-child('+n+') .back').addClass('backRotated');
                }
                delayService.asyncTask(200, x);
            }
            if((i%3)-1 == 0){
                var x = function(){
                    m++;
                    var topY = angular.element('.left-player ul').offset().top  - angular.element('.bottom-player ul').offset().top;
                    var leftX = angular.element('.left-player ul').offset().left - angular.element('.game-body').offset().left;
                    leftX = leftX+(m-1)*$scope.cardLeftMargin;
                    angular.element('.leftPlayerDeck:nth-child('+m+')').css({
                        'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
                    });
                }
                delayService.asyncTask(200, x);
            }
            if((i%3)-2 == 0){
                var x = function(){
                    o++;
                    var topY = angular.element('.right-player ul').offset().top  - angular.element('.bottom-player ul').offset().top;
                    var leftX = angular.element('.right-player ul').offset().left - angular.element('.game-body').offset().left;
                    leftX = leftX+(o-1)*$scope.cardLeftMargin;
                    angular.element('.rightPlayerDeck:nth-child('+o+')').css({
                        'transform' : 'translateX('+leftX+'px) translateY('+topY+'px)'
                    });
                }
                delayService.asyncTask(200, x);
            }
        }
        var fn = function(){
            $scope.distributeBottomPlayer();
            $scope.distributeRightPlayer();
            $scope.distributeLeftPlayer();
        }
        delayService.asyncTask(100, fn);
        
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
        // console.log($scope.arrPlayers);
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
    $scope.getCardInitialStyle = function(e){
        if(e==0){
            var c = $rootScope.left;
            console.log(c);
            var top = 0;
            return {
                'left' : c+'px',
                'top' : top+'px'
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
            var top = $scope.gameWindow.y*2/3;
            var left = $scope.gameWindow.x/2 - $scope.cardSize/2;
            // $timeout(function (){
            //     $('.moveCard').animate({
            //         left : '22em',
            //         top : b
            //     }, function(){
            //         $('.moveCard').addClass('zeroFinal');
            //         $('.moveCard').css({
            //                     left : '',
            //                     top : ''
            //                 });
            //     });
            // }, 10);
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
        // $compile($scope.arrPlayers);
        $scope.activePlayerId = $scope.winnerId;
    }
    $scope.setTrumpCard = function(trump){
        if($scope.playerId == $scope.activePlayerId){
            var data = {
                gameState : 'setTrump',
                trump : trump,
                activePlayerId : $scope.activePlayerId
            }
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
        $scope.cardLeft = angular.element($event.currentTarget.parentElement).offset().left - angular.element('.game-body').offset().left;
        $rootScope.left = $scope.cardLeft;
        if($scope.gameState == 'withdrawCard'){
            if(($scope.activePlayerId == $scope.playerId) && ($scope.otherPlayerId == player)){
                if(card == $scope.cardSelected){
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
        $scope.activePlayerId = $scope.temp;
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
    
    $scope.closeRight = function() {
    $mdSidenav('right').close()
    };

    $scope.toggleRight = function() {
    $mdSidenav('right').toggle();
    };
    $scope.getProfilePic = function(playerindex){
        if (typeof $scope.arrPlayers[playerindex] !== 'undefined') {
            // var picurl = $scope.arrPlayers[playerindex].img;
            var x = {'background': '#fff url(../../assets/img/ankit.jpg) no-repeat center center',
                    'background-size': 'cover!important'};
            return x;
        }
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
}])
