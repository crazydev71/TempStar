
TempStars.Pages.Dentist.JobConfirmed = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'job-confirmed', function( page ) {
            $$('#dentist-job-confirmed-modify-button').on( 'click', modifyButtonHandler );
            $$('#dentist-job-confirmed-cancel-button').on( 'click', cancelButtonHandler );
            TempStars.Analytics.track( 'Viewed Confirmed Job' );            
        });

        app.onPageBeforeRemove( 'job-confirmed', function( page ) {
            $$('#dentist-job-confirmed-modify-button').off( 'click', modifyButtonHandler );
            $$('#dentist-job-confirmed-cancel-button').off( 'click', cancelButtonHandler );
        });
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Booked Job";
        TempStars.Dentist.Router.goForwardPage('modify-job', {}, job );
    }


    function cancelButtonHandler( e ) {
        e.preventDefault();

        var cancelMessage = 'This hygienist has committed and is counting on this shift. Cancelling confirmed jobs may negatively impact your status on TempStars. Are you sure you want to cancel this job?<br><br>';

        if ( job.hygienist && job.hygienist.firstName ) {
            cancelMessage += job.hygienist.firstName + ' '
                            + job.hygienist.lastName
                            + ' will be notified.';
        }

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
        TempStars.Api.cancelJob( TempStars.User.getCurrentUser().dentistId, job.id )
        .then( function() {
            app.hidePreloader();
            TempStars.Dentist.Router.goBackPage();

        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error cancelling job. Please try again.' );
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

TempStars.Pages.Dentist.JobConfirmed.init();
