
TempStars.Pages.Dentist.JobConfirmed = (function() {
    'use strict';

    var job;

    function init() {
        app.onPageBeforeInit( 'dentist-job-confirmed', function( page ) {
            $$('#dentist-job-confirmed-cancel-button').show();
            $$('#dentist-job-confirmed-break-button').hide();

            $$('#dentist-job-confirmed-modify-button').on( 'click', modifyButtonHandler );
            $$('#dentist-job-confirmed-cancel-button').on( 'click', cancelButtonHandler );
            $$('#dentist-job-confirmed-break-button').on( 'click', breakButtonHandler );

            $('#hygienist-rating').starRating({
                starSize: 20,
                activeColor: 'gold',
                initialRating: page.context.hygienist.starScore,
                readOnly: true,
                useGradient: false
            });

            TempStars.Analytics.track( 'Viewed Confirmed Job' );
        });

        app.onPageBeforeRemove( 'dentist-job-confirmed', function( page ) {
            $$('#dentist-job-confirmed-modify-button').off( 'click', modifyButtonHandler );
            $$('#dentist-job-confirmed-cancel-button').off( 'click', cancelButtonHandler );
            $$('#dentist-job-confirmed-break-button').off( 'click', breakButtonHandler );
        });
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        job.pageTitle = "Booked Job";
        TempStars.Dentist.Router.goForwardPage('modify-job', {}, job );
    }

    function cancelButtonHandler( e ) {
        e.preventDefault();
        $$('#dentist-job-confirmed-cancel-button').hide();
        $$('#dentist-job-confirmed-break-button').show();
    }

    function breakButtonHandler( e ) {
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
            app.modal({
                title:  'Job Cancelled',
                text: '',
                buttons: [{
                    text: 'OK', bold: true, onClick: function() {
                        TempStars.Dentist.Router.goBackPage();
                    }}
                ]
            });
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
                    .then( function( j ) {
                        job = j;
                        TempStars.Api.getHygienistRate( job.hygienistId )
                        .then( function( r ) {
                            job.hygienistRate = r.result.rate;
                            resolve( job );
                        });
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Dentist.getJobsByDate( params.date )
                    .then( function( jobs ) {
                        job = jobs[0];
                        TempStars.Api.getHygienistRate( job.hygienistId )
                        .then( function( r ) {
                            job.hygienistRate = r.result.rate;
                            resolve( job );
                        });
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
