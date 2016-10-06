#!/usr/bin/env node

var _       = require('lodash');
var Promise = require('bluebird');
var moment  = require('moment');
var app     = require( '../api/tempstars-api' );
var push    = require( 'push' );

push.init( app.get('gcmApiKey') );

console.log( 'Notification Service running...');

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
    return Promise.map( successfullNotifications, function( sn ) {
        if ( sn != null ) {
            return sn.updateAttributes({
                sentOn:  moment.utc().format('YYYY-MM-DD hh:ss')
            });
        }
    });
})
.then( function( results ) {
    results = _.compact( results );
    console.log( '- sent ' + results.length + ' push notifications' );
    console.log( 'Notification Server completed.');
    process.exit(0);
})
.catch( function( err ) {
    console.log( 'error: ' + err.message );
    console.log( 'Notification Server completed.');
    process.exit(0);
});

function sendNotification( notification ) {
    return new Promise( function( resolve, reject ) {
        var n = notification.toJSON();
        if ( ! n.user.registrationId ) {
            console.log( '- can\'t send notification id: ' + n.id + ' no reg token');
            resolve(null);
            return;
        }
        push.send( n.message, [n.user.registrationId] )
        .then( function( pushResult ) {
            if ( pushResult.success == 1 ) {
                console.log( '- send notification id: ' + n.id );
                resolve( notification );
            }
            else {
                reject( new Error( 'push failed'));
            }
        })
        .catch( function(err) {
            reject( err );
        });
    });
}
