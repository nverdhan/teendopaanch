// var Game = require('./game');
var Game = require('./utils/game325');
var Player = require('./utils/player');
var game = new Game();
var sio = require('socket.io');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var rooms = [];
var room;
module.exports = function (app, server){
    var io = sio.listen(server);
//    var io = sio({
//        io.use(function(){
//              io.enable('browser client minification');
//            io.enable('browser client gzip');
//        });
//    });
	var sessionStore = app.get('sessionStore');
    var client = app.get('redisClient');
    var user = 'bhnj';
    var mongooseClient = app.get('mongooseClient');
    // var redisPub = app.get('redisPub');
	// var redisSub = app.get('redisSub');
    // var config = app.get('config');
    io.use(function(socket, accept){
        var hsData = socket.request;
        console.log(hsData.headers);
        if(hsData.headers.cookie){
            var cookies = cookieParser.signedCookies(cookie.parse(hsData.headers.cookie), 'seasonsofthewitch');
            var sid = cookies['gameApp'];
            sessionStore.load(sid, function(err, session) {
                if(err || !session) {
                    return accept('Error retrieving session!', false);
                }
                if(session.passport){
                    hsData.gameApp = {
                        user: session.passport.user,
                        room: /\/(?:([^\/]+?))\/?$/g.exec(hsData.headers.referer)[1]
                    }
                    // user = hsData.gameApp.user;
                    if(typeof(user) != 'undefined'){
                        console.log(8888888888);
                        client.get('userInfo:'+hsData.gameApp.user, function (err, user) {
                            var x = JSON.stringify(user);
                            client.set('user:'+socket.id, x, function (err, userData){
                                if(err)
                                    throw err;
                            });
                        })
                        
                    }
                }
                return accept(null, true);
            })
        }
   })
    //    io.configure(function(){
    //        io.set('store', new sio.RedisStore({
    //            redisClient : client,
    //            redisPub : redisPub,
    //            redisSub : redisSub
    //        }));
    //        io.enable('browser client minification');
    //        io.eneble('browser client gzip');
    // });
	io.on('connection', function(socket){
        var roomId; var startFlag = 0;
		//io.emit('message', {'message' : 'state from server '});
        socket.on('joinRoom', function(data){
            console.log(user);
            roomId = data.roomId;
            console.log(data);
            // var game[roomId] = new Game();
            client.get('gameRoom:'+roomId, function (err, gameString){
                if(err){
                    throw err;
                }
                socket.join(roomId);
                console.log(gameString);
                client.get('user:'+socket.id, function (err, userData){
                    if(err)
                        throw err;
                    user = JSON.parse(JSON.parse(userData));
                    gamex = JSON.parse(gameString);
                    console.log(gameString);
                    console.log(gamex);
                    var player = new Player();
                    player.id = socket.id;
                    console.log(user);
                    if(user){
                        player.name = user.name;
                        player.img = user.img;  
                    }

                    gamex.players.push(player);
                    if(gamex.players.length == 1){
                        gamex.activePlayerId = socket.id;
                    }
                    if(gamex.players.length == 3){
                        gamex.status = 'closed';
                    }
                    var x = JSON.stringify(gamex);
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        io.sockets.connected[socket.id].emit('message', {'id': socket.id, 'start' : gamex.status});
                        io.sockets.in(roomId).emit('status', {'status' : gamex.status});
                    });
                });
                
                // var status = game.status;
                // console.log(gamex);
                // var gameData = getGame();
            })
        })
//        socket.on('startGame', function(data){
//            console.log(999);
//            var gameData = getGame();
//            io.sockets.in(roomId).emit('gameData', {'gameData' : gameData});
//        });
        socket.on('startGame', function(data){
                client.get('gameRoom:'+roomId, function(err, gameString){
                    if(err)
                        throw err;
                    gamex = JSON.parse(gameString);
                    Game.prototype.initDeck.call(gamex);
                    Game.prototype.distributeCards.call(gamex);
                    Game.prototype.updateHandsToMake.call(gamex);
                    gamex.gameTurn = 1;
                    gamex.gameState  ='setTrump';
                    Game.prototype.assignPlayerIds.call(gamex);
                    var x = JSON.stringify(gamex);
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        for (var i = 0; i < gamex.players.length; i ++) {
                            if(gamex.players[i].id == socket.id){
                                io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                                io.sockets.in(roomId).emit('start', {'data' : gamex});        
                            }
                        };
                    });
                });
        });
        socket.on('nextRound', function(data){
            client.get('gameRoom:'+roomId, function(err, gameString){
                    if(err)
                        throw err;
                    gamex = JSON.parse(gameString);
                    Game.prototype.initDeck.call(gamex);
                    Game.prototype.distributeCards.call(gamex);
                    Game.prototype.nextRound.call(gamex);
                    gamex.gameState  ='setTrump';
                    // var x = game.withdrawCards();
                    // if(x)
                    //     console.log('true');
                    // else
                    //     console.log('false');
                    var x = JSON.stringify(gamex);
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        for (var i = 0; i < gamex.players.length; i ++) {
                            if(gamex.players[i].id == socket.id){
                                io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                                io.sockets.in(roomId).emit('start', {'data' : gamex});        
                            }
                        };
                    });
                });
        });
        socket.on('setTrump', function(data){
            client.get('gameRoom:'+roomId, function(err, gameString){
                if(err)
                    throw err;
                gamex = JSON.parse(gameString);
                gamex.trump = data.data.trump;
                Game.prototype.distributeCards.call(gamex);
                gamex.gameState  ='playCard';
                var y = Game.prototype.withdrawCards.call(gamex);
                var x = JSON.stringify(gamex);

                if(y){
                    gamex.gameState  ='withdrawCard';
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        io.sockets.in(roomId).emit('withdraw', {'data' : gamex });
                        // for (var i = 0; i < game.players.length; i ++) {
                        //     if(game.players[i].id == socket.id){
                        //         // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                        //         io.sockets.in(roomId).emit('withdraw', {'data' : game});      
                        //     }
                        // };
                    });
                }
                else{
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        for (var i = 0; i < gamex.players.length; i ++) {
                            if(gamex.players[i].id == socket.id){
                                // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                                io.sockets.in(roomId).emit('playCard', {'data' : gamex});
                            }
                        };
                    });
                }
            });
        });
        socket.on('withdrawCard', function(data){
            client.get('gameRoom:'+roomId, function(err, gameString){
                if(err)
                    throw err;
                gamex = JSON.parse(gameString);
                gamex.cardIndex = data.data.card;
                Game.prototype.withdrawCard.call(gamex);
                gamex.gameState  ='returnCard';
                var x = JSON.stringify(gamex);
                client.set('gameRoom:'+roomId, x, function(err, gameSet){
                    io.sockets.in(roomId).emit('return', {'data' : gamex});
                    // for (var i = 0; i < gamex.players.length; i ++) {
                    //     if(gamex.players[i].id == socket.id){
                    //         // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                    //         io.sockets.in(roomId).emit('return', {'data' : game});
                    //     }
                    // };
                });
            });
        });
        socket.on('returnCard', function(data){
            client.get('gameRoom:'+roomId, function(err, gameString){
                if(err)
                    throw err;
                gamex = JSON.parse(gameString);
                gamex.cardIndex = data.data.card;
                Game.prototype.returnCard.call(gamex);
                var y = Game.prototype.withdrawCards.call(gamex);
                    if(y){
                        gamex.gameState  ='withdrawCard';
                        var x = JSON.stringify(gamex);
                        client.set('gameRoom:'+roomId, x, function(err, gameSet){
                            io.sockets.in(roomId).emit('withdraw', {'data' : gamex});
                            // for (var i = 0; i < gamex.players.length; i ++) {
                            //     if(gamex.players[i].id == socket.id){
                            //         // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                            //         io.sockets.in(roomId).emit('withdrawCard', {'data' : game});        
                            //     }
                            // };
                        });
                    }
                    else{
                        gamex.gameState  ='playCard';
                        var x = JSON.stringify(gamex);
                        client.set('gameRoom:'+roomId, x, function(err, gameSet){
                            io.sockets.in(roomId).emit('playCard', {'data' : gamex});
                            // for (var i = 0; i < gamex.players.length; i ++) {
                            //     if(gamex.players[i].id == socket.id){
                            //         // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                            //         io.sockets.in(roomId).emit('playCard', {'data' : game});
                            //     }
                            // };
                        });
                    }
            });
        });
        socket.on('playCard', function(data){
            // var card = data.data.cardPlayed;
            client.get('gameRoom:'+roomId, function(err, gameString){
                if(err)
                    throw err;
                gamex = JSON.parse(gameString);
                gamex.cardPlayed = data.data.cardPlayed;
                Game.prototype.playCard.call(gamex);
                if((gamex.gameTurn % 3) == 1){
                    gamex.turnSuit = gamex.cardPlayed.suit;
                }
                if((gamex.gameTurn % 3) == 0){
                    Game.prototype.nextTurn.call(gamex);
                    Game.prototype.getTurnWinner.call(gamex);
                    gamex.gameState  ='playCard';
                    // if(game.gameTurn % 30 == 0){
                    //     //declaration for get winner and next round, starting from withdraw cards and return cards
                    //     game.gameStatus  ='nextRound';
                    // }
                    var x = JSON.stringify(gamex);
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        for (var i = 0; i < gamex.players.length; i ++) {
                            if(gamex.players[i].id == socket.id){
                                // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                                io.sockets.in(roomId).emit('declareWinner', {'data' : gamex}); 
                            }
                        }
                    });
                    //otherPlayerId = winner; activePlayer playCard
                }else{
                    Game.prototype.nextTurn.call(gamex);
                    gamex.gameState  ='playCard';
                    var x = JSON.stringify(gamex);
                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                        io.sockets.in(roomId).emit('cardPlayed', {'data' : gamex});
                        // for (var i = 0; i < game.players.length; i ++) {
                        //     if(game.players[i].id == socket.id){
                        //         // io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                                
                        //     }
                        // }
                    });
                }
                
            });
        });
        socket.on('getWinner', function(data){
            client.get('gameRoom:'+roomId, function(err, gameString){
                if(err)
                    throw err;
                client.set('gameRoom:'+roomId, x, function(err, gameSet){
                    for (var i = 0; i < gamex.players.length; i ++) {
                        if(gamex.players[i].id == socket.id){
                            io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                            io.sockets.in(roomId).emit('status', {'data' : gamex});
                        }
                    };
                });
            });
        });
        socket.on('updateStats', function(data){
            client.get('gameRoom:'+roomId, function(err, gameString){
                if(err)
                    throw err;
                client.set('gameRoom:'+roomId, x, function(err, gameSet){
                    for (var i = 0; i < gamex.players.length; i ++) {
                        if(gamex.players[i].id == socket.id){
                            io.sockets.connected[socket.id].emit('message', {'id': socket.id});
                            io.sockets.in(roomId).emit('status', {'data' : gamex});        
                        }
                    };
                });
            });
        });
        socket.on('sendMsg', function (data){
            client.get('user:'+socket.id, function (err, userData) {
                if(err)
                    throw err;
                var x = JSON.parse(userData);
                var msg = data;
                // client.get('userInfo'+x, function (err, user){
                //     if (err)
                //     {
                //         throw err;
                //     }
                    // var y = JSON.parse(user);
                    var playerData = {
                        id : socket.id,
                        user : x
                    }
                    io.sockets.in(roomId).emit('msgRecieved', {'msg' : msg, 'player' : playerData});
                // });
            });
        });
        socket.on('leaveRoom', function(data){
            io.sockets.in(roomId).emit('PlayerLeft' , {'msg' : 'left'});
            client.srem('roomsFilled', roomId, function(err, data){
                if(err)
                    throw err;
            });
            client.srem('rooms', roomId, function(err, data){
                if(err)
                    throw err;
            });
            delete gamex;
            client.del('gameRoom:'+roomId);
        });
        socket.on('disconnect', function(){
            io.sockets.in(roomId).emit('PlayerLeft' , {'msg' : 'left'});
            client.srem('roomsFilled', roomId, function(err, data){
                if(err)
                    throw err;
            });
            client.srem('rooms', roomId, function(err, data){
                if(err)
                    throw err;
            });
            delete game;
            client.del('gameRoom:'+roomId);
        });
	});
}
