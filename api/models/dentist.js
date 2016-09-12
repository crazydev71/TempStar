
'use strict';

var Promise  = require( 'bluebird' );
var app      = require('../tempstars-api.js' );
var stripe   = require( 'stripe' )(app.get('stripeSecretKey'));
var location = require( 'location' );

module.exports = function( Dentist ) {

    Dentist.disableRemoteMethod('createChangeStream', true);

    Dentist.remoteMethod( 'account', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post', path: '/:id/account' }
    });

    Dentist.account = function( id, data, callback ) {
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
            return new Promise( function( resolve, reject ) {
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
};
