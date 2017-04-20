
TempStars.Pages.Hygienist.TodaysJob = (function() {
    'use strict';

    var job,
        workHistory;

    function init() {
        app.onPageBeforeInit( 'hygienist-todays-job', function( page ) {
            $$('#hygienist-todays-job-complete-button').on( 'click', completeButtonHandler );
            $$('#hygienist-todays-job-cancel-button').on( 'click', cancelButtonHandler );
            $$('#hygienist-todays-job-invoice-button').on( 'click', invoiceButtonHandler );
            $$('#hygienist-todays-job-survey-button').on( 'click', surveyButtonHandler );
            TempStars.Analytics.track( 'Viewed Today\'s Job' );
            $$('.popover-map').on('open', displayMap );
        });

        app.onPageBeforeRemove( 'hygienist-todays-job', function( page ) {
            $$('#hygienist-todays-job-complete-button').off( 'click', completeButtonHandler );
            $$('#hygienist-todays-job-cancel-button').off( 'click', cancelButtonHandler );
            $$('#hygienist-todays-job-invoice-button').off( 'click', invoiceButtonHandler );
            $$('#hygienist-todays-job-survey-button').off( 'click', surveyButtonHandler );
            $$('.popover-map').off('open', displayMap );
        });
    }

    function displayMap( e ) {
        TempStars.Map.displayLocation( job.dentist.lat, job.dentist.lon, job.dentist.practiceName );
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

        var cancelMessage = 'Cancelling this commitment will cause significant disruption to this office and its patients.<br>';

        if ( job.numDaysBlocked > 0 ) {
            cancelMessage += '<br><b>If you cancel this job, as a penalty the system will block you from viewing available jobs for <u>' + job.numDaysBlocked + ' days</u>.</b><br>';
        }

        cancelMessage += '<br><b>Are you sure you want to cancel?</b>';

        app.modal({
          title:  'WAIT!',
          text: cancelMessage,
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelJob }
          ]
        });

    }

    function invoiceButtonHandler( e ) {
        if ( job.hasInvoice ) {
            TempStars.Hygienist.Router.goForwardPage( 'invoice', {}, job );
        }
        else {
            TempStars.Hygienist.gotoInvoicePage(job);
        }
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

    function completeJob() {
        app.showPreloader('Updating Job');
        TempStars.Api.updateJob( job.id, {status: TempStars.Job.status.COMPLETED} )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Marked Job as Complete' );
            TempStars.Hygienist.Router.goBackPage('');
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error marking job as complete. Please try again.' );
        });
    }

    function surveyButtonHandler( e ) {
        e.preventDefault();
        TempStars.Hygienist.surveyButtonHandler( e, job.id );
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                var hygienistId = TempStars.User.getCurrentUser().hygienistId;
                var rate;

                TempStars.Api.getHygienistRate( hygienistId )
                .then( function( r ) {
                    rate = r;
                    return TempStars.Hygienist.getJobsByDate( moment().format('YYYY-MM-DD') );
                })
                .then( function( jobs ) {
                    if ( jobs.length == 0 ) {
                        resolve( { job: {}, workHistory:{} } );
                        return;
                    }
                    job = jobs[0];
                    job.isComplete = (job.status == TempStars.Job.status.COMPLETED ) ? true : false;
                    job.hasInvoice = (job.invoice) ? true : false;
                    job.hygienistRate = job.hourlyRate - job.bonus;
                    job.numDaysBlocked = rate.result.numDaysBlocked;
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
