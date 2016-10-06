
'use strict';

var Promise  = require( 'bluebird' );
var app      = require('../tempstars-api.js' );
var location = require( 'location' );
var moment   = require( 'moment' );
var push     = require( 'push' );
var notifier = require( 'notifier' );

push.init( app.get('gcmApiKey') );

var  jobStatus =  {
    'POSTED': 1,
    'PARTIAL': 2,
    'CONFIRMED': 3,
    'COMPLETED': 4
};

module.exports = function( Hygienist ) {

    Hygienist.disableRemoteMethod('createChangeStream', true);

    // Hygienist.remoteMethod( 'account', {
    //     accepts: [
    //         {arg: 'id', type: 'number', required: true},
    //         {arg: 'data', type: 'object', http: { source: 'body' } } ],
    //     returns: { arg: 'result', type: 'object' },
    //     http: { verb: 'put', path: '/:id/account' }
    // });
    //
    // Hygienist.account = function( id, data, callback ) {
    //     var hygienist;
    //     var geocode;
    //
    //     Hygienist.findById( id )
    //     .then( function( h ) {
    //         hygienist = h;
    //         data.isComplete = 1;
    //         return hygienist.updateAttributes( data );
    //     })
    //     .then( function(h) {
    //         console.log( 'after update hygienist');
    //         console.dir( h );
    //         return new Promise( function( resolve, reject ) {
    //             var address = hygienist.address + ', ' + hygienist.city + ', ' + hygienist.province + ' ' + hygienist.postalCode + ' Canada';
    //             location.geocode( address )
    //             .then( function( latlon ) {
    //                 resolve( latlon );
    //             })
    //             .catch( function( err ) {
    //                 resolve( { lat: 0, lon: 0} );
    //             });
    //         });
    //     })
    //     .then( function( gc ) {
    //         geocode = gc;
    //         var PostalCode = app.models.PostalCode;
    //         var prefix = hygienist.postalCode.substr(0,2);
    //         return PostalCode.findOne( {where: {prefix: prefix} } );
    //     })
    //     .then( function( postalCode ) {
    //         return hygienist.updateAttributes( {
    //             lat: geocode.lat,
    //             lon: geocode.lng,
    //             regionId: postalCode.regionId
    //         });
    //     })
    //     .then( function() {
    //         callback( null, {} );
    //     })
    //     .catch( function( err ) {
    //         callback( err );
    //     });
    // };
    //

    Hygienist.remoteMethod( 'updateAccount', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:id/account' }
    });

    Hygienist.updateAccount = function( id, data, callback ) {
        var hygienist;
        var geocode;

        Hygienist.findById( id )
        .then( function( h ) {
            hygienist = h;
            return hygienist.updateAttributes( data );
        })
        .then( function( h ) {
            hygienist = h;
            return new Promise( function( resolve, reject ) {
                console.log( 'Geocoding...');
                var address = hygienist.address + ', ' + hygienist.city + ', ' + hygienist.province + ' ' + hygienist.postalCode + ' Canada';
                location.geocode( address )
                .then( function( latlon ) {
                    resolve( latlon );
                })
                .catch( function( err ) {
                    resolve( { lat: 0, lon: 0} );
                });
            });
        })
        .then( function( gc ) {
            geocode = gc;
            console.dir( gc );
            //geocode = { lat: -1.0, lon: 1.0};
            var PostalCode = app.models.PostalCode;
            var prefix = hygienist.postalCode.substr(0,2);
            return PostalCode.findOne( {where: {prefix: prefix} } );
        })
        .then( function( postalCode ) {
            console.log( 'Regioning...');
            return hygienist.updateAttributes({
                lat: geocode.lat,
                lon: geocode.lng,
                regionId: postalCode.regionId
            });
        })
        .then( function() {
            console.log( 'update hygienist worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'update hygienist error!' );
            callback( err );
        });
    };


    Hygienist.remoteMethod( 'availableJobs', {
        accepts: [
            {arg: 'id', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'get', path: '/:id/jobs/available' }
    });

    Hygienist.availableJobs = function( id, callback ) {

        var Job = app.models.Job;
        var hygienist;

        // Get the hygienist location
        // Get the available jobs within 100km

        // Hygienist.findById( id )
        // .then( function( h ) {
        //     hygienist = h;
        //     return

        Job.find( {where: {status: {inq: [1,2]}}} )
        .then( function( jobs ) {
            callback( null, jobs );
        })
        .catch( function( err ) {
            callback( err );
        });
    };

    Hygienist.remoteMethod( 'bookJob', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:hygienistId/jobs/:jobId/book' }
    });

    Hygienist.bookJob = function( hygienistId, jobId, callback ) {

        var Job = app.models.Job;

        console.log( 'book job' );
        // Get the job
        Job.findById( jobId )
        .then( function( job ) {
            return job.updateAttributes({
                hygienistId: hygienistId,
                bookedOn: moment.utc().format('YYYY-MM-DD hh:mm:ss'),
                status: 3
            });
        })
        .then( function( job ) {
            var jj = job.toJSON();
            msg = 'Your job on ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += ' has been filled.';
            return push.send( msg, [jj.dentist.user.registrationId])
        })
        .then( function( job ) {
            console.log( 'booked job worked!' );
            callback( null, job );
        })
        .catch( function( err ) {
            console.log( 'booked job error!' );
            callback( err );
        });
    };


    Hygienist.remoteMethod( 'makePartialOffer', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:hygienistId/jobs/:jobId/partialoffer' }
    });

    Hygienist.makePartialOffer = function( hygienistId, jobId, data, callback ) {

        console.log( 'make partial offer' );

        // create po
        // change job status
        // notify
        console.dir( data );

        var Job = app.models.Job;
        var PartialOffer = app.models.PartialOffer;

        Job.findById( jobId )
        .then( function( job ) {
            return job.updateAttributes({
                status: 2
            });
        })
        .then( function( job ) {
            return PartialOffer.create({
                jobId: job.id,
                hygienistId: hygienistId,
                status: 0,
                offeredStartTime: data.offeredStartTime,
                offeredEndTime: data.offeredEndTime,
                createdOn: data.createdOn
            });
        })
        .then( function( job ) {
            var jj = job.toJSON();
            msg = 'You have a new offer for your job on  ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += '.';
            return push.send( msg, [jj.dentist.user.registrationId] );
        })
        .then( function( po ) {
            console.log( 'make partial offer worked!' );
            callback( null, po );
        })
        .catch( function( err ) {
            console.log( 'make partial offer error!' );
            callback( err );
        });
    };



    Hygienist.remoteMethod( 'cancelJob', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'delete', path: '/:hygienistId/jobshifts/:jobId' }
    });

    /**
    * Cancel job
    *
    * if job status is confirmed, "unconfirm"
    */
    Hygienist.cancelJob = function( hygienistId, jobId, callback ) {

        var Job = app.models.Job;
        var jj;

        Job.findById( jobId )
        .then( function( job ) {
            jj = job.toJSON();

            if ( job.status != jobStatus.CONFIRMED ) {
                callback( new Error( 'cannot cancel non-confirmed job') );
                return;
            }

            return job.updateAttributes({
                status: jobStatus.POSTED,
                hygienistId: null
            });
        })
        .then( function( job ) {
            return notifier.createJobNotifications( loopback, app, jj.id, 'New job posted' );
        })
        .then( function( job ) {
            msg = 'Your job on ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += ' has been cancelled by ';
            msg += jj.hygienist.firstName + ' ' + jj.hygienist.lastName;
            msg += ' It has been automatically reposted to the system as a open job.';
            return push.send( msg, [jj.dentist.user.registrationId] );
        })
        .then( function() {
            console.log( 'cancel job worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'cancel job error!' );
            callback( err );
        });
    };

    Hygienist.remoteMethod( 'saveDentistRating', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:hygienistId/jobs/:jobId/rating' }
    });

    Hygienist.saveDentistRating = function( hygienistId, jobId, data, callback ) {
        var Job = app.models.Job;
        var FavouriteDentist = app.models.FavouriteDentist;
        var BlockedDentist = app.models.BlockedDentist;
        var Dentist = app.models.Dentist;

        var job;

        Job.findById( jobId )
        .then( function( j ) {
            // Add survey result to job
            job = j;
            return job.updateAttributes({
                dentistRating: data.dentistRating
            });
        })
        .then( function() {
            // Add fav/blocked dentist
            if ( data.dentistRating == rating.VERY_HAPPY ) {
                return FavouriteDentist.create({
                    hygienistId: hygienistId,
                    dentistId: job.dentistId
                });
            }
            else if ( data.dentistRating == rating.NO_THANK_YOU ) {
                return BlockedHygienist.create({
                    hygienistId: hygienistId,
                    dentistId: job.dentistId
                });
            }
            else {
                return Promise.resolve();
            }
        })
        .then( function() {
            // Get Dentist
            return Dentist.findById( job.dentistId );
        })
        .then( function( dentist ) {
            // Get avg score for last 5 jobs
            return Job.find({
                where: {
                    dentistId: job.dentistId,
                    status: 4
                },
                limit: 5,
                order: 'completedOn DESC'
            });
        })
        .then( function( jobs ) {
            // Calc star score
            var i, avgRating, sum;

            for ( i = 0, sum = 0; i < jobs.length; i++ ) {
                sum += jobs.dentistRating;
            }
            avgRating = sum / jobs.length;

            return dentist.updateAttributes({
                starScore: avgRating
            });
        })
        .then( function() {
            callback( null, {} );
        })
        .catch( function( err ) {
            callback( err );
        });
    };

};
