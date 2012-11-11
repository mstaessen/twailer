#!/usr/bin/env node
var Redis      = require('redis')
  , MailParser = require('mailparser').MailParser;

var mp = new MailParser();
mp.on('end', function(mail){
    var action = mail.to[0].address.toLowerCase().substr(0, mail.to[0].address.indexOf('@'));
    var client = Redis.createClient();
    var message = JSON.stringify({
        email:    mail.from[0].address,
        channel:  mail.subject
    });
    switch(action) {
        case "subscribe":
            client.publish('twailer.subscribe', message);
            break;
        case "unsubscribe":
            client.publish('twailer.unsubscribe', message);
            break;
    }
    client.quit();
});

process.stdin.resume();
process.stdin.setEncoding('ascii');
process.stdin.on('data', function(chunk) {
    mp.write(chunk);
});
process.stdin.on('end', function () {
    mp.end();
});