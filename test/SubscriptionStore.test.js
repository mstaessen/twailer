var SubscriptionStore = require('../lib/SubscriptionStore'),
    should = require('should');

describe('SubscriptionStore', function () {
    var store;

    beforeEach(function () {
        store = new SubscriptionStore();
    });

    describe("#subscribe()", function () {
        it("should not subscribe 'user' to []", function (done) {
            store.subscribe('user', [], function (error, newChannels) {
                newChannels.should.be.empty;
                store.getChannels(function (error, channels) {
                    channels.should.be.empty;
                    done();
                });
            });
        });

        it("should not subscribe 'user' to null", function (done) {
            store.subscribe('user', null, function (error, newChannels) {
                newChannels.should.be.empty;
                store.getChannels(function (error, channels) {
                    channels.should.be.empty;
                    done();
                });
            });
        });

        it("should subscribe 'user' to 'channel'", function (done) {
            store.subscribe('user', 'channel', function (error, newChannels) {
                newChannels.should.eql(['channel']);
                store.getSubscribers('channel', function (error, subscribers) {
                    subscribers.should.eql({
                        'user': ['channel']
                    });
                    done();
                });
            });
        });

        it("should subscribe 'user' to [channel]", function (done) {
            store.subscribe('user', ['channel'], function (error, newChannels) {
                newChannels.should.eql(['channel']);
                store.getSubscribers('channel', function (error, subscribers) {
                    subscribers.should.eql({
                        'user': ['channel']
                    });
                    done();
                });
            });
        });

        it("should subscribe 'user' to ['multiple', 'channels']", function (done) {
            store.subscribe('user', ['multiple', 'channels'], function (error, newChannels) {
                newChannels.should.eql(['multiple', 'channels']);
                store.getSubscribers(['multiple', 'channels'], function (error, subscribers) {
                    subscribers.should.eql({
                        'user': ['multiple', 'channels']
                    });
                    done();
                });
            });
        });
    });

    describe("#unsubscribe()", function () {
        it("should unsubscribe 'user' from 'channel'", function (done) {
            store.subscribe('user', 'channel', function (error, newChannels) {
                newChannels.should.eql(['channel']);
                store.unsubscribe('user', 'channel', function (error, removedChannels) {
                    removedChannels.should.eql(['channel']);
                    store.getSubscribers('channel', function (error, subscribers) {
                        subscribers.should.eql({});
                        done();
                    });
                });
            });
        });
    });

    describe("#getSubscribers()", function () {

    });

    describe("#getChannels()", function () {

    });
});