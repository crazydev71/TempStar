
TempStars.App = (function() {

    'use strict';

    return {
        init: function init() {
            app.onPageBeforeInit( '*', function( page ) {
                console.log( page.name + ': onPageBeforeInit' );
            });

            app.onPageInit( '*', function( page ) {
                console.log( page.name + ': onPageInit' );
            });

            app.onPageReinit( '*', function( page ) {
                console.log( page.name + ': onPageReinit' );
            });

            app.onPageBeforeAnimation( '*', function( page ) {
                console.log( page.name + ': onPageBeforeAnimation' );
            });

            app.onPageAfterAnimation( '*', function( page ) {
                console.log( page.name + ': onPageAfterAnimation' );
            });

            app.onPageBeforeRemove( '*', function( page ) {
                console.log( page.name + ': onPageBeforeRemove' );
            });

            app.onPageBack( '*', function( page ) {
                console.log( page.name + ': onPageBack' );
            });

            app.onPageAfterBack( '*', function( page ) {
                console.log( page.name + ': onPageAfterBack' );
            });

            // TODO
            try {
                Stripe.setPublishableKey('pk_test_fPZwN5y87Dx9r3C4FWhdzGVH');
            }
            catch(e) {
                console.log( e.message );
            }

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
            var menuContent,
                template,
                compiledTemplate,
                user,
                practiceName,
                fullName,
                photoUrl;

            if ( TempStars.User.isDentist() ) {
                if ( TempStars.User.isSetupComplete() ) {

                    // Set up dentist menu
                    template = $$('#dentist-menu').html();
                    compiledTemplate = Template7.compile( template );
                    user = TempStars.User.getCurrentUser();
                    console.dir( user );
                    practiceName = _.capitalize( user.dentist.practiceName );
                    photoUrl = (user.dentist.photoUrl) ? user.dentist.photoUrl : 'img/dental-office.png';
                    menuContent = compiledTemplate({
                        practiceName: practiceName,
                        city: _.trim( user.dentist.city ),
                        province: user.dentist.province,
                        photoUrl: photoUrl
                    });
                    $('#panel-menu').html(menuContent);

                    mainView.router.loadPage({
                        url: 'dentist/home.html',
                        context: user,
                        animatePages: false
                    });
                }
                else {
                    // Go back to signup
                    mainView.router.loadPage( { url: 'landing/dentist-signup1.html', animatePages: false } );
                }
            }
            else {
                if ( TempStars.User.isSetupComplete() ) {

                    // Set up hygienist menu
                    template = $$('#hygienist-menu').html();
                    compiledTemplate = Template7.compile( template );
                    user = TempStars.User.getCurrentUser();
                    console.dir( user );
                    fullName = _.capitalize( user.hygienist.firstName ) + ' ' + _.capitalize( user.hygienist.lastName );
                    photoUrl = (user.hygienist.photoUrl) ? user.hygienist.photoUrl : 'img/hygienist.png';
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
