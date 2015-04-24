
var passport = require('passport');
// var LocalStrategy    = require('passport-local').Strategy;
// var TwitterStrategy  = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');
var configAuth = require('./auth');


module.exports = function(app, passport) {
    // var client = app.get('redisClient');
    // var customSession = app.get('sessionStore');

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    // passport.use('twitter', new TwitterStrategy({

    //     consumerKey     : configAuth.twitterAuth.consumerKey,
    //     consumerSecret  : configAuth.twitterAuth.consumerSecret,
    //     callbackURL     : configAuth.twitterAuth.callbackURL

    // },
    passport.use('facebook', new FacebookStrategy({
        clientID     : configAuth.facebookAuth.clientID,
        clientSecret  : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },
    function(token, tokenSecret, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Twitter
        process.nextTick(function() {

            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);
                // if the user is found then log them in
                if (user) {
                    // var c = JSON.stringify(user.facebook);
                    // client.set('userInfo:'+user.id, c, function (err, userInfo){
                    //     if(err)
                    //         throw err;
                    // });
                    return done(null, user); // user found, return that user
                    customSession.set({'user' : user});
                } else {
                    // if there is no user, create them
                    var newUser                 = new User();
                    // set all of the user data that we need
                    newUser.facebook.id          = profile.id;
                    newUser.facebook.token       = profile.id;
                    newUser.facebook.name    = profile._json.name;
                    newUser.facebook.img = 'https://graph.facebook.com/'+profile.id+'/picture?type=square';

                    // save our user into the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        // var c = JSON.stringify(newUser.facebook);
                        // client.set('userInfo:'+newUser.facebook.id, c, function (err, userInfo){
                        //     if(err)
                        //         throw err;
                        // });
                        return done(null, newUser);
                        customSession.set({'user' : user});
                    });
                }
            });

    });

    }));

};


