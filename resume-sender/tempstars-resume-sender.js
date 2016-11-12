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
var dentistLocation;
var tmpFolder;
var zipFile;

console.log( 'Resume Sender Service started: ' + moment.utc().toString() );

getSendResumeRequests()
.then( fillRequests )
.then( function( results ) {
    console.log( '- finished sending resumes' );
})
.catch( function( err ) {
    console.log( '- error: ' + err.message );
})
.finally( function() {
    console.log( 'Resume Sender Service ended:   ' + moment().toString() + '.');
})


function getSendResumeRequests() {
    return new Promise( function( resolve, reject ) {
        console.log( '- getting all Send Resume Requests' );

        // Get all the unsent requests
        SendResumeRequest.find({ where: { sentOn: null}})
        .then( function( requests ) {
            resolve( requests );
        })
        .catch( function( err ) {
            reject( err );
        });
    });
}

function fillRequests( requests ) {
    console.log( '- found ' + requests.length + ' requests for resumes' );
    return Promise.map( requests, fillRequest, {concurrency: 1} );
}

function fillRequest( request ) {
    return new Promise( function( resolve, reject ) {

        console.log( '- processing request id: ' + request.id );
        var Dentist = app.models.Dentist;
        var numResumes;

        // Get the dentist
        Dentist.findById( parseInt( request.dentistId ) )
        .then( function( dentist ) {
            zipFile = 'resumes-' + dentist.id + '.zip';

            // Get Hygienists nearby
            console.log( '- for dentist: ' + dentist.practiceName );
            return getHygienistsNearDentist( dentist );
        })
        .then( function( hygienists ) {
            // Get best candidate resumes
            return getBestCandidateResumes( request, hygienists );
        })
        .then( function( resumeUrls ) {
            // Download resumes
            numResumes = resumeUrls.length;
            return downloadResumes( resumeUrls );
        })
        .then( function() {
            // Zip up resumes
            return zip( tmpFolder.name );
        })
        .then( function( zf ) {
            // Send email
            zipFile = zf;
            return email( request.email, zipFile );
        })
        .then( function() {
            // Update db
            return request.updateAttributes({
                resumesSent: numResumes,
                sentOn: moment.utc().format('YYYY-MM-DD HH:mm')
            });
        })
        .then( function() {
            // Clean up
            rimraf.sync( tmpFolder.name );
            //tmpFolder.removeCallback();
            fs.unlinkSync( zipFile );
            resolve();
        })
        .catch( function( err ) {
            console.log( err.message );
            reject( err );
        });
    });
}

function getHygienistsNearDentist( dentist ) {
    // Get the hygienists ordered by distance from the dentist
    var Hygienist = app.models.Hygienist;
    dentistLocation = new loopback.GeoPoint( { lat: dentist.lat, lng: dentist.lon });
    return Hygienist.find( {where: {location: {near: dentistLocation}}, limit:100} );
}

function getBestCandidateResumes( request, hygienists ) {

    // Filter out hygienist who are more than 110km
    hygienists = _.map( hygienists, function( hygienist ) {
        var hygienistLocation = new loopback.GeoPoint({ lat: hygienist.lat, lng: hygienist.lon});
        var distance = loopback.GeoPoint.distanceBetween( dentistLocation, hygienistLocation, {type: 'kilometers'});
        if ( distance > 110 ) {
            return false;
        }
        return hygienist;
    });
    hygienists = _.compact( hygienists );

    // Filter out the hygienists without a resume
    hygienists = _.reject( hygienists, ['resumeUrl', null] );

    // Sort by star rating
    hygienists = _.orderBy( hygienists, ['starScore'], ['desc'] );

    // Only process max resumes requested
    if ( hygienists.length > request.maxResumes ) {
        hygienists.length = request.maxResumes;
    }

    // Extract the resume URLs
    var resumeUrls = _.map( hygienists, 'resumeUrl' );
    return resumeUrls;
}

function downloadResumes( resumeUrls ) {
    console.log( '- downloading resumes' );
    tmpFolder = tmp.dirSync();
    return Promise.all( resumeUrls.map( function( url ) {
        return download( url, tmpFolder.name );
    }));
}

function zip( folder ) {
    console.log( '- zipping ' + folder );

    return new Promise( function( resolve, reject ) {
        var zip = new FolderZip();
        zip.zipFolder( folder, {parentFolderName: 'resumes'}, function(){
            zip.writeToFileSync( zipFile );
            resolve( zipFile );
        });
    });
}

function email( emailAddress, zipFile ) {
    console.log( '- emailing ' + emailAddress );
    return new Promise( function( resolve, reject ) {
        Email.send({
            to: emailAddress,
            from: 'no-reply@tempstars.net',
            subject: 'TempStars resumes',
            text: 'Here are the matching resumes.',
            attachments: [ { path: zipFile } ]
        }, function( err ) {
            if ( err ) {
                console.log( err.message );
            }
            resolve();
        });
    });
}
