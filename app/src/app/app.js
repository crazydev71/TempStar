
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
                    var template = $$('#dentist-menu').html();
                    var compiledTemplate = Template7.compile( template );
                    var user = TempStars.User.getCurrentUser();
                    console.dir( user );
                    var practiceName = _.capitalize( user.dentist.practiceName );
                    var photoUrl = (user.dentist.photoUrl) ? user.dentist.photoUrl : 'img/dental-office.png';
                    menuContent = compiledTemplate({
                        practiceName: practiceName,
                        city: _.trim( user.dentist.city ),
                        province: user.dentist.province,
                        photoUrl: photoUrl
                    });
                    $('#panel-menu').html(menuContent);

                    mainView.router.loadPage( { url: 'dentist/home.html', animatePages: false } );
                }
                else {
                    // Go back to signup
                    mainView.router.loadPage( { url: 'landing/dentist-signup1.html', animatePages: false } );
                }
            }
            else {
                if ( TempStars.User.isSetupComplete() ) {

                    // Set up hygienist menu
                    var template = $$('#hygienist-menu').html();
                    var compiledTemplate = Template7.compile( template );
                    var user = TempStars.User.getCurrentUser();
                    console.dir( user );
                    var fullName = _.capitalize( user.hygienist.firstName ) + ' ' + _.capitalize( user.hygienist.lastName );
                    var photoUrl = (user.hygienist.photoUrl) ? user.hygienist.photoUrl : 'img/hygienist.png';
                    menuContent = compiledTemplate({
                        fullname: fullName,
                        city: _.trim( user.hygienist.city ),
                        province: user.hygienist.province,
                        photoUrl: photoUrl
                    });
                    $('#panel-menu').html(menuContent);

                    mainView.router.loadPage( { url: 'hygienist/home.html', animatePages: false } );
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
        }
    };
    
})();
