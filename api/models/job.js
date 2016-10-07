
var _        = require( 'lodash' );
var Promise  = require( 'bluebird' );
var moment   = require( 'moment' );
var app      = require('../tempstars-api.js' );
var push     = require( 'push' );

push.init( app.get('gcmApiKey') );

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

        console.log( 'accept partial offer' );

        // change PO status to accepted, update hygienist
        // change job status to confirmed, update hygienist
        // notify accepted partial offer hygienist
        // change other partial offers status to rejected
        // notify other partial offer hygienists

        var PartialOffer = app.models.PartialOffer;
        var Shift = app.models.Shift;
        var partialOffer,
            job,
            jj,
            msg,
            poJSON;

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

            return job.updateAttributes({
                status: jobStatus.CONFIRMED,
                hygienistId: partialOffer.hygienistId,
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
        // .then( function() {
        //     return PartialOffer.find( {jobId: jobId, status: 1} );
        // })
        // .then( function( rpo ) {
        //     rejectedPartialOffers = rpo;
        // })
        .then( function() {
            // Accept the real partial offer
            return partialOffer.updateAttributes({
                status: 2,
                hygienistId: partialOffer.hygienistId
            });
        })
        .then( function() {
            // Notify accepted hygienist
            msg = 'Your partial offer on ';
            msg += moment(jj.startDate).format('ddd MMM Do');
            msg += ' with ' + jj.dentist.practiceName;
            msg += ' has been accepted, booked, and confirmed.';
            return push.send( msg, [poJSON.hygienist.user.registrationId] );
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
            console.log( 'accept partial offer worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'accept partial offer error!' );
            callback( err );
        });
    };


    Job.remoteMethod( 'resend', {
        accepts: [
            {arg: 'jobId', type: 'number', required: true}],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:jobId/resend' }
    });

    Job.resend = function( jobId, callback ) {
        console.log( 'resend invoice for job' );
        callback( null, {} );
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

        // TODO send notification
        console.log( 'send invoice for job: ' + jobId );
        console.dir( data );

        Shift.findOne( {where: {jobId: jobId}} )
        .then( function( shift ) {
            console.log( 'got shift');
            console.dir( shift );
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
            var jj = job.toJSON();
            msg = 'You have a new invoice from  ';
            msg += jj.hygienist.firstName + ' ' + jj.hygienist.lastName;
            return push.send( msg, [jj.dentist.user.registrationId] );
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
