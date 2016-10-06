
var Promise = require('bluebird');
var gcm     = require('node-gcm');

var gcmSender;

function init( apiKey ) {
    gcmSender = new gcm.Sender( apiKey );
}

function send( message, regTokens ) {
    return new Promise( function( resolve, reject ) {

        if ( ! gcmSender ) {
            reject( new Error( 'push not initialized.'));
        }

        var notification = new gcm.Message({
            "notification": {
                "title": "TempStars",
                "body": message
            }
        });

        gcmSender.send( notification, { registrationTokens: regTokens }, function (err, response) {
            if (err) {
                reject( err );
            }
            else {
                resolve( response );
            }
        });
    });
}

module.exports = {
    init,
    send
};
