#!/usr/bin/env node

//var _            = require('lodash');
//var config       = require('config');
var nodemailer   = require('nodemailer');
var sesTransport = require('nodemailer-ses-transport');

// Initialize the mailer to use SES
var mailer = nodemailer.createTransport( sesTransport({
    accessKeyId: 'AKIAJFUJRZ25B3ASWI4Q',
    secretAccessKey: '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'
}));

var message = {
    from: 'billing@tempstars.net',
//    to: 'mbetts@me.com, drjyounger@hotmail.com',
    to: 'mbetts@me.com',
    subject: 'Billing Service Results',
    text: 'Here are the billing activities...'
};

console.log( 'billing service ran' );

mailer.sendMail( message, function( err, info ) {
    if ( err ) {
        console.log( 'error sending email' );
    }
    else {
        console.log( 'sent email' );
    }
});
