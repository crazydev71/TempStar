
TempStars.Pages.Hygienist.AvailableJob = (function() {
    'use strict';

    var job,
        workHistory;

    function init() {

        app.onPageBeforeInit( 'hygienist-available-job', function( page ) {
            console.log(page);
            job = page.context.job;
            $$('#hygienist-available-job-accept-button').on( 'click', acceptButtonHandler );
            $$('#hygienist-available-job-custom-button').on( 'click', customButtonHandler );
            $$('#hygienist-available-job-tooltip-desc').on( 'click', tooltipDescButtonHandler );
            $$('#hygienist-available-job-custom-button-tooltip').on( 'click', customTooltipButtonHandler );

            TempStars.Analytics.track( 'Viewed Available Job Detail' );
            $$('.popover-map').on('open', displayMap );

            if (job.shifts[0].type === 2) {
                $$('#hygienist-available-job-tooltip').show();
                $$('#hygienist-available-job-accept-button').hide();
            }
            else {
                $$('#hygienist-available-job-tooltip').hide();
                $$('#hygienist-available-job-accept-button').show();
            }
        });

        app.onPageBeforeRemove( 'hygienist-available-job', function( page ) {
            $$('#hygienist-available-job-accept-button').off( 'click', acceptButtonHandler );
            $$('#hygienist-available-job-custom-button').off( 'click', customButtonHandler );
            $$('#hygienist-available-job-tooltip-desc').off( 'click', tooltipDescButtonHandler );
            $$('#hygienist-available-job-custom-button-tooltip').off( 'click', customTooltipButtonHandler );
            $$('.popover-map').off('open', displayMap );
        });
    }

    function displayMap( e ) {
        TempStars.Map.displayLocation( job.dentist.lat, job.dentist.lon, job.dentist.practiceName );
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
                '<b>You are making a commitment.<br>There are penalties for<br>cancelling booked shifts.</b><br><br>' +
                '<b>Are you sure?</b>',
            buttons: [
              { text: 'Book This Shift', bold: true, onClick: bookJob },
              { text: 'Cancel' }
            ]
        });
    }

    function customButtonHandler( e ) {
        app.modal({
            text: "Word or PDF files are the best for offices to view. You an upload other file types but offices may not be able to view them.",
            title: '',
            buttons: [
                {
                    text: 'Got it!',
                    onClick: function() {
                        var hygienist = TempStars.User.getCurrentUser().hygienist;
                        if (hygienist && hygienist.resumeUrl) {
                            TempStars.Hygienist.Router.goForwardPage('make-partial-offer', {}, job );
                        }
                        else {
                            var info = "";
                            info = "Custom Offers require you to have a resume uploaded." + "<br><br>" +
                                   "Would you like to add your resume to your profile now?" + "<br><br>" +
                                   "Note: You must be on your" + "<br>" +
                                   "computer(Mac/PC/Laptop)" + "<br>" +
                                   "to upload your resume.";
                            app.modal({
                                text: info,
                                title: 'Custom Offers Need a Resume',
                                buttons: [
                                    {
                                        text: 'Go To Profile',
                                        onClick: function() {
                                            TempStars.Hygienist.Router.goForwardPage('profile');
                                        }
                                    },
                                    {
                                        text: 'Later',
                                        onClick: function() {
                                        }
                                    }
                                ]
                            });
                        }
                    }
                }
            ]
        });
    }

    function tooltipDescButtonHandler( e ) {
        var tooltipInfo = "";
        tooltipInfo = "This office prefers to view and review details of a hygienist before booking the placement. Please submit a Custom Offer for this job for their review.";
        app.modal({
            text: tooltipInfo,
            title: 'Custom Offer',
            buttons: [
                {
                    text: 'OK',
                    bold: true,
                    onClick: function() {
                    }
                }
            ]
        });
    }

    function customTooltipButtonHandler( e ) {
        var tooltipInfo = "";
        tooltipInfo = "Now you can set your own hourly rate!" + "<br>" +
                      "Submit a Custom Offer to the office at your preferred $/hr rate. They will be notified of your offer, review your resume and have the option to Accept or Decline your offer. Submitted Custom Offers expire after 12 hours.";
        app.modal({
            text: tooltipInfo,
            title: 'Custom Offers',
            buttons: [
                {
                    text: 'Got it!',
                    bold: true,
                    onClick: function() {
                    }
                }
            ]
        });
    }

    function bookJob() {
        app.showPreloader('Booking Job');
        TempStars.Api.bookJob( TempStars.User.getCurrentUser().hygienistId, job.id, job.modifiedOn )
        .then( function() {
            app.hidePreloader();
            app.alert( 'You\'re confirmed!', function() {
                var officeInfo = "";
                officeInfo = "Arrival: " + job.dentist.detail.hygienistArrival + "<br>" +
                             "Primary Contact: " + job.dentist.detail.primaryContact + "<br>" +
                             "Parking: " + job.dentist.detail.parking + "<br>" +
                             "Payment: " + job.dentist.detail.payment + "<br>" +
                             "Radiography: " + job.dentist.detail.radiography + "<br>" +
                             "Ultrasonic: " + job.dentist.detail.ultrasonic + "<br>" +
                             "Avg Recall: " + job.dentist.detail.avgApptTime + "<br>" +
                             "Charting: " + job.dentist.detail.charting + "<br>" +
                             "Software: " + job.dentist.detail.software + "<br>";

                app.modal({
                    text: officeInfo,
                    title: 'Office Information',
                    buttons: [
                        {
                            text: 'Got it!',
                            bold: true,
                            onClick: function() {
                                TempStars.Analytics.track( 'Booked Job' );
                                TempStars.Hygienist.Router.goForwardPage('home');
                            }
                        }
                    ]
                });
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error booking job: ' + err.error.message, function() {
                if ( err.error.message == 'Job is no longer available.' ||
                     err.error.message == 'Job was changed since you viewed it.' ) {
                    app.closeModal();
                    setTimeout( TempStars.Hygienist.Router.goBackPage('available-jobs'), 0 );
                }
            });
        });
    }

    return {
        init: init,
        getData: function( params ) {
            var hygienistId = TempStars.User.getCurrentUser().hygienistId;
            
            return new Promise( function( resolve, reject ) {
                var rate;
                
                if ( params.id ) {

                    TempStars.Api.getHygienistRate( hygienistId )
                    .then( function( r ) {
                        rate = r;
                        return TempStars.Api.getJob( params.id );
                    })
                    .then( function( j ) {
                        job = j;
                        job.isComplete = (job.status == TempStars.Job.status.COMPLETED ) ? true : false;
                        job.hasInvoice = (job.invoice) ? true : false;

                        // var hygienistLocation = new loopback.GeoPoint({ lat: job.hygienist.lat, lng: job.hygienist.lon});
                        // var dentistLocation = new loopback.GeoPoint({ lat: job.dentist.lat, lng: job.dentist.lon});
                        // job.distance = loopback.GeoPoint.distanceBetween( dentistLocation, hygienistLocation, {type: 'kilometers'});
                        // job.distance = 0;
                        return TempStars.Hygienist.getJobsByDentist( job.dentistId );
                    })
                    .then( function( dentistJobs ) {
                        if ( dentistJobs.length == 0 ) {
                            workHistory =  {};
                        }
                        else {
                            workHistory = _.remove( dentistJobs, function(o) {
                                return o.hygienistPrivateNotes != null;
                            });
                        }
                        resolve( {job: job, workHistory: workHistory, rate: rate.result.hourlyRate, baseRate: rate.result.baseRate, inviteAdjustment: rate.result.inviteAdjustment} );
                    })
                    .catch( function( err ) {
                        reject( err );
                    });
                }
                else {
                    TempStars.Api.getHygienistRate( hygienistId )
                    .then( function( r ) {
                        rate = r;
                        return TempStars.Hygienist.getJobsByDate( moment().format('YYYY-MM-DD') );
                    })
                    .then( function( jobs ) {
                        if ( jobs.length == 0 ) {
                            resolve( { job: {}, workHistory:{}, rate: rate.result.hourlyRate, baseRate: rate.result.baseRate, inviteAdjustment: rate.result.inviteAdjustment } );
                            return;
                        }
                        job = jobs[0];
                        job.isComplete = (job.status == TempStars.Job.status.COMPLETED ) ? true : false;
                        job.hasInvoice = (job.invoice) ? true : false;
                        // var hygienistLocation = new loopback.GeoPoint({ lat: job.hygienist.lat, lng: job.hygienist.lon});
                        // var dentistLocation = new loopback.GeoPoint({ lat: job.dentist.lat, lng: job.dentist.lon});
                        // job.distance = loopback.GeoPoint.distanceBetween( dentistLocation, hygienistLocation, {type: 'kilometers'});
                        //job.distance = 0;

                        return TempStars.Hygienist.getJobsByDentist( job.dentistId );
                    })
                    .then( function( dentistJobs ) {
                        if ( dentistJobs.length == 0 ) {
                            workHistory =  {};
                        }
                        else {
                            workHistory = _.remove( dentistJobs, function(o) {
                                return o.hygienistPrivateNotes != null;
                            });
                        }
                        resolve( {job: job, workHistory: workHistory, rate: rate.result.hourlyRate, baseRate: rate.result.baseRate, inviteAdjustment: rate.result.inviteAdjustment} );
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
