
'use strict';

var Promise  = require( 'bluebird' );
var app      = require('../tempstars-api.js' );
var stripe   = require( 'stripe' )(app.get('stripeSecretKey'));
var location = require( 'location' );

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
        var customerId;
        var dentist;
        var geocode;

        Dentist.findById( data.user.dentistId )
        .then( function( d ) {
            dentist = d;
            if ( dentist.stripeCustomerId ) {
                return Promise.resolve( dentist.stripeCustomerId );
            }
            else {
                return new Promise( function( resolve, reject ) {
                    stripe.customers.create({
                        source: data.p2.token,
                        description: data.p1.businessOwner,
                        email: data.user.email
                    })
                    .then( function( c ) {
                        resolve( c.id );
                    });
                });
            }
        })
        .then( function( cid ) {
            customerId = cid;
            return dentist.updateAttributes({
                practiceName: data.p1.practiceName,
                businessOwner: data.p1.businessOwner,
                phone: data.p1.phone,
                address: data.p1.address,
                city: data.p1.city,
                province: data.p1.province,
                postalCode: data.p1.postalCode,
                photoUrl: data.p1.photoUrl,
                stripeCustomerId: customerId,
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
            console.dir( gc );
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
/*
        {
            job: {
                dentistId: id,
                hygienistId: 14,
                postedOn: '2016-09-19',
                startDate: '2016-09-22'
            },
            shifts: [
                { shiftDate: '2016-09-22', startTime:'9:00', endTime: '17:00'},
                { shiftDate: '2016-09-23', startTime:'9:00', endTime: '17:00'}
            ]
        }
*/
    console.dir( data );
        // Create a new job and the shifts for that job
        var j = data.job;
        j.dentistId = parseInt(id);
        Job.create( j )
        .then( function( job ) {
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
            console.log( 'post job worked!' );
            callback( null, {} );
        })
        .catch( function( err ) {
            console.log( 'post job error!' );
            callback( err );
        });
    };


};
