var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');

var redis = require('redis');
var RedisStore = require('connect-redis')(session);

//create two redis clients. One for publish message channel. Other for Subscribing message channel
var redisPub = redis.createClient();
var redisSub = redis.createClient();
var redisClient = redis.createClient();

var socket = require('socket.io');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('game325','root','');



var flash = require('connect-flash');
var port     = process.env.PORT || 3000;

var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var config = {
    'session' : {
        'secret' : 'nightsinwhitesatin'
    }
}

var app = express();
// Enable CORS
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allowedCORSOrigins);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
};
app.use(allowCrossDomain);

// var routes = require('./routes/index');
// var users = require('./routes/users');
var mongoose = require('mongoose');

var configDB = require('./config/DBConfig.js');

var socialAuth = require('./config/auth');

//mongoose.connect(configDB.url);

app.set('config', config);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//to pass the redis clienst along with the app
app.set('redisPub', redisPub);
app.set('redisSub', redisSub);
app.set('redisClient', redisClient);

app.set('mongooseClient', mongoose);


//app.set('session', session);
app.set('sessionStore', new RedisStore({client : redisClient}));
//session.store({'user' : 123});

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.session.secret));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'www/app')));
app.set('rootDir',__dirname);
app.use(express.static(path.join(__dirname, 'www')));

app.use(session({
    key : 'gameApp',
    store : app.get('sessionStore'),
    secret : 'seasonsofthewitch'
}));
app.use(flash());



require('./models/user');
require('./config/passport')(app, passport);



app.use(passport.initialize());
app.use(passport.session());

app.use(express.Router());
// var routes = require('./routes/routes')(app, passport);
// app.use('/', routes);
// app.use('/users', users);
require('./routes/routes')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});
var server  = require('http').createServer(app).listen(port, function(req, res){
	console.log("Magic happens on port "+ port);
});

require('./socket')(app, server);
// module.exports = app;
