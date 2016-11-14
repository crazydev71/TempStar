
TempStars.Pages.Dentist.JobPosted = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'dentist-job-posted', function( page ) {
            $$('#dentist-job-posted-modify-button').on( 'click', modifyButtonHandler );
            $$('#dentist-job-posted-cancel-button').on( 'click', cancelButtonHandler );
            TempStars.Analytics.track( 'Viewed Posted Job' );

        });

        app.onPageBeforeRemove( 'dentist-job-posted', function( page ) {
            $$('#dentist-job-posted-modify-button').off( 'click', modifyButtonHandler );
            $$('#dentist-job-posted-cancel-button').off( 'click', cancelButtonHandler );
        });
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Posted Job";
        TempStars.Dentist.Router.goForwardPage('modify-job', {}, job );
    }

    function cancelButtonHandler( e ) {
        e.preventDefault();
        app.modal({
          title:  'Cancel Job',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelJob }
          ]
        });
    }

    function cancelJob() {
        app.showPreloader('Cancelling Job');
        TempStars.Api.cancelJob( TempStars.User.getCurrentUser().dentistId, job.id )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Cancelled Job' );
            TempStars.Dentist.Router.goBackPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error cancelling job. Please try again.' );
        });
    }

    function modifyJob() {
        console.log( 'modifying job');
    }

    // TODO
    function rateHygienist( result ) {
        TempStars.Api.updateJob( job.id, {hygienistRating: result} )
        .then( function() {
            TempStars.Dentist.Router.reloadPage('job-completed', { id: job.id } );
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Dentist.getJob( params.id )
                    .then( function( job ) {
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Dentist.getJobsByDate( params.date )
                    .then( function( jobs ) {
                        job = jobs[0];
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }

            });
        }
    };

})();

TempStars.Pages.Dentist.JobPosted.init();
