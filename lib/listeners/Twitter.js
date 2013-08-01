var EventEmitter = require('events').EventEmitter,
    validator = require('validator'),
    Twit = require('twit');

function TwitterListener(config) {
    EventEmitter.call(this);

    this.twit = new Twit(config);
    this.channels = [];
    this.stream = null;

    var self = this;
    setInterval(function () {
        self.refreshStream();
    }, 1 * 60 * 60 * 1000);
    this.refreshStream();
}

TwitterListener.prototype = new EventEmitter();
TwitterListener.prototype.constructor = TwitterListener;

TwitterListener.prototype.track = function (channels) {
    if ('string' === typeof channels) {
        channels = [channels];
    }

    if (channels instanceof Array) {
        var self = this, changes = false;
        channels.forEach(function (channel) {
            if (-1 === self.channels.indexOf(channel) && self.isValidChannel(channel)) {
                self.channels.push(channel);
                changes = true;
            }
        });

        if (changes) {
            this.refreshStream();
        }
    }
};

TwitterListener.prototype.untrack = function (channels) {
    if ('string' === typeof channels) {
        channels = [channels];
    }

    if (channels instanceof Array) {
        var self = this, changes = false;
        channels.forEach(function (channel) {
            var index = self.channels.indexOf(channel);
            if (-1 !== index) {
                self.channels.splice(index, 1);
                changes = true;
            }
        });

        if (changes) {
            this.refreshStream();
        }
    }
};

TwitterListener.prototype.refreshStream = function () {
    if (this.channels.length) {
        var self = this;
        console.log("Refreshing stream to track %s", this.channels.join(', '));
        this.stream = this.twit.stream('statuses/filter', { track: this.channels });
        this.stream.on('tweet', function (tweet) {
            self.onTweet(tweet);
        });
        this.stream.on('connect', function (req) {
            console.log("Connecting to Twitter API.");
        });
        this.stream.on('reconnect', function (req, res, interval) {
            console.log("Reconnecting to Twitter API.");
        });
        this.stream.on('disconnect', function (msg) {
            console.log('disconnected because %s', msg);
        });
        this.stream.on('warning', function (warning) {
            console.log('Warning: %s', warning);
        });
        this.stream.on('error', function (error) {
            console.log(error);
        });
    } else {
        if (this.stream) {
            this.stream = null;
        }
    }
};

TwitterListener.prototype.onTweet = function (tweet) {
    var hashtags = tweet.entities.hashtags.map(function (input) {
        return '#' + input.text;
    });
    var mentions = tweet.entities.user_mentions.map(function (input) {
        return '@' + input.screen_name;
    });
    var post = {
        text: tweet.text,
        date: new Date(tweet.created_at),
        href: 'https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str,
        user: {
            name: tweet.user.name,
            username: tweet.user.screen_name,
            href: 'https://twitter.com/' + tweet.user.screen_name
        },
        channels: [].concat(hashtags).concat(mentions).channels.map(function (input) {
            return input.toLowerCase();
        })
    };
    this.emit('post', post);
};

TwitterListener.prototype.close = function () {
    if (this.stream) {
        this.stream.stop();
    }
};

TwitterListener.prototype.isValidChannel = function (channel) {
    try {
        // Hashtags start with a hash and can be maximally 60 chars long (API restriction)
        validator.check(channel).len(2, 60).regex(/\#[A-Za-z0-9_]/);
        return true;
    } catch (e) {
        try {
            // Usernames start with @ and can be maximally 16 chars long
            validator.check(channel).len(2, 16).regex(/\@[A-Za-z0-9_]/);
            return true;
        } catch (e) {
            return false;
        }
    }
};

exports = module.exports = TwitterListener;