function SubscriptionStore() {
    this.map = {};
}

/**
 *
 * @param subscriber string
 * @param channels array|string
 * @param callback function(error, newChannels)
 */
SubscriptionStore.prototype.subscribe = function (subscriber, channels, callback) {
    if ('string' === typeof channels) {
        channels = [channels];
    }
    var newChannels = [];
    if (channels instanceof Array) {
        var self = this;
        channels.forEach(function (channel) {
            if (!self.map[channel]) {
                self.map[channel] = [];
                newChannels.push(channel);
            }
            self.map[channel].push(subscriber);
        });
    }
    callback(null, newChannels);
};

/**
 *
 * @param subscriber string
 * @param channels string|array
 * @param callback function(error, removedChannels)
 */
SubscriptionStore.prototype.unsubscribe = function (subscriber, channels, callback) {
    if (!channels || channels === '' || channels === []) {
        channels = Object.keys(this.map);
    }
    if ('string' === typeof channels) {
        channels = [channels];
    }
    var removedChannels = [];
    if (channels instanceof Array) {
        var self = this;
        channels.forEach(function (channel) {
            if (self.map[channel]) {
                var index = self.map[channel].indexOf(subscriber);

                if (-1 !== index) {
                    self.map[channel].splice(index, 1);
                }

                if (self.map[channel].length === 0) {
                    delete self.map[channel];
                    removedChannels.push(channel);
                }
            }
        });
    }
    callback(null, removedChannels);
};

/**
 *
 * @param channels string|array
 * @param callback function(error, {subscriber: [channel]})
 */
SubscriptionStore.prototype.getSubscribers = function (channels, callback) {
    var subscribers = {};
    if ('string' === typeof channels) {
        channels = [channels];
    }
    if (channels instanceof Array) {
        var self = this;
        channels.forEach(function (channel) {
            if (self.map[channel]) {
                self.map[channel].forEach(function (subscriber) {
                    if (!subscribers[subscriber]) {
                        subscribers[subscriber] = [];
                    }
                    subscribers[subscriber].push(channel);
                });
            }
        });
    }
    callback(null, subscribers);
};

/**
 *
 * @param callback function(error, [channel])
 */
SubscriptionStore.prototype.getChannels = function (callback) {
    callback(null, Object.keys(this.map));
};

/**
 *
 * @param callback function(error)
 */
SubscriptionStore.prototype.clear = function(callback) {
    this.map = {};
    callback(null);
};

module.exports = exports = SubscriptionStore;