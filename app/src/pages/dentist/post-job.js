
TempStars.Pages.Dentist.PostJob = (function() {

    'use strict';

    var jobDate;

    function init() {

        app.onPageBeforeAnimation( 'dentist-post-job', function( page ) {

            var defaultDate = (page.context.defaultDate) ? page.context.defaultDate : null;

            var datePicker = app.calendar({
                input: '#dentist-post-job-date',
                cssClass: 'open-calendar',
                toolbar: true,
                firstDay: 0,
                dateFormat: 'D, M d, yyyy',
                minDate: moment().subtract(1, 'days'),
                onDayClick: function(picker, dayContainer, dateYear, dateMonth, dateDay) {
                    setTimeout( function() {
                        picker.close();
                    }, 400);
                },
                disabled: page.context.jobs
            });

            if ( defaultDate !== null ) {
                datePicker.setValue( [defaultDate] );
            }

            if ( ! Template7.global.web ) {
            app.picker({
                input: '#dentist-post-job-starttime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Starting Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',

                rotateEffect: false,
                updateValuesOnTouchmove: false,
                value: [ '8:00 am'],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 5; i < 23; i++ ) {
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
                input: '#dentist-post-job-endtime',
                toolbar: true,
                toolbarTemplate: '<div class="toolbar">' +
                '<div class="toolbar-inner">' +
                    'Select Ending Time' +
                    '<a href="#" class="link close-picker">{{closeText}}</a>' +
                '</div>' +
                '</div>',
                rotateEffect: false,
                updateValuesOnTouchmove: false,
                value: [ '5:00 pm'],
                cols: [
                    { values: (function() {
                            var vals = [],
                                timeStr;
                            for ( var i = 5; i < 23; i++ ) {
                                for ( var j = 0; j <  60; j = j + 15 ) {
                                    timeStr = moment().hours(i).minutes(j).format('h:mm a');
                                    vals.push( timeStr );
                                }
                            }
                            return vals;
                        })()
                }]
            });
            }

            $$('#dentist-post-job-button').on( 'click', postJobHandler );
            TempStars.Analytics.track( 'Viewed Post Job' );

        });
    }

    function getJobDate( job ) {
        return moment(job.startDate).startOf('day').toDate();
    }

    function postJobHandler( e ) {

        var constraints = {
            startDate: {
                presence: true,
            },
            postedStart: {
                presence: true,
                time: true
            },
            postedEnd: {
                presence: true,
                time: true
            }
        };

        // Clear errors
        $$('#dentist-post-job-form .form-error-msg').html('');
        $$('#dentist-post-job-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#dentist-post-job-form');
        var errors = validate( formData, constraints );

        if ( errors ) {
            if ( errors.startDate ) {
                $('#dentist-post-job-form input[name="startDate"]').addClass('error').next().html( errors.startDate[0] );
            }
            if ( errors.postedStart ) {
                $$('#dentist-post-job-starttime').addClass('error').next().html( errors.postedStart[0] );
            }
            if ( errors.postedEnd ) {
                $$('#dentist-post-job-endtime').addClass('error').next().html( errors.postedEnd[0] );
            }
            return;
        }

        // Validate start time is before end time
        if ( moment(formData.postedStart, 'hh:mm a').toDate().getTime() >= moment(formData.postedEnd, 'hh:mm a').toDate().getTime() ) {
            $$('#dentist-post-job-form .form-error-msg')
                .html('<span class="ti-alert"></span> Starting time must be before ending time.')
                .show();
            return;
        }

        TempStars.Job.checkIncentives( formData, confirmJob );
    }

    function confirmJob( formData ) {

        var text =
            formData.startDate + '<br>' +
            formData.postedStart + ' - ' +
            formData.postedEnd + '<br>';

        //var boost = TempStars.Job.getHourlyRateBoost( formData );
        if ( formData.bonus > 0 ) {
            text += '<br>+$' + formData.bonus + '/hr incentive bonus<br>';
        }

        app.confirm( text, 'Post Job?', function() {
            postJob( formData );
        });
    }

    function postJob( formData ) {
        var dentistId,
            data,
            fullStartTime,
            fullEndTime,
            hours,
            minutes;

        app.showPreloader('Posting Job');

        dentistId = TempStars.User.getCurrentUser().dentistId;

        hours = moment( formData.postedStart, 'h:mm a' ).hours(),
        minutes = moment( formData.postedStart, 'h:mm a' ).minutes();
        fullStartTime = moment( formData.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        hours = moment( formData.postedEnd, 'h:mm a' ).hours(),
        minutes = moment( formData.postedEnd, 'h:mm a' ).minutes();
        fullEndTime = moment( formData.startDate )
                        .add( hours, 'hours' )
                        .add( minutes, 'minutes' )
                        .utc()
                        .format('YYYY-MM-DD HH:mm');

        data = {
            job: {
                postedOn: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
                startDate: moment( formData.startDate ).format('YYYY-MM-DD'),
                status: TempStars.Job.status.POSTED,
                short: formData.short,
                urgent: formData.urgent,
                weekend: formData.weekend,
                bonus: formData.bonus
            },
            shifts: [
                {
                    shiftDate: moment( formData.startDate ).format('YYYY-MM-DD'),
                    startTime: fullStartTime,
                    endTime: fullEndTime
                }
            ]
        };

        TempStars.Api.postJob( dentistId, data )
        .then( function() {
            app.hidePreloader();
            TempStars.Dentist.Router.goBackPage('home');
            TempStars.Analytics.track( 'Posted Job' );
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error posting job. ' + err.error.message );
            TempStars.Dentist.Router.goBackPage();
        });

    }

    return {
        init: init,

        getData: function( params ) {
            return new Promise( function( resolve, reject ) {
                var data = {};

                // Default date in form
                data.defaultDate = (params.date) ? params.date : null;

                // Get all existing jobs so they can be disabled in the calendar
                TempStars.Dentist.getAllJobs()
                .then( function( rawJobs ) {
                    data.jobs = _(rawJobs)
                        .map( getJobDate )
                        .value();
                    resolve( data );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        }
    };

})();

TempStars.Pages.Dentist.PostJob.init();
