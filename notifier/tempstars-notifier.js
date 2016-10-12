#!/usr/bin/env node

var _       = require('lodash');
var Promise = require('bluebird');
var moment  = require('moment');
var app     = require( '../api/tempstars-api' );
var push    = require( 'push' );

push.init(
    app.get('gcmApiKey'),
    {
        key: app.get('apnKey'),
        keyId: app.get('apnKeyId'),
        teamId: app.get('apnTeamId')
    },
    app.get('pushEnv')
);

console.log( 'Notification Service started: ' + moment.utc().toString() );

var comparisonTime = moment.utc().format('YYYY-MM-DD hh:mm  ');
console.log( '- getting all unsent notifications before: ' + comparisonTime );

// Get all notifications that need to be sent
var Notification = app.models.Notification;
var notifications;

Notification.find({
    where: { 
        sentOn: '0000-00-00 00:00:00',
        sendTime: {lt: comparisonTime}
    }
})
.then( function( notifications ) {
    console.log( '- found ' + notifications.length + ' notifications to send' );
    return Promise.map( notifications, sendNotification );
})
.then( function( successfullNotifications ) {
    return Promise.map( successfullNotifications, function( sn ) {
        if ( sn != null ) {
            var sentOnTime = moment.utc().format('YYYY-MM-DD hh:mm');
            console.log( '- updating notification id: ' + sn.id + ' to SENT with sentOn: ' + sentOnTime );
            return sn.updateAttributes({
                sentOn:  sentOnTime,
                status: 1
            });
        }
    });
})
.then( function( results ) {
    results = _.compact( results );
    console.log( '- sent ' + results.length + ' push notifications' );
    console.log( 'Notification Service ended:   ' + moment.utc().toString() + '.');
})
.catch( function( err ) {
    console.log( '- error: ' + err.message );
    console.log( 'Notification Service ended:   ' + moment().toString() + '.');
});

function sendNotification( notification ) {
    return new Promise( function( resolve, reject ) {
        var n = notification.toJSON();
        console.log( '- sending notification id: ' + n.id );
        if ( ! n.user.registrationId ) {
            console.log( '- can\'t send notification id: ' + n.id + ' no reg token');
            resolve(null);
            return;
        }

        push.send( n.message, n.user.platform, n.user.registrationId )
        .then( function( pushResult ) {
            if ( pushResult.success == 1 ) {
                console.log( '- sent notification id: ' + n.id );
                resolve( notification );
            }
            else {
                console.log( '- send notification failed for id: ' + n.id );
                reject( new Error( 'push failed'));
            }
        })
        .catch( function(err) {
            console.log( '- send notification rejected for id: ' + n.id );
            reject( err );
        });
    });
}
