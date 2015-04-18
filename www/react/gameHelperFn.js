var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var Player = function(id){
    return {
     id : id,
     name : '',
     img : '',
     type : '',
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
var GameStatus = {
	NOT_STARTED : 0,
	FINISHED : 1,
	IN_PROGRESS : 2,
	SET_TRUMP : 3,
	PLAY_CARD : 4,
	WITHDRAW_CARD : 5,
	RETURN_CARD : 6,
	WAITING : 7
}
var gameVars = {
	noOfPlayers : 3,
	botsName : ['dUmMy', 'aNk', 'eNVy']
}
var gameCSSConstants = {
	gameWindow : { x : 800, y : 600, padding : 10},
	gameBody : { x : 800, y : 600, padding : 10},
	cardSize : {x: 80, y : 113.4},//px
	trump : {left : 0, top : 0},
	deckCSS : {x : 0, y : (600-113.4)},
	cardLeftMargin : 30
}
var DelayService = function (time, fn) {
	var time = time;
	var fn = fn;
	var _fact = {};
    var _initvalue = 1;
    var waitPromise = Q.when(true);
    var _asyncTask = function(time, fn){
        waitPromise = waitPromise.then(function (){
            return setTimeout(function (){
                fn();
            }, time);
        });
        return waitPromise;
    }
    _fact.asyncTask = _asyncTask;
    //_fact.waitPromise = waitPromise;
    return _fact;
}
var delayService = new DelayService(null, null);
var scaleGameBody = function(){
        var win_w = window.innerWidth;
        var effh = window.innerHeight;
        var effw = win_w - 80;
        if(effw/effh < gameCSSConstants.gameBody.x/gameCSSConstants.gameBody.y){
            var scalefactor = effw/gameCSSConstants.gameBody.x;
            var leftshift = gameCSSConstants.gameBody.x*(scalefactor-1)/2;
            var topshift = gameCSSConstants.gameBody.y*(scalefactor-1)/2 + + (effh-gameCSSConstants.gameBody.y*scalefactor)/2;
        }
        if(effw/effh > gameCSSConstants.gameBody.x/gameCSSConstants.gameBody.y){
            scalefactor = effh/gameCSSConstants.gameBody.y;
            var leftshift = gameCSSConstants.gameBody.x*(scalefactor-1)/2 + (effw-gameCSSConstants.gameBody.x*scalefactor)/2;
            var topshift = gameCSSConstants.gameBody.y*(scalefactor-1)/2;
        }
        return {
                WebkitTransform : 'scale('+scalefactor+','+scalefactor+')',
                msTransform : 'scale('+scalefactor+','+scalefactor+')',
                Transform : 'scale('+scalefactor+','+scalefactor+')',
                left : leftshift,
                top: topshift
            }
    }
var getTrumpStyle = function (trump, trumpSet,  index, state){
	switch(trump){
		case 'H':
			var posy = '-226.88px';
			break;
		case 'S':
			var posy = '-340.32px';
			break;
		case 'D':
			var posy = '0px';
			break;
		case 'C':
			var posy = '-113.44px';
			break;
	}
	var posx = -1040;
    if(state == 'SET_TRUMP'){
        var left = (gameCSSConstants.gameBody.x - (4)*(gameCSSConstants.cardSize.x))/2 + gameCSSConstants.cardSize.x*index;
        var top = gameCSSConstants.gameBody.y/2;
        var zIndex = 99;
    }else{
        var zIndex = 0
        if(trump == trumpSet)
            zIndex = 1;
        var left = gameCSSConstants.gameBody.x - gameCSSConstants.cardSize.x - gameCSSConstants.gameBody.padding;
        var top = gameCSSConstants.gameBody.y - gameCSSConstants.cardSize.y - gameCSSConstants.gameBody.padding;
    }
    var x = {
        		backgroundImage : 'url(assets/img/cardpic.jpg)',
                width : gameCSSConstants.cardSize.x,
                height : gameCSSConstants.cardSize.y,
                backgroundSize : '1200px',
                backgroundPosition : posx+'px '+posy,
                left : left,
                top : top,
                zIndex : zIndex
            };
    return x;
}
var getCardPic = function(card){
	if(!card){
        return {};
    }
    else
    {
    	switch(card.suit){
    		case 'H':
    			var posy = '-226.88px';
    			break;
    		case 'S':
    			var posy = '-340.32px';
    			break;
    		case 'D':
    			var posy = '0px';
    			break;
    		case 'C':
    			var posy = '-113.44px';
    			break;
    	}
        var posx = ((card.rank-1)*80*-1);
        var x = {
        		backgroundImage : 'url(assets/img/cardpic.jpg)',
                width : gameCSSConstants.cardSize.x,
                height : gameCSSConstants.cardSize.y,
                backgroundSize : 1200,
                backgroundPosition : posx+'px '+posy
            };
    	return x;
   }
}
var getProfilePic = function (id){

}
var sortDeck = function (array){
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
var arrangePlayerPositions = function(playerIds, playerId){
    while(playerIds.indexOf(playerId) > 0){
        var e = playerIds.pop();
        playerIds.push(e);
    }
    return playerIds;
}
