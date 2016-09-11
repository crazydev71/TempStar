
var Promise = require('bluebird');

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyBe9yK51RCqEYIMDF5BHmk5lFw7gHHMuLM',
  timeout: 10 * 1000,
  Promise: Promise
});

function geocode( address ) {
    return new Promise( function( resolve, reject ) {

        googleMapsClient.geocode( { address: address } ).asPromise()
        .then( function( resp ) {
            var msg;
            console.dir( resp );
            if ( resp.json.status != 'OK' ) {
                msg = ( resp.json.error_message ) ? resp.json.error_message : resp.json.status;
                reject( new Error( msg ));
            }
            else {
                resolve( resp.json.results[0].geometry.location );
            }
        })
        .catch( function( err ) {
            reject( err );
        });

    });
}

module.exports = {
    geocode
};
