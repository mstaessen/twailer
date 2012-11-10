var Twitter   = require('twit')
  , config    = require('./config')
  , Events    = require('events')
  , Util      = require('util')
  , Validator = require('validator');

Object.prototype.keys = function() {
    var keys = [];
    for(var key in this) {
        keys.push(key);
    }
    return keys;
};
   
var twitter = new Twitter(config);   
   
var StreamListener = function() {
    Events.EventEmitter.call(this);
    
    this.subscriptions = {};
    this.stream = null;
}

Util.inherits(StreamListener, Events.EventEmitter);


StreamListener.prototype.subscribe = function(email, channel) {
    if(this.isValidChannel(channel) && this.isValidEmail(email)) {
        // Create channel if it does not exist
        if(!this.subscriptions[channel]) {
            this.subscriptions[channel] = [];
        }
            
        // Subscribe email if it is not already subscribed
        if(this.subscriptions[channel].indexOf(email) == -1) {
            this.subscriptions[channel].push(email);
            this.onSubscribe(email, channel);
            this.emit('subscribe', email, channel);
        }
    } else {
        // TODO: Error handling
        console.log("error: invalid email or channel");
    }
};
    
StreamListener.prototype.unsubscribe = function(email, channel) {
    if(this.isValidEmail(email)) {
        if(channel != undefined && this.isValidChannel(channel) && this.subscriptions[channel]) {
            this.subscriptions[channel].splice(this.subscriptions[channel].indexOf(email), 1);
            this.onUnsubscribe(email, channel);
            this.emit('unsubscribe', email, channel);
                
            // Remove the channel if nobody is left
            if(this.subscriptions[channel].length == 0) {
                delete this.subscriptions[channel];
            }
        } else if(channel == undefined) {
            for(var channel in this.subscriptions) {
                // Let's go recursive ^^
                this.unsubscribe(email, channel);
            }
        } else {
            // TODO: Error handling
            console.log("error: invalid channel");
        }
    } else {
        // TODO: Error handling
        console.log("error: invalid address");
    }
};
    
StreamListener.prototype.resetStream = function() {
    if(this.hasSubscriptions()) {
        var oldStream = this.stream;
        this.stream = twitter.stream('/statuses/filter', {track: this.subscriptions.keys()});
        this.stream.on('tweet', this.onTweet(tweet));
        oldStream.stop();
    }
};
    
StreamListener.prototype.onSubscribe = function(email, channel) {
    // The number of keywords in track does not match the number of keywords in subscriptions, reset
    if(this.subscriptions.keys().length != this.stream.oauth.params.track.length) {
        this.resetStream();
    }
};
    
StreamListener.prototype.onUnsubscribe = function(email, channel) {
    // The number of keywords in track does not match the number of keywords in subscriptions, reset
    if(this.subscriptions.keys().length != this.stream.oauth.params.track.length) {
        this.resetStream();
    }
};

StreamListener.prototype.onTweet = function(tweet) {
    console.log(tweet.text);
};
    
StreamListener.prototype.isValidEmail = function(email) {
    try {
        Validator.check(email).isEmail();
        return true;
    } catch (e) {
        return false;
    }
};
    
StreamListener.prototype.isValidChannel = function(channel) {
    try {
        // Hashtags start with a hash and can be maximally 60 chars long (API restriction)
        Validator.check(channel).len(2, 60).regex(/\#[A-Za-z0-9_]/);
        return true;
    } catch (e) {
        try {
            // Usernames start with @ and can be maximally 16 chars long
            Validator.check(channel).len(2, 16).regex(/\@[A-Za-z0-9_]/);
            return true;
        } catch (e) {
            return false;
        }
    }
};

exports = module.exports = StreamListener;