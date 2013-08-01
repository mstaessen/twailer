# Twailer v1.0.0 [![Build Status](https://secure.travis-ci.org/mstaessen/twailer.png)](http://travis-ci.org/mstaessen/twailer)

Twailer is a little robot that monitors certain channels on Social Media. It can send you _realtime_ notifications
whenever somebody tweets with a certain hashtag/mention.

## What's new in version 1?

After 9 months of prototype evaluation, it is time for a complete rewrite. The previous version (v0) was a bugged, quick
and dirty prototype. The next version (v1) focusses on stability and modularity which will allow users to track more
social media.

### Pluggable Architecture

Basically, Twailer handles three types of tasks:
- Social media monitoring (SourceMonitor)
- Subscription management (SubscriptionStore)
- Sending notifications (NotificationHandler)

Each of these tasks is replaceable with a custom implementation in order to suit your needs.

<pre>
                                          +-----------------------+
                                          |                       |
                                          |     SourceMonitor     |
                                          |                       |
                                          +-----------------------+
                                                    ^   |
                                  channels to track |   | posts
                                                    |   v
+-----------------------+                 +-----------------------+                +----------------------+
|                       |  (un)subscribe  |                       |  notification  |                      |
|     TwailerClient     |     request     |        Twailer        |    commands    |  NotificationSender  |
|                       | --------------> |                       | -------------> |                      |
+-----------------------+                 +-----------------------+                +----------------------+
                                                    ^   |
                                       subscription |   | subscription
                                                    |   v
                                          +-----------------------+
                                          |                       |
                                          |   SubscriptionStore   |
                                          |                       |
                                          +-----------------------+
</pre>

### Work In Progress

- [x] Use Unix sockets instead of Redis Pub/Sub
- [ ] `SourceMonitor`s
    - [x] `TwitterMonitor`
    - [ ] ...
- [ ] `SubscriptionStore`s
    - [x] InMemorySubscriptionStore
    - [ ] MongoSubscriptionStore
    - [ ] ...
- [ ] `NotificationSender`s
    - [ ] `EmailSender`
    - [ ] ...

## Issues

Create a new ticket on GitHub.