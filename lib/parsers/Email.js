var MailParser = require('mailparser').MailParser,
    Event = require('../Event');

function EmailParser() {};
EmailParser.prototype.parse = function (inputStream, callback) {
    var mp = new MailParser();
    mp.on('end', function (mail) {
        var addressee = mail.to[0].address.toLowerCase().substr(0, mail.to[0].address.indexOf('@'));
        var channels = mail.subject.split(',').map(function (input) {
            return input.trim();
        });
        var subscriber = mail.from[0].address;

        switch (addressee) {
            case 'subscribe':
                callback({
                    type: Event.SUBSCRIBE,
                    data: {
                        subscriber: subscriber,
                        channels: channels
                    }
                });
                break;
            case 'unsubscribe':
                callback({
                    type: Event.UNSUBSCRIBE,
                    data: {
                        subscriber: subscriber,
                        channels: channels
                    }
                });
                break;
        }
    });
};

module.exports = exports = EmailParser;