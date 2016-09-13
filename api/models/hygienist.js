
'use strict';

var Promise  = require( 'bluebird' );
var app      = require('../tempstars-api.js' );
var location = require( 'location' );

module.exports = function( Hygienist ) {

    Hygienist.disableRemoteMethod('createChangeStream', true);

    Hygienist.remoteMethod( 'account', {
        accepts: [
            {arg: 'id', type: 'number', required: true},
            {arg: 'data', type: 'object', http: { source: 'body' } } ],
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'put', path: '/:id/account' }
    });

    Hygienist.account = function( id, data, callback ) {
        var hygienist;
        var geocode;

        Hygienist.findById( id )
        .then( function( h ) {
            hygienist = h;
            data.isComplete = 1;
            return hygienist.updateAttributes( data );
        })
        .then( function() {
            return new Promise( function( resolve, reject ) {
                var address = hygienist.address + ', ' + hygienist.city + ', ' + hygienist.province + ' ' + hygienist.postalCode + ' Canada';
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
            var prefix = hygienist.postalCode.substr(0,2);
            return PostalCode.findOne( {where: {prefix: prefix} } );
        })
        .then( function( postalCode ) {
            return hygienist.updateAttributes( {
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
