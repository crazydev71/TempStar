
'use strict';

var _        = require( 'lodash');
var Promise  = require( 'bluebird' );
var loopback = require( 'loopback' );
var app      = require('../tempstars-api.js' );
var stripe   = require( 'stripe' )(app.get('stripeSecretKey'));
var moment   = require( 'moment' );
var location = require( 'location' );
var push     = require( 'push' );
var notifier = require( 'notifier' );


push.init(
    app.get('gcmApiKey'),
    {
        key: app.get('apnKey'),
        keyId: app.get('apnKeyId'),
        teamId: app.get('apnTeamId')
    },
    app.get('pushEnv')
);

var  jobStatus =  {
    'POSTED': 1,
    'PARTIAL': 2,
    'CONFIRMED': 3,
    'COMPLETED': 4
};

var rating = {
    'VERY_HAPPY': 5,
    'PLEASED': 4.2,
    'NO_THANK_YOU': 3
};

module.exports = function( Dentist ) {

    Dentist.disableRemoteMethod('createChangeStream', true);

    Dentist.remoteMethod( 'createAccount', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:id/account' }
    });

    Dentist.createAccount = function( id, data, callback ) {
        var dentist;
        var geocode;

        Dentist.findById( data.user.dentistId )
        .then( function( d ) {
            dentist = d;
            return dentist.updateAttributes({
                practiceName: data.p1.practiceName,
                businessOwner: data.p1.businessOwner,
                phone: data.p1.phone,
                address: data.p1.address,
                city: data.p1.city,
                province: data.p1.province,
                postalCode: data.p1.postalCode,
                photoUrl: data.p1.photoUrl,
                isComplete: 1
            });
        })
        .then( function( d ) {
            dentist = d;
            var DentistDetail = app.models.DentistDetail;
            return DentistDetail.findOrCreate( {where: { dentistId: dentist.id }}, {
                dentistId: dentist.id,
                primaryContact: data.p3.primaryContact,
                parking: data.p3.parking,
                payment: data.p3.payment,
                hygienistArrival: data.p3.hygienistArrival,
                radiography: data.p3.radiography,
                ultrasonic: data.p3.ultrasonic,
                sterilization: data.p3.sterilization,
                avgApptTime: data.p3.avgApptTime,
                charting: data.p3.charting,
                software: data.p3.software
            });
        })
        .then( function() {
            console.log( 'geocoding...' );

            return new Promise( function( resolve, reject ) {
                var address = dentist.address + ', ' + dentist.city + ', ' + dentist.province + ' ' + dentist.postalCode + ' Canada';
                location.geocode( address )
                .then( function( latlon ) {
                    console.log( 'geocoding worked supposedly' );
                    resolve( latlon );
                })
                .catch( function( err ) {
                    console.log( 'geocode error' );
                    resolve( { lat: 0, lon: 0} );
                });
            });
        })
        .then( function( gc ) {
            geocode = gc;
            console.log( 'geocode: ', gc );
            var PostalCode = app.models.PostalCode;
            var prefix = dentist.postalCode.substr(0,2);
            return PostalCode.findOne( {where: {prefix: prefix} } );
        })
        .then( function( postalCode ) {
            return dentist.updateAttributes( {
                lat: geocode.lat,
                lon: geocode.lng,
                regionId: postalCode.regionId
            });
        })
        .then( function() {
            callback( null, {} );
        })
        .catch( function( err ) {
            callback( err );
        });
    };


    Dentist.remoteMethod( 'addPaymentInfo', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:id/account/payment' }
    });

    Dentist.addPaymentInfo = function( id, data, callback ) {
        var dentist;

        Dentist.findById( id )
        .then( function( d ) {
            dentist = d;
            if ( dentist.stripeCustomerId ) {
                return Promise.resolve( dentist.stripeCustomerId );
            }
            else {
                return new Promise( function( resolve, reject ) {
                    stripe.customers.create({
                        source: data.token,
                        description: dentist.businessOwner,
                        email: dentist.user.email
                    })
                    .then( function( c ) {
                        resolve( c.id );
                    });
                });
            }
        })
        .then( function( cid ) {
            return dentist.updateAttributes({
                stripeCustomerId: cid
            });
        })
        .then( function() {
            callback( null, {} );
        })
        .catch( function( err ) {
            callback( err );
        });
    };

    Dentist.remoteMethod( 'updateAccount', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:id/account' }
    });

    Dentist.updateAccount = function( id, data, callback ) {
        var dentist;
        var dentistDetail;
        var geocode;

        Dentist.findById( id )
        .then( function( d ) {
            dentist = d;
            return dentist.updateAttributes({
                practiceName: data.practiceName,
                businessOwner: data.businessOwner,
                phone: data.phone,
                address: data.address,
                city: data.city,
                province: data.province,
                postalCode: data.postalCode,
                photoUrl: data.photoUrl
            });
        })
        .then( function( d ) {
            dentist = d;
            var DentistDetail = app.models.DentistDetail;
            return DentistDetail.findById( data.detailId );
        })
        .then( function( dd ) {
            dentistDetail = dd;
            return dentistDetail.updateAttributes({
                primaryContact: data.primaryContact,
                parking: data.parking,
                payment: data.payment,
                hygienistArrival: data.hygienistArrival,
                radiography: data.radiography,
                ultrasonic: data.ultrasonic,
                sterilization: data.sterilization,
                avgApptTime: data.avgApptTime,
                charting: data.charting,
                software: data.software
            });
        })
        .then( function() {
            return new Promise( function( resolve, reject ) {
                console.log( 'Geocoding...');
                var address = dentist.address + ', ' + dentist.city + ', ' + dentist.province + ' ' + dentist.postalCode + ' Canada';
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
            //geocode = { lat: -1.0, lon: 1.0};
            var PostalCode = app.models.PostalCode;
            var prefix = dentist.postalCode.substr(0,2);
            return PostalCode.findOne( {where: {prefix: prefix} } );
        })
        .then( function( postalCode ) {
            console.log( 'Regioning...');
            return dentist.updateAttributes({
                lat: geocode.lat,
                lon: geocode.lng,
                regionId: postalCode.regionId
            });
        })
        .then( function() {
            console.log( 'worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'error!' );
            callback( err );
        });
    };

    Dentist.remoteMethod( 'postJob', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:id/jobshifts' }
    });

    Dentist.postJob = function( id, data, callback ) {

        var Job = app.models.Job;
        var Shift = app.models.Shift;
        var Dentist = app.models.Dentist;
        var Region = app.models.Region;
        var region, job, dentist;

        // Create a new job and the shifts for that job
        // Then create notifications for each potential hygienist
        Dentist.findById( parseInt(id) )
        .then( function( d ) {
            dentist = d;
            if ( d.stripeCustomerId == null ) {
                throw new Error( 'Payment information is required to post a job.  Please tap on “Get a Temp Hygienist” to complete your payment information.' );
                return;
            }

            return Job.findOne({ where: {
                dentistId: parseInt(id),
                startDate: data.job.startDate
            }});
        })
        .then( function( existingJob ) {
            if ( existingJob ) {
                throw new Error( 'You already have a job posted for this day.' );
                return;
            }
        })
        .then( function() {
            var jobData = data.job;
            jobData.dentistId = parseInt(id);
            jobData.dentistRating = 0;
            jobData.hygienistRating = 0;
            jobData.hygienistId = 0;
            return Job.create( jobData );
        })
        .then( function( j ) {
            job = j;
            return Promise.map( data.shifts, function( shift ) {
                var s = {};
                s.jobId = job.id;
                s.shiftDate = shift.shiftDate;
                s.postedStart = shift.startTime;
                s.postedEnd = shift.endTime;
                return Shift.create( s );
            });
        })
        .then( function() {
            var jj = job.toJSON();
            return notifier.createJobNotifications( loopback, app, jj.id, 'New job posted' );
        })
        .then( function() {
            console.log( 'post job worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'post job error!' );
            callback( err );
        });
    };



    Dentist.remoteMethod( 'cancelJob', {
        accepts: [
            {arg: 'dentistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'delete', path: '/:dentistId/jobshifts/:jobId' }
    });

    /**
    * Cancel job
    *
    * if job status is posted, delete job and shifts
    * if job status is partial, delete job, shifts, and partial offers and notify
    * if job status is confirmed delete job, shifts, and notify
    * if job status is complete, don't do anything
    */
    Dentist.cancelJob = function( dentistId, jobId, callback ) {

        var Job = app.models.Job;
        var Email = app.models.Email;
        var Notification = app.models.Notification;

        var job;

        console.log( 'cancel job' );
        // Get the job
        Job.findById( jobId )
        .then( function( j ) {
            var jj, msg;

            job = j;
            console.log( 'got job with status:' + job.status );

            switch ( job.status ) {
                case jobStatus.COMPLETED:
                    console.log( 'cancel completed job' );
                    callback( new Error( 'cannot cancel completed job') );
                    return;
                    break;

                case jobStatus.CONFIRMED:
                    console.log( 'cancel confirmed job' );
                    // Notify hygienist
                    jj = job.toJSON();
                    msg = 'Your job on ';
                    msg += moment(jj.startDate).format('ddd MMM D, YYYY');
                    msg += ' with ' + jj.dentist.practiceName;
                    msg += ' has been cancelled.';
                    push.send( msg, jj.hygienist.user.platform, jj.hygienist.user.registrationId )
                    .then( function( response ) {
                        return new Promise( function( resolve, reject ) {
                            if ( ! response.success ) {
                                Email.send({
                                    to: jj.hygienist.user.email,
                                    from: app.get('emailFrom'),
                                    bcc:  app.get('emailBcc'),
                                    subject: 'Job cancelled on ' + moment(jj.startDate).format('ddd MMM D, YYYY'),
                                    text: msg
                                }, function( err ) {
                                    if ( err ) {
                                        console.log( err.message );
                                    }
                                    resolve();
                                });
                            }
                            else {
                                resolve();
                            }
                        });
                    })
                    .then( function() {
                        return job.partialOffers.destroyAll();
                    })
                    .catch( function( err ) {
                        console.log( err.message );
                    });
                    break;

                case jobStatus.PARTIAL:
                    console.log( 'cancel partial offer job' );

                    // Notify hygienists
                    jj = job.toJSON();
                    msg = 'Your partial offer for the job on  ';
                    msg += moment(jj.startDate).format('ddd MMM D, YYYY');
                    msg += ' with ' + jj.dentist.practiceName;
                    msg += ' has been removed since the job was cancelled.';
                    _.map( jj.partialOffers, function( po ) {
                        push.send( msg, po.hygienist.user.platform, po.hygienist.user.registrationId )
                        .then( function( response ) {
                            return new Promise( function( resolve, reject ) {
                                if ( ! response.success ) {
                                    Email.send({
                                        to: po.hygienist.user.email,
                                        from: app.get('emailFrom'),
                                        bcc:  app.get('emailBcc'),
                                        subject: 'Partial Offer for ' + moment(jj.startDate).format('ddd MMM D, YYYY') + ' removed',
                                        text: msg
                                    }, function( err ) {
                                        if ( err ) {
                                            console.log( err.message );
                                        }
                                        resolve();
                                    });
                                }
                                else {
                                    resolve();
                                }
                            });
                        });
                    });

                    // Delete partial offers
                    return job.partialOffers.destroyAll();
                    break;

                case jobStatus.POSTED:
                    console.log( 'cancel posted job' );
                    break;
            }
        })
        .then( function() {
            // Delete job and shifts
            console.log( 'delete shifts' );
            return job.shifts.destroyAll();
        })
        .then( function() {
            // Delete notifications
            console.log( 'delete notifications' );
            return Notification.destroyAll( { jobId: jobId } );
        })
        .then( function() {
            console.log( 'delete job' );
            return Job.deleteById( jobId );
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

    Dentist.remoteMethod( 'saveHygienistRating', {
        accepts: [
            {arg: 'dentistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:dentistId/jobs/:jobId' }
    });

    Dentist.saveHygienistRating = function( dentistId, jobId, data, callback ) {
        var Job = app.models.Job;
        var FavouriteHygienist = app.models.FavouriteHygienist;
        var BlockedHygienist = app.models.BlockedHygienist;
        var Hygienist = app.models.Hygienist;

        var job, hygienist, rating;

        switch ( data.hygienistRating ) {
            case 'VH':
                rating = 5;
                break;

            case 'PL':
                rating = 3.5;
                break;

            case 'NTY':
                rating = 2;
                break;

            default:
                break;
        }

        Job.findById( jobId )
        .then( function( j ) {
            // Add survey result to job
            job = j;
            return job.updateAttributes({
                hygienistRating: rating
            });
        })
        .then( function() {
            // Add fav/blocked hygienist
            if ( data.hygienistRating == 'VH' ) {
                return FavouriteHygienist.findOrCreate({
                    dentistId: dentistId,
                    hygienistId: job.hygienistId
                });
            }
            else if ( data.hygienistRating == 'NTY' ) {
                return BlockedHygienist.findOrCreate({
                    dentistId: dentistId,
                    hygienistId: job.hygienistId
                });
            }
            else {
                return Promise.resolve();
            }
        })
        .then( function() {
            // Get Hygienist
            return Hygienist.findById( job.hygienistId );
        })
        .then( function( h ) {
            hygienist = h;
            // Get avg score for last 5 jobs
            return Job.find({
                where: {
                    hygienistId: hygienist.id,
                    status: jobStatus.COMPLETED
                },
                limit: 5,
                order: 'completedOn DESC'
            });
        })
        .then( function( jobs ) {
            // Calc star score
            var i, rating, avgRating, sum, nonzero;

            for ( i = sum = nonzero = 0; i < jobs.length; i++ ) {
                rating = jobs[i].hygienistRating;
                if ( rating ) {
                    sum += rating;
                    nonzero++;
                }
            }
            avgRating = sum / nonzero;

            return hygienist.updateAttributes({
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

    Dentist.remoteMethod( 'modifyJob', {
        accepts: [
            {arg: 'dentistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:dentistId/jobshifts/:jobId' }
    });

    Dentist.modifyJob = function( dentistId, jobId, data, callback ) {

        var Job = app.models.Job;
        var Shift = app.models.Shift;
        var Email = app.models.Email;

        var job, jj, shiftId, msg;

        console.log( 'modify job' );

        // Get the job

        Job.findById( jobId )
        .then( function( j ) {
            job = j;
            jj = job.toJSON();
            shiftId = jj.shifts[0].id;
            return Shift.findById( shiftId );
        })
        .then( function( shift ) {
            return shift.updateAttributes( data );
        })
        .then( function() {

            switch ( job.status ) {
                case jobStatus.COMPLETED:
                    console.log( 'modify completed job' );
                    callback( new Error( 'cannot modify completed job') );
                    return;
                    break;

                case jobStatus.CONFIRMED:
                    console.log( 'modify confirmed job' );
                    // Notify hygienist
                    msg = 'Your job on ';
                    msg += moment(jj.startDate).format('ddd MMM D, YYYY');
                    msg += ' with ' + jj.dentist.practiceName;
                    msg += ' has been modified.';
                    push.send( msg, jj.hygienist.user.platform, jj.hygienist.user.registrationId )
                    .then( function( response ) {
                        return new Promise( function( resolve, reject ) {
                            if ( ! response.success ) {
                                Email.send({
                                    to: jj.hygienist.user.email,
                                    from: app.get('emailFrom'),
                                    bcc:  app.get('emailBcc'),
                                    subject: 'Job on ' + moment(jj.startDate).format('ddd MMM D, YYYY') + ' changed',
                                    text: msg
                                }, function( err ) {
                                    if ( err ) {
                                        console.log( err.message );
                                    }
                                    resolve();
                                });
                            }
                            else {
                                resolve();
                            }
                        });
                    })
                    .then( function() {
                        return job.partialOffers.destroyAll();
                    })
                    .catch( function( err ) {
                        console.log( err.message );
                    })

                    break;

                case jobStatus.PARTIAL:
                    console.log( 'modify partial offer job' );

                    // Notify hygienists
                    jj = job.toJSON();
                    msg = 'The job for your partial offer on  ';
                    msg += moment(jj.startDate).format('ddd MMM D, YYYY');
                    msg += ' with ' + jj.dentist.practiceName;
                    msg += ' has been modified.';
                    _.map( jj.partialOffers, function( po ) {
                        push.send( msg, po.hygienist.user.platform, po.hygienist.user.registrationId )
                        .then( function( response ) {
                            return new Promise( function( resolve, reject ) {
                                if ( ! response.success ) {
                                    Email.send({
                                        to: po.hygienist.user.email,
                                        from: app.get('emailFrom'),
                                        bcc:  app.get('emailBcc'),
                                        subject: 'Partial Offer for ' + moment(jj.startDate).format('ddd MMM D, YYYY') + ' changed',
                                        text: msg
                                    }, function( err ) {
                                        if ( err ) {
                                            console.log( err.message );
                                        }
                                        resolve();
                                    });
                                }
                                else {
                                    resolve();
                                }
                            });
                        });
                    });
                    break;

                case jobStatus.POSTED:
                    console.log( 'modify posted job' );
                    break;
            }
        })
        .then( function() {
            console.log( 'modify job worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'modify job error!' );
            callback( err );
        });
    };


    Dentist.remoteMethod( 'sendResumes', {
        accepts: [
            {arg: 'dentistId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:dentistId/resumes' }
    });

    Dentist.sendResumes = function( dentistId, data, callback ) {

        var SendResumeRequest = app.models.SendResumeRequest;

        data.dentistId = dentistId;
        SendResumeRequest.create( data )
        .then( function() {
            callback( null, {} );
        })
        .catch( function( err ) {
            callback( err );
        });
    };

};
