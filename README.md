# Twailer

Get an email whenever a tweet with a certain hashtag or mention is published.

## Workflow

### Subscribe 

If you want to get email updates for some hashtag or mention, simply send an email to 
subscribe@domain.tld with the hashtag (including #) or mention (including @) in the subject
field. If the subscription was successful, you will receive a confirmation email.

### Unsubscribe

If you no longer want to receive email updates, you can unsubscribe in a similar fasion:
send an email to unsubscribe@domain.tld. Supplying the hashtag or mention in the subject
field is optional. If you do not supply any, all your subscriptions will be removed.

## Requirements

* A mailserver (I am using postfix)
* A Redis server
* NodeJS
* Twitter API credentials (to be filled in in config.js)

## Installation

This installation guide is intended for Ubuntu and postfix. If you are using another 
MTA, you will have to figure out how to install this yourself. Installation is not that 
difficult ;)

First, lets make sure all the requirements are satisfied.

    apt-get install postfix redis-server nodejs

Now, let's install the source files

    mkdir -p /path/to/target/location && cd /path/to/target/location
    npm install twailer

Next, we need to configure postfix. First, we need a new transport method. In `master.conf`, add

    twailer   unix  -       n       n       -       -       pipe
      flags=FR user=twailer argv=/path/to/twailer/bin/twailer
      
Because your node installation may be different from mine, you might need to change the shebang. 
You could use `/usr/bin/env node` but then you will need to configure postfix to pass the `$PATH`
variable.

We want emails sent to `(un)?subscribe@domain.tld` delivered on this machine, so we need to add a 
mailbox domain in `main.cf`

    virtual_mailbox_domains = domain.tld [other domains]
    
We don't want to receive these mails in an inbox, we want them delivered to our new transport. In
`main.cf`, configure the location for the transport map.
   
    transport_maps = hash:/etc/postfix/transport
    
In `/etc/postfix/transport`, add the following lines:

    subscribe@domain.tld    twailer:
    unsubscribe@domain.tld  twailer:
    
Finally, we need to reload postfix. Don't forget to convert the transport map to Berkeley DB with `postmap`.

    postmap /etc/postfix/transport
    postfix reload

You're all set! You can now process incoming subscription mails.

To use the application, start the twailer process.

    node twailer.js 

## Questions, Pull Requests

Open an issue
