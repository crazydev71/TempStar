
TempStars.App = (function() {

    'use strict';

    var userInterface = 'landing';

    // From substack
    function compareVersions(a, b) {
        var pa = a.split('.');
        var pb = b.split('.');
        for (var i = 0; i < 3; i++) {
            var na = Number(pa[i]);
            var nb = Number(pb[i]);
            if (na > nb) return 1;
            if (nb > na) return -1;
            if (!isNaN(na) && isNaN(nb)) return 1;
            if (isNaN(na) && !isNaN(nb)) return -1;
        }
        return 0;
    }

    return {
        init: function init() {
            console.log( 'APP INIT' );

            if ( TempStars.Config.debug ) {

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
            }

            try {
                Stripe.setPublishableKey( TempStars.Config.stripe.pubKey );
                TempStars.Analytics.init();
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
            TempStars.App.isVersionOk()
            .then( function( ok ) {
                if ( ok ) {
                    TempStars.App.gotoStartingPage1();
                }
                else {
                    mainView.router.loadPage( 'landing/download.html' );
                }
                return;
            })
            .catch( function( err ) {
                mainView.router.loadPage( 'index.html' );
            });
        },

        gotoStartingPage1: function gotoStartingPage1() {
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
                    userInterface = 'dentist';
                    TempStars.Dentist.Router.goForwardPage( 'home' );
                }
                else {
                    // Go back to signup
                    userInterface = 'landing';
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
                    userInterface = 'hygienist';
                    TempStars.Hygienist.Router.goForwardPage('home');
                }
                else {
                    userInterface = 'landing';
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

        isVersionOk: function isVersionOk() {
            return new Promise( function( resolve, reject ) {
                TempStars.Api.getMinVersion()
                .then( function( response ) {
                    var minVersion = response.version;
                    console.log('platform: ' + window.device.platform);
                    if ( window.device.platform == 'iOS' || window.device.platform == 'Android' ) {
                        // If the app version is less than the minimum version, then it's no good
                        if ( compareVersions( TempStars.version, minVersion ) === -1 ) {
                            console.log( 'version is NOT ok' );
                            resolve( false );
                        }
                        else {
                            console.log( 'version is ok' );
                            resolve( true );
                        }
                    }
                    else {
                        console.log( 'version is ok' );
                        resolve( true );
                    }
                })
                .catch( function(err) {
                    console.log( err.message );
                    reject( err );
                });
            });
        }
    };

})();
