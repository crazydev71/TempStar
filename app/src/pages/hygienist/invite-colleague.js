
TempStars.Pages.Hygienist.InviteColleague = (function() {

    'use strict';

    var data;

    function init() {
        app.onPageBeforeInit( 'hygienist-invite-colleague', function( page ) {
            // CLOSE MODAL IF ITS OPEN
            $('.modal-overlay-visible').click();

            $$('#invite-colleague-button').on( 'click', inviteColleagueButtonHandler );

            TempStars.Analytics.track( 'Viewed Invite Colleague' );
        });

        app.onPageBeforeRemove( 'hygienist-invite-colleague', function( page ) {
            $$('#invite-colleague-button').off( 'click', inviteColleagueButtonHandler );
        });
    }


    function inviteColleagueButtonHandler(e) {
        var role;
        var user;

        user = TempStars.User.getCurrentUser();
        console.log(user);

        var constraints = {
            email: {
                presence: true,
                email: true
            }
        };

        var formData = app.formToJSON('#invite-colleague-form');
        var errors = validate(formData, constraints);

        // Clear errors
        $$('#invite-colleague-form .form-error-msg').html('');
        $$('#invite-colleague-form .field-error-msg').removeClass( 'error' ).html('');

        if ( errors ) {
            if ( errors.email ) {
                $('#invite-colleague-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            }
            return;
        }

        console.log(formData);

        app.showPreloader('Sending Invite');
        TempStars.Api.sendInvite( user.id, formData )
            .then( function() {
                app.hidePreloader();
                app.alert( 'We just send an invitation e-mail to your colleague. When she signs up, she\'ll earn an extra $2 an hour on her first placement, and you will earn an extra $0.25 on your next placement. Once she goes on her first placement, you\'ll earn an extra $1.75 on your next placement!','Thank You');
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert( 'Error sending invoice. Please try again' );
            });

    }

    function getData() {
        return new Promise( function( resolve, reject ) {
            TempStars.Api.getHygienist()
            .then( function( profile ) {
                data = profile;
                resolve( data );
            })
            .catch( function( err ) {
                app.alert('Error retrieving profile. Please try again' );
                reject( err );
            });
        });
    }

    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Hygienist.InviteColleague.init();
