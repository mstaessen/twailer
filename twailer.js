var Redis          = require('redis')
  , NodeMailer     = require('nodemailer')
  , StreamListener = require('./stream-listener');
  
var streamListener = new StreamListener();
var mailTransport  = NodeMailer.createTransport("Sendmail");
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
