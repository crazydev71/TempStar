
var Promise = require('bluebird');
var gcm     = require('node-gcm');

var gcmSender;

function init( apiKey ) {
    gcmSender = new gcm.Sender( apiKey );
}

function send( message, regTokens ) {
    return new Promise( function( resolve, reject ) {

        console.log( 'sending push notification' );
        if ( ! gcmSender ) {
            console.log( 'push not initialized');
            reject( new Error( 'push not initialized.'));
            return;
        }

        if ( ! regTokens ) {
            console.log( '1 token is invalid' );
        }
        if ( ! regTokens.length ) {
            console.log( '2 token is invalid' );
        }
        if ( ! regTokens[0] ) {
            console.log( '3 token is invalid' );
        }
        if ( ! regTokens || ! regTokens.length || ! regTokens[0] ) {
            console.dir( regTokens );
            console.log( 'token is invalid' );
            resolve();
            return;
        }
        var notification = new gcm.Message({
            "notification": {
                "title": "TempStars",
                "body": message,
            },
            "priority": "high"
        });

        gcmSender.send( notification, { registrationTokens: regTokens }, function (err, response) {
            if (err) {
                console.log( 'error sending message: ' + err.message );
                reject( err );
            }
            else {
                console.log( 'sent message' );
                resolve( response );
            }
        });
    });
}

module.exports = {
    init,
    send
};
