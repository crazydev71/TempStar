'use strict';

var Promise = require( 'bluebird' );
var voucher_codes = require('voucher-code-generator');


module.exports = function( TSUser ) {

    var roles =  {
        'ADMIN': 5,
        'DENTIST': 4,
        'HYGIENIST': 6
    };

    TSUser.remoteMethod( 'account', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object' },
        http: { verb: 'post' }
    });

    TSUser.account = function( data, callback ) {
        console.log( 'create account data: ' + JSON.stringify(data) );

        var user;
        var RoleMapping = TSUser.app.models.RoleMapping;
        var Dentist = TSUser.app.models.Dentist;
        var Hygienist = TSUser.app.models.Hygienist;

        //var inviteCode = Date.now() / 1000 | 0;
        var inviteCode = voucher_codes.generate({
            length: 8,
            count: 1
        });

        console.log(inviteCode);


        // Create the user, role, account, and then log the user in
        TSUser.create( { email: data.email, password: data.password, inviteCode: inviteCode } )
        .then( function( u ) {
            user = u;
            // Give them the appropriate role
            return RoleMapping.create({
                principalType: RoleMapping.USER,
                principalId: user.id,
                roleId: data.role
            });
        })
        .then( function( r ) {
            // Create account based on role
            if ( data.role == roles.DENTIST ) {
                return Dentist.create( { isComplete: false } );
            }
            else {
                return Hygienist.create( { isComplete: false } );
            }
        })
        .then( function( account ) {
            if ( data.role == roles.DENTIST ) {
                return user.updateAttributes( { dentistId: account.id });
            }
            else {
                return user.updateAttributes( { hygienistId: account.id });
            }
        })
        .then( function() {
            // Log them in
            return TSUser.login( { email: data.email, password: data.password });
        })
        .then( function( auth ) {
            // Return auth
            callback( null, auth );
        })
        .catch( function( err ) {
            console.log( 'error creating account' );
            callback( err );
        });
    };

    TSUser.on( 'resetPasswordRequest', function( info ) {
        console.dir( info.accessToken );

        console.log(info.email); // the email of the requested user
        console.log(info.accessToken.id); // the temp access token to allow password reset

        // requires AccessToken.belongsTo(User)
        info.accessToken.user( function(err, user ) {
            console.log(user); // the actual user
        });

        var url = TSUser.app.get('resetPasswordLink');
        var html = 'Click <a href="' + url + '?access_token=' +
                    info.accessToken.id + '">here</a> to reset your password';
        TSUser.app.models.Email.send({
          to: info.email,
          from: TSUser.app.get('emailFrom'),
          subject: 'Password reset',
          html: html
        }, function(err) {
          if (err) return console.log('> error sending password reset email');
          console.log('> sending password reset email to:', info.email);
        });

    });
};
