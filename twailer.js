var StreamListener = require('./stream-listener')
  , Express        = require('express')
  , fs             = require('fs')
  , http           = require('http')
  , NodeMailer     = require("nodemailer");
  
var app            = new Express();
var streamListener = new StreamListener()
var mailTransport  = NodeMailer.createTransport("Sendmail");

//var writeConfig = function(channels) {
//    
//};

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

app.get('/subscribe/:email/:channel', function(req, res) {
    streamListener.subscribe(email, channel);
});
app.get('/subscribe/:email/:channel', function(req, res) {
    streamListener.unsubscribe(email, channel);  
});

http.createServer(app).listen(3000, '127.0.0.1');