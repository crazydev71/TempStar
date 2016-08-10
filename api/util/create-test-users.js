
// Create test users
// This is idempotent

var Promise = require( 'bluebird' );
var app     = require( '../tempstars-api' );

var Role        = app.models.Role;
var User        = app.models.User;
var RoleMapping = app.models.RoleMapping;

var users = [   {username: "Test Admin",     email: 'testadmin@tempstars.net',     password: 'password', roles: ['admin'] },
                {username: "Test Dentist",   email: 'testdentist@tempstars.net',   password: 'password', roles: ['dentist'] },
                {username: "Test Hygienist", email: 'testhygienist@tempstars.net', password: 'password', roles: ['hygienist'] }
            ];


// Make sure this isn't prod
var NODE_ENV = process.env['NODE_ENV'];
if ( NODE_ENV == 'production' ) {
    console.log( 'Error: can only create test users in non-production environments.' );
    process.exit(-1);
}

// Create users and their roles if needed
createUsers()
.then( function() {
    console.log( 'done' );
})
.catch( function(err) {
    console.log( 'edone');
})
.finally( function() {
    process.exit();
})

function createUsers() {
    return Promise.map( users, createUser );
}

function createUser( user ) {
    return User.findOrCreate( {where: { email: user.email }}, user )
    .then( function( result ) {
        // findOrCreate returns an array with the first element being the actual result
        console.log( 'create user ' + result[0].username );
        return createUserRoles( [ result[0], user.roles ] );
    })
    .catch( function( err ) {
        console.log( 'error');
    });
}

function createUserRoles( userRoles ) {
    var user = userRoles[0];
    var roles = userRoles[1];

    return Promise.map( roles, function( role ) {
        return createUserRole( user, role );
    });
}

function createUserRole( user, role ) {
    return getRoleByName( role )
    .then( function( r ) {
        return RoleMapping.findOrCreate(
            {where: { and: [ {principalId: user.id}, {roleId: r.id}] }},
            { principalType: RoleMapping.USER,
              principalId: user.id,
              roleId: r.id })
        .then( function( result ) {
            console.log( 'added role to user: ' + r.name + ' to ' + user.username );
        })
        .catch( function( err ) {
            console.log( 'error creating user role' );
        });
    })
    .catch( function( err ) {
        console.log( 'error getting role' );
    })
}

function getRoleByName( roleName ) {
     return Role.findOne( { where: {name: roleName }})
     .then( function( result ) {
         if ( ! result ) {
             Promise.reject( new Error( 'role not found: ' + roleName ));
         }
         else {
             return result;
         }
     })
     .catch( function( err ) {
         console.err( 'error:', err );
         Promise.reject( err );
     });
}
