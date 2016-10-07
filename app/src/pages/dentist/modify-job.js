
TempStars.Pages.Dentist.ModifyJob = (function() {

    'use strict';

    var job;

    function init() {

        app.onPageBeforeInit( 'modify-job', function( page ) {
            job = page.context;
            job.postedStart = moment.utc( job.shifts[0].postedStart ).local().format('h:mm a');
            job.postedEnd = moment.utc( job.shifts[0].postedEnd ).local().format('h:mm a');

            app.picker({
                input: '#dentist-modify-job-starttime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Starting Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',

                rotateEffect: false,
                value: [ job.postedStart ],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 0; i < 24; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }]
            });

            app.picker({
                input: '#dentist-modify-job-endtime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Ending Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: false,
                value: [ job.postedEnd ],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 0; i < 24; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }]
            });

            $$('#dentist-modify-job-button').on( 'click', modifyJobHandler );
        });
    }

    function getJobDate( job ) {
        return moment(job.startDate).startOf('day').toDate();
    }

    function modifyJobHandler( e ) {

        var constraints = {
            postedStart: {
                presence: true
            },
            postedEnd: {
                presence: true
            }
        };

        // Clear errors
        $$('#dentist-modify-job-form .form-error-msg').html('');
        $$('#dentist-modify-job-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#dentist-modify-job-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.postedStart ) {
                $$('#dentist-modify-job-form input[name="postedStart"]').addClass('error').next().html( errors.postedStart[0] );
            }
            if ( errors.postedEnd ) {
                $$('#dentist-modify-job-form input[name="postedEnd"]').addClass('error').next().html( errors.postedEnd[0] );
            }
            return;
        }

        // Validate start time is before end time
        if ( moment(formData.postedStart, 'hh:mm a').toDate().getTime() >= moment(formData.postedEnd, 'hh:mm a').toDate().getTime() ) {
            $$('#dentist-modify-job-form .form-error-msg')
                .html('<span class="ti-alert"></span> Starting time must be before ending time.')
                .show();
            return;
        }

        var confirmMessage =
            moment.utc( job.startDate ).local().format('ddd, MMM D, YYYY') + '<br>' +
            formData.postedStart + ' - ' +
            formData.postedEnd + '<br>';

        if ( job.status == TempStars.Job.status.CONFIRMED ) {
            confirmMessage += '<br>' + job.hygienist.firstName + ' '
                            + job.hygienist.lastName
                            + ' will be notified.';
        }
        else if ( job.status == TempStars.Job.status.PARTIAL ) {
            confirmMessage += '<br>The hygienists who submitted<br>partial offers will be notified.';
        }

        app.confirm( confirmMessage, 'Modify Job?', function() {
            modifyJob( formData );
        });
    }

    function modifyJob( formData ) {
        var dentistId,
            shiftId,
            data,
            fullStartTime,
            fullEndTime,
            hours,
            minutes;

        app.showPreloader('Modifying Job');

        dentistId = TempStars.User.getCurrentUser().dentistId;
        shiftId = job.shifts[0].id;

        hours = moment( formData.postedStart, 'h:mm a' ).hours(),
        minutes = moment( formData.postedStart, 'h:mm a' ).minutes();
        fullStartTime = moment( job.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        hours = moment( formData.postedEnd, 'h:mm a' ).hours(),
        minutes = moment( formData.postedEnd, 'h:mm a' ).minutes();
        fullEndTime = moment( job.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        data = {
            postedStart: fullStartTime,
            postedEnd: fullEndTime
        };

        TempStars.Api.modifyJob( dentistId, job.id, data )
        .then( function() {
            app.hidePreloader();
            //app.alert( 'Job Modified', function() {
                TempStars.Dentist.Router.goBackPage('', { id: job.id });
            //});
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error modifying job. Please try again.' );
        });

    }

    return {
        init: init,

        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.ModifyJob.init();
