
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
                //app.alert( 'We just sent an invitation e-mail to '+formData.firstName+'. When she signs up, '+formData.firstName+' will earn an extra $2/hr on her first placement. And you\'ll earn an extra $.25/hr on your next placement. When '+formData.firstName+' completes her first placement, you\'ll earn an extra $1.75/hr on your next placement! For details see <a href="http://www.tempstars.ca/invite">www.tempstars.ca/invite</a>','Thank You');

                 app.confirm('We just sent an invitation e-mail to '+formData.firstName+'. When she signs up, '+formData.firstName+' will earn an extra $2/hr on her first placement. And you\'ll earn an extra $.25/hr on your next placement. When '+formData.firstName+' completes her first placement, you\'ll earn an extra $1.75/hr on your next placement! For details see <a href="http://www.tempstars.ca/invite">www.tempstars.ca/invite</a><br/><br/> Invite Another Colleague?', 'Thank You!', 
                  function () {
                    //app.alert('You clicked Ok button');
                  },
                  function () {
                    TempStars.Hygienist.Router.goForwardPage('home');
                  }
                );

                document.getElementById("invite-colleague-form").reset();

            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert( 'Error sending invite. Please try again' );
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
