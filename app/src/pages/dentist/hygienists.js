
TempStars.Pages.Dentist.Hygienists = (function() {
    'use strict';

    function init() {
        app.onPageBeforeInit( 'hygienists', function( page ) {
            $$('.dentist-hygienists-remove-blocked-button').on( 'click', removeBlockedHandler );
            $$('.dentist-hygienists-remove-fav-button').on( 'click', removeFavHandler );
            TempStars.Analytics.track( 'Viewed Hygienists' );            
        });

        app.onPageBeforeRemove( 'hygienists', function( page ) {
            $$('.dentist-hygienists-remove-blocked-button').off( 'click', removeBlockedHandler );
            $$('.dentist-hygienists-remove-fav-button').off( 'click', removeFavHandler );
        });
    }

    function removeBlockedHandler( e ) {
        var name = $(this).attr('data-name');
        var blockedHygienistId = $(this).attr('data-id');
        var dentistId = TempStars.User.getCurrentUser().dentistId;

        app.confirm('Are you sure you want to remove ' + name + '?', 'Remove Blocked Hygienist', function() {
            app.showPreloader('Removing Blocked Hygienist');
            TempStars.Api.removeBlockedHygienist( dentistId, blockedHygienistId )
            .then( function() {
                app.hidePreloader();
                TempStars.Dentist.Router.reloadPage('hygienists');
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert('Error removing hygienist. Please try again.' );
            });
        });
    }

    function removeFavHandler( e ) {
        var name = $(this).attr('data-name');
        var favHygienistId = $(this).attr('data-id');
        var dentistId = TempStars.User.getCurrentUser().dentistId;

        app.confirm('Are you sure you want to remove ' + name + '?', 'Remove Favourite Hygienist', function() {
            app.showPreloader('Removing Favourite Hygienist');
            TempStars.Api.removeFavouriteHygienist( dentistId, favHygienistId )
            .then( function() {
                app.hidePreloader();
                TempStars.Dentist.Router.reloadPage('hygienists');
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert('Error removing hygienist. Please try again.' );
            });
        });
    }

    return {
        init: init,

        getData: function getData() {
            var data = {};

            return new Promise( function( resolve, reject ) {
                TempStars.Api.getBlockedHygienists( TempStars.User.getCurrentUser().dentistId )
                .then( function( blockedHygienists ) {
                    data.blocked = blockedHygienists;
                    return TempStars.Api.getFavouriteHygienists( TempStars.User.getCurrentUser().dentistId );
                })
                .then( function( favHygienists ) {
                    data.favourites = favHygienists;
                    resolve( data );
                })
                .catch( function( err ) {
                    app.alert('Error retrieving hygienists. Please try again' );
                    reject( err );
                });
            });
        }

    };

})();

TempStars.Pages.Dentist.Hygienists.init();
