
TempStars.User = (function() {

    'use strict';

    var userLoggedIn,
        userAuth,
        userAccount;

    return {
        roles:  {
            'ADMIN': 5,
            'DENTIST': 4,
            'HYGIENIST': 6
        },

        getCurrentUser: function getCurrentUser() {
            return userAccount;
        },

        refresh: function refresh() {
            return new Promise( function( resolve, reject ) {
                TempStars.User.getAccount()
                .then( function( account ) {
                    userAccount = account;
                    TempStars.Storage.set( 'userAccount', account );
                    resolve();
                })
                .catch( function( err ) {
                    console.log( 'refresh failed' );
                    reject( err );
                });
            });
        },

        autoLogin: function autoLogin() {
            return new Promise( function( resolve, reject ) {

                userLoggedIn = false;
                userAuth = undefined;
                userAccount = undefined;

                TempStars.Storage.get( 'userAuth' )
                .then( function( auth ) {
                    userAuth = auth;
                    TempStars.Api.setAuthToken( userAuth.id );
                    userLoggedIn = true;
                    return TempStars.Storage.get( 'userAccount' );
                })
                .then( function( account ) {
                    userAccount = account;
                    TempStars.Push.init();
                    return TempStars.User.updateRegistration();
                })
                .then( function() {
                    resolve();
                })
                .catch( function( err ) {
                    reject();
                });
            });
        },

        login: function login( email, password ) {
            return new Promise( function( resolve, reject ) {

                userLoggedIn = false;
                userAuth = undefined;
                userAccount = undefined;
                TempStars.Storage.remove( 'userAuth' );
                TempStars.Storage.remove( 'userAccount' );

                TempStars.Api.login( email, password )
                .then( function( auth ) {
                    userLoggedIn = true;
                    userAuth = auth;
                    TempStars.Storage.set( 'userAuth', auth );
                    TempStars.Api.setAuthToken( auth.id );
                    return TempStars.User.getAccount();
                })
                .then( function( account ) {
                    userAccount = account;
                    TempStars.Storage.set( 'userAccount', account );
                    // Setup push notifications
                    TempStars.Push.init();
                })
                .then( function() {
                    resolve();
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        },

        getAccount: function getAccount() {
            var fullAccount;

            return new Promise( function( resolve, reject ) {
                TempStars.Api.getUserAccount()
                .then( function( ua ) {
                    fullAccount = ua;
                    if ( ua.roles[0].id == TempStars.User.roles.DENTIST ) {
                        return TempStars.Api.getDentist();
                    }
                    else {
                        return TempStars.Api.getHygienist();
                    }
                })
                .then( function( a ) {
                    if ( fullAccount.roles[0].id == TempStars.User.roles.DENTIST ) {
                        fullAccount.dentist = a;
                    }
                    else {
                        fullAccount.hygienist = a;
                    }
                    resolve( fullAccount );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        },

        isDentist: function isDentist() {
            if ( userAccount && userAccount.roles[0].id == TempStars.User.roles.DENTIST ) {
                return true;
            }
            return false;
        },

        isHygienist: function isHygienist() {
            if ( userAccount && userAccount.roles[0].id == TempStars.User.roles.HYGIENIST ) {
                return true;
            }
            return false;
        },

        isSetupComplete: function isSetupComplete() {
            if ( ! userAccount ) {
                return false;
            }

            if ( userAccount.roles[0].id == TempStars.User.roles.DENTIST ) {
                if ( userAccount.dentist.isComplete ) {
                    return true;
                }
            }
            else if (  userAccount.roles[0].id == TempStars.User.roles.HYGIENIST ) {
                if ( userAccount.hygienist.isComplete ) {
                    return true;
                }
            }
            return false;
        },

        logout: function logout() {
            return new Promise( function( resolve, reject ) {

                TempStars.Api.logout()
                .finally( function() {
                    userAuth = undefined;
                    userAccount = undefined;
                    userLoggedIn = false;
                    TempStars.Api.setAuthToken( null );
                    TempStars.Storage.remove( 'userAuth' );
                    TempStars.Storage.remove( 'userAccount' );
                    delete window.registrationId;
                    resolve();
                });

            });
        },

        create: function create( email, password, role ) {
            return new Promise( function( resolve, reject ) {
                TempStars.Api.createAccount( email, password, role )
                .then( function( authResult ) {
                    userAuth = authResult.result;
                    TempStars.Api.setAuthToken( userAuth.id );
                    userLoggedIn = true;
                    TempStars.Storage.set( 'userAuth', userAuth );
                    return TempStars.User.getAccount();
                })
                .then( function( account ) {
                    userAccount = account;
                    TempStars.Storage.set( 'userAccount', account );
                    resolve();
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        },

        requestPasswordReset: function requestPasswordReset( email ) {
            return TempStars.Api.resetPassword( email );
        },

        updateRegistration: function updateRegistration() {
            return new Promise( function( resolve, reject ) {

                console.log( 'updating push registration' );

                if ( ! userLoggedIn ) {
                    console.log( 'updating push registration - user not logged in' );
                    resolve();
                    return;
                }

                if ( ! window.registrationId ) {
                    console.log( 'updating push registration - push token not set' );
                    resolve();
                    return;
                }

                if ( window.registrationId == userAccount.registrationId ) {
                    console.log( 'updating push registration - push token not changed' );
                    resolve();
                    return;
                }

                console.log( 'updating push registration token for user' );
                TempStars.Api.updateRegistration( userAccount.id, device.platform, window.registrationId )
                .then( TempStars.User.refresh )
                .then( function() {
                    resolve();
                })
                .catch( function( err) {
                    resolve();
                });
            });
        },

        updateLastJobId: function updateLastJobId( jobId ) {
            if ( jobId > userAccount.hygienist.lastJobIdViewed ) {
                userAccount.hygienist.lastJobIdViewed = jobId;
            }
        }

    };
})();
