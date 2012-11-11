var Util           = require('util')
  , Redis          = require('redis')
  , NodeMailer     = require('nodemailer')
  , StreamListener = require('./stream-listener')
  , Subscriptions  = require('./subscriptions');
  
/**************************
 ****  Mail Transport  ****
 **************************/
   
var mailTransport  = NodeMailer.createTransport("SMTP");

/**************************
 ****  StreamListener  ****
 **************************/
  
var streamListener = new StreamListener(Subscriptions.restore());

streamListener.on('subscribe', function(email, channel) {
    Subscriptions.backup(streamListener.subscriptions);
});

streamListener.on('unsubscribe', function(email, channel) {
    Subscriptions.backup(streamListener.subscriptions);
});

streamListener.on('subscribe', function(email, channel) {
    // TODO: elaborate, use rendering engine
    mailTransport.sendMail({
        from:                 "twailer@twailer.mstaessen.be",
        to:                   email,
        subject:              "[" + channel + "] Subscription confirmation",
        generateTextFromHTML: true,
        html:                 "<p>You successfully subscribed to the channel '" + channel + "'</p>"
    });
});

streamListener.on('unsubscribe', function(email, channel) {
    // TODO: elaborate, use rendering engine
    mailTransport.sendMail({
        from:                 "twailer@twailer.mstaessen.be",
        to:                   email,
        subject:              "[" + channel + "] Subscription removal confirmation",
        generateTextFromHTML: true,
        html:                 "<p>You successfully unsubscribed from the channel '" + channel + "'</p>"
    });
});

streamListener.on('tweet', function(tweet) {
    var hashtags = tweet.entities.hashtags;
    var user_mentions = tweet.entities.user_mentions;
    var subscribers = {};
    
    // Iterate over all the hashtags in the tweet
    for(var i = 0; i < hashtags.length; i++) {
        // The Twitter API strips the hash
        var tag = '#' + hashtags[i].text;
        // We're tracking this hashtag
        if(streamListener.subscriptions[tag]) {
            var emails = streamListener.subscriptions[tag];
            for(var j = 0; j < emails.length; j++) {
                var email = emails[j];
                if(!subscribers[email]) {
                    subscribers[email] = [];
                }
                subscribers[email].push("[" + tag + "]");
            }
        }
    }
    
    // Iterate over all the user_mentions in the tweet
    for(var i = 0; i < user_mentions.length; i++) {
        // The Twitter API strips the at-sign
        var user = '@' + user_mentions[i].screen_name;
        // We're tracking this user
        if(streamListener.subscriptions[user]) {
            var emails = streamListener.subscriptions[user];
            for(var j = 0; j < emails.length; j++) {
                var email = emails[j];
                if(!subscribers[email]) {
                    subscribers[email] = [];
                }
                subscribers[email].push("[" + user + "]");
            }
        }
    }
    
    for(var subscriber in subscribers) {
        mailTransport.sendMail({
            from:                 "twailer@twailer.mstaessen.be",
            to:                   subscriber,
            subject:              subscribers[subscriber].join(' '),
            generateTextFromHTML: true,
            html:                 '<blockquote class="twitter-tweet">'
                                + '<p>' + tweet.text + '</p>&mdash; ' + tweet.user.name + ' (@' + tweet.user.screen_name + ') '
                                + '<a href="https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '" data-datetime="' + tweet.created_at + '">' + tweet.created_at + '</a>'
                                + '</blockquote>'
                                + '<script src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
        });
        console.log("Sent mail to " + subscriber);
    }
});

/************************
 ****  Redis Client  ****
 ************************/

var client = Redis.createClient();

client.on('connect', function() {
    console.log("Successfully connected to redis server!");
});

client.on('subscribe', function(channel, count) {
    console.log("Successfully subscribed to " + channel);
});

client.on('message', function(channel, message) {
    var msg = JSON.parse(message)
    switch(channel) {
        case 'twailer.subscribe':
            console.log("Received 'subscribe to " + msg.channel + " message' from " + msg.email);
            streamListener.subscribe(msg.email, msg.channel);
            break;
        case 'twailer.unsubscribe':
            console.log("Received 'ubsubscribe from " + msg.channel + " message' from " + msg.email);
            streamListener.unsubscribe(msg.email, msg.channel);            
            break;
    }
});

client.subscribe('twailer.subscribe');
client.subscribe('twailer.unsubscribe');
