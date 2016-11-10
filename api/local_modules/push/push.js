
var Promise = require('bluebird');
var gcm     = require('node-gcm');
var apn     = require('apn');

var gcmSender;
var apnSender;
var apnToken;
var isProd;

function init( gcmApiKey, aToken, env ) {

    //console.log( 'push apn initialized with env: ' + env );
    isProd = (env === 'prod');
    console.log( 'push apn is prod: ' + isProd );

    gcmSender = new gcm.Sender( gcmApiKey );

    apnToken = aToken;
    apnSender = new apn.Provider({
        token: apnToken,
        production: isProd
    });
}

function send( message, platform, regToken ) {

    //console.log( 'sending push notification' );

    if ( platform == 'iOS' ) {
        return sendiOSMessage( message, regToken );
    }
    else {
        return sendAndroidMessage( message, regToken );
    }
}

function sendiOSMessage( message, regToken ) {
    return new Promise( function( resolve, reject ) {
        var response;

        if ( ! apnSender ) {
            console.log( '- iOS push not initialized');
            reject( new Error( 'iOS push not initialized.'));
            return;
        }

        if ( ! regToken ) {
            console.log( '- iOS token is invalid' );
            // Don't fail
            resolve( {success: 0} );
            return;
        }

        var msg = new apn.Notification();
        msg.topic = 'ca.version1.TempStars';
        msg.alert = message;
        msg.expiry = Math.floor(Date.now() / 1000) + 3600 * 24; // Expires in 24 hours

        apnSender.send( msg, [regToken] )
        .then( function( result ) {
            if ( result.failed.length == 0 ) {
                console.log( '- iOS push message sent' );
                response = { success: 1 };
            }
            else {
                console.log( '- iOS push message failed' );
                if ( result.failed[0].status == '500' ) {
                    apnSender = new apn.Provider({
                        token: apnToken,
                        production: isProd
                    });
                    apnSender.send( msg, [regToken] )
                    .then( function( result ) {
                        if ( result.failed.length == 0 ) {
                            console.log( '- iOS push message2 sent' );
                            response = { success: 1 };
                            resolve( response );
                            return;
                        }
                    })
                }
                console.dir( result, {depth:null} );
                response = { success: 0 };
            }
            resolve( response );
        })
        .catch( function( err ) {
            console.log( '- error sending iOS push message');
            console.log( err.message );
            reject( err );
        });
    });
}

function sendAndroidMessage( message, regToken ) {
    return new Promise( function( resolve, reject ) {

        if ( ! gcmSender ) {
            console.log( '- Android push not initialized');
            reject( new Error( 'Android push not initialized.'));
            return;
        }

        if ( ! regToken ) {
            console.log( '- Android token is invalid' );
            resolve( {success: 0} );
            return;
        }

        var msg = new gcm.Message({
            notification: {
                title: 'TempStars',
                body: message,
            },
            priority: 'high'
        });

        gcmSender.send( msg, { registrationTokens: [regToken] }, function (err, response) {
            if (err) {
                console.log( '- error sending Android message: ' + err.message );
                reject( err );
            }
            else {
                console.log( '- sent Android message' );
                resolve( response );
            }
        });
    });
}

module.exports = {
    init,
    send
};
