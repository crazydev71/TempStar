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

console.log( 'Notification Service started: ' + moment().toString() );

// Get all notifications that need to be sent
var Notification = app.models.Notification;
var notifications;

Notification.find({
    where: { 
        sentOn: '0000-00-00 00:00:00',
        sendTime: {lt: moment.utc().format('YYYY-MM-DD hh:ss')}
    }
})
.then( function( notifications ) {
    console.log( '- attempting to send ' + notifications.length + ' notifications' );
    return Promise.map( notifications, sendNotification );
})
.then( function( successfullNotifications ) {
    console.log( '- successful notifications:');
    console.dir( successfullNotifications );
    return Promise.map( successfullNotifications, function( sn ) {
        console.log( '- updating sn' );
        console.dir( sn );
        if ( sn != null ) {
            return sn.updateAttributes({
                sentOn:  moment.utc().format('YYYY-MM-DD hh:ss')
            });
        }
    });
})
.then( function( results ) {
    console.log( 'send results');
    console.dir( results );
    results = _.compact( results );
    console.log( 'compacted results' );
    console.log( results );
    console.log( '- sent ' + results.length + ' push notifications' );
    console.log( 'Notification Service ended:   ' + moment().toString() + '.');
})
.catch( function( err ) {
    console.log( '- error: ' + err.message );
    console.log( 'Notification Service ended:   ' + moment().toString() + '.');
});

function sendNotification( notification ) {
    return new Promise( function( resolve, reject ) {
        var n = notification.toJSON();
        console.log( '- sending notification' );
        console.dir( n );
        if ( ! n.user.registrationId ) {
            console.log( '- can\'t send notification id: ' + n.id + ' no reg token');
            resolve(null);
            return;
        }

        push.send( n.message, n.user.platform, n.user.registrationId )
        .then( function( pushResult ) {
            if ( pushResult.success == 1 ) {
                console.log( '- send notification id: ' + n.id );
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
