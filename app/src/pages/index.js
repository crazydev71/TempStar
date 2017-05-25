TempStars.Pages.Index = (function() {

    function init() {
        console.log( 'ON INDEX PAGE INIT');
        app.onPageInit( 'index', function( page ) {
            $$('#login-button').on( 'click', loginButtonHandler );
            $$('#login-form input').on( 'keypress', keyHandler );
        }).trigger();

        app.onPageBeforeRemove( 'index', function( page ) {
            $$('#login-button').off( 'click', loginButtonHandler );
            $$('#login-form input').off( 'keypress', keyHandler );
        });

        // Global handler for logout
        $$(document).on( 'click', '.logout-link', TempStars.Menu.logout );
    }

    function loginButtonHandler(e) {

        var constraints = {
            email: {
                presence: true,
                email: true
            },
            password: {
                presence: true
            }
        };

        var formData = app.formToJSON('#login-form');
        var errors = validate(formData, constraints );

        // Clear errors
        $$('#login-form .form-error-msg').html('');
        $$('#login-form .field-error-msg').removeClass( 'error' ).html('');

        // If there are validation errors, show them
        if ( errors ) {
            if ( errors.email ) {
                $('#login-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            }
            if ( errors.password ) {
                $$('#login-form input[name="password"]').addClass('error').next().html( errors.password[0] );
            }
            return;
        }

        formData.email = formData.email.toLowerCase();

        app.showPreloader('Logging In');
        TempStars.User.login( formData.email, formData.password )
        .then(function() {
            app.hidePreloader();
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            var msg = err.message || 'Please try again.';
            app.hidePreloader();
            $$('#login-form .form-error-msg')
                .html('<span class="ti-alert"></span> Login failed. ' + msg)
                .show();
            if ( err.message ) {
                TempStars.User.logout();
            }
        });
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#login-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init
    };

})();

TempStars.Pages.Index.init();
