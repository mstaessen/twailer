var StreamListener = require('./stream-listener')
  , Express        = require('express')
  , fs             = require('fs');
  
var app = new Express();
var streamListener = new StreamListener()
var writeConfig = function(channels) {
    
};
streamListener.on('subscribe', writeConfig(streamListener.subscriptions));
streamListener.on('unsubscribe', writeConfig(streamListener.subscriptions));

app.get('/subscribe/:email/:channel', function(req, res) {
  
});
app.get('/subscribe/:email/:channel', function(req, res) {
  
});
app.listen(3000);