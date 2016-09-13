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


        var resetWorked;
        var errorMessage = '';

        app.showPreloader('Sending Password Reset');
        setTimeout( function() {
            app.hidePreloader();
            if ( resetWorked ) {
                $$('#forgot-password-status').show();
            }
            else {
                $$('#forgot-password-form .form-error-msg')
                    .html('<span class="ti-alert"></span> Sending password reset email failed.<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + errorMessage )
                    .show();
            }
        }, 3000 );

        TempStars.User.requestPasswordReset( formData.email )
        .then( function() {
            resetWorked = true;
        })
        .catch( function( err ) {
            if ( err && err.error && err.error.message ) {
                errorMessage = err.error.message;
            }
            resetWorked = false;
        });
    }

    return {
        init: init
    };

})();

TempStars.Pages.ForgotPassword.init();
