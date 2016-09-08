
TempStars.App = (function() {

    'use strict';

    var userLoggedIn,
        userAuth,
        userAccount;

    return {
        init: function init() {

            // TODO
            Stripe.setPublishableKey('pk_test_fPZwN5y87Dx9r3C4FWhdzGVH');

            TempStars.User.autoLogin()
            .then( function() {
                TempStars.App.gotoStartingPage();
            })
            .catch( function() {
                // Stay on main page
                console.log( 'autoLogin failed' );
            });
        },

        gotoStartingPage: function gotoStartingPage() {
            var menuContent;

            if ( TempStars.User.isDentist() ) {
                if ( TempStars.User.isSetupComplete() ) {

                    // Set up dentist menu
                    menuContent = $('#dentist-menu').html();
                    $('#panel-menu').html(menuContent);

                    mainView.router.loadPage( { url: 'dentist/dentist.html', animatePages: false } );
                }
                else {
                    mainView.router.loadPage( { url: 'landing/dentist-signup1.html', animatePages: false } );
                }
            }
            else {
                if ( TempStars.User.isSetupComplete() ) {

                    // Set up hygienist menu
                    menuContent = $('#hygienist-menu').html();
                    $('#panel-menu').html(menuContent);

                    mainView.router.loadPage( { url: 'hygienist/hygienist.html', animatePages: false } );
                }
                else {
                    mainView.router.loadPage( { url: 'landing/hygienist-signup.html', animatePages: false } );
                }
            }

        },

        clearSignupData: function clearSignupData() {
            app.formDeleteData('dentist-signup1-form');
            app.formDeleteData('dentist-signup2-form');
            app.formDeleteData('dentist-signup3-form');
            app.formDeleteData('hygienist-signup-form');
        },

        // TODO
        logout: function logout() {
            app.formDeleteData('dentist-signup1-form');
            app.formDeleteData('dentist-signup2-form');
            app.formDeleteData('dentist-signup3-form');
            app.formDeleteData('hygienist-signup-form');
        },

        sendPasswordResetLink: function sendPasswordResetLink() {

        }
    };
})();
