var Twitter   = require('twit')
  , config    = require('./config')
  , events    = require('events')
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
    events.EventEmitter.call(this);
    
    this.subscriptions = {};
    this.stream = null;
}

Util.inherits(StreamListener, events.EventEmitter);

StreamListener.prototype = {
    constructor: StreamListener,
    subscribe: function(email, channel) {
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
    },
    unsubscribe: function(email, channel) {
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
    },
    resetStream: function() {
        if(this.hasSubscriptions()) {
            var oldStream = this.stream;
            this.stream = twitter.stream('/statuses/filter', {track: this.subscriptions.keys()});
            this.stream.on('tweet', this.onTweet(tweet));
            oldStream.stop();
        }
    },
    onSubscribe: function(email, channel) {
        // The number of keywords in track does not match the number of keywords in subscriptions, reset
        if(this.subscriptions.keys().length != this.stream.oauth.params.track.length) {
            this.resetStream();
        }
    },
    onUnsubscribe: function(email, channel) {
        // The number of keywords in track does not match the number of keywords in subscriptions, reset
        if(this.subscriptions.keys().length != this.stream.oauth.params.track.length) {
            this.resetStream();
        }
    },
    onTweet: function(tweet) {
        console.log(tweet.text);
    },
    isValidEmail: function(email) {
        return Validator.check(email).isEmail();
    },
    isValidChannel: function(channel) {
        return Validator.check(channel).len(2, 16).regex(/@[A-Za-z0-9_]/) 
            || Validator.check(channel).len(2, 60).regex(/#[A-Za-z0-9_]/);
    }
}

exports = module.exports = StreamListener;