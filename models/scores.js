var mongoose = require('mongoose');

var scoreScheme = mongoose.Schema({
	userId : String,
	userType : String,
	image : String,
	game : String,
	game325 : {
			noOfGamesPlayed : Number,
			noOfGamesWon : Number,
			points : Number	
	}
});

module.exports = mongoose.model('DBScore', scoreScheme);