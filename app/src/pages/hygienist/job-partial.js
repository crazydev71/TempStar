
TempStars.Pages.Hygienist.JobPartial = (function() {
    'use strict';

    var job;
    var initialized = false;

    function init() {

        if ( ! initialized ) {

            app.onPageBeforeInit( 'job-partial', function( page ) {
                $$('#hygienist-job-partial-modify-button').on( 'click', modifyButtonHandler );
                $$('#hygienist-job-partial-cancel-button').on( 'click', cancelButtonHandler );
            });

            initialized = true;
        }
    }

    function modifyButtonHandler( e ) {
        e.preventDefault();
        var po = job.partialOffers[0];
        po.startDate = job.startDate;
        po.jobId = job.id;
        TempStars.Hygienist.Router.goForwardPage('modify-partial-offer', {}, po );
    }


    function cancelButtonHandler( e ) {
        e.preventDefault();

        var cancelMessage = 'Are you sure?<br><br>' + job.dentist.practiceName +
                            ' will be notified.';

        app.modal({
          title:  'Cancel Job',
          text: cancelMessage,
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: cancelPartialOffer }
          ]
        });
    }

    function cancelPartialOffer() {
        app.showPreloader('Cancelling Partial Offer');
        TempStars.Api.cancelPartialOffer( job.partialOffers[0].id )
        .then( function() {
            app.hidePreloader();
            TempStars.Hygienist.Router.goBackPage();

        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error cancelling partial offer. Please try again.' );
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Api.getJob( params.id )
                    .then( function( j ) {
                        job = j;
                        job.partialOffers = _(job.partialOffers).filter(['hygienistId', TempStars.User.getCurrentUser().hygienistId]).value();
                        resolve( job );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Api.getHygienistPartialOffers( TempStars.User.getCurrentUser().hygienistId )
                    .then( function( pos ) {
                        var a = _(pos).filter(['job.startDate', params.date] ).value();
                        job = a[0].job;
                        resolve( job );
                    })
                    // TempStars.Hygienist.getHygienistPartialOffers( params.date )
                    // .then( function( jobs ) {
                    //     job = jobs[0];
                    //     job.partialOffers = _(job.partialOffers).filter(['hygienistId', TempStars.User.getCurrentUser().hygienistId]).value();
                    //     resolve( job );
                    // })
                    .catch( function( err ) {
                        reject( err );
                    });
                }

            });
        }
    };

})();

TempStars.Pages.Hygienist.JobPartial.init();
