
'use strict';

var _        = require( 'lodash');
var Promise  = require( 'bluebird' );
var moment   = require( 'moment' );

var loopback,
    app;

function createJobNotifications( lb, a, jobId, message ) {
    loopback = lb;
    app = a;

    return new Promise( function( resolve, reject ) {
        var Job = app.models.Job;
        var Hygienist = app.models.Hygienist;
        var Notification = app.models.Notification;
        var job;
        var dentistLocation;
        var MAX_DISTANCE = 110;

        // Determine notification times
        var now,
            minutesTillStart,
            interval,
            favSendTime,
            above4SendTime,
            above3SendTime,
            above2SendTime,
            bottomSendTime;

        Job.findById( jobId )
        .then( function( j ) {
            job = j.toJSON();

            // Get all hygienists and their distance from the dentist office
            dentistLocation = new loopback.GeoPoint( { lat: job.dentist.lat, lng: job.dentist.lon });
            return Hygienist.find( {where: {location: {near: dentistLocation}}, limit:100} );

            // Should be able to do this but is buggy:
            // return Hygienist.find( {where: {location: {near: loc, maxDistance: 110, unit: 'kilometers'}}} )
        })
        .then( function( hygienists ) {
            return Promise.map( hygienists, function( hygienist ) {
                var hygienistLocation = new loopback.GeoPoint({ lat: hygienist.lat, lng: hygienist.lon});
                hygienist.distance = loopback.GeoPoint.distanceBetween( dentistLocation, hygienistLocation, {type: 'kilometers'});
                return hygienist;
            });
        })
        .then( function( hygienists ) {
            return Promise.all( hygienists.map( function( hygienist ) {
                return isBlockedHygienist( job.dentistId, hygienist.id )
                    .then( function( blocked ) {
                        if ( blocked ) {
                            return undefined;
                        }
                        else {
                            return hygienist;
                        }
                    })
                    .catch( function( err ) {
                        return undefined;
                    });
            }));
        })
        .then( function( hygienists ) {
            hygienists = _.compact( hygienists );
            return Promise.all( hygienists.map( function( hygienist ) {
                return isFavHygienist( job.dentistId, hygienist.id )
                    .then( function( fav ) {
                        hygienist.isFav = fav;
                        return hygienist;
                    })
                    .catch( function( err ) {
                        hygienist.isFav = false;
                        return hygienist;
                    });
            }));
        })
        .then( function( hygienists ) {

            var sendTime;
            var MAX_INTERVAL = 36 * 60; // minutes
            now = moment.utc();
            console.log( 'now: ' + now.toDate() );

            minutesTillStart = moment.utc( job.shifts[0].postedStart ).diff( now, 'minutes');
            console.log( 'minutes until job start: ' + minutesTillStart );

            interval = Math.round( minutesTillStart / 35 );
            interval = (interval < 1) ? 1 : interval;
            interval = (interval > MAX_INTERVAL) ? MAX_INTERVAL : interval;
            
            console.log( 'interval: ' + interval );

            favSendTime = now.clone();
            console.log( 'favSendTime: ' + favSendTime.toDate() );

            above4SendTime = now.clone().add( 1 * interval, 'minutes' );
            console.log( 'above4SendTime: ' + above4SendTime.toDate() );

            above3SendTime = now.clone().add( 2 * interval, 'minutes' );
            console.log( 'above3SendTime: ' + above3SendTime.toDate() );

            above2SendTime = now.clone().add( 3 * interval, 'minutes' );
            console.log( 'above2SendTime: ' + above2SendTime.toDate() );

            bottomSendTime = now.clone().add( 4 * interval, 'minutes' );
            console.log( 'bottomSendTime: ' + bottomSendTime.toDate() );

            return Promise.all( hygienists.map( function( hygienist ) {

                if ( hygienist.distance > MAX_DISTANCE ) {
                    return;
                }

                if ( hygienist.isFav ) {
                    sendTime = favSendTime;
                }
                else if ( hygienist.starScore > 4 ) {
                    sendTime = above4SendTime;
                }
                else if ( hygienist.starScore > 3 ) {
                    sendTime = above3SendTime;
                }
                else if ( hygienist.starScore > 2 ) {
                    sendTime = above2SendTime;
                }
                else {
                    sendTime = bottomSendTime;
                }

                return Notification.create({
                    sendTime: moment(sendTime).utc().format('YYYY-MM-DD HH:mm' ),
                    message: message,
                    userId: hygienist.user.id,
                    jobId: jobId
                });

            }));
        })
        .then( function() {
            resolve();
        })
        .catch( function( err ) {
            reject( err );
        });
    });
}

function isFavHygienist( dentistId, hygienistId ) {
    return new Promise( function( resolve, reject ) {
        var FavouriteHygienist = app.models.FavouriteHygienist;

        // Is hygienist a favourite of this dentist?
        FavouriteHygienist.findOne({
            where: {
                dentistId: dentistId,
                hygienistId: hygienistId
            }
        })
        .then( function( fav ) {
            if ( fav ) {
                resolve( true );
            }
            else {
                resolve( false );
            }
        })
        .catch( function( err ) {
            reject( err );
        });
    });
}

function isBlockedHygienist( dentistId, hygienistId ) {
    return new Promise( function( resolve, reject ) {
        var BlockedHygienist = app.models.BlockedHygienist;

        // Did dentist block this hygienist?
        BlockedHygienist.findOne({
            where: {
                dentistId: dentistId,
                hygienistId: hygienistId
            }
        })
        .then( function( blocked ) {
            if ( blocked ) {
                resolve( true );
            }
            else {
                resolve( false );
            }
        })
        .catch( function( err ) {
            reject( err );
        });
    });
}


module.exports = {
    createJobNotifications
};
