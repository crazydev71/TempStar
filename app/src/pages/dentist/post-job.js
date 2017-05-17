
TempStars.Pages.Dentist.PostJob = (function() {

    'use strict';

    var jobDate;
    var jobType = 0;

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

            $$('#dentist-post-job-checkmark-1').css('background-image', "url('./img/radio-off.svg')");
            $$('#dentist-post-job-checkmark-2').css('background-image', "url('./img/radio-off.svg')");
        });

        $$(document).on( 'click', '.dentist-post-job-check-type .checkmark-text', checkmarkButtonHandler );
        $$(document).on( 'click', '.dentist-post-job-check-type .tooltip-text', tooltipButtonHandler );
    }

    function checkmarkButtonHandler( e ) {
        var type = parseInt($$(this).attr('data-id'));
        console.log(type);
        jobType = type;

        if (jobType === 1) {
            $$('#dentist-post-job-checkmark-1').css('background-image', "url('./img/radio-on.svg')");
            $$('#dentist-post-job-checkmark-2').css('background-image', "url('./img/radio-off.svg')");
        }
        else if (jobType === 2) {
            $$('#dentist-post-job-checkmark-1').css('background-image', "url('./img/radio-off.svg')");
            $$('#dentist-post-job-checkmark-2').css('background-image', "url('./img/radio-on.svg')");
        }
    }

    function tooltipButtonHandler( e ) {
        var type = parseInt($$(this).attr('data-id'));
        var title = "", text = "";

        if (type === 1) {
            title = "Automatically Book the Best Available Hygienist";
            text = "The fastest and easiest way to find a good hygienist - the system automatically finds and books the best available hygienist for your job posting." + "<br><br>" +
                   "Once the hygienist accepts your job, she is automatically booked and confirmed - you don’t have to do anything else." + "<br><br>" +
                   "Custom Offers are still permitted with this option.";
        }
        else if (type === 2) {
            title = "Custom Offers";
            text = "For offices wanting to review hygienists before they are booked, this feature prevents auto-booking and allows you to review and approve a hygienist before booking her." + "<br><br>" +
                   "Note: Checking this box slows down the speed and lowers the success rate of placements, but gives you a bit more control over who comes in.";
        }
        else
            return;

        app.modal({
            title: title,
            text: text,
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

        if (jobType === 2) {
            var text = "";
            text = "<b>" + formData.startDate + "<br>" +
                   formData.postedStart + ' - ' + formData.postedEnd + "</b><br><br>" +
                   "You have selected to only allow Custom Offers." + "<br>" +
                   "Remember: this gives you a bit more control but slows down and lowers the placement success rate." + "<br><br>" +
                   "You’ll receive a notification when you receive a Custom Offer from a hygienist.";
            app.modal({
                title: 'Post This Job?',
                text: text,
                buttons: [
                    {
                        text: 'Post This Job',
                        bold: true,
                        onClick: function() {
                            postJob( formData );
                        }
                    },
                    {
                        text: 'Cancel'
                    }
                ]
            });
        }
        else
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
            app.modal({
                text: 'Our system is alerting our best available hygienists for this job. You’ll receive confirmation when this shift is filled. To add/modify an incentive bonus, tap the job date on the calendar.',
                title: 'We\'re on it.',
                buttons: [
                    {
                        text: 'Got it!',
                        bold: true,
                        onClick: function() {
                            postJob( formData );
                        }
                    }
                ]
            });
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
                    endTime: fullEndTime,
                    type: jobType
                }
            ]
        };

        TempStars.Api.postJob( dentistId, data )
        .then( function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Posted Job' );

            if (jobType === 2) {
                var text = "";
                text = "When you have Custom Offers, you’ll receive a notification and there will be a" + "<img src='./img/custom-offer.png' style='width: 20px; position: relative; top: 6px; padding: 0px 3px;' />" + "on your job date." + "<br><br>" +
                       "Tap the target on your job date to view your offers." + "<br><br>" +
                       "You can also modify the job to allow auto-booking by tapping on the job date.";
                app.modal({
                    title: 'Your Job Has Been Posted',
                    text: text,
                    buttons: [
                        {
                            text: 'Got it!',
                            bold: true,
                            onClick: function() {
                                TempStars.Dentist.Router.goBackPage('home');
                            }
                        }
                    ]
                });
            }
            else if (jobType === 1) {
                var text = "";
                text = "Our sophisticated algorithm is ranking and prioritizing notifications to find the best available hygienist for your job posting. When the best hygienist is booked for your job, you will be notified that the job is booked and confirmed. You won’t have to do anything else. To add or modify an Incentive Bonus to this job posting, tap on the job date from your calendar.";
                app.modal({
                    title: "We're On It!",
                    text: text,
                    buttons: [
                        {
                            text: 'Got it!',
                            bold: true,
                            onClick: function() {
                                TempStars.Dentist.Router.goBackPage('home');
                            }
                        }
                    ]
                });
            }
            else
                TempStars.Dentist.Router.goBackPage('home');
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
                data.jobType = 0;

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
