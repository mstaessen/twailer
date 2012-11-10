#!/usr/local/bin/node

var fs         = require('fs')
  , http       = require('http')
  , MailParser = require('mailparser').MailParser;

var rawMail = '';
var mp = new MailParser();
mp.on('end', function(mail){
    var action = mail.to[0].address.toLowerCase().substr(0, mail.to[0].address.indexOf('@'));
    var track = mail.subject;
    var subscriber = mail.from[0].address;
    switch(action) {
        case "subscribe":
            console.log("Subscribe " + subscriber + " to " + track);
            break;
        case "unsubscribe":
            console.log("Unsubscribe " + subscriber + " from " + track);
            break;
    }  

    fs.writeFile('/home/twailer/msg', rawMail, function(err) {
        if(err) {
            process.stderr.write('failed to write');
        }
    });  
});

process.stdin.resume();
process.stdin.setEncoding('ascii');
process.stdin.on('data', function(chunk) {
  mp.write(chunk);
  rawMail += chunk;
});
process.stdin.on('end', function () {
  mp.end();
});