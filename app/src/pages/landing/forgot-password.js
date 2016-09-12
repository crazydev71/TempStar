TempStars.Pages.ForgotPassword = (function() {

    function init() {

        app.onPageInit( 'forgot-password', function( page ) {
            $('#forgot-password-button').on( 'click', forgotPasswordButtonHandler );
            mainView.showNavbar();
        });

        app.onPageBeforeRemove( 'forgot-password', function( page ) {
            $('#forgot-password-button').off( 'click', forgotPasswordButtonHandler );
        });
    }

    function forgotPasswordButtonHandler( e ) {
        var constraints = {
            email: {
                presence: true,
                email: true
            }
        };

        var formData = app.formToJSON('#forgot-password-form');
        var errors = validate(formData, constraints);

        // Clear errors
        $$('#forgot-password-form .form-error-msg').html('');
        $$('#forgot-password-form .field-error-msg').removeClass( 'error' ).html('');

        if ( errors ) {
            if ( errors.email ) {
                $('#forgot-password-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            }
            return;
        }


        app.showPreloader('Sending Password Reset');
        TempStars.User.requestPasswordReset( formData.email )
        .then(function() {
            app.hidePreloader();
            $$('#forgot-password-status').show();
        })
        .catch( function( err ) {
            var msg;
                msg = 'Please try again.';

            app.hidePreloader();
            $$('#signup-form .form-error-msg')
                .html('<span class="ti-alert"></span> Sending password reset email failed. ' + msg )
                .show();
        });
    }

    return {
        init: init
    };

})();

TempStars.Pages.ForgotPassword.init();
