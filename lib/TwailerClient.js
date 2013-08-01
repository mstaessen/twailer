var net = require('net');

var parsers = {
    email: require('./parsers/Email')
};

function TwailerClient(config) {
    this.config = config;
}

TwailerClient.prototype.subscribe = function (user, channels) {
    var socket = net.connect(this.config.socket);
    socket.write(JSON.stringify({
        event: 'subscribe',
        data: {
            email: user,
            channels: channels
        }
    }));
    socket.end();
};

module.exports = exports = TwailerClient;
