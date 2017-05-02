#!/usr/bin/env node

var fs       = require( 'fs' );
var _        = require('lodash');
var moment   = require('moment');
var loopback = require( 'loopback' );
var app      = require( '../api/tempstars-api' );
var Promise  = require('bluebird');
var path     = require( 'path' );
var download = require( 'download' );
var tmp      = require('tmp');
var FolderZip = require( 'folder-zip' );
var rimraf    = require( 'rimraf' );

var SendResumeRequest = app.models.SendResumeRequest;
var Email = app.models.Email;

function sendSorryEmail( emailAddress ) {
    console.log( '- emailing sorry ' + emailAddress );
    return new Promise( function( resolve, reject ) {
        Email.send({
            to: emailAddress,
            from: app.get('emailFrom'),
            subject: 'TempStars email test',
            text: 'Sorry there are no matching resumes at this time.'
        }, function( err ) {
            if ( err ) {
                console.log( err.message );
                reject( err );
            }
            resolve();
        });
    });
}

sendSorryEmail( 'drjyounger@hotmail.com' )
.then( function() {
    console.log( 'sent');
})
.catch( function(err) {
    console.log( err.message );
});
