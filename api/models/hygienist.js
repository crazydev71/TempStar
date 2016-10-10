
'use strict';

var _        = require( 'lodash' );
var Promise  = require( 'bluebird' );
var loopback = require( 'loopback' );
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

var rating = {
    'VERY_HAPPY': 5,
    'PLEASED': 3.5,
    'NO_THANK_YOU': 2
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
        var Hygienist = app.models.Hygienist;
        var hygienist,
            hygienistLocation,
            distance,
            jobs;


        // Get the hygienist location
        // Get the available jobs
        // Filter by location
        // Filter out jobs already booked on or have partial offers on

        Hygienist.findById( id )
        .then( function( h ) {
            hygienist = h;
            return Job.find( {where: {status: {inq: [1,2]}}} );
        })
        .then( function( jobs ) {
            // If don't have a location for the hygienist, return all the jobs
            if ( ! hygienist.location ) {
                return _.map( jobs, function( job ) {
                    job.distance = 'unknown';
                });
            }
            hygienistLocation = new loopback.GeoPoint({ lat: hygienist.lat, lng: hygienist.lon});

            return _.map( jobs, function( job ) {
                var jj = job.toJSON();
                var jobLocation = new loopback.GeoPoint( { lng: jj.dentist.lon, lat: jj.dentist.lat} );
                distance = loopback.GeoPoint.distanceBetween( jobLocation, hygienistLocation, {type: 'kilometers'});
                if ( distance <= 110 ) {
                    jj.distance = distance.toFixed(1);
                    return jj;
                }
            });
        })
        .then( function( js ) {
            jobs = js;
            if ( jobs.length == 0 ) {
                return jobs;
            }
            var maxJob = _.maxBy( jobs, 'id' );
            return hygienist.updateAttributes({ lastJobIdViewed: maxJob.id });
        })
        .then( function() {
            callback( null, jobs );
        })
        .catch( function( err ) {
            callback( err );
        });
    };

    Hygienist.remoteMethod( 'getMaxAvailableJobId', {
        accepts: [
            {arg: 'id', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'get', path: '/:id/maji' }
    });

    Hygienist.getMaxAvailableJobId = function( id, callback ) {

        var Job = app.models.Job;
        var Hygienist = app.models.Hygienist;
        var hygienist,
            hygienistLocation,
            distance,
            jobs;

        Hygienist.findById( id )
        .then( function( h ) {
            hygienist = h;
            return Job.find( {where: {status: {inq: [1,2]}}} );
        })
        .then( function( jobs ) {
            // If don't have a location for the hygienist, return all the jobs
            if ( ! hygienist.location ) {
                return _.map( jobs, function( job ) {
                    job.distance = 'unknown';
                });
            }
            hygienistLocation = new loopback.GeoPoint({ lat: hygienist.lat, lng: hygienist.lon});

            return _.map( jobs, function( job ) {
                var jj = job.toJSON();
                var jobLocation = new loopback.GeoPoint( { lng: jj.dentist.lon, lat: jj.dentist.lat} );
                distance = loopback.GeoPoint.distanceBetween( jobLocation, hygienistLocation, {type: 'kilometers'});
                if ( distance <= 110 ) {
                    jj.distance = distance.toFixed(1);
                    return jj;
                }
            });
        })
        .then( function( jobs ) {
            var maji, maxJob;

            if ( ! jobs  ) {
                maji = 0;
            }
            else {
                maxJob = _.maxBy( jobs, 'id' );
                if ( maxJob ) {
                    maji = maxJob.id;
                }
                else {
                    maji = 0;
                }
            }
            callback( null, maji );
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
        var Hygienist = app.models.Hygienist;
        var PartialOffer = app.models.PartialOffer;
        var rateAdjustment = 0;
        var hourlyRate;
        var job;

        console.log( 'book job' );

        // Get the hygienist
        Hygienist.findById( hygienistId )
        .then( function( h ) {
            if ( h.starScore == 5 ) {
                rateAdjustment = 4;
            }
            else if ( h.starScore < 5 && h.starScore >= 4) {
                rateAdjustment = 2;
            }
            else if ( h.starScore < 4 && h.starScore >= 3) {
                rateAdjustment = 0;
            }
            else if ( h.starScore < 3 && h.starScore >= 2) {
                rateAdjustment = -2;
            }
            else if ( h.starScore < 2 ) {
                rateAdjustment = -4;
            }
            return Job.findById( jobId );
        })
        .then( function( j ) {
            job = j;

            if ( job.status == jobStatus.CONFIRMED || job.status == jobStatus.COMPLETED ) {
                throw new Error( 'Job is no longer available.');
                return;
            }

            return Job.count({ hygienistId: hygienistId, startDate: job.startDate });
        })
        .then( function( alreadyBooked ) {

            if ( alreadyBooked ) {
                throw new Error( 'You are already booked for that day.');
                return;
            }

            hourlyRate = job.hourlyRate + rateAdjustment;
            return job.updateAttributes({
                hygienistId: hygienistId,
                bookedOn: moment.utc().format('YYYY-MM-DD hh:mm:ss'),
                hourlyRate: hourlyRate,
                status: jobStatus.CONFIRMED
            });
        })
        .then( function( job ) {
            var jj = job.toJSON();
            var msg = 'Your job on ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += ' has been filled.';
            return push.send( msg, [jj.dentist.user.registrationId])
        })
        .then( function() {
            return PartialOffer.updateAll( {jobId: jobId}, { status: 1 } );
        })
        .then( function() {
            return notifyPartialOffers( job );
        })
        .then( function() {
            console.log( 'booked job worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'booked job error!' );
            callback( err );
        });
    };

    function notifyPartialOffers( job ) {
        // Get all the partial offers for this job
        // Notify all the hygienists except the booked one
        var PartialOffer = app.models.PartialOffer;
        var jj = job.toJSON();
        var pj;

        return PartialOffer.find({jobId: job.id})
        .then( function( pos ) {
            return Promise.map( pos, function( po ) {
                pj = po.toJSON();
                if ( po.hygienistId != job.hygienistId ) {
                    var msg = 'Your partial offer on ';
                    msg += moment(jj.startDate).format('ddd MMM Do');
                    msg += ' has been rejected.';
                    return push.send( msg, [pj.hygienist.user.registrationId])
                }
            });
        });
    }

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

        var Job = app.models.Job;
        var PartialOffer = app.models.PartialOffer;
        var job;
        var jj;

        Job.findById( jobId )
        .then( function( j ) {
            job = j;

            if ( job == null ) {
                throw new Error( 'Job is no longer available.');
                return;
            }

            jj = job.toJSON();
            if ( jj.status == jobStatus.CONFIRMED || jj.status == jobStatus.COMPLETED ) {
                throw new Error( 'Job is no longer available.');
                return;
            }

            return Job.count({ hygienistId: hygienistId, startDate: job.startDate });
        })
        .then( function( alreadyBooked ) {

            if ( alreadyBooked ) {
                throw new Error( 'You are already booked for that day.');
                return;
            }

            return job.updateAttributes({
                status: jobStatus.PARTIAL
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
        .then( function( po ) {
            var msg = 'You have a new offer for your job on  ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += '.';
            return push.send( msg, [jj.dentist.user.registrationId] );
        })
        .then( function() {
            console.log( 'make partial offer worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'make partial offer error!' );
            callback( err );
        });
    };


    Hygienist.remoteMethod( 'cancelPartialOffer', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'partialOfferId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'delete', path: '/:hygienistId/jobs/:jobId/partialoffers/:partialOfferId' }
    });

    Hygienist.cancelPartialOffer = function( hygienistId, jobId, partialOfferId, callback ) {

        console.log( 'cancel partial offer' );

        var Job = app.models.Job;
        var PartialOffer = app.models.PartialOffer;
        var job;

        // Delete partial offer
        // If last partial offer on this job, change job status back to POSTED

        Job.findById( jobId )
        .then( function( j ) {
            job = j;
            return PartialOffer.findById( partialOfferId );
        })
        .then( function( po ) {
            return po.destroy();
        })
        .then( function() {
            return PartialOffer.count({
                jobId: jobId
            });
        })
        .then( function( numRemaining ) {
            if ( numRemaining == 0 ) {
                return job.updateAttributes({
                    status: 1
                });
            }
            else {
                return;
            }
        })
        .then( function() {
            console.log( 'cancel partial offer worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'cancel partial offer error!' );
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
    */
    Hygienist.cancelJob = function( hygienistId, jobId, callback ) {

        var Job = app.models.Job;
        var jj;

        Job.findById( jobId )
        .then( function( job ) {
            jj = job.toJSON();

            return job.updateAttributes({
                status: jobStatus.POSTED,
                hygienistId: null
            });
        })
        .then( function( job ) {
            return notifier.createJobNotifications( loopback, app, jj.id, 'New job posted' );
        })
        .then( function( job ) {
            var msg = 'Your job on ';
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
        http: { verb: 'put', path: '/:hygienistId/jobs/:jobId' }
    });

    Hygienist.saveDentistRating = function( hygienistId, jobId, data, callback ) {
        var Job = app.models.Job;
        var FavouriteDentist = app.models.FavouriteDentist;
        var BlockedDentist = app.models.BlockedDentist;
        var Dentist = app.models.Dentist;

        var job, dentist;

        Job.findById( jobId )
        .then( function( j ) {
            // Add survey result to job
            job = j;
            return job.updateAttributes({
                dentistRating: data.rating
            });
        })
        .then( function() {
            // Add fav/blocked dentist
            if ( data.rating == rating.VERY_HAPPY ) {
                return FavouriteDentist.create({
                    hygienistId: hygienistId,
                    dentistId: job.dentistId
                });
            }
            else if ( data.rating == rating.NO_THANK_YOU ) {
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
        .then( function( d ) {
            dentist = d;
            // Get avg score for last 5 jobs
            return Job.find({
                where: {
                    dentistId: job.dentistId,
                    status: jobStatus.COMPLETED
                },
                limit: 5,
                order: 'completedOn DESC'
            });
        })
        .then( function( jobs ) {
            // Calc star score
            var i, avgRating, sum;

            for ( i = 0, sum = 0; i < jobs.length; i++ ) {
                sum += jobs[i].dentistRating;
            }
            avgRating = sum / jobs.length;

            return dentist.updateAttributes({
                rating: avgRating
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
