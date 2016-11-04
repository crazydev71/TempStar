
TempStars.Pages.Hygienist.Job = (function() {
    'use strict';

    function init() {
        app.onPageBeforeInit( 'hygienist-job', function( page ) {
            $$('#hygienist-job-notes-save-button').on( 'click', saveNotesHandler );
            TempStars.Analytics.track( 'Viewed Job Details' );
        });

        app.onPageBeforeRemove( 'hygienist-job', function( page ) {
            $$('#hygienist-job-notes-save-button').off( 'click', saveNotesHandler );
        });

    }

    function saveNotesHandler( e ) {
        var jobId = $$(this).attr('data-id');
        var notes = $$('#hygienist-job-notes').val();
        app.showPreloader('Saving Private Notes');

        TempStars.Api.updateJob( jobId, { hygienistPrivateNotes: notes} )
        .then( function() {
            app.hidePreloader();
            TempStars.Hygienist.Router.goBackPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error saving notes. Please try again.' );
        });
    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Hygienist.Job.init();
