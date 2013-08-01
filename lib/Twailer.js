var EventEmitter = require('events').EventEmitter,
    net = require('net'),
    Event = require('./Event');

function Twailer(config) {
    // "super()"
    EventEmitter.call(this);

    var self = this;
    this.socket = net.createServer(function (conn) {
        conn.on('data', function (data) {
            var event = JSON.parse(data.toString());
            if (event instanceof Object) {
                self.process(event);
            }
        });
    });

    this.socket.listen(config.socket, function () {
        console.log('Listening on %s', config.socket);
    });
}
Twailer.prototype = new EventEmitter();
Twailer.prototype.constructor = Twailer;

Twailer.prototype.process = function (event) {
    if (event && event.event && event.data) {
        switch(event.type) {
            case Event.SUBSCRIBE:
                if (event.data.subscriber && event.data.channels) {
                    this.subscribe(user, channels);
                }
                break;
            case Event.UNSUBSCRIBE:
                if (event.data.subscriber && event.data.channels) {
                    this.subscribe(user, channels);
                }
                break;
            default:
                break;
        }
    }
};

Twailer.prototype.close = function () {
    this.socket.close();
};

module.exports = exports = Twailer;