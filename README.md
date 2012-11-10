# Twailer

Get an email whenever a tweet with a certain hashtag or mention is published.

## Requirements

* A mailserver (I am using postfix)
* Twitter API credentials (to be filled in in config.js)

## Workflow

### Subscribe 

If you want to get email updates for some hashtag or mention, simply send an email to 
subscribe@domain.tld with the hashtag (including #) or mention (including @) in the subject
field. If the subscription was successful, you will receive a confirmation email.

### Unsubscribe

If you no longer want to receive email updates, you can unsubscribe in a similar fasion:
send an email to unsubscribe@domain.tld. Supplying the hashtag or mention in the subject
field is optional. If you do not supply any, all your subscriptions will be removed.

## Questions, Pull Requests

Open an issue
