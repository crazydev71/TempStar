TempStars.Pages.Signup = (function() {

    function init() {

        app.onPageInit( 'signup', function( page ) {
            mainView.showNavbar();
            $$('#signup-button').on( 'click', signupButtonHandler );
            $$('#signup-account-type-hygienist').on( 'change', toggleHygienist );
            $$('#signup-account-type-dentist').on( 'change', toggleDentist );
        });

        app.onPageBeforeRemove( 'signup', function( page ) {
            $$('#signup-button').off( 'click', signupButtonHandler );
            $$('#signup-account-type-hygienist').off( 'change', toggleHygienist );
            $$('#signup-account-type-dentist').off( 'change', toggleDentist );
        });
    }

    function signupButtonHandler(e) {
        var role;

        var constraints = {
            email: {
                presence: true,
                email: true
            },
            password: {
                presence: true,
                length: {
                    minimum: 6
                }
            }
        };

        var formData = app.formToJSON('#signup-form');
        var errors = validate(formData, constraints);

        // Clear errors
        $$('#signup-form .form-error-msg').html('');
        $$('#signup-form .field-error-msg').removeClass( 'error' ).html('');

        // Custom error checking for 'radio' button
        if ( ! $$('#signup-account-type-hygienist').prop('checked') &&
             ! $$('#signup-account-type-dentist').prop('checked') ) {
            $('#signup-account-error-msg').addClass('error').html( 'Must select one option' );
        }

        if ( errors ) {
            if ( errors.email ) {
                $('#signup-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            }
            if ( errors.password ) {
                $$('#signup-form input[name="password"]').addClass('error').next().html( errors.password[0] );
            }
            return;
        }

        if ( $$('#signup-account-type-hygienist').prop('checked') ) {
            role = TempStars.User.roles.HYGIENIST;
        }
        else if ( $$('#signup-account-type-dentist').prop('checked') ) {
            role = TempStars.User.roles.DENTIST;
        }

        app.showPreloader('Creating Account');
        TempStars.User.create( formData.email, formData.password, role )
        .then(function() {
            app.hidePreloader();
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            $$('#signup-form .form-error-msg')
                .html('<span class="ti-alert"></span> Create account failed. Please try again.')
                .show();
        });
    }

    function toggleHygienist(e) {
        if ( $$(this).prop('checked') ) {
            $$('#signup-account-type-dentist').prop('checked', false);
        }
    }

    function toggleDentist(e) {
        if ( $$(this).prop('checked') ) {
            $$('#signup-account-type-hygienist').prop('checked', false);
        }
    }

    function removeError(e) {
        $$(this).removeClass( 'error' ).next().html( '' );
    }

    return {
        init: init
    };

})();

TempStars.Pages.Signup.init();
