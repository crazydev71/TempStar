
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
        var h = TempStars.User.getCurrentUser().hygienist;
        var numCancelled = h.numCancelled || 0;
        var numBooked = h.numBooked || 1;
        var numWeeksBlocked = 0;
        var cancelPercent;

        numCancelled++;
        if ( numCancelled == 1 ) {
            // First offense, so always block 2 weeks
            numWeeksBlocked = 2;
        }
        else {
            cancelPercent = numCancelled / numBooked;
            if ( cancelPercent > 0.05 ) {
                numWeeksBlocked = numCancelled * 2;
            }
        }

        var cancelMessage = 'Cancelling this commitment will cause significant disruption to this office and its patients.<br>' +
            '<br><b>If you cancel this job, as a penalty the system will block you from viewing available jobs for <u>' + numWeeksBlocked + ' weeks</u>. ' +
            '<br><br>Are you sure you want to cancel?</b>';

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
            TempStars.User.refresh()
            .then( function() {
                TempStars.Analytics.track( 'Cancelled Job' );
                TempStars.Hygienist.Router.goBackPage();
            });
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
                var hygienistId = TempStars.User.getCurrentUser().hygienistId;
                var rate;

                if ( params.id ) {
                    TempStars.Api.getHygienistRate( hygienistId )
                    .then( function( r ) {
                        rate = r;
                        return TempStars.Hygienist.getJob( params.id );
                    })
                    .then( function( job ) {
                        job.hygienistRate = rate.result.rate;
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Api.getHygienistRate( hygienistId )
                    .then( function( r ) {
                        rate = r;
                        return TempStars.Hygienist.getJobsByDate( params.date );
                    })
                    .then( function( jobs ) {
                        job = jobs[0];
                        job.hygienistRate = rate.result.rate;                        
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
