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
    billingDate,
    overallResults = [];

// Initialize
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
var mailer = nodemailer.createTransport( sesTransport({
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
}));
db = mysql.createConnection( config.db );


// Billing run
console.log( 'Billing run started at ' + moment.utc().format('YYYY-MM-DD hh:ss') + '.');

console.log( '- getting billing date' );
getBillDate()
.then( function( bd ) {
    billingDate = bd;
    console.log( '- billing date: ' + billingDate );
    overallResults.push( 'Billing date: ' + billingDate );
    console.log( '- updating job status' );
    return updateJobStatus( billingDate );
})
.then( function() {
    console.log( '- getting dentists to bill' );
    return getDentistsToBill( billingDate );
})
.then( function( dentists ) {
    console.log( '- found ' + dentists.length + ' dentists to bill' );
    overallResults.push( 'Dentists to bill: ' + dentists.length );
    return billDentists( dentists );
})
.then( function() {
    console.log( '- billing done' );
    console.log( '- saving new billing date' );
    return saveBillDate( billingDate );
})
.then( function() {
    console.log( '- saved new billing date' );
    console.log( '- sending email' );
    return sendEmail();
})
.then( function() {
    console.log( '- sent email' );
    console.log( 'Billing run ended at ' + moment.utc().format('YYYY-MM-DD hh:ss') + '.');
    //process.exit(0);
})
.catch( function( err ) {
    console.log( err.message );
    //process.exit(-1);
});

function getBillDate() {
    return new Promise( function( resolve, reject ) {
        db.queryAsync( "select lastBillDate from billing" )
        .then( function( results ) {
            var billDate = moment( results[0].lastBillDate ).add( 1, 'days').format('YYYY-MM-DD');
            resolve( billDate );
        })
        .catch( function( err ) {
            reject( err );
        });
    });
}

// Update jobs that were booked for date to completed
function updateJobStatus( billDate ) {
    return new Promise( function( resolve, reject ) {
        db.queryAsync( "update Job set status = 4 where status = 3 and startDate =?", [billDate])
        .then( function( results ) {
            console.log( '- updated ' + results.affectedRows + ' jobs status to COMPLETED');
            resolve();
        })
        .catch( function(err) {
            reject( err );
        });
    });
}

function getDentistsToBill( billDate ) {
    return new Promise( function( resolve, reject ) {
        var sql = 'select * from Job j ' +
                  'inner join Dentist d on d.id = j.dentistId ' +
                  'inner join Invoice i on i.jobId = j.id ' +
                  'where j.startDate = ? ' +
                  'and j.status = 4 ' +
                  'and j.dentistBilled is null';

        db.queryAsync( sql, [billDate] )
        .then( function( results ) {
            resolve( results );
        })
        .catch( function(err) {
            reject( err );
        });
    });
}

function billDentists( dentists ) {
    return Promise.map( dentists, function( dentist ) {
        return billDentist( dentist );
    });
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
            reject( err );
            return;
        })
        .then( function( result ) {
            // Update billed flag
            return db.queryAsync( "update Job set dentistBilled = 1 where id = ?", [billingInfo.jobId] );
        })
        .then( function( results ) {
            console.log( '- billed dentist: ' + billingInfo.practiceName );
            overallResults.push( '- billed ' + billingInfo.practiceName + ' for job ' +  billingInfo.jobId );
            resolve();
        })
        .catch( function(err) {
            reject( err );
        })
    });
}

function saveBillDate( billDate ) {
    return new Promise( function( resolve, reject ) {
        db.queryAsync( "update billing set lastBillDate = ? limit 1", [billDate] )
        .then( function( results ) {
            resolve();
        })
        .catch( function(err) {
            reject( err );
        })
    });
}

function sendEmail() {
    var text = overallResults.join("\n");
    var message = {
        from: config.email.from,
        to: config.email.to,
        subject: 'Billing Service Results',
        text: text
    };
    return mailer.sendMail( message );
}
