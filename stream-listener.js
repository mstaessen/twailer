var Twitter   = require('twit')
  , config    = require('./config')
  , events    = require('events')
  , Util      = require('util'),
  , Validator = require('validator');
   
var twitter = new Twitter(config);   
   
var StreamListener = function() {
    events.EventEmitter.call(this);
    
    this.subscriptions = [];
    this.stream = null;
    
    this.on('subscribe', onSubscribe(email, channel));
    this.on('unsubscribe', onUnsubscribe(email, channel));
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
                this.emit('subscribe', email, channel);
            }
        } else {
            // TODO: Error handling
        }
    },
    unsubscribe: function(email, channel) {
        if(this.isValidEmail(email)) {
            if(channel != undefined && this.isValidChannel(channel) && this.subscriptions[channel]) {
                this.subscriptions[channel].splice(this.subscriptions[channel].indexOf(email), 1);
                this.emit('unsubscribe', email, channel);
            } else if(channel == undefined) {
                for(var channel in this.subscriptions) {
                    // Let's go recursive ^^
                    this.unsubscribe(email, channel);
                }
            } else {
                // TODO: Error handling
            }
        } else {
            // TODO: Error handling
        }
    },
    onSubscribe: function(email, channel) {
        
    },
    onUnsubscribe: function(email, channel) {
        
    },
    onTweet: function(tweet) {
        console.log(tweet);
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