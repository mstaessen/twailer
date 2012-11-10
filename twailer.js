var Util           = require('util')
  , Redis          = require('redis')
  , NodeMailer     = require('nodemailer')
  , StreamListener = require('./stream-listener');
  
var streamListener = new StreamListener();
var mailTransport  = NodeMailer.createTransport("SMTP");
var client         = Redis.createClient();

// TODO: streamListener.on('subscribe', writeConfig(streamListener.subscriptions));
// TODO: streamListener.on('unsubscribe', writeConfig(streamListener.subscriptions));

streamListener.on('subscribe', function(email, channel) {
    // TODO: elaborate
    mailTransport.sendMail({
        from:                 "twailer@twailer.mstaessen.be",
        to:                   email,
        subject:              "[" + channel + "] Subscription confirmation",
        generateTextFromHTML: true,
        html:                 "<p>You successfully subscribed to the channel '" + channel + "'</p>"
    });
});

streamListener.on('unsubscribe', function(email, channel) {
    // TODO: elaborate
    mailTransport.sendMail({
        from:                 "twailer@twailer.mstaessen.be",
        to:                   email,
        subject:              "[" + channel + "] Subscription removal confirmation",
        generateTextFromHTML: true,
        html:                 "<p>You successfully unsubscribed from the channel '" + channel + "'</p>"
    });
});

streamListener.on('tweet', function(tweet) {
    console.log("Received: " + tweet.text);
    
    var hashtags = tweet.entities.hashtags;
    var user_mentions = tweet.entities.user_mentions;
    var subscribers = {};
    
    // Find out which users follow some of the hashtags in this post
    for(var i = 0; i < hashtags.length; i++) {
        if(streamListener.subscriptions[hashtags[i]]) {
            for(var j = 0; j < streamListener.subscriptions[hashtags[i]].length; j++) {
                if(!subscribers[streamListener.subscriptions[hashtags[i]][j]]) {
                    subscribers[streamListener.subscriptions[hashtags[i]][j]] = [];
                    console.log("Added " + subscribers[streamListener.subscriptions[hashtags[i]][j]] + " for " + hashtags[i]);
                }
                subscribers[streamListener.subscriptions[hashtags[i]][j]].push("[" + hashtags[i] + "]");
            }
        }
    }
    
    // Find out which users follow some of the user_mentions in this post
    for(var i = 0; i < user_mentions.length; i++) {
        if(streamListener.subscriptions[user_mentions[i]]) {
            for(var j = 0; j < streamListener.subscriptions[user_mentions[i]].length; j++) {
                if(!subscribers[streamListener.subscriptions[user_mentions[i]][j]]) {
                    subscribers[streamListener.subscriptions[user_mentions[i]][j]] = [];
                }
                subscribers[streamListener.subscriptions[user_mentions[i]][j]].push("[" + user_mentions[i] + "]");
            }
        }
    } 
    
    console.log(Util.inspect(subscribers));
    
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
