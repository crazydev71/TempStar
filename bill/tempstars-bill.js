#!/usr/bin/env node

var _            = require('lodash');
var config       = require('config');
var Promise      = require('bluebird');
var nodemailer   = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');
var mysql        = require('mysql');
var moment       = require('moment');
var stripe       = require('stripe')(config.stripe.secretKey);

var db,
    sql,
    today,
    msg,
    overallResults = [];

// Initialize
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
var mailer = nodemailer.createTransport( sesTransport({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
}));
db = mysql.createConnection( config.db );

// Billing run
log( 'Billing run started at ' + moment.utc().format('YYYY-MM-DD hh:ss') + ' UTC.' );

today = moment.utc().format('YYYY-MM-DD');
log( '- billing dentists for jobs completed before: ' + today );

updateJobStatus( today )
.then( function() {
    console.log( '- getting dentists to bill' );
    return getDentistsToBill( today );
})
.then( function( dentists ) {
    log( '- dentists to bill: ' + dentists.length );
    return billDentists( dentists );
})
.then( function() {
    log( 'Billing run ended at ' + moment.utc().format('YYYY-MM-DD hh:ss') + ' UTC.');
})
.then( function() {
    console.log( '- sending email' );
    return sendEmail();
})
.catch( function( err ) {
    console.log( err.message );
})
.finally( function() {
    process.exit();
})

// Update jobs that were booked before today to completed
function updateJobStatus( today ) {
    return new Promise( function( resolve, reject ) {
        db.queryAsync( "update Job set status = 4 where status = 3 and startDate < ?", [today] )
        .then( function( results ) {
            log( '- updated ' + results.affectedRows + ' jobs status to COMPLETED' );
            resolve();
        })
        .catch( function(err) {
            reject( err );
        });
    });
}

function getDentistsToBill( today ) {
    return new Promise( function( resolve, reject ) {
        var sql = 'select * from Job j ' +
                  'inner join Dentist d on d.id = j.dentistId ' +
                  'inner join Invoice i on i.jobId = j.id ' +
                  'where j.startDate < ? ' +
                  'and j.status = 4 ' +
                  'and j.dentistBilled is null';

        db.queryAsync( sql, [today] )
        .then( function( results ) {
            resolve( results );
        })
        .catch( function(err) {
            reject( err );
        });
    });
}

function billDentists( dentists ) {
    // return Promise.map( dentists, function( dentist ) {
    //     return billDentist( dentist );
    // });
    return Promise.map( dentists, billDentist, { concurrency: 1 } );
}

function billDentist( billingInfo ) {
    return new Promise( function( resolve, reject ) {

        console.log( '- billing dentist: ' + billingInfo.practiceName );

        // Charge dentist credit card
        stripe.charges.create({
              amount: config.stripe.amount,
              currency: config.stripe.currency,
              customer: billingInfo.stripeCustomerId
        })
        .catch( function(err) {
            log( '- error billing dentist: ' + billingInfo.practiceName + ' for job ' +  billingInfo.jobId + ' ' + err.message );
            reject( err );
            return;
        })
        .then( function( result ) {
            // Update billed flag
            return db.queryAsync( "update Job set dentistBilled = 1 where id = ?", [billingInfo.jobId] );
        })
        .then( function( results ) {
            log( '- billed dentist: ' + billingInfo.practiceName + ' for job ' +  billingInfo.jobId );
            resolve();
        })
        .catch( function(err) {
            log( '- error updating billing status dentist: ' + billingInfo.practiceName + ' for job ' +  billingInfo.jobId );
            reject( err );
        });
    });
}

function sendEmail() {
    var text = overallResults.join("\n");
    var message = {
        from: config.email.from,
        to: config.email.to,
        subject: 'TempStars Billing Service Report',
        text: text
    };
    return mailer.sendMail( message );
}

function log( msg ) {
    console.log( msg );
    overallResults.push( msg );
}
