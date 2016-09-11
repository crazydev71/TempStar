
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
        var customer;
        var dentist;
        var geocode;

        stripe.customers.create({
          source: data.p2.token,
          description: data.p1.businessOwner,
          email: data.user.email
        })
        .then( function( c ) {
            customer = c;
            return Dentist.findById( data.user.dentistId );
        })
        .then( function( dentist ) {
            return dentist.updateAttributes({
                practiceName: data.p1.practiceName,
                businessOwner: data.p1.businessOwner,
                phone: data.p1.phone,
                address: data.p1.address,
                city: data.p1.city,
                province: data.p1.province,
                postalCode: data.p1.postalCode,
                stripeCustomerId: customer.id,
                isComplete: 1
            });
        })
        .then( function( d ) {
            dentist = d;
            return dentist.detail.create({
                primaryContact: data.p3.primaryContact,
                parking: data.p3.parking,
                payment: data.p3.payment,
                hygienistArrival: data.p3.hygienistArrival,
                radiography: data.p3.radiography,
                ultrasonic: data.p3.ultrasonic,
                sterilization: data.p3.sterilization,
                avgApptTime: data.p3.avgApptTime,
                recallReport: data.p3.recallReport,
                lunch: data.p3.lunch,
                charting: data.p3.charting,
                software: data.p3.software
            });
        })
        .then( function() {
            var address = dentist.address + ', ' + dentist.city + ', ' + dentist.province + ' ' + dentist.postalCode + ' Canada';
            return location.geocode( address );
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
