var deck = function(){
	return  {
		deck : [{
				suit : 'S',
				rank : 13
			},
			{
				suit : 'S',
				rank : 12
			},
			{
				suit : 'S',
				rank : 11
			},
			{
				suit : 'S',
				rank : 10
			},
			{
				suit : 'S',
				rank : 9
			},
			{
				suit : 'S',
				rank : 8
			},
			{
				suit : 'S',
				rank : 7
			},
			{
				suit : 'S',
				rank : 6
			},
			{
				suit : 'H',
				rank : 13
			},
			{
				suit : 'H',
				rank : 12
			},
			{
				suit : 'H',
				rank : 11
			},
			{
				suit : 'H',
				rank : 10
			},
			{
				suit : 'H',
				rank : 9
			},
			{
				suit : 'H',
				rank : 8
			},
			{
				suit : 'H',
				rank : 7
			},
			{
				suit : 'H',
				rank : 6
			},
			{
				suit : 'C',
				rank : 13
			},
			{
				suit : 'C',
				rank : 12
			},
			{
				suit : 'C',
				rank : 11
			},
			{
				suit : 'C',
				rank : 10
			},
			{
				suit : 'C',
				rank : 9
			},
			{
				suit : 'C',
				rank : 8
			},
			{
				suit : 'C',
				rank : 7
			},
			{
				suit : 'D',
				rank : 13
			},
			{
				suit : 'D',
				rank : 12
			},
			{
				suit : 'D',
				rank : 11
			},
			{
				suit : 'D',
				rank : 10
			},
			{
				suit : 'D',
				rank : 9
			},
			{
				suit : 'D',
				rank : 8
			},
			{
				suit : 'D',
				rank : 7
			}
	],
	shuffleDeck : function(array){
		if(!array)
			var array = new deck();
		var currentIndex = array.length, temporaryValue, randomIndex;
		//While there remain elements to shuffle...
		while (0 !== currentIndex) {
			//Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			//And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
		}
	}
}
module.exports = deck;
