#!/usr/bin/env node

var _       = require('lodash');
var moment  = require('moment');
var app     = require( '../api/tempstars-api' );
var push    = require( 'push' );
var Promise = require('bluebird');

push.init(
    app.get('gcmApiKey'),
    {
        key: app.get('apnKey'),
        keyId: app.get('apnKeyId'),
        teamId: app.get('apnTeamId')
    },
    app.get('pushEnv')
);

var Notification = app.models.Notification;

var notificationStatus = {
    UNSENT: 0,
    SENT: 1,
    FAILED: 2
};

var MAX_ATTEMPTS = 10;


console.log( 'Notification Service started: ' + moment.utc().toString() );

getNotifications()
.then( sendNotifications )
.then( function( results ) {
    results = _.compact( results );
    console.log( '- sent ' + results.length + ' push notifications' );
})
.catch( function( err ) {
    console.log( '- error: ' + err.message );
})
.finally( function() {
    console.log( 'Notification Service ended:   ' + moment().toString() + '.');
})

function getNotifications() {
    return new Promise( function( resolve, reject ) {
        var comparisonTime = moment.utc().format('YYYY-MM-DD HH:mm');
        console.log( '- getting all unsent notifications before: ' + comparisonTime );

        // Get all notifications that need to be sent
        Notification.find({ where: { status: notificationStatus.UNSENT, sendTime: {lt: comparisonTime}}})
        .then( function( notifications ) {
            resolve( notifications );
        })
        .catch( function( err ) {
            reject( err );
        });
    });
}

function sendNotifications( notifications ) {
    console.log( '- found ' + notifications.length + ' notifications to send' );
    return Promise.map( notifications, sendNotification,  { concurrency: 1} );
}

function sendNotification( notification ) {
    return new Promise( function( resolve, reject ) {

        console.log( '- sending notification id: ' + notification.id );

        checkMaxAttempts( notification )
        .then( send )
        .then( function( status ) {
            resolve( status );
        })
        .catch( function( err ) {
            resolve( false );
        });
    });
}

function checkMaxAttempts( notification ) {
    return new Promise( function( resolve, reject ) {

        var status;
        var attempts = notification.attempts + 1;

        // If hit max attempts, change status to failed and get out; otherwise update the number of attempts
        // console.log( '- checking number of attempts' );
        if ( attempts >= MAX_ATTEMPTS ) {
            status = notificationStatus.FAILED;
        }
        else {
            status = notificationStatus.UNSENT;
        }

        notification.updateAttributes({
            attempts: attempts,
            status: status
        })
        .then( function( n ) {
            if ( status == notificationStatus.FAILED ) {
                console.log( '- updated notification id: ' + notification.id + ' to FAILED, exceeeded max attempts' );
                reject( false );
            }
            else {
                console.log( '- updated notification id: ' + notification.id + ' attempts: ' + attempts );
                resolve( n );
            }
            return;
        })
        .catch( function( err ) {
            console.log( '- ERROR updating notification id: ' + notification.id );
            reject( err );
            return;
        });
    });
}

function send( notification ) {
    return new Promise( function( resolve, reject ) {
        var n = notification.toJSON();

        // Attempt to send push message
        // console.log( '- attempting to push ' + n.id );
        push.send( n.message, n.user.platform, n.user.registrationId )
        .then( function( pushResult ) {
            var sentOnTime = moment.utc().format('YYYY-MM-DD HH:mm');

            // If worked, update to SENT and log sentOn time
            if ( pushResult.success == 1 ) {
                console.log( '- sent notification id: ' + n.id );
                notification.updateAttributes({
                    sentOn:  sentOnTime,
                    status: notificationStatus.SENT
                })
                .then( function() {
                    console.log( '- updated notification id: ' + n.id + ' to SENT with sentOn: ' + sentOnTime );
                    resolve( true );
                })
                .catch( function(err ) {
                    console.log( '- ERROR updating notification id: ' + n.id + ' to SENT' );
                    reject( false );
                });
            }
            else {
                console.log( '- send notification failed for id: ' + n.id );
                reject( false );
            }
        })
        .catch( function() {
            console.log( 'outer catch');
            reject( false );
        });
    });
}
