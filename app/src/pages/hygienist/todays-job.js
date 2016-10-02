
TempStars.Pages.Hygienist.TodaysJob = (function() {
    'use strict';

    var job,
        workHistory;

    function init() {
        app.onPageBeforeInit( 'todays-job', function( page ) {
            $$('#hygienist-todays-job-complete-button').on( 'click', completeButtonHandler );
            $$('#hygienist-todays-job-cancel-button').on( 'click', cancelButtonHandler );
            $$('#hygienist-todays-job-invoice-button').on( 'click', invoiceButtonHandler );
            $$('#hygienist-todays-job-survey-button').on( 'click', surveyButtonHandler );
        });

        app.onPageBeforeRemove( 'todays-job', function( page ) {
            $$('#hygienist-todays-job-complete-button').off( 'click', completeButtonHandler );
            $$('#hygienist-todays-job-cancel-button').off( 'click', cancelButtonHandler );
            $$('#hygienist-todays-job-invoice-button').off( 'click', invoiceButtonHandler );
            $$('#hygienist-todays-job-survey-button').off( 'click', surveyButtonHandler );
        });
    }

    function completeButtonHandler( e ) {
        e.preventDefault();
        app.modal({
          title:  'Mark Job as Complete',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: completeJob }
          ]
        });
    }

    function cancelButtonHandler( e ) {
        e.preventDefault();
        app.modal({
          title:  'Cancel Job',
          text: 'Are you sure? Cancelling a booked/confirmed job may cause disruption at this office and may negatively impact your status on TempStars.',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelJob }
          ]
        });
    }

    function surveyButtonHandler( e ) {
        app.modal({
          title:  'Rate the Dental Office',
          text: 'How happy would you be to work at this office again?',
          verticalButtons: true,
          buttons: [
            {
                text: 'Very Happy',
                onClick: function() {
                    app.alert('Great, they will be added to your favourites.', function() {
                        saveSurvey( TempStars.Survey.VERY_HAPPY );
                    });
                }
            },
            {
                text: 'Pleased',
                onClick: function() {
                    app.alert('Thanks, all set.', function() {
                        saveSurvey( TempStars.Survey.PLEASED );
                    });
                }
            },
            {
                text: 'No Thank You!',
                onClick: function() {
                    app.alert('Sorry, they will be added to your blocked list.', function() {
                        saveSurvey( TempStars.Survey.NO_THANK_YOU );
                    });
                }
            }
          ]
        });
    }

    function invoiceButtonHandler( e ) {
        if ( job.hasInvoice ) {
            TempStars.Hygienist.Router.goForwardPage( 'invoice', {}, job );
        }
        else {
            TempStars.Hygienist.Router.goForwardPage( 'create-invoice', {}, job );            
        }
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

    function completeJob() {
        app.showPreloader('Updating Job');
        TempStars.Api.updateJob( job.id, {status: TempStars.Job.status.COMPLETED} )
        .then( function() {
            app.hidePreloader();
            TempStars.Hygienist.Router.goBackPage('');
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error marking job as complete. Please try again.' );
        });
    }

    function saveSurvey( result ) {
        app.showPreloader('Saving Survey');
        TempStars.Api.updateJob( job.id, {hygienistSurvey: result} )
        .then( function() {

            var data = { dentistId: job.dentistId };

            if ( result == TempStars.Survey.VERY_HAPPY ) {
                return TempStars.Api.addFavouriteDentist( job.hygienistId, data );
            }
            else if ( result == TempStars.Survey.NO_THANK_YOU ) {
                return TempStars.Api.addBlockedDentist( job.hygienistId, data );
            }
            else {
                return Promise.resolve();
            }
        })
        .then( function() {
            app.hidePreloader();
            TempStars.Hygienist.Router.reloadPage('todays-job');
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error saving survey. Please try again.' );
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                TempStars.Hygienist.getJobsByDate( moment().format('YYYY-MM-DD') )
                .then( function( jobs ) {
                    if ( jobs.length == 0 ) {
                        resolve( { job: {}, workHistory:{} } );
                        return;
                    }
                    job = jobs[0];
                    job.isComplete = (job.status == TempStars.Job.status.COMPLETED ) ? true : false;
                    job.hasInvoice = (job.invoice) ? true : false;
                    return TempStars.Hygienist.getJobsByDentist( job.dentistId );
                })
                .then( function( dentistJobs ) {
                    if ( dentistJobs.length == 0 ) {
                        workHistory =  {};
                    }
                    else {
                        // workHistory = dentistJobs;
                        workHistory = _.remove( dentistJobs, function(o) {
                            return o.hygienistPrivateNotes != null;
                        });
                    }
                    resolve( {job: job, workHistory: workHistory} );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        }
    };

})();

TempStars.Pages.Hygienist.TodaysJob.init();
