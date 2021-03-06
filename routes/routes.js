var Game = require('../utils/game325');
var Player = require('../utils/player');
var players = [];
var randomstring = require("randomstring");
var User = function  (name, image, type){
    return {
        name : name,
        image : image,
        type : type
    }
}
module.exports = function(app, passport) {
    var client = app.get('redisClient');
    var customSession = app.get('sessionStore');
    app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {
			user : req.user // get the user out of session and pass to template
		});
	});
    app.get('/test', function (req, res){
        if(!req.user){
            console.log('test');
            req.user = {
                id : 'anon',
                name : 'Dead'
            }
        }
        console.log(req.user);
    });
    app.post('/api/start', function(req, res ){
        var room, game, gameType;
        if(req.user){
            var userId = req.user.id;
        }else{
            var userId = 1;
        }
        client.scard('rooms2', function(err, data){
            var i = data;
            if(i>0){
                client.spop('rooms2', function(err, data){
                    room = data;
                    client.srem('room2', room, function(err, roomDeleted){
                        if(err)
                            return err;
                        // client.sadd('rooms3', room, function(err, roomAdded){
                        //     if(err)
                        //         return err;
                            res.json({  
                                    'game' : 'start',
                                    'roomId' : room
                            });                        
                        // });
                    });
                });
            }else{
                client.scard('rooms1', function(err, data){
                    var i = data;
                    if(i>0){
                        client.spop('rooms1', function(err, data){
                            room = data;
                            client.srem('rooms1', room, function(err, roomDeleted){
                                if(err)
                                    return err;
                                client.sadd('rooms2', room, function(err, roomAdded){
                                    if(err)
                                        return err;
                                    res.json({  
                                        'game' : 'start',
                                        'roomId' : room
                                    });   
                                });
                            });
                        });
                    }
                    else{
                        var id = randomstring.generate(5);
                        room = id;
                        client.sadd('rooms1' , id, function (err, roomAdded){
                            if(err)
                                return err;
                            var game = new Game();
                            game.id = id;
                            game.status = 'open';
                            game.round = 1;
                            var x = JSON.stringify(game);
                            client.set('gameRoom:'+room, x, function (err, GamedataAdded){
                                if(err)
                                    return err;
                                res.json({  'game' : 'start',
                                            'roomId' : room
                                         });
                            });
                        });
                    }
                });
            }
        });
    });
    app.post('/api/create', function (req, res) {
        var id = randomstring.generate(5);
        room = id;
        client.sadd('rooms4', id, function (err, roomAdded) {
            // body...
            if(err)
                throw err;
            var game = new Game();
            game.id = id;
            game.status = 'open';
            game.round = 1;
            var x = JSON.stringify(game);
            client.set('gameRoom:'+room, x, function (err, GamedataAdded) {
                if(err)
                    throw err;
                res.json({'game' : 'start',
                            'roomId' : room,
                            'type' : 0 // 0=>private
                        });
            });
        });
    });
    app.post('/api/join', function (req, res){
        var id = req.roomId;
        client.get('gameRoom:'+id, function (err, gameData){
            if(err)
                throw err;
            if(!gameData){
                res.json({'error' : 'Invalid Room'}); 
                return false;   
            }else{
                var gameData = JSON.parse(gameData);
                res.json({'game' : 'start',
                    'roomId' : room,
                    'type' : 0 // 0=>private
                });    
            }
        });
    });
    // app.post('/game/:id', function(req, res){
    //     var playerId = req.user.id;
    //     if(players.length == 2){
    //         game.start();
    //     }
    // });
	
    app.get('/start', function(req, res){
		game = new Game();
		var player = new player();
		player.id = req.user.id;
		game.owner = req.user.id;
		res.render('start');
	});
    // app.get('/game/:id', function(req, res){
	// 	var id = res.query('id');
	// 	res.render('start')
	// });
    // route for logging out
	
    app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
    
    app.post('/api/auth', function(req, res){
        if (req.user) {
            if(req.user.facebook){
                console.log(req.user.facebook.img)
                var user = new User(req.user.facebook.name, req.user.facebook.img, 'fb');
            }
            else if(req.user.twitter){
                var user = new User(req.user.twitter.name, req.user.twitter.img, 'twitter');
                // var user = req.user.twitter;
                // user.type = 'twitter';
            }else if(req.user.google){
                var user = new User(req.user.google.name, req.user.google.img, 'google');
                // var user = req.user.google;
                // user.type = 'google';
            }else if(req.user.google){
                // var user = req.user.local;
                // user.type = 'local';
                var user = new User(req.user.local.name, req.user.local.img, 'local');
            }
            console.log(user);
            res.json({'user' : user });
        }else {
            res.json({'error' : 401})
        }
    });
	
    app.get('/auth/twitter', passport.authenticate('twitter'));

	app.get('/auth/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect : '/',
			failureRedirect : '/'
	}));
    app.get('/auth/facebook', passport.authenticate('facebook'));


    app.get('/auth/facebook/callback', 
        passport.authenticate('facebook', { successRedirect: '/',
                                            failureRedirect: '/' }));

    app.get('/', function(req, res){
        res.sendFile('www/index.html', { root: app.get('rootDir')});
    });

    app.get('*', function(req, res){
        res.sendFile('www/index.html', { root: app.get('rootDir')});
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/');
}
