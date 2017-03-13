#!/usr/bin/env node

var _        = require('lodash');
var config   = require('config');
var moment   = require('moment');
var loopback = require('loopback');
var app      = require('../api/tempstars-api');
var Promise  = require('bluebird');
var Nightmare = require('nightmare');

var scaper = Nightmare({show:false});

var getCDHOInfo = function( regNum ) {
    return function(scraper) {
        scraper
        .goto('https://publicregister.cdho.org/Pages/en_US/Forms/Public/Register/Default.aspx')
        .wait('#ctl00_BodyContent_MemberNameSearch_RegistrationNo')
        .type('#ctl00_BodyContent_MemberNameSearch_RegistrationNo', regNum )
        .click('form[action*="./Default.aspx"] [type=submit]')
        .wait('#ctl00_BodyContent_rgMain_ctl00')
        .click('#ctl00_BodyContent_rgMain_ctl00_ctl04_HyperLink2')
        .wait('#BodyContent_lblMemberName')
        .evaluate(function() {
            var nameElem = document.querySelector('#BodyContent_lblMemberName');
            var regStatusElem = document.querySelector('#BodyContent_MemberSummary_lblRegistrationStatus');
            var expiryDateElem = document.querySelector('#BodyContent_MemberSummary_lblExpiryDate');
            var instituteElem = document.querySelector('#BodyContent_MemberSummary_lblInstitute');
            var gradYearElem = document.querySelector('#BodyContent_MemberSummary_lblYearOfGraduation');
            var langElem = document.querySelector('#BodyContent_MemberSummary_lblLanguages');

            return {
                name: nameElem.innerText,
                status: regStatusElem.innerText,
                expiry: expiryDateElem.innerText,
                institute: instituteElem.innerText,
                gradYear: gradYearElem.innerText,
                languages: langElem.innerText
            };
        });
  };
};

var Hygienist = app.models.Hygienist;
var Email = app.models.Email;
var results = {
    numChecked: 0,
    numFound: 0,
    numNotFound: 0,
    numNotActive: 0
};
var notFound = [];
var notActive = [];
var lastMonth = moment().subtract(1,'month').format('YYYY-MM-DD');

// Get Hygienists who haven't had their CDHO registration checked or who have had it checked over a month ago
// isComplete = 1 and (lastCDHOCheck == null or lastCDHOCheck < lastMonth)
function getHygienistsToCheck() {
    return Hygienist.find({
        where: {and: [
            {isComplete: 1},
            {or: [
                {lastCDHOCheck: null},
                {lastCDHOCheck: {lt: lastMonth}}
            ]}
        ]},
        limit: 100
    });
}

function checkHygienists( hygienists ) {
    console.log( 'checking ' + hygienists.length + ' hygienists' );
    return Promise.map( hygienists, checkHygienist, {concurrency: 1} );
}

function checkHygienist( hygienist ) {
    return new Promise( function( resolve, reject ) {

        // Get the CDHO info
        console.log( '- checking hygienist id: ' + hygienist.id );
        results.numChecked++;
        // scraper = null;
        // var scaper = Nightmare({show:false});
        scaper.use( getCDHOInfo(hygienist.CDHONumber) )
        .then( function( info ) {
            console.log( '- CDHO record found' );
            results.numFound++;
            if ( info.status != 'Active' ) {
                notActive.push( hygienist.id );
                results.numNotActive++;
            }
            var data = {
                    cdhoStatus: info.status,
                    graduationYear: info.gradYear,
                    school: info.institute,
                    languages: info.languages,
                    lastCDHOCheck: moment().utc().format('YYYY-MM-DD HH:mm')
            };
            return hygienist.updateAttributes( data );
        })
        .catch( function( err ) {
            console.log( err.message );
            console.log( '- CDHO record NOT found' );
            results.numNotFound++;
            notFound.push( hygienist.id );
            var data = {
                cdhoStatus: 'Not Found',
                lastCDHOCheck: moment().utc().format('YYYY-MM-DD HH:mm')
            };
            return hygienist.updateAttributes( data );
        })
        .then( function() {
            console.log( '- finished check' );
            resolve();
        })
        .catch( function(err) {
            results.numNotFound++;
            console.log( 'Error scraping hygienist id ' + hygienist.id + ': ' + err );
            reject(err);
        });

    });
}

function emailResults() {
    console.log( '- emailing results' );
    return new Promise( function( resolve, reject ) {
        Email.send({
            to: config.email.to,
            from: config.email.from,
            subject: 'TempStars Scraping Results',
            text: 'Results\r\n' +
                  '----------\r\n' +
                'numChecked: ' + results.numChecked + '\r\n' +
                'numFound: ' + results.numFound + '\r\n' +
                'numNotFound: ' + results.numNotFound + '\r\n' +
                'numNotActive: ' + results.numNotActive + '\r\n\r\n' +
                'Not Found Ids: ' + notFound.join(', ') + '\r\n\r\n' +
                'Not Active Ids: ' + notActive.join(', ')
        }, function( err ) {
            if ( err ) {
                console.log( err.message );
            }
            resolve();
        });
    });
}

console.log( 'Scraper Service started: ' + moment.utc().toString() );

getHygienistsToCheck()
.then( checkHygienists )
.then( emailResults )
.then( function() {
    console.log( results );
    console.log( 'not found ids: ' + notFound.join(', '));
    console.log( 'not active ids: ' + notActive.join(','));
    return scaper.end();
})
.then( function() {
    console.log( 'Scraper Service ended:   ' + moment().toString() + '.');
    process.exit(0);
})
.catch( function(err) {
    console.error( err.message );
    console.log( 'Scraper Service ended:   ' + moment().toString() + '.');
    process.exit(-1);
});
