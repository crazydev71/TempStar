TempStars.Pages.Signup = (function() {

    function init() {

        app.onPageInit( 'signup', function( page ) {
            mainView.showNavbar();
            $$('#signup-button').on( 'click', signupButtonHandler );
            $$('#signup-account-type-hygienist').on( 'change', toggleHygienist );
            $$('#signup-account-type-dentist').on( 'change', toggleDentist );
            $$('#signup-form input').on( 'keypress', keyHandler );

            $(document).on( 'opened', '.popover-invite', openInvitePopoverHandler );
            $(document).on( 'closed', '.popover-invite', closeInvitePopoverHandler );

            TempStars.Analytics.track( 'Viewed Create Account Page' );
        });

        app.onPageBeforeRemove( 'signup', function( page ) {
            $$('#signup-button').off( 'click', signupButtonHandler );
            $$('#signup-account-type-hygienist').off( 'change', toggleHygienist );
            $$('#signup-account-type-dentist').off( 'change', toggleDentist );
            $$('#signup-form input').off( 'keypress', keyHandler );

            $(document).off( 'opened', '.popover-invite', openInvitePopoverHandler );
            $(document).off( 'closed', '.popover-invite', closeInvitePopoverHandler );
            
        });
    }

    function openInvitePopoverHandler( e ) {
        // Forces resuming app to stay on page
        window.cameraOpen = true;
    }

    function closeInvitePopoverHandler(e) {
        // Forces resuming app to go to main page
        window.cameraOpen = false;
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
            if ( ! errors ) {
                errors = {};
            }
            errors.accountType = ['Must select one option'];
        }

        if ( errors ) {
            if ( errors.accountType ) {
                $('#signup-account-error-msg').addClass('error').html( 'Must select one option' );
            }
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

        if(formData.inviteCode != ''){
            
            TempStars.User.checkUserInviteCode( formData.inviteCode )
            .then(function(){
                return TempStars.User.create( formData.email, formData.password, role, formData.inviteCode )
            })
            .then(function() {
                console.log('user created');
                app.hidePreloader();
                TempStars.Analytics.track( 'Created Account' );

                TempStars.App.clearSignupData();
                TempStars.App.gotoStartingPage();
            })
            .catch( function( err ) {
                console.log(err);
                var msg;
                if ( err && err.error && err.error.details && err.error.details.messages && err.error.details.messages.email ) {
                    msg = err.error.details.messages.email[0] + '.';
                }else if(err == 'Invalid invite code'){
                    msg = 'Invalid invite code.'
                }
                else {
                    msg = 'Please try again.'
                }
                app.hidePreloader();
                $$('#signup-form .form-error-msg')
                .html('<span class="ti-alert"></span> Create account failed. ' + msg )
                .show();
            });
            
        }else{
            TempStars.User.create( formData.email, formData.password, role, formData.inviteCode )
            .then(function() {
                app.hidePreloader();
                TempStars.Analytics.track( 'Created Account' );

                TempStars.App.clearSignupData();
                TempStars.App.gotoStartingPage();
            })
            .catch( function( err ) {
                var msg;
                if ( err && err.error && err.error.details && err.error.details.messages && err.error.details.messages.email ) {
                    msg = err.error.details.messages.email[0] + '.';
                }
                else {
                    msg = 'Please try again.'
                }
                app.hidePreloader();
                $$('#signup-form .form-error-msg')
                    .html('<span class="ti-alert"></span> Create account failed. ' + msg )
                    .show();
            });
        }

        
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

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#signup-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init
    };

})();

TempStars.Pages.Signup.init();
