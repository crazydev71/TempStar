
var _        = require( 'lodash' );
var Promise  = require( 'bluebird' );
var moment   = require( 'moment' );
var app      = require('../tempstars-api.js' );
var push     = require( 'push' );
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

module.exports = function( Job ){
    Job.disableRemoteMethod('createChangeStream', true);

    Job.remoteMethod( 'acceptPartialOffer', {
        accepts: [
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'poId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:jobId/partialoffers/:poId/accept' }
    });

    Job.acceptPartialOffer = function( jobId, poId, callback ) {

        console.log( 'accept custom offer' );

        // change PO status to accepted, update hygienist
        // change job status to confirmed, update hygienist
        // notify accepted partial offer hygienist
        // change other partial offers status to rejected
        // notify other partial offer hygienists

        var PartialOffer = app.models.PartialOffer;
        var Shift = app.models.Shift;
        var Hygienist = app.models.Hygienist;
        var Email = app.models.Email;

        var rateAdjustment = 0;
        var hourlyRate;
        var partialOffer,
            job,
            jj,
            msg,
            poJSON,
            numBooked,
            hygienist;

        // Get the partial offer
        PartialOffer.findById( poId )
        .then( function( po ) {
            partialOffer = po;
            poJSON = po.toJSON();
            return Job.findById( jobId );
        })
        .then( function( j ) {
            job = j;
            jj = job.toJSON();
            return Hygienist.findById( partialOffer.hygienistId );
        })
        .then( function( h ) {
            hygienist = h;
            numBooked = h.numBooked || 0;
            numBooked++;
            return Job.count({ hygienistId: h.id, startDate: jj.startDate });
        })
        .then( function( alreadyBooked ) {

            if ( alreadyBooked ) {
                throw new Error( 'This hygienist is already booked for that day.');
                return;
            }

            if ( jj.status != jobStatus.PARTIAL ) {
                throw new Error( 'Job is no longer accepting custom offers');
                return;
            }

            // if ( hygienist.starScore == 5 ) {
            //     rateAdjustment = 4;
            // }
            // else if ( hygienist.starScore < 5 && hygienist.starScore >= 4) {
            //     rateAdjustment = 2;
            // }
            // else if ( hygienist.starScore < 4 && hygienist.starScore >= 3) {
            //     rateAdjustment = 0;
            // }
            // else if ( hygienist.starScore < 3 && hygienist.starScore >= 2) {
            //     rateAdjustment = -2;
            // }
            // else if ( hygienist.starScore < 2 ) {
            //     rateAdjustment = -4;
            // }
            // hourlyRate = jj.hourlyRate + rateAdjustment;

            // Add incentives
            // hourlyRate += (jj.short) ? 2 : 0;
            // hourlyRate += (jj.urgent) ? 2 : 0;
            // hourlyRate += (jj.weekend) ? 2 : 0;

            hourlyRate = partialOffer.hourlyRate;

            return job.updateAttributes({
                status: jobStatus.CONFIRMED,
                hygienistId: partialOffer.hygienistId,
                bookedOn: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                hourlyRate: hourlyRate,
                bonus: 0
            });
        })
        .then( function() {
            return Shift.findOne( {where: {jobId: jobId}} );
        })
        .then( function( shift ) {
            return shift.updateAttributes({
                postedStart: partialOffer.offeredStartTime,
                postedEnd: partialOffer.offeredEndTime
            });
        })
        .then( function() {
            // Reject all the partial offers for this job
            return PartialOffer.updateAll( {jobId: jobId}, { status: 1 } );
        })
        .then( function() {
            // Accept the real partial offer
            return partialOffer.updateAttributes({
                status: 2,
                hygienistId: partialOffer.hygienistId
            });
        })
        .then( function() {
            // Accept the real partial offer
            return PartialOffer.find( { where: { hygienistId: partialOffer.hygienistId, status: 0}} );
        })
        .then( function( pendintPartialOffers ) {
            var pendingIDs = [];
            for (var i = 0; i < pendintPartialOffers.length; i++) {
                if (moment(pendintPartialOffers[i].offeredStartTime).format('YYYY-MM-DD') === jj.startDate) {
                    pendingIDs.push(pendintPartialOffers[i].id);
                }
            }
            return PartialOffer.updateAll( {id: {inq: pendingIDs}}, { status: 1 } );
        })
        .then( function() {
            // bump the number of booked jobs
            return hygienist.updateAttributes({ numBooked: numBooked });
        })
        .then( function() {
            // Notify accepted hygienist
            msg = 'Your Custom Offer for ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            // msg += ' with ' + jj.dentist.practiceName;
            msg += ' has been accepted. You are now booked and confirmed for that shift.';
            msg += ' The office and patients are now counting on you to keep your commitment.';
            return push.send( msg, poJSON.hygienist.user.platform, poJSON.hygienist.user.registrationId );
        })
        .then( function( response ) {
            return new Promise( function( resolve, reject ) {
                if ( ! response.success ) {
                    Email.send({
                        to: poJSON.hygienist.user.email,
                        from: app.get('emailFrom'),
                        bcc:  app.get('emailBcc'),
                        subject: 'Custom Offer on ' + moment(jj.startDate).format('ddd MMM D, YYYY') + ' accepted',
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

        // .then( function() {
        //     // Notify hygienists who have rejected partial offers
        //     return Promise.map( rejectedPartialOffers, function( rpo ) {
        //         var jj = job.toJSON();
        //         msg = 'Your partial offer on ';
        //         msg += moment(jj.startDate).format('ddd MMM Do');
        //         msg += ' with ' + jj.dentist.practiceName;
        //         msg += ' has been declined.';
        //         var rpoJSON = rpo.toJSON();
        //         return push.send( msg, [rpoJSON.hygienist.user.registrationId] );
        //     });
        // })
        .then( function() {
            console.log( 'accept custom offer worked!' );
            
            var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var utcOffset = moment().utcOffset();
            var shift_start = moment(partialOffer.offeredStartTime).utcOffset(utcOffset);
            var shift_end = moment(partialOffer.offeredEndTime).utcOffset(utcOffset);

            // send email to dentist
            var dentist_tpl_name = "Dentist Books a Job";
            var message = {
                "subject": 'Your TempStars job booking details - read carefully',
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
                        "content": poJSON.hygienist.firstName
                    },
                    {
                        "name": "hygienistLastName",
                        "content": poJSON.hygienist.lastName
                    },
                    {
                        "name": "gradYear",
                        "content": poJSON.hygienist.graduationYear
                    },
                    {
                        "name": "school",
                        "content": poJSON.hygienist.school
                    },
                    {
                        "name": "CDHO",
                        "content": poJSON.hygienist.CDHONumber
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

            // send email to hygienist
            var hygienist_tpl_name = "Hygienist Books a Job";
            var message = {
                "subject": 'Your TempStars job booking details - read carefully',
                "from_email": app.get('emailFrom'),
                "to": [{
                        "email": poJSON.hygienist.user.email,
                        "name": poJSON.hygienist.firstName + ' ' + poJSON.hygienist.lastName,
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
                        "content": poJSON.hygienist.firstName
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
            console.log( 'accept custom offer error!' );
            callback( err );
        });
    };

    Job.remoteMethod( 'rejectPartialOffer', {
        accepts: [
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'poId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:jobId/partialoffers/:poId/reject' }
    });

    Job.rejectPartialOffer = function( jobId, poId, callback ) {

        console.log( 'reject custom offer' );

        // change PO status to rejected
        // if no other partial offers, change job status to POSTED
        // notify hygienist

        var PartialOffer = app.models.PartialOffer;
        var Job = app.models.Job;
        var Email = app.models.Email;

        var jj, pj;

        // Get the partial offer
        PartialOffer.findById( poId )
        .then( function( po ) {
            pj = po.toJSON();
            // Change to rejected
            return po.updateAttributes({
                status: 1
            });
        })
        .then( function() {
            // Count the number of partial offers for this job
            return PartialOffer.count({ jobId: jobId });
        })
        .then( function( numPartialOffers ) {
            if ( numPartialOffers == 1 ) {
                return Job.findById( jobId )
                .then( function( job ) {
                    return job.updateAttributes({ status: 1 });
                });
            }
            return;
        })
        .then( function( job ) {
            // Notify hygienist
            jj = job.toJSON();
            msg = 'Your Custom Offer for ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            // msg += ' with ' + jj.dentist.practiceName;
            msg += ' has been declined.';
            return push.send( msg, pj.hygienist.user.platform, pj.hygienist.user.registrationId );
        })
        .then( function( response ) {
            return new Promise( function( resolve, reject ) {
                Email.send({
                    from: app.get('emailFrom'),
                    to: pj.hygienist.user.email,
                    bcc:  app.get('emailBcc'),
                    subject: 'Custom Offer on ' + moment(jj.startDate).format('ddd MMM D, YYYY') +  ' declined',
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
            console.log( 'rejected partial offer worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'rejected partial offer error!' );
            callback( err );
        });
    };


    Job.remoteMethod( 'resend', {
        accepts: [
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:jobId/resend' }
    });

    Job.resend = function( jobId, data, callback ) {
        console.log( 'resend invoice for job' );
        var Job = app.models.Job;
        var Email = app.models.Email;
        var jj, msg;

        Job.findById( jobId )
        .then( function( job ) {
            jj = job.toJSON();
            msg = 'You have a new invoice from  ';
            msg += jj.hygienist.firstName + ' ' + jj.hygienist.lastName;
            return push.send( msg, jj.dentist.user.platform, jj.dentist.user.registrationId );
        })
        .then( function() {
            Email.send({
                from: app.get('emailFrom'),
                to: jj.dentist.user.email,
                bcc: jj.hygienist.user.email + ', ' + app.get('emailBcc'),
                subject: 'Invoice from ' + jj.hygienist.firstName + ' ' + jj.hygienist.lastName,
                html: data.html },
                function(err) {
                    if (err) {
                        return new Error( 'error resending email: ' + err.message );
                    }
                    return;
            });
        })
        .then( function() {
            console.log( 'resend invoice worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'resend invoice error: ' + err.message );
            callback( err );
        });
    };

    Job.remoteMethod( 'send', {
        accepts: [
            {arg: 'jobId', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:jobId/invoices/send' }
    });

    Job.send = function( jobId, data, callback ) {

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
                from: app.get('emailFrom'),
                to: jj.dentist.user.email,
                bcc: jj.hygienist.user.email + ', ' + app.get('emailBcc'),
                subject: 'Invoice from ' + jj.hygienist.firstName + ' ' + jj.hygienist.lastName,
                html: data.html },
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

};
