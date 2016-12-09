
TempStars.Pages.Hygienist.JobConfirmed = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'hygienist-job-confirmed', function( page ) {
            $$('#hygienist-job-confirmed-modify-button').on( 'click', modifyButtonHandler );
            $$('#hygienist-job-confirmed-cancel-button').on( 'click', cancelButtonHandler );
            $$('.popover-map').on('open', displayMap );
            TempStars.Analytics.track( 'Viewed Confirmed Job' );
        });

        app.onPageBeforeRemove( 'hygienist-job-confirmed', function( page ) {
            $$('#hygienist-job-confirmed-modify-button').off( 'click', modifyButtonHandler );
            $$('#hygienist-job-confirmed-cancel-button').off( 'click', cancelButtonHandler );
            $$('.popover-map').off('open', displayMap );
        });
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Booked/Confirmed Job";
        TempStars.Hygienist.Router.goForwardPage('modify-job', {}, job );
    }


    function cancelButtonHandler( e ) {
        e.preventDefault();

        var cancelMessage = 'This office and patients are counting on you. Cancelling confirmed jobs may negatively impact your status on TempStars. Are you sure you want to cancel this job?<br><br>' +
            job.dentist.practiceName + ' will be notified.';

        app.modal({
          title:  'WAIT!',
          text: cancelMessage,
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelJob }
          ]
        });
    }

    function cancelJob() {
        app.showPreloader('Cancelling Job');
        TempStars.Api.hygienistCancelJob( TempStars.User.getCurrentUser().hygienistId, job.id )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Cancelled Job' );
            TempStars.Hygienist.Router.goBackPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error cancelling job. Please try again.' );
        });
    }

    function displayMap( e ) {
        TempStars.Map.displayLocation( job.dentist.lat, job.dentist.lon, job.dentist.practiceName );
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Hygienist.getJob( params.id )
                    .then( function( job ) {
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Hygienist.getJobsByDate( params.date )
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

TempStars.Pages.Hygienist.JobConfirmed.init();
