var player = function(){
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
     handsMadeInLR : 0,
     totalHandsToMake : 0,
     cardPlayed : {}
    }
}
module.exports = player;