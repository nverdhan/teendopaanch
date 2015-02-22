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
    var user = '';
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
        socket.on('JOIN_ROOM', function(data){
            roomId = data.roomId;
            console.log(socket.id);
            client.get('gameRoom:'+roomId, function (err, gameString){
                if(err){
                    throw err;
                }
                socket.join(roomId);
                client.get('user:'+socket.id, function (err, userData){
                    if(err)
                        throw err;
                    user = JSON.parse(JSON.parse(userData));
                    gamex = JSON.parse(gameString);
                    var player = new Player();
                    player.id = socket.id;
                    if(user){
                        player.name = user.name;
                        player.image = user.img;
                        player.type = 'fb'
                    }else if(data.user){
                        player.name = data.user.name;
                        player.image = data.user.image;
                        player.type = data.user.type;
                    }
                    console.log(player);
                    if(gamex.gamePaused){
                            for (var i = gamex.players.length - 1; i >= 0; i--) {
                                if(gamex.players[i].id == undefined){
                                    gamex.players[i].id = socket.id;
                                    gamex.gamePaused = false;
                                }
                            }
                            gamex.playerIds = [];
                            for (var i = gamex.players.length - 1; i >= 0; i--) {
                                    gamex.playerIds.push(gamex.players[i].id);
                                }
                            for (var i = gamex.players.length - 1; i >= 0; i--) {
                                if(gamex.players[i].id == socket.id){
                                    if(gamex.playerIds.indexOf(gamex.activePlayerId) == -1){
                                        gamex.activePlayerId = socket.id;
                                    }
                                    if(gamex.playerIds.indexOf(gamex.otherPlayerId) == -1){
                                        gamex.otherPlayerId = socket.id;
                                    }
                                    var x = JSON.stringify(gamex);
                                    client.set('gameRoom:'+roomId, x, function(err, gameSet){
                                        io.sockets.connected[socket.id].emit('GAME_STATUS', {'status' : gamex.status});
                                        io.sockets.connected[socket.id].emit('CONNECTED_2', {'id': socket.id, 'data' : gamex});
                                        io.sockets.connected[socket.id].emit('GAME', {'data' : gamex});
                                    });
                                }else{
                                    io.sockets.in(roomId).emit('RECONNECTED', {'id' : player.id});
                                }
                            };
                        return false;
                    }else{
                        gamex.players.push(player);
                        if(gamex.players.length == 1){
                            gamex.activePlayerId = socket.id;
                        }
                        if(gamex.players.length == 3){
                            gamex.status = 'closed';
                        }
                        var x = JSON.stringify(gamex);
                        client.set('gameRoom:'+roomId, x, function(err, gameSet){
                            io.sockets.connected[socket.id].emit('CONNECTED', {'id': socket.id, 'start' : gamex.status});
                            io.sockets.in(roomId).emit('GAME_STATUS', {'data' : gamex});
                        })
                    }
                })              
            })
        });
        socket.on('GAME', function (data){
            client.get('gameRoom:'+roomId, function (err, gameData){
                    if(err)
                        throw err;
                    var gamex = JSON.parse(gameData);
                    var gameEvent = data.data.gameEvent;
                    switch(gameEvent){
                        case "START_GAME":
                            Game.prototype.initDeck.call(gamex);
                            Game.prototype.distributeCards.call(gamex);
                            Game.prototype.updateHandsToMake.call(gamex);
                            gamex.gameTurn = 1;
                            gamex.gameState  ='SET_TRUMP';
                            gamex.gameEvent  ='SET_TRUMP';
                            Game.prototype.assignPlayerIds.call(gamex);
                            break;
                        case "NEXT_ROUND":
                            gamex = JSON.parse(gameString);
                            Game.prototype.initDeck.call(gamex);
                            Game.prototype.distributeCards.call(gamex);
                            Game.prototype.nextRound.call(gamex);
                            gamex.gameState  ='SET_TRUMP';
                            gamex.gameEvent  ='SET_TRUMP';
                            break;
                        case "SET_TRUMP":
                            gamex.trump = data.data.trump;
                            Game.prototype.distributeCards.call(gamex);
                            gamex.gameState  ='PLAY_CARD';
                            gamex.gameEvent  ='PLAY_CARD';
                            var y = Game.prototype.withdrawCards.call(gamex);
                            if(y){
                                gamex.gameState  ='WITHDRAW_CARD';
                                gamex.gameEvent  ='WITHDRAW';
                            }
                            break;
                        case "WITHDRAW_CARD":
                            gamex.cardIndex = data.data.card;
                            Game.prototype.withdrawCard.call(gamex);
                            gamex.gameState  = 'RETURN_CARD';
                            gamex.gameEvent ='RETURN';
                            break;
                        case "RETURN_CARD":
                            gamex.cardIndex = data.data.card;
                            Game.prototype.returnCard.call(gamex);
                            var y = Game.prototype.withdrawCards.call(gamex);
                                if(y){
                                    gamex.gameState  = 'WITHDRAW_CARD';
                                    gamex.gameEvent = 'WITHDRAW';
                                    var x = JSON.stringify(gamex);
                                }
                                else{
                                    gamex.gameState  ='PLAY_CARD';
                                    gamex.gameEvent = 'PLAY_CARD';
                                    console.log('play')
                                }
                            break;
                        case "PLAY_CARD":
                            gamex.cardPlayed = data.data.cardPlayed;
                            Game.prototype.playCard.call(gamex);
                            if((gamex.gameTurn % 3) == 1){
                                gamex.turnSuit = gamex.cardPlayed.suit;
                            }
                            if((gamex.gameTurn % 3) == 0){
                                Game.prototype.nextTurn.call(gamex);
                                Game.prototype.getTurnWinner.call(gamex);
                                gamex.gameState  ='PLAY_CARD';
                                gamex.gameEvent  = 'DECLARE_WINNER';
                            }else{
                                Game.prototype.nextTurn.call(gamex);
                                gamex.gameState  ='PLAY_CARD';
                                gamex.gameEvent  = 'CARD_PLAYED';
                            }
                        break;
                        default:
                            null
                        }
                        var x = JSON.stringify(gamex);
                        client.set('gameRoom:'+roomId, x, function(err, gameSet){
                            if(err)
                                throw err;
                            io.sockets.in(roomId).emit('GAME', {'data' : gamex});
                        });
                });
        });
        socket.on('sendMsg', function (data){
            client.get('user:'+socket.id, function (err, userData) {
                if(err)
                    throw err;
                // var x = JSON.parse(userData);
                var msg = data;
                var playerData = {
                    id : socket.id,
                    user : data.user
                }
                io.sockets.in(roomId).emit('msgRecieved', {'msg' : msg, 'player' : playerData});
            })
        })
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
            client.get('gameRoom:'+roomId, function (err, gameData){
                    if(!roomId){
                        return false;
                    }
                    if(!gameData){
                        return false;
                    }
                    socket.leave(roomId);
                    var gamex = JSON.parse(gameData);
                    gamex.gamePaused = true;
                    for (var i = gamex.players.length - 1; i >= 0; i--) {
                        if(gamex.players[i].id == socket.id){
                            gamex.players[i].id = undefined;
                            var playerLeftId = socket.id;
                        }
                    }
                    var n = 0;
                    for (var i = gamex.players.length - 1; i >= 0; i--) {
                        if(gamex.players[i].id == undefined){
                            n++;
                        }
                    }
                    if(n == 2){
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
                    }else{
                        var x = JSON.stringify(gamex);
                            client.set('gameRoom:'+roomId, x, function (err, gameData){
                                io.sockets.in(roomId).emit('DISCONNECTED' , {'id' : playerLeftId});
                            });
                    }
            });
            // client.srem('roomsFilled', roomId, function(err, data){
            //     if(err)
            //         throw err;
            // });
        });
	});
}
