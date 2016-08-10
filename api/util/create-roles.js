
// Create roles if they don't exist

var Promise = require( 'bluebird' );
var app     = require( '../tempstars-api' );

var roles = ['admin', 'dentist', 'hygienist'];

Promise.map( roles, function( role ) {
    return new Promise( function( resolve, reject ) {
        app.models.Role.findOrCreate(
            {where: { name: role }},
            {name: role },
            function( err, result ) {
                if ( err ) {
                    reject( err );
                }
                else {
                    resolve( result );
                }
        });
    });
})
.then( function( results ) {
    console.log( 'created roles:');
    console.log( results );
    console.log( "" );
})
.catch( function( errors ) {
    console.error( 'error creating roles' );
    console.error( errors );
})
.finally( function() {
    process.exit();
})
