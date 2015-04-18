var Game325Component = React.createClass({displayName: "Game325Component",
    componentWillMount : function(){
        this.type = this.props.type;
        this.playerId = this.props.playerId;
        this.game = this.props.game;
        if(this.type == 'LIVE'){
            this.arrangePlayers(this.props.game);    
        }
        console.log(this.props.game);
        // this.arrangePlayers(this.props.game);
        this.players = this.props.game.players;
        this.playerIds = [];
        for (var i =  0; i < this.players.length; i++){
            this.playerIds.push(this.players[i].id); 
        };
        this.playedCards = this.props.game.playedCards;
        this.next(this.props.game);
    },
    componentWillReceiveProps : function(nextProps){
        this.game = nextProps.game;
        this.props.game = nextProps.game;
        this.playerId = this.props.playerId;
        this.game.lastPlayerId = nextProps.game.otherPlayerId;
        this.arrangePlayers(this.props.game);
        this.players = this.props.game.players;
        this.props.game.returnCard = false;
        this.playerIds = [];
        for (var i =  0; i < this.players.length; i++){
            this.playerIds.push(this.players[i].id); 
        };
        if(this.game.gameEvent == 'WITHDRAW'){
            this.props.game.returnCard = true;
        }
        this.next(this.props.game);
    },
    arrangePlayers : function(){
        var myPlayerObj;
        for (var i = this.game.players.length - 1; i >= 0; i--) {
            if(this.game.players[i].id == this.playerId){
                myPlayerObj = this.game.players[i];
            }
        };
        while(this.game.players.indexOf(myPlayerObj) !== 0){
            var s = this.game.players.pop();
            this.game.players.unshift(s);
        }
    },
    getPlayerIndexFromId : function(id){
        for (var i = this.props.game.players.length - 1; i >= 0; i--) {
            if(this.props.game.players[i].id == id){
                return i;
            }
        }
    },
    setTrump : function(trump){
        var index = this.getPlayerIndexFromId(this.props.game.activePlayerId);
        if(this.playerId == this.props.game.activePlayerId || this.props.game.players[index].type == 'bot'){
            var data = {
                gameState : 'SET_TRUMP',
                gameEvent : 'SET_TRUMP',
                trump : trump,
                activePlayerId : this.props.game.activePlayerId
            }
            // this.gameEvent(data);
            this.clickHandler(data);
        }
    },
    playCard : function(){
        //play card and place card on board
    },
    clickHandler : function(data){
        this.props.scope.gameEvent(data);
    },
    getInitialState : function(){
        return ({
            leftPlayerDeck : null,
            rightPlayerDeck : null,
            bottomPlayerPlayerCard : null,
            leftPlayerPlayerCard : null,
            rightPlayerPlayerCard : null,
            trumpCard : null
        })
    },
    /*gameEvent : function(data){
        var gameEvent = data.gameEvent;
        this.props.game.returnCard = false;
        var game = {
            props : this.props.game,
            data : data
        }
        if(this.type == 'BOTS'){
            localStorage.setItem('gameData', JSON.stringify(game));    
        }
        switch(gameEvent){
            case "START_GAME":
                Game.prototype.initDeck.call(this.props.game);
                Game.prototype.distributeCards.call(this.props.game);
                Game.prototype.updateHandsToMake.call(this.props.game);
                this.props.game.gameTurn = 1;
                this.props.game.gameState  ='SET_TRUMP';
                this.props.game.gameEvent  ='SET_TRUMP';
                Game.prototype.assignPlayerIds.call(this.props.game);
                break;
            case "NEXT_ROUND":
                Game.prototype.initDeck.call(this.props.game);
                Game.prototype.distributeCards.call(this.props.game);
                Game.prototype.nextRound.call(this.props.game);
                this.props.game.gameState  ='SET_TRUMP';
                this.props.game.gameEvent  ='SET_TRUMP';
                break;
            case "SET_TRUMP":
                this.props.game.trump = data.trump;
                Game.prototype.distributeCards.call(this.props.game);
                this.props.game.gameState  ='PLAY_CARD';
                this.props.game.gameEvent  ='PLAY_CARD';
                var y = Game.prototype.withdrawCards.call(this.props.game);
                if(y){
                    this.props.game.gameState  ='WITHDRAW_CARD';
                    this.props.game.gameEvent  ='WITHDRAW';
                }
                break;
            case "WITHDRAW_CARD":
                this.props.game.cardIndex = data.card;
                Game.prototype.moveWithdrawCard.call(this.props.game);
                //Game.prototype.withdrawCard.call(this.props.game);
                this.props.game.gameState  = 'RETURN_CARD';
                this.props.game.gameEvent ='RETURN';
                break;
            case "RETURN_CARD":
                this.props.game.cardIndex = data.card;
                Game.prototype.moveReturnCard.call(this.props.game);
                this.props.game.returnCard = true;
                var self = this;
                var y = Game.prototype.withdrawCards.call(this.props.game);
                if(y){
                    this.props.game.gameState  = 'WITHDRAW_CARD';
                    this.props.game.gameEvent = 'WITHDRAW';
                    var x = JSON.stringify(this.props.game);
                }
                else{
                    this.props.game.gameState  ='PLAY_CARD';
                    this.props.game.gameEvent = 'PLAY_CARD';
                }
                break;
            case "PLAY_CARD":
                this.props.game.cardPlayed = data.cardPlayed;
                Game.prototype.playCard.call(this.props.game);
                if((this.props.game.gameTurn % 3) == 1){
                    this.props.game.turnSuit = this.props.game.cardPlayed.suit;
                }
                if((this.props.game.gameTurn % 3) == 0){
                    Game.prototype.nextTurn.call(this.props.game);
                    Game.prototype.getTurnWinner.call(this.props.game);
                    this.props.game.gameState  ='PLAY_CARD';
                    this.props.game.gameEvent  = 'DECLARE_WINNER';
                }else{
                    Game.prototype.nextTurn.call(this.props.game);
                    this.props.game.gameState  ='PLAY_CARD';
                    this.props.game.gameEvent  = 'CARD_PLAYED';
                }
                break;
            default:
                break;
            }
            var self = this;
            var fn = function () {
                self.next(self.props.game);
            }
            delayService.asyncTask(200, fn);
    },*/
    playCard : function(){
        var activePlayerId = this.props.game.activePlayerId;
        var lastPlayerId = this.props.game.lastPlayerId;
        var lastPlayerPosition = this.getPlayerIndexFromId(lastPlayerId);
        for (var i = this.props.game.players.length - 1; i >= 0; i--) {
            for (var j = this.props.game.players[i].cards.length - 1; j >= 0; j--) {
                if(this.props.game.players[i].cards[j].suit == this.props.game.cardPlayed.suit && this.props.game.players[i].cards[j].rank == this.props.game.cardPlayed.rank){
                    this.props.game.playedCards[lastPlayerPosition] = this.props.game.players[i].cards[j];
                    this.props.game.players[i].cards[j].state = 'played';
                }
            }
        }
    },
    next : function (data){
        var gameEvent = data.gameEvent;
        switch(gameEvent){
            case 'PLAY_CARD':
                if(this.props.game.returnCard){
                    this.returnCard();
                }
                break;
            case 'CARD_PLAYED':
                this.playCard();
                this.placeCardOnBoard();
                break;
            case 'DECLARE_WINNER':
                this.playCard();
                this.placeCardOnBoard();
                this.updateCards();
                this.moveHand();
                break;
            case 'SET_TRUMP':
                break;
            case 'WITHDRAW':
                if(this.props.game.returnCard){
                    this.returnCard();
                }
                break;
            case 'RETURN':
                this.withdrawCard();
                break;
            default:
                null;
                break;
        }
        var self = this;
        var fn  = function(){
            self.setState({
                gameState : gameEvent
            }); 

        }
        delayService.asyncTask(200, fn);
        if(this.type == 'BOTS' && gameEvent != 'DECLARE_WINNER'){
            this.checkBotPlay();
        }
    },
    updateCards : function(){
        var self = this;
        var fn = function(){
            self.players =  self.props.game.players;
        }
        delayService.asyncTask(600, fn);
    },
    withdrawCard : function (){
        var self = this;
        var fn = function (){
            console.log('withdrawn')
            Game.prototype.withdrawCard.call(self.props.game);
            self.setState({
                gameState : 'withdrawMoved'
            })
        }
        delayService.asyncTask(1200, fn);
    },
    returnCard : function() {
        var self = this;
        console.log('returned')
        var fn = function (){
            Game.prototype.returnCard.call(self.props.game);
            self.setState({
                gameState : 'returnMoved'
            })
        }
        delayService.asyncTask(1200, fn);
    },
    placeCardOnBoard : function(){
        var self = this;
        var fn = function () {
            var playerIndex = self.getPlayerIndexFromId(self.props.game.otherPlayerId);
            self.playedCards[playerIndex].display = 'block';
            self.playedCards[playerIndex].suit = self.props.game.cardPlayed.suit;
            self.playedCards[playerIndex].rank = self.props.game.cardPlayed.rank;
            for (var i = self.props.game.players.length - 1; i >= 0; i--) {
                    for (var j = self.props.game.players[i].cards.length - 1; j >= 0; j--) {
                        if(self.props.game.players[i].cards[j].suit == self.props.game.cardPlayed.suit && self.props.game.players[i].cards[j].rank == self.props.game.cardPlayed.rank){
                            var index = j;
                            var id = i;
                        }
                    };
                };
                var card = self.props.game.players[id].cards.splice(index, 1);
                self.setState({
                    gameState : 'CARD_PLACED_ON_BOARD'
                });
            }
            delayService.asyncTask(1200, fn);
    },
    moveHand : function (){
        var self = this;
        var fn = function (){
            var winnerId = self.props.game.winnerId;
            var winnerPos = self.getPlayerIndexFromId(winnerId);
            for (var i = self.props.game.players.length - 1; i >= 0; i--){
                self.playedCards[i].moveTo = winnerPos;
            }
            self.setState({
                gameState : 'HAND_MOVED'
            });
        }
        delayService.asyncTask(2000, fn);
        delayService.asyncTask(2000, this.refreshPlayedCards);
        delayService.asyncTask(1600, this.updateScores);

    },
    refreshPlayedCards : function () {
        var self = this;
        var fn = function () {
            for (var i = self.props.game.players.length - 1; i >= 0; i--){
                self.playedCards[i].suit = '';
                self.playedCards[i].rank = '';
                self.playedCards[i].display = 'none';
                delete self.playedCards[i].moveTo;
            }
            self.setState({
                gameState : 'REFRESH_PLAYED_CARDS'
            });
            // self.updateScores();
        }
        delayService.asyncTask(1200, fn);
    },
    updateScores : function (){
        if(this.props.game.gameTurn%30 == 1 && (this.playerId == this.props.game.activePlayerId)){
                    var data = {
                        gameEvent : 'NEXT_ROUND'
                    }
                    this.clickHandler(data);
        }else{
            if(this.type == 'BOTS'){
               delayService.asyncTask(2000, this.checkBotPlay); 
            }    
        }
        this.props.scope.updateScores(this.players);
        
    },
    checkBotPlay : function (){
        var self = this;
        if(this.type == 'BOTS' && this.props.game.players[this.props.game.activePlayerId].type == 'bot'){
            var fn = function(){
                self.playBot();
            }
            var fn = delayService.asyncTask(2000, fn);
        }
    },
    playBot : function(){
        switch(this.props.game.gameState){
            case 'PLAY_CARD':
                var e = this.props.game.activePlayerId;
                var trump = this.props.game.trump;
                var turnSuit = this.props.game.turnSuit;
                var deck = this.props.game.players[e].cards;
                var playableCards = Array();
                var trumpCards = Array();
                for (var i = 0; i < deck.length; i++){
                    if(deck[i].suit == turnSuit){
                        var a = deck[i];
                        playableCards.push(a);
                    }
                    if(deck[i].suit == trump){
                        var a = deck[i];
                        trumpCards.push(a);
                    }
                }
                if(playableCards.length > 0){
                    var card = playableCards[0];
                }else if(trumpCards.length > 0){
                    var card =  trumpCards[0];
                }else{
                    var card = this.getSmallestCard(deck);
                }
                this.cardPlayed(card, this.props.game.activePlayerId);
                break;
            case 'SET_TRUMP':
                var trumps = ['S', 'H', 'C', 'D'];
                var trump = trumps[Math.floor(Math.random()*trumps.length)];
                var self = this;
                var fn = function () {
                    self.setTrump(trump);
                }
                delayService.asyncTask(1000, fn);
                break;
            case 'WITHDRAW_CARD':
                var cardIndex = Math.floor(Math.random()*10);
                var self = this;
                var data = {
                        gameState : 'WITHDRAW_CARD',
                        gameEvent : 'WITHDRAW_CARD',
                        card : cardIndex,
                    }
                var fn = function () {
                    self.clickHandler(data);
                }
                delayService.asyncTask(2000, fn);
                    // socket.emit('GAME', {data : data});
                break;
            case 'RETURN_CARD':
                var cardIndex = Math.floor(Math.random()*11);
                var self = this;
                var data = {
                        gameState : 'RETURN_CARD',
                        gameEvent : 'RETURN_CARD',
                        card : cardIndex,
                    }
                var fn = function () {
                    self.clickHandler(data);
                }
                delayService.asyncTask(2000, fn);
                break;
            default: 
                break;
        }   
    },
    getSmallestCard : function (deck){
        return deck[0];
    },
    cardPlayed : function (card, player){
        var sendEvent = false;
        this.props.game.lastPlayerId = this.props.game.activePlayerId;
        var activePlayer = this.props.game.activePlayerId;
        var activePlayerIndex = this.getPlayerIndexFromId(activePlayer);
        var playerPosition = this.getPlayerIndexFromId(player);
        if((this.props.game.players[activePlayerIndex].type == 'bot' || this.playerId == this.props.game.activePlayerId) && this.props.game.gameState == 'PLAY_CARD'){
            var data = {
                gameState : 'PLAY_CARD',
                gameEvent : 'PLAY_CARD',
                cardPlayed : card,
                activePlayerId : this.props.game.activePlayerId
            }
            sendEvent = true;
        }
        if((this.props.game.players[activePlayerIndex].type == 'bot' || this.playerId == this.props.game.activePlayerId) && this.props.game.gameState == 'WITHDRAW_CARD' && player == this.props.game.otherPlayerId){
            for (var i = this.players[playerPosition].cards.length - 1; i >= 0; i--){
                if(this.players[playerPosition].cards[i].suit == card.suit && this.players[playerPosition].cards[i].rank == card.rank){
                    cardIndex = i;
                }
            }
            console.log(this.props.game.gameState);
            console.log(this.props.game.players[activePlayerIndex].type);
            var data = {
                        gameState : 'WITHDRAW_CARD',
                        gameEvent : 'WITHDRAW_CARD',
                        card : cardIndex,
                    }
            sendEvent = true;
        }
        if((this.props.game.players[activePlayerIndex].type == 'bot' || this.playerId == this.props.game.activePlayerId) && this.props.game.gameState == 'RETURN_CARD'){
            console.log(this.props.game.players[activePlayerIndex].type);
            console.log(this.props.game.gameState);
            for (var i = this.players[activePlayerIndex].cards.length - 1; i >= 0; i--){
                if(this.players[activePlayerIndex].cards[i].suit == card.suit && this.players[activePlayerIndex].cards[i].rank == card.rank){
                    cardIndex = i;
                }
            };
            var data = {
                        gameState : 'RETURN_CARD',
                        gameEvent : 'RETURN_CARD',
                        card : cardIndex,
                    }
            sendEvent = true;

        }
        if(sendEvent){
            this.clickHandler(data);            
        }
    },
    render : function(){
        var gameBodyStyle = scaleGameBody();
        return (
            React.createElement("div", {id: "war_game_component", style: gameBodyStyle, className: "game-body"}, 
            React.createElement(TrumpComponent, {trump: this.props.game.trump, setTrump: this.setTrump, gameState: this.props.game.gameState}), 
            React.createElement(PlayedCardsComponent, {playedCards: this.playedCards}), 
            React.createElement(GameStateInfo, {gameState: this.props.game.gameState, players: this.props.game.players, activePlayerId: this.props.game.activePlayerId, otherPlayerId: this.props.game.otherPlayerId, lastPlayerId: this.props.game.lastPlayerId}), 
            React.createElement(PlayerComponent, {player: this.props.game.players[0], playerIds: this.playerIds, scope: this.props.scope, cardPlayed: this.cardPlayed, position: 0, activePlayerId: this.props.game.activePlayerId}), 
            React.createElement(PlayerComponent, {player: this.props.game.players[1], playerIds: this.playerIds, scope: this.props.scope, cardPlayed: this.cardPlayed, position: 1, activePlayerId: this.props.game.activePlayerId}), 
            React.createElement(PlayerComponent, {player: this.props.game.players[2], playerIds: this.playerIds, scope: this.props.scope, cardPlayed: this.cardPlayed, position: 2, activePlayerId: this.props.game.activePlayerId})
            )
        );
    }
});
var GameStateInfo = React.createClass({displayName: "GameStateInfo",
    render : function (){
        var gameState = this.props.gameState;
        var players = this.props.players;
        var activePlayerId = this.props.activePlayerId;
        var otherPlayerId = this.props.otherPlayerId;
        for (var i = players.length - 1; i >= 0; i--) {
            if(players[i].id == this.props.activePlayerId){
                activePlayerId = i;
            }
            if(players[i].id == this.props.otherPlayerId){
                otherPlayerId = i;
            }
        };
        switch(gameState){
            case 'PLAY_CARD':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                statusString+= ' turn. Play Card.';
                break;
            case 'SET_TRUMP':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                statusString+= ' turn. Set Trump.';
                break;
            case 'WITHDRAW_CARD':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                statusString+= ' turn. Withdraw card from '+players[otherPlayerId].name;
                break;
            case 'RETURN_CARD':
                if(activePlayerId == 0){
                    var statusString = 'Your';
                }else{
                    var statusString = players[activePlayerId].name+"'s";   
                }
                statusString+= ' turn. Return card to '+players[otherPlayerId].name;
                break;
        }
        return (
                React.createElement("div", {className: "game-status"}, 
                React.createElement("h3", null, statusString)
                )
        );
    }
});
var TrumpComponent = React.createClass({displayName: "TrumpComponent",
    getInitialState : function (){
        return {
            trumps : ['S', 'H', 'C', 'D'],
        }
    },
    handleClick : function (trump) {
        this.props.setTrump(trump);
    },
    render : function(){
            var self = this;
            var gameState = self.props.gameState;
            var trumpNodes = this.state.trumps.map(function (trump, index){
                var style = getTrumpStyle(trump, self.props.trump, index, gameState);
                return (React.createElement(TrumpCardComponent, {key: trump, style: style, trump: trump, click: self.handleClick}))
            });
            return (
                React.createElement("div", {className: "trumps"}, 
                    trumpNodes
                )
            )
        }
});
var TrumpCardComponent = React.createClass({displayName: "TrumpCardComponent",
    handleClick : function(e){
        this.props.click(e.props.trump);
    },
    render : function (){
        return (
            React.createElement("div", {className: "card trump-cards", style: this.props.style, onClick: this.handleClick.bind(null, this) })
            )
    }
});
var PlayerComponent = React.createClass({displayName: "PlayerComponent",
    getInitialState : function (){
        return {
            player : null,
            mounted : false,
            style : {                     
                    width : 100,
                    height : 50,
                    left : 0,
                    top : 0,
                    'transform' : 'translateX(0px) translateY(0px)'
                }
        }
    },
    componentDidMount : function (){
        if(this.props.player.id == 0){
        }
    },
    handleCardClick : function (card, player) {
            this.props.cardPlayed(card, player);
    },
    render : function () {
        var player = this.props.player;
        var self = this;
        var noOfCards = this.props.player.cards.length;
        var activePlayerId = this.props.activePlayerId;
        var position = this.props.position;
        var cards = this.props.player.cards.map(function (card, index){
            var cardStyle = getCardPic(card);
            var cardKey = card.rank+'.'+card.suit;
            return React.createElement(CardComponent, {playerIds: self.props.playerIds, scope: self.props.scope, key: cardKey, card: card, index: index, position: self.props.position, playerId: self.props.player.id, noOfCards: noOfCards, cardClicked: self.handleCardClick, cardStyle: cardStyle})
        });
        return (
            React.createElement("div", null, 
            React.createElement(PlayerInfoComponent, {player: player, activePlayerId: activePlayerId, position: position}), 
            cards
            )
        )
    }
});
var PlayerInfoComponent = React.createClass({displayName: "PlayerInfoComponent",
    componentDidMount : function (){
        // this.msg = this.props.player.msg;
    },
    componentWillReceiveProps: function(){
        var msg = this.props.player.msg;
    },
    render : function () {
        var id = this.props.player.id;
        var name = this.props.player.name;
        var type = this.props.player.type;
        var image = this.props.player.img;
        var position = this.props.position;
        var handsMade = this.props.player.handsMade;
        var handsToMake = this.props.player.handsToMake;
        var activePlayerId = this.props.activePlayerId;
        var msg = this.props.player.msg;
        var cx = React.addons.classSet;
        var profileClasses;
        if(msg && msg != this.msg){
            profileClasses = cx({
                'players-profile' : true,
                'anim-start' : true,
                'anim-end' : false
            });
            var self = this;
            var fn = function(){
                self.msg = self.props.player.msg;
                self.setState({'State' : 'Message'})
            }
            delayService.asyncTask(3000, fn);
        }else if(msg == this.msg || !msg || msg == ''){
            var self = this;
            var fn = function(){
                profileClasses = cx({
                    'players-profile' : true,
                    'anim-start' : false,
                    'anim-end' : true
                });
                self.msg = '';
                //self.setState({'State' : 'Message'})
            }
            delayService.asyncTask(3000, fn);
        }
        switch(position){
            case 0:
                var className = 'bottom-player';
                break;
            case 1:
                var className = 'left-player';
                break;
            case 2:
                var className = 'right-player';
                break;
        }
        var playerClass  = 'ball'
        if(id == activePlayerId){
            playerClass  = 'ball player-active';
        }
        if(type == 'local' || type == 'bot' || type == 'you'){
            var picurl = '/assets/img/avatars.png';
            var index = image;
            var backgroundPosition = index*45+'px 0px';
        }else{
            var picurl = image;
            var backgroundPosition = '50% 50%';
        }
        var playerStyle = {
                background: '#fff url('+picurl+')',
                backgroundPosition : backgroundPosition
            };
            // var msg = this.msg;
            // console.log(this.msg);
        return (
            React.createElement("div", {className: className}, 
                React.createElement("div", {className: profileClasses}, 
                    React.createElement("div", {className: playerClass, style: playerStyle}, 
                        React.createElement("div", {className: "player-info-name"}, name), 
                        React.createElement("div", {className: "statistics"}, handsMade, "/", handsToMake),
                        React.createElement("div", {className : "notif"},
                            React.createElement("div", {className : "bar"},
                                React.createElement("p", {className : "text"}, msg
                                )
                            )
                        )
                    )
                )
            )
        );
    }
});
var PlayedCardsComponent = React.createClass({displayName: "PlayedCardsComponent",
    getInitialState : function () {
        return {

        }
    },
    render : function(){
        var cards = this.props.playedCards.map(function (card, index){
            if(typeof card.moveTo == 'undefined'){
                switch(index){
                    case 0:
                        var posY = -(gameCSSConstants.cardSize.y + 40);
                        var posX = gameCSSConstants.gameWindow.x/2 - gameCSSConstants.cardSize.x/2;
                        break;
                    case 1:
                        var posY = -(2*gameCSSConstants.cardSize.y + 40);
                        var posX = gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                        break;
                    case 2:
                        var posY = -(2*gameCSSConstants.cardSize.y + 40);
                        var posX = 2*gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                }
            }else{
                var fullDeckWidth = 9*(gameCSSConstants.cardLeftMargin) + gameCSSConstants.cardSize.x;
                switch(card.moveTo){
                    case 0:
                        var posY = 0;
                        var posX = 0.5*(gameCSSConstants.gameWindow.x - gameCSSConstants.cardSize.x);
                        break;
                    case 1:
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                        var posX = 0.5*(fullDeckWidth - gameCSSConstants.cardSize.x);
                        break;
                    case 2:
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                        var posX = gameCSSConstants.gameWindow.x - 0.5*(fullDeckWidth - gameCSSConstants.cardSize.x);
                        break;
                }
            }
            var style = {
                left : 0,
                top : (600 - (gameCSSConstants.cardSize.y)),
                transform : 'translateX('+posX+'px) translateY('+posY+'px)',
                display : 'none'
            }
            if(card.display){
                style.display = 'block';
            }
            var frontClassName = 'card frontRotated';
            var backClassName = 'card backRotated';
            var cardStyle = getCardPic(card);
            if(card.suit){
                var cardKey = card.suit+'_'+card.rank;
                return (
                    React.createElement("div", {key: cardKey, className: "card", style: style}, 
                        React.createElement("a", {className: frontClassName, style: cardStyle}), 
                        React.createElement("a", {className: backClassName})
                    )
                )   
            }
        });
        return (
            React.createElement("div", null, 
                cards
            )
            )
    }
})
var CardComponent = React.createClass({displayName: "CardComponent",
    getInitialState : function (){
        return {
            shuffle : true,
            style : {
                left : gameCSSConstants.deckCSS.x,
                top : gameCSSConstants.deckCSS.y,
                height : gameCSSConstants.cardSize.y,
                width : gameCSSConstants.cardSize.x
            }
        }
    },
    getInitialCardCSS : function(){
        return {
            
        }
    },
    componentDidMount : function(){
        var self = this;
        var t = (this.props.index+this.props.position+2)*200;
        var fn = function (){
            self.setState({mounted : true})
        }
        if(this.props.card.animation != false){
            delayService.asyncTask(t, fn);  
        }else{
            fn();
        }
        
    },
    componentWillLeave : function(){
        this.state.style.transform = 'translateX(0px) translateY(0px)';
    },
    handleClick : function(card, player){
        this.props.cardClicked(card, player);
    },
    render : function (){
        var style = this.state.style;
        var cardStyle = this.props.cardStyle;
        var index = this.props.index;
        var playerId = this.props.playerId;
        var position = this.props.position;
        var card = this.props.card;
        var noOfCards = this.props.noOfCards;
        var fullDeckWidth = 9*(gameCSSConstants.cardLeftMargin) + gameCSSConstants.cardSize.x;

        if(this.state.mounted){
            if(!card.state || card.state == 'deck'){
                switch(position){
                case 0:
                    var posY = 0;
                    var posX = 0.5*(gameCSSConstants.gameWindow.x - (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) - gameCSSConstants.cardSize.x);
                        posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                    break;
                case 1:
                    var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                    var posX = 0.5*(fullDeckWidth -  (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) - gameCSSConstants.cardSize.x);
                        posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                    break;
                case 2:
                    var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                    var posX = gameCSSConstants.gameWindow.x -0.5*(fullDeckWidth +  (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) + gameCSSConstants.cardSize.x);
                        posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                }   
            }else if(card.state == 'played'){
                switch(position){
                case 0:
                    var posY = -(gameCSSConstants.cardSize.y + 40);
                    var posX = gameCSSConstants.gameWindow.x/2 - gameCSSConstants.cardSize.x/2;
                    break;
                case 1:
                    var posY = -(2*gameCSSConstants.cardSize.y + 40);
                    var posX = gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                    break;
                case 2:
                    var posY = -(2*gameCSSConstants.cardSize.y + 40);
                    var posX = 2*gameCSSConstants.gameWindow.x/3 - gameCSSConstants.cardSize.x/2;
                }
            }else if(card.state == 'withdrawn'){
                var moveToPosition = this.props.playerIds.indexOf(card.moveTo);
                var moveFromPosition = this.props.playerIds.indexOf(card.moveFrom);
                var index = 10;
                switch(moveToPosition){
                    case 0:
                        var posY = 0;
                        var posX = 0.5*(gameCSSConstants.gameWindow.x - (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) - gameCSSConstants.cardSize.x);
                            posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                        break;
                    case 1:
                        if(moveFromPosition == 0){
                            index = -1;
                        }
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                        var posX = 0.5*(fullDeckWidth -  (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) - gameCSSConstants.cardSize.x);
                            posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                        break;
                    case 2:
                        index = -1;
                        var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                        var posX = gameCSSConstants.gameWindow.x -0.5*(fullDeckWidth +  (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) + gameCSSConstants.cardSize.x);
                            posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                        break;
                }
            }else if(card.state == 'returned'){
                var index = 10;
                var moveToPosition = this.props.playerIds.indexOf(card.moveTo);
                var moveFromPosition = this.props.playerIds.indexOf(card.moveFrom);
                switch(moveToPosition){
                case 0:
                    var posY = 0;
                    var posX = 0.5*(gameCSSConstants.gameWindow.x - (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) - gameCSSConstants.cardSize.x);
                        posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                    break;
                case 1:
                    if(moveToPosition == 0){
                        index = 0;
                    }
                    var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                    var posX = 0.5*(fullDeckWidth -  (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) - gameCSSConstants.cardSize.x);
                        posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                    break;
                case 2:
                    index = 0;
                    var posY = -(gameCSSConstants.gameWindow.y - gameCSSConstants.cardSize.y - 60 - 2*gameCSSConstants.gameWindow.padding);
                    var posX = gameCSSConstants.gameWindow.x -0.5*(fullDeckWidth +  (noOfCards - 1)*(gameCSSConstants.cardLeftMargin) + gameCSSConstants.cardSize.x);
                        posX+= (index-1)*(gameCSSConstants.cardLeftMargin);
                    break;
                }
            }
            style.transform = 'translateX('+posX+'px) translateY('+posY+'px)';
        }
        var frontClassName = 'card front';
        var backClassName = 'card back';
        if((position == 0 && this.state.mounted) || card.state == 'played' || (card.moveTo == 0 && card.state == 'withdrawn') || (card.moveTo == 0 && card.state == 'returned')){
            frontClassName = 'card frontRotated';
            backClassName = 'card backRotated';
        }
        if(card.moveTo != 0 && (card.state == 'withdrawn' || card.state == 'returned')){
            var frontClassName = 'card front';
            var backClassName = 'card back';
        }
        return (
            React.createElement("div", {className: "card", style: style, onClick: this.handleClick.bind(null, this.props.card, this.props.playerId)}, 
                React.createElement("a", {className: frontClassName, style: cardStyle}), 
                React.createElement("a", {className: backClassName})
            )
        )
    }
});
