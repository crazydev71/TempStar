
TempStars.Pages.Hygienist.DentalOffices = (function() {
    'use strict';

    function init() {
        app.onPageBeforeInit( 'dental-offices', function( page ) {
            $$('.hygienist-dentaloffices-remove-blocked-button').on( 'click', removeBlockedHandler );
            $$('.hygienist-dentaloffices-remove-fav-button').on( 'click', removeFavHandler );
            TempStars.Analytics.track( 'Viewed Dental Offices' );            
        });

        app.onPageBeforeRemove( 'dental-offices', function( page ) {
            $$('.hygienist-dentaloffices-remove-blocked-button').off( 'click', removeBlockedHandler );
            $$('.hygienist-dentaloffices-remove-fav-button').off( 'click', removeFavHandler );
        });
    }

    function removeBlockedHandler( e ) {
        var name = $(this).attr('data-name');
        var blockedDentistId = $(this).attr('data-id');
        var hygienistId = TempStars.User.getCurrentUser().hygienistId;

        app.confirm('Are you sure you want to remove ' + name + '?', 'Remove Blocked Office', function() {
            app.showPreloader('Removing Blocked Office');
            TempStars.Api.removeBlockedDentist( hygienistId, blockedDentistId )
            .then( function(){
                app.hidePreloader();
                TempStars.Hygienist.Router.reloadPage('dental-offices');
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert('Error removing dental office. Please try again.' );
            });
        });
    }

    function removeFavHandler( e ) {
        var name = $(this).attr('data-name');
        var favDentistId = $(this).attr('data-id');
        var hygienistId = TempStars.User.getCurrentUser().hygienistId;

        app.confirm('Are you sure you want to remove ' + name + '?', 'Remove Favourite Office', function() {
            app.showPreloader('Removing Favourite Office');
            TempStars.Api.removeFavouriteDentist( hygienistId, favDentistId )
            .then( function(){
                app.hidePreloader();
                TempStars.Hygienist.Router.reloadPage('dental-offices');
            })
            .catch( function( err ) {
                app.hidePreloader();
                app.alert('Error removing dental office. Please try again.' );
            });
        });
    }

    return {
        init: init,

        getData: function getData() {
            var data = {};

            return new Promise( function( resolve, reject ) {
                TempStars.Api.getBlockedDentists( TempStars.User.getCurrentUser().hygienistId )
                .then( function( blockedDentists ) {
                    data.blocked = blockedDentists;
                    return TempStars.Api.getFavouriteDentists( TempStars.User.getCurrentUser().hygienistId );
                })
                .then( function( favDentists ) {
                    data.favourites = favDentists;
                    resolve( data );
                })
                .catch( function( err ) {
                    app.alert('Error retrieving dental offices. Please try again' );
                    reject( err );
                });
            });
        }

    };

})();

TempStars.Pages.Hygienist.DentalOffices.init();
