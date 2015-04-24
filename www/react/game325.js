var Score = function(){
	return {
		handsToMake : 0,
		handsMade : 0,
	}
}
var Game = function(){
	this.players = [],
 	this.rank,
	this.suit,
	this.turnSuit,
	this.deck,
	this.cardIndex,
	this.cardPlayed,
	this.playerIds,
	this.round,
	this.gameStarter,
	this.gamePaused = false,
	this.noOfPlayers,
	this.gameTurn = 1,
	this.playerSetTrump,
	this.gameWinSeq,
	this.withdraw,
	this.playedCards = Array({},{},{});
	this.allPlayedCards = Array();
	this.playerWinningIndex = Array(0,0,0),
	this.players = Array(),
	this.activePlayer,
	this.activePlayerId,
	this.otherPlayerId,
	this.activeSuit,
	this.lastGameWinner,
	this.gameRound = 0,
	this.cardWithdrawn,
	this.cardReturned,
	this.cardMoveFrom,
	this.remainingCards,
	this.cardMoveTo,
	this.moveFrom,
	this.moveTo,
	this.returnCard
}	
Game.prototype.initDeck = function() {
	var deck = new Deck();
	this.deck = deck.deck;
	this.deck = deck.shuffleDeck(this.deck);
	cardcount = new Deck();
	this.remainingCards = cardcount.deck;
	for (var i = this.remainingCards.length - 1; i >= 0; i--) {
		switch(this.remainingCards[i].suit){
			case 'S':
				this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order;
				break;
			case 'H':
				this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order - 8;
				break;
			case 'C':
				this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order - 16;
				break;
			case 'D':
				this.remainingCards[i].currentSuitOrder = this.remainingCards[i].order - 23;
				break;
		}
	};
	// return this.deck;
}
Game.prototype.distributeCards = function(){
	var n = 5;
	for (var i = 0; i < n; i++) {
		for (var j = 0; j < this.players.length; j++) {
			var card = this.deck.pop();
			this.players[j].cards.push(card);
		}
	}
}
Game.prototype.gameStart = function(){
	if(this.gameTurn == 1){
		this.initDeck();
		this.distributeCards(5);
	}
}
Game.prototype.getPlayer = function(id){
	for (var i = this.players.length - 1; i >= 0; i--) {
		if(this.players[i].id == id)
			return this.players[i];
	}
}
Game.prototype.assignPlayerIds = function(){
	this.playerIds =  Array();
	for (var i = 0; i < this.players.length; i++) {
		this.playerIds.push(this.players[i].id);
	}
}
Game.prototype.updateHandsToMake = function() {
	var j;
	var x = this.gameTurn%3;
	for (var i =0; i < this.players.length; i++) {
        if(this.players[i].id == this.activePlayerId){
            j = i;
            // console.log(this.players[i]);
            this.players[i].handsToMake = 5;
            this.players[i].scores[x-1].handsToMake = 5;
        }
        if(j == 0){
            this.players[1].handsToMake = 3;
            this.players[2].handsToMake = 2;
            this.players[1].scores[x-1].handsToMake = 3;
            this.players[2].scores[x-1].handsToMake = 2;
        }
        if(j == 1){
            this.players[0].handsToMake = 2;
            this.players[2].handsToMake = 3;
            this.players[0].scores[x].handsToMake = 2;
            this.players[2].scores[x].handsToMake = 3;
        }
        if(j == 2){
            this.players[0].handsToMake = 3;
            this.players[1].handsToMake = 2;
            this.players[0].scores[x].handsToMake = 3;
            this.players[1].scores[x].handsToMake = 2;
        }
    }
}
Game.prototype.withdrawCard = function(){
	// var activePlayerId = this.activePlayerId;
	// var otherPlayerId = this.otherPlayerId;
	var cardIndex = this.cardIndex;
	// console.log('withdrawCard called 1')
	// console.log(this.cardMoveFrom + '-------->' + this.cardMoveTo);
	// console.log(this);
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].id == this.cardMoveFrom){
			this.players[i].cards[cardIndex].state = 'deck';
			this.players[i].cards[cardIndex].animation = false;
			var card = this.players[i].cards.splice(cardIndex, 1);
			// console.log('Splice done');
			this.cardPlayed = card[0];
			// this.cardMoveFrom = otherPlayerId;
			delete this.cardPlayed.moveFrom;
			delete this.cardPlayed.moveTo;
			// this.otherPlayerId = this.cardMoveTo;
		}
	}
	// this.moveFrom = this.activePlayerId;
	// this.moveTo = this.otherPlayerId;
	for (var i = this.players.length - 1; i >= 0; i--) {
		if(this.players[i].id == this.cardMoveTo){
			// console.log('Push done');
			this.players[i].cards.push(this.cardPlayed);
			this.players[i].cardWillBeMovedFrom = null;
			// this.activePlayerId = this.cardMoveFrom;
			// this.cardMoveFrom = activePlayerId;
		}
	}
}
Game.prototype.moveWithdrawCard = function(){
	console.log('moveWithdrawCard Called 1');
	var activePlayerId = this.activePlayerId;
	var otherPlayerId = this.otherPlayerId;
	var cardIndex = this.cardIndex;
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].id == otherPlayerId){
			this.cardPlayed = this.players[i].cards[cardIndex];
			this.cardMoveFrom = otherPlayerId;
			this.cardMoveTo = activePlayerId;
			this.players[i].cards[cardIndex].state = 'withdrawn';
			this.players[i].cards[cardIndex].animation = true;
			this.players[i].cards[cardIndex].moveFrom = otherPlayerId;
			this.players[i].cards[cardIndex].moveTo = activePlayerId;
		}
	// }
	// for (var i = this.players.length - 1; i >= 0; i--) {
		if(this.players[i].id == activePlayerId){
			this.players[i].cardWillBeMovedFrom = otherPlayerId;
		}
	}
	// this.moveFrom = otherPlayerId;
	// this.moveTo = activePlayerId;
}
Game.prototype.returnCard = function(){
	// console.log('returnCard Called 1');
	// var activePlayerId = this.moveFrom;
	// var otherPlayerId = this.moveTo;
	var cardIndex = this.cardIndex;
	// console.log(this.cardMoveFrom + '-------->' + this.cardMoveTo);
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].id == this.cardMoveTo){
			this.players[i].cards[cardIndex].state = 'deck';
			this.players[i].cards[cardIndex].animation = false;
			var card = this.players[i].cards.splice(cardIndex, 1);
			// console.log('Splice done');
			this.cardPlayed = card[0];
			// this.cardMoveFrom = activePlayerId;
			delete this.cardPlayed.moveFrom;
			delete this.cardPlayed.moveTo;
		}
	}
	for (var i = 0; i < this.players.length; i ++){
		if(this.players[i].id == this.cardMoveFrom){
			// console.log('Push done');
			this.players[i].cards.push(this.cardPlayed);
			this.players[i].cardWillBeMovedFrom = null;
			// this.cardMoveTo = otherPlayerId;
			// this.players[i].handsMadeInLR++;
		}
	}
}
Game.prototype.moveReturnCard = function(){
	// console.log('moveReturnCard Called 1');
	// var activePlayerId = this.moveFrom;
	// var otherPlayerId = this.moveTo;
	
	var activePlayerId = this.activePlayerId;
	var otherPlayerId = this.otherPlayerId;
	var cardIndex = this.cardIndex;
	for (var i = 0; i < this.players.length; i ++) {
		if(this.players[i].id == activePlayerId){
			var card = this.players[i].cards[cardIndex];
			this.returnCard = true;
			this.players[i].cards[cardIndex].state = 'returned';
			this.players[i].cards[cardIndex].animation = true;
			this.players[i].cards[cardIndex].moveFrom = activePlayerId;
			this.players[i].cards[cardIndex].moveTo = otherPlayerId;
			this.players[i].handsMadeInLR--;
			this.cardPlayed = card;
			this.cardWithdrawn = card;
			this.moveFrom = activePlayerId;
			this.moveTo = otherPlayerId;
		}
		if(this.players[i].id == otherPlayerId){
			this.players[i].handsMadeInLR++;
			this.players[i].cardWillbeMovedFrom = activePlayerId; // To adjust card index while rendering -- Fake It by Seether
		}
	}
}
// Game.prototype.setTrump = function(trump){
// 	this.trump = trump;
// }
Game.prototype.playCard = function(){
	var card = this.cardPlayed;
	for (var i = 0; i < this.players.length ; i++) {
		if(this.players[i].id == this.activePlayerId){
			this.players[i].cardPlayed = card;
			for (var j = this.players[i].cards.length - 1; j >= 0; j--) {
				if(this.players[i].cards[j].suit == card.suit && this.players[i].cards[j].rank == card.rank){
					var index = j;
				}
			};
			// this.players[i].cards.splice(index, 1);
		}
	}
	this.cardPlayed = card;
}
Game.prototype.nextRound = function(){
	for (var i = this.players.length - 1; i >= 0; i--){
		// var z = this.gameTurn%3;
		if(this.players[i].handsToMake == 2){
			var score = new Score();
			var lastScore = this.players[i].scores[this.players[i].scores.length - 1];
			//score.handsToMake = this.players[i].handsToMake;
			//score.handsMade = this.players[i].handsMade;
			//this.players[i].scores.push(score);
			this.players[i].handsToMakeInLR = 2;
			this.players[i].handsToMake = 3;
			this.players[i].handsMadeInLR = lastScore.handsMade;
			score.handsToMake = this.players[i].handsToMake;
			this.players[i].scores.push(score);
		}else if(this.players[i].handsToMake == 3){
			var score = new Score();
			var lastScore = this.players[i].scores[this.players[i].scores.length - 1];
			//score.handsToMake = this.players[i].handsToMake;
			//score.handsMade = this.players[i].handsMade;
			//this.players[i].scores.push(score);
			this.players[i].handsToMakeInLR = 3;
			this.activePlayerId = this.players[i].id;
			this.players[i].handsToMake = 5;
			this.players[i].handsMadeInLR = lastScore.handsMade;
			score.handsToMake = this.players[i].handsToMake;
			this.players[i].scores.push(score);	
		}else if(this.players[i].handsToMake == 5){
			var score = new Score();
			var lastScore = this.players[i].scores[this.players[i].scores.length - 1];
			//score.handsMade = this.players[i].handsMade;
			this.players[i].handsToMakeInLR = 5;
			this.players[i].handsToMake = 2;
			this.players[i].handsMadeInLR = lastScore.handsMade;
			score.handsToMake = this.players[i].handsToMake;
			this.players[i].scores.push(score);
		}
		var totalHandsToMake = 0;
		for (var k = this.players[i].scores.length - 1; k >= 0; k--) {
			totalHandsToMake += this.players[i].scores[k].handsToMake;
		};
		this.players[i].totalHandsToMake = totalHandsToMake;
	}
	for (var i = this.players.length - 1; i >= 0; i--) {
		// updateScoresInDB(this.players[i]);
	};
	console.log(this.players);
}
Game.prototype.getTurnWinner = function() {
	var self = this;
	var x = (this.gameTurn-1)/30;
	var y = parseInt(x);
	if(x == y){
		var x = x-1;
	}else{
		var x = Math.floor(this.gameTurn/30);	
	}
	var biggestCard = null;
	for (var i = 0; i < this.players.length; i++){
		biggestCard = getBiggestCard(biggestCard, this.players[i].cardPlayed, this.turnSuit, this.trump);
	}
	// console.log(biggestCard);
	for (var i = 0; i < this.players.length; i++) {
		if(this.players[i].cardPlayed == biggestCard){
			this.lastGameWinner = this.players[i].id;
			this.players[i].handsMade++;
			this.winnerId =  this.players[i].id;
			this.activePlayerId = this.winnerId;
			this.players[i].scores[x].handsMade++;
		}
	}
}
Game.prototype.nextTurn = function() {
	var z = this.gameTurn;
	z++;
	this.gameTurn = z;
	var n;
	for (var i = 0; i < this.players.length; i++) {
		if(this.activePlayerId ==  this.players[i].id){
			n = i;
		}
	};
	if((n+1) == this.players.length){
		n = 0;
	}else{
		n = n+1;
	}
	this.otherPlayerId = this.activePlayerId;
	this.activePlayerId = this.players[n].id;
}
/*Game.prototype.getBiggestCard = function(card1, card2) {
	if(card1 == null)
		return card2;
	if(card2 == null)
		return card1;
	var turnSuit = this.turnSuit;
	if(card1.suit == this.trump){
        if(card2.suit == this.trump){
            if(card1.rank > card2.rank){
                return card1;
            }else{
                return card2;
            }
        }else{
            return card1;
        }
    }else if(card2.suit == this.trump){
        return card2;
    }else if(card1.suit == turnSuit && card2.suit == turnSuit){
        if(card1.rank > card2.rank){
            return card1;
        }else{
            return card2;
        }
    }else if(card1.suit == turnSuit && card2 != turnSuit){
        return card1;
    }else if(card1.suit != turnSuit && card2 == turnSuit){
        return card2;
    }else{
        if(card1.rank > card2.rank){
            return card1;
        }else{
            return card2;
        }
    }
};*/
//check if withdraw cards is applicable for next round
Game.prototype.assignActivePlayer = function(){
	for (var i = this.players.length - 1; i >= 0; i--) {
		if(this.players[i].handsToMake == 5){
			this.activePlayerId = this.players[i].id;
		}
	};
}
Game.prototype.withdrawCards = function(){
	var array = new Array();
	var arrayId = new Array();
	var arrayVal = new Array();
	var x = function(){
		return {
			id : '',
			value : ''
		}
	}
	for (var i = 0; i < this.players.length; i++){
		var j = new x();
		j.id = this.players[i].id;
		j.value = this.players[i].handsToMakeInLR - this.players[i].handsMadeInLR;
		array.push(j);
	}
	array.sort(function (a, b){
		if (a.value > b.value){
	    	return 1;
	  	}
	  	if (a.value < b.value){
	    	return -1;
	  	}
	  	return 0;
	});
	for (var i = 0; i < array.length; i++) {
		arrayId.push(array[i].id);
		arrayVal.push(array[i].value);
	}
	if(arrayVal[0] == 0 && arrayVal[2] == 0){
                this.withdraw = false;
                return false;
                // this.game_turn = 1;
                // this.gameStart();
            }else{
            		this.activePlayerId = arrayId[0];
                    this.otherPlayerId = arrayId[2];
                // if(arrayVal[0] == 0){
                //     this.activePlayerId = arrayId[1];
                //     this.otherPlayerId = arrayId[2];
                // }
                // if(arrayVal[1] == 0){
                //     this.activePlayerId = arrayId[0];
                //     this.otherPlayerId = arrayId[2];
                // }
                // if(arrayVal[1] < 0){
                //     this.activePlayerId = arrayId[0];
                //     this.otherPlayerId = arrayId[1];
                // }
                // if(arrayVal[1] > 0){
                //     this.activePlayerId = arrayId[1];
                //     this.otherPlayerId = arrayId[2];
                // }
                this.withdraw = 'true';
                return true;
            }
}
function getBiggestCard (card1, card2, turnSuit, trump) {
	if(card1 == null)
		return card2;
	// var turnSuit = this.turnSuit;
	if(card1.suit == trump){
        if(card2.suit == trump){
            if(card1.rank > card2.rank){
                return card1;
            }else{
                return card2;
            }
        }else{
            return card1;
        }
    }else if(card2.suit == trump){
        return card2;
    }else if(card1.suit == turnSuit && card2.suit == turnSuit){
        if(card1.rank > card2.rank){
            return card1;
        }else{
            return card2;
        }
    }else if(card1.suit == turnSuit && card2.suit != turnSuit){
        return card1;
    }else if(card1.suit != turnSuit && card2.suit == turnSuit){
        return card2;
    }else{
        if(card1.rank > card2.rank){
            return card1;
        }else{
            return card2;
        }
    }
}
function updateScoresInDB(player){
	console.log(player);
	// if(player.type != 'local'){
		if(player){
		Scores.findOne({'userId': player.userId}, function (err, scores){
			if(err)
				throw err;
			if(scores){
				var n = player.handsToMake - player.handsMade;
				if (n >= 0) {
					scores.Game.noOfGamesWon = scores.gameWon+1;
				}
				scores.Game.noOfGamesPlayed = scores.noOfGamesPlayed+1;
				scores.Game.points = scores.Game.points+n;
			}else{
				var score = new scores();
				score.id = player.id;
				score.type = player.type;
				score.image = player.image;
				var n = player.handsToMake - player.handsMade;
				scores.Game.noOfGamesWon = 0;
				if (n >= 0) {
					scores.Game.noOfGamesWon = 1;
				}
				scores.Game.noOfGamesPlayed = 1;
				scores.Game.points = n;
				
			}
			score.save(function (err){
				if(err)
					throw err;
			});
		});
	}
}
//helper functions