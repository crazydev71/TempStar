
'use strict';

var _        = require( 'lodash' );
var Promise  = require( 'bluebird' );
var loopback = require( 'loopback' );
var app      = require('../tempstars-api.js' );
var location = require( 'location' );
var moment   = require( 'moment' );
var push     = require( 'push' );
var notifier = require( 'notifier' );
var MailChimp = require( 'mailchimp-api-v3');
var mailChimp = new MailChimp(app.get('mailChimpAPIKey'));
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(app.get('MandrillAPIKey'));

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
        .then (function (h) {
            hygienist = h;
            app.models.TSUser.find({where:{hygienistId: hygienist.id}})
            .then(function (users) {
                console.log(users);
                if (!users.length)
                    return false;

                var user = users[0];

                if (user.emailVerified | true) { // always true for Local Test
                    var prefix = hygienist.postalCode.substr(0,1);
                    
                    if (prefix == 'V') {
                        console.log("Subscribing Vancouver's Hygienist List...");
                        // In case the hygienist is in Vancuber
                        mailChimp.post('/lists/e1c0d37310/members', {
                            "email_address":user.email,
                            "status":"subscribed",
                            "merge_fields": {
                                "FNAME": hygienist.firstName,
                                "LNAME": hygienist.lastName,
                                "EMAIL": user.email
                            }
                        }, function(err, res) {
                            if (err)
                                console.log(err);
                            console.log(res);
                        });
                    } else {
                        console.log("Hygienist Members List...");
                        // In case the hygienist is not in Vancuber
                        mailChimp.post('/lists/2e1ea40483/members', {
                            "email_address":user.email,
                            "status":"subscribed",
                            "merge_fields": {
                                "FNAME": hygienist.firstName,
                                "LNAME": hygienist.lastName,
                                "EMAIL": user.email
                            }
                        }, function(err, res) {
                            if (err)
                                console.log(err);
                            console.log(res);
                        });
                    }
                }
                
            })
            return hygienist;
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
            //geocode = { lat: -1.0, lon: 1.0};
            var PostalCode = app.models.PostalCode;
            var prefix = hygienist.postalCode.substr(0,2);
            if (hygienist.province === 'BC')
                prefix = hygienist.postalCode.substr(0,1);
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
        var BlockedHygienist = app.models.BlockedHygienist;
        var BlockedDentist = app.models.BlockedDentist;
        var PartialOffer = app.models.PartialOffer;
        var hygienist,
            hygienistLocation,
            distance,
            jobs;


        // Get the hygienist location
        // Get the available jobs not blocked
        // Filter by location
        // Filter out jobs already booked on

        Hygienist.findById( id )
        .then( function( h ) {
            hygienist = h;
            return Job.find( {where: {status: {inq: [1,2]}}} );
        })
        .then( function( js ) {
            jobs = js;
            return BlockedHygienist.find( {where: { hygienistId: id}} );
        })
        .then( function( blocked ) {
            return _.filter( jobs, function( job ) {
                if ( _.find( blocked, { 'dentistId': job.dentistId} ) ) {
                    // If we find them in the blocked list, want to remove the job
                    return false;
                }
                else {
                    return true;
                }
            });
        })
        .then( function( js ) {
            jobs = js;
            return BlockedDentist.find( { where: { hygienistId: id}} );
        })
        .then( function( blockedDentists ) {
            return _.filter( jobs, function( job ) {
                if ( _.find( blockedDentists, { 'dentistId': job.dentistId} ) ) {
                    // If we find them in the blocked list, want to remove the job
                    return false;
                }
                else {
                    return true;
                }
            });
        })
        .then( function( js ) {
            jobs = js;
            console.log('available jobs: ' + jobs.length);
            return PartialOffer.find( { where: { hygienistId: id }} );
        })
        .then( function( partialOffers ) {
            var confirmedPartialOffers = [];
            for (var i = 0; i < partialOffers.length; i++) {
                if (partialOffers[i].status === 2) {
                    confirmedPartialOffers.push(partialOffers[i]);
                }
            }

            return _.filter( jobs, function( job ) {
                if ( _.find( partialOffers, { 'jobId': job.id} ) ) {
                    // If hygienist already made custom offer for that job, want to remove it
                    return false;
                }
                else {
                    for (var i = 0; i < confirmedPartialOffers.length; i++) {
                        if (job.startDate === moment(confirmedPartialOffers[i].offeredStartTime).format('YYYY-MM-DD'))
                            return false;
                    }
                    return true;
                }
            });
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
                if ( distance <= 110 && hygienist.province === jj.dentist.province ) {
                    jj.distance = distance.toFixed(1);
                    return jj;
                }
            });
        })
        .then( function( js ) {
            // Filter out dates with booked jobs for this hygienist
            jobs = _.compact( js );
            return Promise.map( jobs, function( job ) {
                return new Promise( function( resolve, reject ) {

                    Job.count({ status: 3, hygienistId: id, startDate: job.startDate })
                    .then( function(otherJob) {
                        if ( otherJob ) {
                            resolve(null);
                        }
                        else {
                            resolve(job);
                        }
                    })
                    .catch( function(err) {
                        resolve( job );
                    });
                });
            });
        })
        .then( function( js ) {

            jobs = _.compact( js );
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


    Hygienist.remoteMethod( 'updateInviteStatus', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:hygienistId/updateInviteStatus' }
    });

    Hygienist.updateInviteStatus = function( hygienistId, data, callback ) {

        var User = app.models.TSUser;
        var Hygienist = app.models.Hygienist;
        var Invite = app.models.Invite;
        var hygienist;
        var user;
        var userInviteCode;
        var invites;

        // Get the hygienist
        Hygienist.findById( hygienistId )
        .then( function( h ) {
            hygienist = h;

            return User.find( { where: { hygienistId: parseInt(hygienistId)}} );
        })
        .then( function( u ) {
            user = u;
            userInviteCode = user[0].inviteCode;

            return Invite.find( { where: { inviteCode: userInviteCode}} );
        })
        .then( function( i ) {
            invites = i;
            inviteStatusUpdate(user[0].id,invites);
            console.log( 'invite status update complete!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'invite status update error!' );
            callback( err );
        });
    };


    Hygienist.remoteMethod( 'bookJob', {
        accepts: [
            {arg: 'hygienistId', type: 'number', required: true},
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:hygienistId/jobs/:jobId/book' }
    });

    Hygienist.bookJob = function( hygienistId, jobId, data, callback ) {

        var User = app.models.TSUser;
        var Job = app.models.Job;
        var Hygienist = app.models.Hygienist;
        var PartialOffer = app.models.PartialOffer;
        var Email = app.models.Email;
        var Region = app.models.Region;
        var Invite = app.models.Invite;

        var rateAdjustment = 0;
        var hourlyRate;
        var job;
        var jj, msg;
        var hygienist;
        var numBooked;

        var rate; 
        var user;
        var userInviteCode;
        var invites;
        var invitedAdjustment = 0;
        var inviteBonus; 

        // Get the hygienist
        Hygienist.findById( hygienistId )
        .then( function( h ) {
            hygienist = h;
            numBooked = h.numBooked || 0;
            numBooked++;

            return Region.findById( h.regionId );
        })
        .then( function( r ) {
            rate = r;
            console.log( 'hygienistId: ' + hygienistId );

            return User.find( { where: { hygienistId: parseInt(hygienistId)}} );
        })
        .then( function( u ) {
            user = u;
            userInviteCode = user[0].inviteCode;

            return Invite.find( { where: { inviteCode: userInviteCode, signupComplete: 1}} );
        })
        .then( function( i ) {
            invites = i;

            return Invite.find( { where: { invitedUserId: user[0].id, userOnPlacement: 0}} );
        })
        .then( function( usedInvite ) {

            for(var i=0; i < usedInvite.length; i++){
                if(usedInvite[i].inviteCode != 0){
                    invitedAdjustment = 2;
                }
            }

            /// GET ADJUSTMENTS 
            inviteBonus = inviteAdjustments(invites) + invitedAdjustment;

            // UPDATE INVITE STATUS 
            //inviteStatusUpdate(user[0].id,invites);

            var baseRate = getAdjustedRate( rate.rate, hygienist.starScore );
            hourlyRate = baseRate + inviteBonus;

            return Job.findById( jobId );
        })
        .then( function( j ) {
            job = j;
            jj = job.toJSON();

            if ( job == null || job.status == jobStatus.CONFIRMED || job.status == jobStatus.COMPLETED ) {
                throw new Error( 'Job is no longer available.');
                return;
            }

            if ( data && data.lastModifiedOn ) {
                if ( job.modifiedOn != data.lastModifiedOn ) {
                    throw new Error( 'Job was changed since you viewed it.');
                    return;
                }
            }

            // Add incentive bonus
            hourlyRate += job.bonus;
            console.log( 'bonus: ' + job.bonus );
            console.log( 'final rate: ' + hourlyRate );
            return Job.count({ hygienistId: hygienistId, startDate: job.startDate });
        })
        .then( function( alreadyBooked ) {

            if ( alreadyBooked ) {
                throw new Error( 'You are already booked for that day.');
                return;
            }

            return job.updateAttributes({
                hygienistId: hygienistId,
                bookedOn: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                hourlyRate: hourlyRate,
                inviteBonus: inviteBonus,
                status: jobStatus.CONFIRMED
            });
        })
        .then( function( job ) {
            jj = job.toJSON();
            return hygienist.updateAttributes( {numBooked: numBooked });
        })
        .then( function() {
            msg = 'Your job on ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += ' has been filled. Tap on the job date in the app to view details.';
            return push.send( msg, jj.dentist.user.platform, jj.dentist.user.registrationId );
        })
        .then( function( response ) {
            return new Promise( function( resolve, reject ) {
                if ( ! response.success ) {
                    Email.send({
                        to: jj.dentist.user.email,
                        from: app.get('emailFrom'),
                        bcc:  app.get('emailBcc'),
                        subject: 'Job on ' + moment(jj.startDate).format('ddd MMM D, YYYY') + ' filled',
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
            return PartialOffer.updateAll( {jobId: jobId}, { status: 1 } );
        })
        .then( function() {
            return notifyPartialOffers( job );
        })
        .then( function() {
            console.log( 'booked job worked!' );

            var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var utcOffset = moment().utcOffset();
            var shift_start = moment(jj.shifts[0].postedStart).utcOffset(utcOffset);
            var shift_end = moment(jj.shifts[0].postedEnd).utcOffset(utcOffset);
            // send email to dentist
            var dentist_tpl_name = "Dentist Books a Job";
            var message = {
                "subject": "Your TempStars job booking details - read carefully",
                "from_email": app.get('emailFrom'),
                "to": [{
                        "email": jj.dentist.user.email,
                        "name": jj.dentist.practiceName,
                        "type": "to"
                    }],
                "headers": {
                    "Reply-To": app.get('emailFrom')
                },
                "important": false,
                "track_opens": null,
                "track_clicks": null,
                "auto_text": null,
                "auto_html": null,
                "inline_css": null,
                "url_strip_qs": null,
                "preserve_recipients": null,
                "view_content_link": null,
                "bcc_address": app.get('emailBcc'),
                "tracking_domain": null,
                "signing_domain": null,
                "return_path_domain": null,
                "merge": true,
                "merge_language": "mailchimp",
                "global_merge_vars": [{
                        "name": "pracname",
                        "content": jj.dentist.practiceName
                    },
                    {
                        "name": "hygienistFirstName",
                        "content": hygienist.firstName
                    },
                    {
                        "name": "hygienistLastName",
                        "content": hygienist.lastName
                    },
                    {
                        "name": "gradYear",
                        "content": hygienist.graduationYear
                    },
                    {
                        "name": "school",
                        "content": hygienist.school
                    },
                    {
                        "name": "CDHO",
                        "content": hygienist.CDHONumber
                    },
                    {
                        "name": "dayOfWeek",
                        "content": weekdays[shift_start.day()]
                    },
                    {
                        "name": "shiftDate",
                        "content": shift_start.format('MMMM D')
                    },
                    {
                        "name": "startTime",
                        "content": shift_start.format('h:mm a')
                    },
                    {
                        "name": "endTime",
                        "content": shift_end.format('h:mm a')
                    },
                    {
                        "name": "rate",
                        "content": hourlyRate
                    }
                ],
                "tags": [
                    "booking"
                ],
                "subaccount": "Development",
                "google_analytics_domains": [
                    "tempstars.ca"
                ],
                "metadata": {
                    "website": "www.tempstars.ca"
                }
            };
            mandrill_client.messages.sendTemplate({
                "template_name": dentist_tpl_name, 
                "template_content": [], 
                "message": message, 
                "async": false
            }, function(result) {
                console.log('confirm email result: ', result);
            }, function(e) {
                // Mandrill returns the error as an object with name and message keys
                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
            });

            var hygienistJSON = hygienist.toJSON();
            // send email to hygienist
            var hygienist_tpl_name = "Hygienist Books a Job";
            var message = {
                "subject": 'Your TempStars job booking details - read carefully',
                "from_email": app.get('emailFrom'),
                "to": [{
                        "email": hygienistJSON.user.email,
                        "name": hygienistJSON.firstName + ' ' + hygienistJSON.lastName,
                        "type": "to"
                    }],
                "headers": {
                    "Reply-To": app.get('emailFrom')
                },
                "important": false,
                "track_opens": null,
                "track_clicks": null,
                "auto_text": null,
                "auto_html": null,
                "inline_css": null,
                "url_strip_qs": null,
                "preserve_recipients": null,
                "view_content_link": null,
                "bcc_address": app.get('emailBcc'),
                "tracking_domain": null,
                "signing_domain": null,
                "return_path_domain": null,
                "merge": true,
                "merge_language": "mailchimp",
                "global_merge_vars": [{
                        "name": "fname",
                        "content": hygienistJSON.firstName
                    },
                    {
                        "name": "practiceName",
                        "content": jj.dentist.practiceName
                    },
                    {
                        "name": "dayOfWeek",
                        "content": weekdays[shift_start.day()]
                    },
                    {
                        "name": "shiftDate",
                        "content": shift_start.format('MMMM D')
                    },
                    {
                        "name": "startTime",
                        "content": shift_start.format('h:mm a')
                    },
                    {
                        "name": "endTime",
                        "content": shift_end.format('h:mm a')
                    },
                    {
                        "name": "rate",
                        "content": hourlyRate.toFixed(2)
                    }
                ],
                "tags": [
                    "booking"
                ],
                "subaccount": "Development",
                "google_analytics_domains": [
                    "tempstars.ca"
                ],
                "metadata": {
                    "website": "www.tempstars.ca"
                }
            };
            mandrill_client.messages.sendTemplate({
                "template_name": hygienist_tpl_name, 
                "template_content": [], 
                "message": message, 
                "async": false
            }, function(result) {
                console.log('confirm email result: ', result);
            }, function(e) {
                // Mandrill returns the error as an object with name and message keys
                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
            });

            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'booked job error!' );
            callback( err );
        });
    };

    function getAdjustedRate( baseRate, starScore ) {

        var hourlyRate,
            rateAdjustment;

console.log( 'base rate: ' + baseRate );
console.log( 'star score: ' + starScore );

        if ( starScore == 5 ) {
            rateAdjustment = 4;
        }
        else if ( starScore < 5 && starScore >= 4) {
            rateAdjustment = 2;
        }
        else if ( starScore < 4 && starScore >= 3) {
            rateAdjustment = 0;
        }
        else if ( starScore < 3 && starScore >= 2) {
            rateAdjustment = -2;
        }
        else if ( starScore < 2 ) {
            rateAdjustment = -4;
        }

console.log( 'rate adj: ' + rateAdjustment );
        hourlyRate = parseInt(baseRate) + rateAdjustment;
console.log( 'hourlyRate: ' + hourlyRate );
        return hourlyRate;
    }

    function calculateCancellationPenalty( hygienist ) {
        var cancelPercent;
        var numCancelled;
        var numDaysBlocked = 0;

        if ( hygienist.numBooked == 0 ) {
            return 0;
        }

        numCancelled = hygienist.numCancelled + 1;
        cancelPercent = numCancelled / hygienist.numBooked;
        if ( cancelPercent > 0.05 ) {
            numDaysBlocked = numCancelled * 14;
        }

        return numDaysBlocked;
    }

    function notifyPartialOffers( job ) {
        // Get all the partial offers for this job
        // Notify all the hygienists except the booked one
        var PartialOffer = app.models.PartialOffer;
        var Email = app.models.Email;

        var jj = job.toJSON();
        var pj;

        return PartialOffer.find( {where: {jobId: job.id}} )
        .then( function( pos ) {
            return Promise.map( pos, function( po ) {
                pj = po.toJSON();
                if ( po.hygienistId != job.hygienistId ) {
                    var msg = 'Your Custom Offer on ';
                    msg += moment(jj.startDate).format('ddd MMM Do');
                    msg += ' was declined.';
                    push.send( msg, pj.hygienist.user.platform, pj.hygienist.user.registrationId )
                    .then( function( response ) {
                        return new Promise( function( resolve, reject ) {
                            if ( ! response.success ) {
                                Email.send({
                                    to: pj.hygienist.user.email,
                                    from: app.get('emailFrom'),
                                    bcc:  app.get('emailBcc'),
                                    subject: 'Custom Offer for ' + moment(jj.startDate).format('ddd MMM D, YYYY') + ' declined',
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

        console.log( 'make a custom offer' );

        var Job = app.models.Job;
        var PartialOffer = app.models.PartialOffer;
        var Email = app.models.Email;
        var Region = app.models.Region;

        var job;
        var jj;
        var msg;
        var hygienist;
        var hourlyRate;

        Hygienist.findById( hygienistId )
        .then( function( h ) {
            hygienist = h;
            return Region.findById( h.regionId );
        })
        .then( function( r ) {
            hourlyRate = getAdjustedRate( r.rate, hygienist.starScore );
            return Job.findById( jobId );
        })
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
                hourlyRate: data.hourlyRate,
                offeredStartTime: data.offeredStartTime,
                offeredEndTime: data.offeredEndTime,
                createdOn: data.createdOn
            });
        })
        .then( function( po ) {
            msg = 'You have received a new Custom Offer for your job posting on  ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += '. In the TempStars app, tap the target icon on the job ';
            msg += 'date to view the Custom Offer details.  This Custom Offer will expire in 18 hours';
            return push.send( msg, jj.dentist.user.platform, jj.dentist.user.registrationId );
        })
        .then( function( response ) {
            return new Promise( function( resolve, reject ) {
                if ( ! response.success ) {
                    Email.send({
                        to: jj.dentist.user.email,
                        from: app.get('emailFrom'),
                        bcc:  app.get('emailBcc'),
                        subject: 'You have a new Custom Offer for your job on ' + moment(jj.startDate).format('ddd MMM D, YYYY'),
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
            console.log( 'make a custom offer worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'make a custom offer error!' );
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

        console.log( 'cancel custom offer' );

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
            console.log( 'cancel custom offer worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'cancel custom offer error!' );
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
        var Region = app.models.Region;
        var Email = app.models.Email;
        var Hygienist = app.models.Hygienist;

        var job, jj, msg;
        var baseRate;

        Job.findById( jobId )
        .then( function( j ) {
            job = j;
            jj = job.toJSON();
            return Region.findById( jj.dentist.regionId );
        })
        .then( function( region ) {
            baseRate = region.rate;
            return job.updateAttributes({
                status: jobStatus.POSTED,
                hourlyRate: baseRate,
                hygienistId: null
            });
        })
        .then( function( job ) {
            return Hygienist.findById( hygienistId );
        })
        .then( function( h ) {
            var numCancelled = h.numCancelled + 1;
            var numDaysBlocked = calculateCancellationPenalty( h );
            if ( numDaysBlocked > 0 ) {
                var blockedUntil = moment().add( numDaysBlocked, 'days').utc().format('YYYY-MM-DD HH:mm:ss');
                return h.updateAttributes({blockedUntil: blockedUntil, numCancelled: numCancelled });
            }
            else {
                return h.updateAttributes({ numCancelled: numCancelled });
            }
        })
        .then( function( job ) {
            return notifier.createJobNotifications( loopback, app, jj.id, 'New job posted' );
        })
        .then( function( job ) {
            msg = 'Your TempStars hygienist, ';
            msg += jj.hygienist.firstName + ' ' + jj.hygienist.lastName;
            msg += ', has cancelled for your job on ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += '. It has automatically been re-posted to the system for other hygienists to book.';
            msg += 'You\'ll receive a status update when your job is re-filled.';
            return push.send( msg, jj.dentist.user.platform, jj.dentist.user.registrationId );
        })
        .then( function( response ) {
            return new Promise( function( resolve, reject ) {
                Email.send({
                    from: app.get('emailFrom'),
                    to: jj.dentist.user.email,
                    bcc:  app.get('emailBcc'),
                    subject: 'Job cancelled on ' + moment(jj.startDate).format('ddd MMM D, YYYY'),
                    text: msg
                }, function( err ) {
                    if ( err ) {
                        console.log( err.message );
                    }
                    resolve();
                });
            });
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

        var job, dentist, rating;

        switch ( data.rating ) {
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
                dentistRating: rating
            });
        })
        .then( function() {
            // Add fav/blocked dentist
            if ( data.rating == 'VH' ) {
                return FavouriteDentist.findOrCreate({
                    hygienistId: hygienistId,
                    dentistId: job.dentistId
                });
            }
            else if ( data.rating == 'NTY' ) {
                return BlockedDentist.findOrCreate({
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
            // Calc rating
            var i, rating, avgRating, sum, nonzero;

            for ( i = sum = nonzero = 0; i < jobs.length; i++ ) {
                rating = jobs[i].dentistRating;
                if ( rating ) {
                    sum += rating;
                    nonzero++;
                }
            }
            avgRating = sum / nonzero;

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


    function inviteAdjustments(invites){
        var inviteRateAdjustment = 0;
        
        if(invites.length == 0){
            return inviteRateAdjustment;
        }

        for(var i=0; i < invites.length; i++){
            // ADD $0.25
            if(invites[i].status == 0 && invites[i].userOnPlacement == 0){
                inviteRateAdjustment = inviteRateAdjustment + 0.25;
            }
            // ADD $2.00
            if(invites[i].status == 0 && invites[i].userOnPlacement == 1){
                inviteRateAdjustment = inviteRateAdjustment + 2.00;
            }
            
            // ADD $1.75
            if(invites[i].status == 1 && invites[i].userOnPlacement == 1){
                inviteRateAdjustment = inviteRateAdjustment + 1.75;
            }
            // ADD $2.00
            if(invites[i].status == 2){
                inviteRateAdjustment = inviteRateAdjustment + 2;
            }
            
            // ADD $0
            if(invites[i].status == 3){
                //inviteRateAdjustment = inviteRateAdjustment + 0;
            }
        }

        return inviteRateAdjustment;

    }

    function inviteStatusUpdate(userId,invites){
        var Invite = app.models.Invite;

        // UPDATE INVITE TABLE AS USER HAS NOW BOOKED A PAID PLACEMENT
        Invite.updateAll({invitedUserId: userId}, {userOnPlacement: 1});

        if(invites.length == 0){
            return;
        }

        // UPDATE INVITE STATUS CODES
        for(var i=0; i < invites.length; i++){
            if(invites[i].status == 0){
                Invite.updateAll({id: invites[i].id}, {status: 1});
            }
            if(invites[i].status == 1 && invites[i].userOnPlacement == 1){
                Invite.updateAll({id: invites[i].id}, {status: 3});
            }
            if(invites[i].status == 2){
                Invite.updateAll({id: invites[i].id}, {status: 3});
            }   
        }
    }


    Hygienist.remoteMethod( 'getCurrentRate', {
        accepts: [
            {arg: 'id', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'get', path: '/:id/rate' }
    });
    Hygienist.getCurrentRate = function( id, callback ) {

        var Hygienist = app.models.Hygienist;
        var Region = app.models.Region;
        var Invite = app.models.Invite;
        var User = app.models.TSUser;
        
        var user;
        var userInviteCode;
        var hygienist;
        var rate;
        var invites;
        var invitedAdjustment = 0;


        // Get the hygienist
        Hygienist.findById( parseInt(id) )
        .then( function( h ) {
            hygienist = h;
            return Region.findById( h.regionId );
        })
        .then( function( r ) {
            rate = r;
            return User.find( { where: { hygienistId: id}} );
        })
        .then( function( u ) {
            user = u;
            userInviteCode = user[0].inviteCode;

            return Invite.find( { where: { inviteCode: userInviteCode, signupComplete: 1}} );
        })
        .then( function( i ) {
            invites = i;
            //user = u;
            //userInviteCode = user[0].inviteCode;

            return Invite.find( { where: { invitedUserId: user[0].id, userOnPlacement: 0}} );
        })
        .then( function( usedInvite ) {
            /// GET ADJUSTMENTS

            for(var i=0; i < usedInvite.length; i++){
                if(usedInvite[i].inviteCode != 0){
                    invitedAdjustment = 2;
                }
            }

            var inviteAdjustment = inviteAdjustments(invites) + invitedAdjustment;
            var baseRate = getAdjustedRate( rate.rate, hygienist.starScore );
            var hourlyRate = baseRate + inviteAdjustment;
            var numDaysBlocked = calculateCancellationPenalty( hygienist );


            var resp = { rate: hourlyRate,baseRate:baseRate,inviteAdjustment:inviteAdjustment, numDaysBlocked: numDaysBlocked, invites: invites };
            callback( null, resp );
        })
        .catch( function( err ) {
            callback( err );
        });
    };




    Hygienist.send = function( jobId, data, callback ) {

        var Shift = app.models.Shift;
        var Invoice = app.models.Invoice;
        var Job = app.models.Job;
        var Email = app.models.Email;
        var jj;

        // TODO send notification
        console.log( 'send invoice for job: ' + jobId );

        Shift.findOne( {where: {jobId: jobId}} )
        .then( function( shift ) {
            console.log( 'got shift');
            // Update shift
            return shift.updateAttributes({
                actualStart: data.actualStart,
                actualEnd: data.actualEnd,
                totalHours: data.totalHours,
                unpaidHours: data.unpaidHours,
                billableHours: data.billableHours
            });
        })
        .then( function() {
            console.log( 'create invoice' );
            // Create invoice
            return Invoice.create({
                jobId: jobId,
                totalHours: data.totalHours,
                totalUnpaidHours: data.unpaidHours,
                totalBillableHours: data.billableHours,
                hourlyRate: data.hourlyRate,
                totalInvoiceAmt: data.totalAmt,
                hygienistMarkedPaid: 0,
                dentistMarkedPaid: 0,
                sent: 1,
                createdOn: data.createdOn,
                sentOn: data.sentOn
            });
        })
        .then( function( invoice ) {
            return Job.findById( jobId );
        })
        .then( function( job ) {
            jj = job.toJSON();
            msg = 'You have a new invoice from  ';
            msg += jj.hygienist.firstName + ' ' + jj.hygienist.lastName;
            return push.send( msg, jj.dentist.user.platform, jj.dentist.user.registrationId );
        })
        .then( function() {
            Email.send({
                to: jj.dentist.user.email,
                from: app.get('emailFrom'),
                subject: 'Invoice from ' + jj.hygienist.firstName + ' ' + jj.hygienist.lastName,
                html: çΩ.html },
                function(err) {
                    if (err) {
                        return console.log('error sending invoice email');
                    }
                    return;
            });
        })
        .then( function() {
            console.log( 'create invoice worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'create invoice error: ' + err.message );
            callback( err );
        });
    };





    Hygienist.remoteMethod( 'sendInvite', {
        accepts: [
            {arg: 'userId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:userId/sendInvite' }
    });

    Hygienist.sendInvite = function(userId,data,callback){
        var Email = app.models.Email;
        var User = app.models.TSUser;
        var Hygienist = app.models.Hygienist;

        var theUser;
        var hygienist;

        User.find( { where: { id: userId}} )
        .then( function( u ) {
            theUser = u;
            return Hygienist.findById( theUser[0].hygienistId );
        })
        .then( function( h ) {
            hygienist = h;

            var firstName = data.firstName;
            var capitcalFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

            var hygienistFirstName = hygienist.firstName;
            var capitcalhygienistFirstName = hygienistFirstName.charAt(0).toUpperCase() + hygienistFirstName.slice(1);

            var emailMsg = '<p>Hi '+capitcalFirstName +',</p>';
            emailMsg += '<p>Someone really likes you!  '+capitcalhygienistFirstName +' is a member of TempStars and invited you to join.  And is giving your a bonus +$2.00/hr on your first placement! </p>';
            emailMsg += '<p>TempStars is Canada’s premium dental hygiene temping service.  We use cutting-edge mobile technology to make fast and easy connections between hygienists and dental offices.  </p>';
            emailMsg += '<p>It’s totally free for hygienists to join and use.</p>';
            emailMsg += '<p>Earn a bonus +$2/hr on your first placement when you join using '+capitcalhygienistFirstName +'’s Invite Code: <strong>'+theUser[0].inviteCode +'</strong> </p>';
            emailMsg += '<p><a href="https://app2.tempstars.ca">Join TempStars using '+capitcalhygienistFirstName +'’s Invite Code <strong>'+theUser[0].inviteCode +'</strong></a></p>';
            emailMsg += '<p>Find out more about TempStars helps you live an empowered professional lifestyle.</p>';
            emailMsg += '<br/>';
            emailMsg += '<p><a href="http://www.tempstars.ca/hygienists/">Learn More</a></p>'
            emailMsg += '<br/>';
            emailMsg += '<p>Over 180 hygienists trust TempStars to connect them with dental offices for their temping placements.  When you join, be sure to use '+capitcalhygienistFirstName +'’s Invite Code to earn your bonus +$2/hr on your first job.</p>';
            emailMsg += '<p><a href="https://app2.tempstars.ca">Join TempStars using '+capitcalhygienistFirstName +'’s Invite Code <strong>'+theUser[0].inviteCode +'</strong></a></p>';
            emailMsg += '<p>Thanks '+capitcalFirstName +', we look forward to having you as a member of TempStars Nation!</p>';
            emailMsg += '<p>Kindest regards,<br/>James Younger, DDS<br/>Founder/CEO, TempStars</p>';

            Email.send({
                to: data.email,
                from: 'help@tempstars.ca',
                subject: ''+ capitcalFirstName +', '+capitcalhygienistFirstName +' '+hygienist.lastName +' invited you to join TempStars!',
                html: emailMsg
            }, function( err ) {
                if ( err ) {
                    console.log( err.message );
                }
                console.log( 'create invoice worked!' );
                callback( null, {} );
            });

        });

    }




    Hygienist.remoteMethod( 'updateInviteSignupComplete', {
        accepts: [
            {arg: 'userId', type: 'number', required: true} ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:userId/updateInviteSignupComplete' }
    });

    Hygienist.updateInviteSignupComplete = function(userId,callback){
        var Invite = app.models.Invite;

        Invite.updateAll({invitedUserId: userId}, {signupComplete: 1});
        callback( null, {} );

    }

};
