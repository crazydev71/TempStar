
TempStars.Pages.Hygienist.JobConfirmed = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'job-confirmed', function( page ) {
            $$('#hygienist-job-confirmed-modify-button').on( 'click', modifyButtonHandler );
            $$('#hygienist-job-confirmed-cancel-button').on( 'click', cancelButtonHandler );
        });

        app.onPageBeforeRemove( 'job-confirmed', function( page ) {
            $$('#hygienist-job-confirmed-modify-button').off( 'click', modifyButtonHandler );
            $$('#hygienist-job-confirmed-cancel-button').off( 'click', cancelButtonHandler );
        });
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Booked/Confirmed Job";
        TempStars.Hygienist.Router.goForwardPage('modify-job', {}, job );
    }


    function cancelButtonHandler( e ) {
        e.preventDefault();

        var cancelMessage = 'Are you sure?<br><br>' +
            job.dentist.practiceName + ' will be notified.';

        app.modal({
          title:  'Cancel Job',
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
            TempStars.Hygienist.Router.goBackPage();

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
