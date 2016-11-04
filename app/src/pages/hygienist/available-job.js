
TempStars.Pages.Hygienist.AvailableJob = (function() {
    'use strict';

    var job,
        workHistory;

    function init() {
        app.onPageBeforeInit( 'available-job', function( page ) {
            job = page.context.job;
            $$('#hygienist-available-job-accept-button').on( 'click', acceptButtonHandler );
            $$('#hygienist-available-job-partial-button').on( 'click', partialButtonHandler );
            TempStars.Analytics.track( 'Viewed Available Job Detail' );
        });

        app.onPageBeforeRemove( 'available-job', function( page ) {
            $$('#hygienist-available-job-accept-button').off( 'click', acceptButtonHandler );
            $$('#hygienist-available-job-partial-button').off( 'click', partialButtonHandler );
        });
    }

    function acceptButtonHandler( e ) {
        e.preventDefault();

        app.modal({
            title:  'Book and Confirm Job',
            text: 'You are committing to work at:<br>' +
                job.dentist.practiceName + '<br>' +
                moment( job.startDate ).format('ddd MMM D, YYYY') + '<br>' +
                moment.utc( job.shifts[0].postedStart ).local().format('h:mm a')  + ' - ' +
                moment.utc( job.shifts[0].postedEnd ).local().format('h:mm a') + '<br><br>' +
                '<b>Are you sure?</b>',
            buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: bookJob }
            ]
        });
    }

    function partialButtonHandler( e ) {
        TempStars.Hygienist.Router.goForwardPage('make-partial-offer', {}, job );
    }


    function bookJob() {
        app.showPreloader('Booking Job');
        TempStars.Api.bookJob( TempStars.User.getCurrentUser().hygienistId, job.id )
        .then( function() {
            app.hidePreloader();
            app.alert( 'You\'re confirmed!', function() {
                TempStars.Analytics.track( 'Booked Job' );                
                TempStars.Hygienist.Router.goForwardPage('home');
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error booking job: ' + err.error.message, function() {
                if ( err.error.message == 'Job is no longer available.' ) {
                    TempStars.Hygienist.Router.goBackPage('available-jobs');
                }
            });
        });
    }

    return {
        init: init,
        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                if ( params.id ) {
                    TempStars.Api.getHygienistJob( TempStars.User.getCurrentUser().hygienistId, params.id )
                    .then( function( j ) {
                        job = j;
                        job.isComplete = (job.status == TempStars.Job.status.COMPLETED ) ? true : false;
                        job.hasInvoice = (job.invoice) ? true : false;

                        // var hygienistLocation = new loopback.GeoPoint({ lat: job.hygienist.lat, lng: job.hygienist.lon});
                        // var dentistLocation = new loopback.GeoPoint({ lat: job.dentist.lat, lng: job.dentist.lon});
                        // job.distance = loopback.GeoPoint.distanceBetween( dentistLocation, hygienistLocation, {type: 'kilometers'});
                        job.distance = 0;
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
                }
                else {
                    TempStars.Hygienist.getJobsByDate( moment().format('YYYY-MM-DD') )
                    .then( function( jobs ) {
                        if ( jobs.length == 0 ) {
                            resolve( { job: {}, workHistory:{} } );
                            return;
                        }
                        job = jobs[0];
                        job.isComplete = (job.status == TempStars.Job.status.COMPLETED ) ? true : false;
                        job.hasInvoice = (job.invoice) ? true : false;
                        // var hygienistLocation = new loopback.GeoPoint({ lat: job.hygienist.lat, lng: job.hygienist.lon});
                        // var dentistLocation = new loopback.GeoPoint({ lat: job.dentist.lat, lng: job.dentist.lon});
                        // job.distance = loopback.GeoPoint.distanceBetween( dentistLocation, hygienistLocation, {type: 'kilometers'});
                        job.distance = 0;

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
                }
            });
        }
    };

})();

TempStars.Pages.Hygienist.AvailableJob.init();
