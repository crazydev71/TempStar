TempStars.Pages.DentistSignup3 = (function() {

    function init() {

        app.onPageInit( 'dentist-signup3', function( page ) {
            mainView.showNavbar();
            $$('#dentist-signup3-done-button').on( 'click', doneButtonHandler );
            $$('#dentist-signup3-logout-link').on( 'click', logoutHandler );
            $$('#dentist-signup3-form input').on( 'keypress', keyHandler );
            TempStars.Analytics.track( 'Viewed Dentist Signup Page 3' );
        });

        app.onPageBeforeRemove( 'dentist-signup3', function( page ) {
            $$('#dentist-signup3-done-button').off( 'click', doneButtonHandler );
            $$('#dentist-signup3-logout-link').off( 'click', logoutHandler );
            $$('#dentist-signup3-form input').on( 'keypress', keyHandler );
        });

        app.onPageBeforeAnimation( 'dentist-signup3', function( page ) {
            mainView.showNavbar();
        });
    }

    function doneButtonHandler( e ) {
        var allData;

        var constraints = {
            primaryContact: {
                presence: true
            },
            parking: {
                presence: {message: "is required"}
            },
            payment: {
                presence: {message: "is required"}
            },
            hygienistArrival: {
                presence: {message: "is required"}
            },
            radiography: {
                presence: {message: "is required"}
            },
            ultrasonic: {
                presence: {message: "is required"}
            },
            avgApptTime: {
                presence: {message: "is required"}
            },
            charting: {
                presence: {message: "is required"}
            },
            software: {
                presence: {message: "is required"}
            }
        };

        // Clear errors
        $$('#dentist-signup3-form .form-error-msg').html('');
        $$('#dentist-signup3-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#dentist-signup3-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.primaryContact ) {
                $('#dentist-signup3-form input[name="primaryContact"]').addClass('error').next().html( errors.primaryContact[0] );
            }
            if ( errors.parking ) {
                $$('#dentist-signup3-form select[name="parking"]').addClass('error').next().html( errors.parking[0] );
            }
            if ( errors.payment ) {
                $$('#dentist-signup3-form select[name="payment"]').addClass('error').next().html( errors.payment[0] );
            }
            if ( errors.hygienistArrival ) {
                $$('#dentist-signup3-form select[name="hygienistArrival"]').addClass('error').next().html( errors.hygienistArrival[0] );
            }
            if ( errors.radiography ) {
                $$('#dentist-signup3-form select[name="radiography"]').addClass('error').next().html( errors.radiography[0] );
            }
            if ( errors.sterilization ) {
                $$('#dentist-signup3-form select[name="sterilization"]').addClass('error').next().html( errors.sterilization[0] );
            }
            if ( errors.ultrasonic ) {
                $$('#dentist-signup3-form select[name="ultrasonic"]').addClass('error').next().html( errors.ultrasonic[0] );
            }
            if ( errors.avgApptTime ) {
                $$('#dentist-signup3-form select[name="avgApptTime"]').addClass('error').next().html( errors.avgApptTime[0] );
            }
            if ( errors.charting ) {
                $$('#dentist-signup3-form select[name="charting"]').addClass('error').next().html( errors.charting[0] );
            }
            if ( errors.software ) {
                $$('#dentist-signup3-form select[name="software"]').addClass('error').next().html( errors.software[0] );
            }
            return;
        }

        // Save form data
        app.formStoreData('dentist-signup3-form', formData );

        app.showPreloader('Setting Up Account');

        // Build data to pass to server
        allData = {};
        allData.user = TempStars.User.getCurrentUser();
        allData.p1 = app.formGetData( 'dentist-signup1-form' );
        allData.p2 = { token: app.formGetData( 'dentist-signup2-form' ).token };
        allData.p3 = formData;

        TempStars.Dentist.setupAccount( allData )
        .then( function() {
            return TempStars.User.refresh();
        })
        .then(function() {
            app.hidePreloader();
            TempStars.Push.init();
            TempStars.User.updateRegistration();
            TempStars.Analytics.track( 'Dentist Completed Signup' );
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            $$('#dentist-signup3-form .form-error-msg')
                .html('<span class="ti-alert"></span> Setting up account failed. ' + err.error.message )
                .show();
        });
    }

    function logoutHandler( e ) {
        app.confirm( 'Are you sure you want to log out?', function() {
            TempStars.User.logout()
            .then( function() {
                mainView.router.loadPage( { url: 'index.html', animatePages: false } );
            });
        });
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#dentist-signup3-done-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init
    };

})();

TempStars.Pages.DentistSignup3.init();
