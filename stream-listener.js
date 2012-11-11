var Events    = require('events')
  , Util      = require('util')
  , Twitter   = require('twit')
  , Validator = require('validator')
  , config    = require('./config');
   
var twitter = new Twitter(config);   
   
var StreamListener = function(subscriptions) {
    Events.EventEmitter.call(this);
    
    this.subscriptions = subscriptions || {};
    this.stream = null;
    this.nbChannels = 0;
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
        this.stream = twitter.stream('statuses/filter', {track: Object.keys(this.subscriptions)});
        
        // capture this in self to prevent a scoping problem with the anonymous function
        var self = this;
        this.stream.on('tweet', function(tweet) {
            self.onTweet(tweet);
        });
        
        this.stream.on('connect', function(req) {
            console.log("Trying to connect...");
        });
        
        this.stream.on('reconnect', function(req, res, interval) {
            console.log("Trying to reconnect...");
        });
        
        // Twitter disconnects the oldest connection if more then one request is made
        this.stream.on('disconnect', function(msg) {
            console.log("disconnected: " + Util.inspect(msg));
        });
        
        console.log("Started a new stream tracking " + Object.keys(this.subscriptions).join(', '));
    }
};
    
StreamListener.prototype.onSubscribe = function(email, channel) {
    // The number of channels has changed, reset the stream...
    if(!this.stream || Object.keys(this.subscriptions).length != this.nbChannels) {
        this.resetStream();
        this.nbChannels = Object.keys(this.subscriptions).length;
    }
};
    
StreamListener.prototype.onUnsubscribe = function(email, channel) {
    // The number of channels has changed, reset the stream...
    if(Object.keys(this.subscriptions).length != this.nbChannels) {
        this.resetStream();
        this.nbChannels = Object.keys(this.subscriptions).length;
    }
};

StreamListener.prototype.onTweet = function(tweet) {
    console.log("Incoming tweet: " + tweet.text);
    this.emit('tweet', tweet);
};

StreamListener.prototype.hasSubscriptions = function() {
    return Object.keys(this.subscriptions).length != 0;
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