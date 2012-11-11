var FileSystem = require('fs');

module.exports = {
    backup: function(subscriptions) {
        FileSystem.writeFile('./subscriptions.json', JSON.stringify(subscriptions), function(error) {
            if(error) {
                console.log("Backup failed.");
            } else {
                console.log("Backup succeeded");
            }
        });
    },
    restore: function() {
        try {
            return JSON.parse(FileSystem.readFileSync('./subscriptions.json', 'utf8'));
        } catch (e) {
            return {};
        }
    }
}