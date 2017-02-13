
TempStars.Pages.Hygienist.Home = (function() {
    'use strict';

    var interval,
        calendar;

    function init() {
        app.onPageBeforeInit( 'hygienist-home', function( page ) {

            $$('#hygienist-home-available-jobs-button').on( 'click', availableJobsButtonHandler );

            var rating = TempStars.User.getCurrentUser().hygienist.starScore;
            $('#my-rating').starRating({
                starSize: 20,
                activeColor: 'gold',
                initialRating: rating,
                readOnly: true,
                useGradient: false
            });
            //     {
            //     initialRating: 4,
            //     readOnly: true
            // });

            mainView.showNavbar();
            displayCalendar( page.context );
            if ( page.context.haveNewJobs ) {
                $$('#hygienist-new-jobs-badge').show();
            }
            else {
                $$('#hygienist-new-jobs-badge').hide();
            }
            TempStars.Analytics.track( 'Viewed Home Page' );
            interval = setInterval( refreshPage, 5000 );
        });

        app.onPageBeforeRemove( 'hygienist-home', function( page ) {
            clearInterval( interval );
            $$('#hygienist-home-available-jobs-button').off( 'click', availableJobsButtonHandler );
        });
    }

    function availableJobsButtonHandler(e) {
        e.preventDefault();
        var blockedUntil = TempStars.User.getCurrentUser().hygienist.blockedUntil;
        if ( ! blockedUntil ) {
            TempStars.Hygienist.Router.goForwardPage('available-jobs');
        }
        else {
            var now = moment();
            var blocked = moment( blockedUntil );
            var diff = blocked.diff( now, 'days' );
            if ( diff <= 0 ) {
                TempStars.Hygienist.Router.goForwardPage('available-jobs');
            }
            else {
                app.alert( 'Due to previously cancelling a job commitment, Available Jobs is blocked.<br><br>Days remaining: ' + diff,
                    'Cancellation Penalty in Effect' );
            }
        }
    };

    function refreshPage() {
        TempStars.Pages.Hygienist.Home.getData()
        .then( function( data ) {
            calendar.updateEvents( data.actionRequired );
            calendar.updateMarkers( [data.partial, data.confirmed, data.completed] );
            if ( data.haveNewJobs ) {
                $$('#hygienist-new-jobs-badge').show();
            }
            else {
                $$('#hygienist-new-jobs-badge').hide();
            }
        });
    }

    function displayCalendar( data ) {

        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];

        calendar = app.calendar({
            container: '#hygienist-calendar-inline-container',
            value: [new Date()],
            weekHeader: true,
            firstDay: 0,
            toolbarTemplate:
                '<div class="toolbar calendar-custom-toolbar">' +
                    '<div class="toolbar-inner">' +
                        '<div class="left">' +
                            '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
                        '</div>' +
                        '<div class="center"></div>' +
                        '<div class="right">' +
                            '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            onOpen: function (p) {
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
                $$('.calendar-custom-toolbar .left .link').on('click', function () {
                    calendar.prevMonth();
                });
                $$('.calendar-custom-toolbar .right .link').on('click', function () {
                    calendar.nextMonth();
                });
            },
            onMonthYearChangeStart: function (p) {
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
            },
            events: data.actionRequired,

            rangesClasses: [
                {
                    cssClass: 'calendar-partial',
                    range: data.partial
                },
                {
                    cssClass: 'calendar-confirmed',
                    range: data.confirmed
                },
                {
                    cssClass: 'calendar-completed',
                    range: data.completed
                }
            ],

            onDayClick: function(picker, dayContainer, dateYear, dateMonth, dateDay) {
                console.log('on day click');
                if ( $(dayContainer).hasClass('calendar-completed') ) {
                    completedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-confirmed') && $(dayContainer).hasClass('picker-calendar-day-today') ) {
                    todayDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-confirmed') ) {
                    confirmedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-partial') ) {
                    partialDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
                else if ( $(dayContainer).hasClass('calendar-posted') ) {
                    postedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay);
                }
            }
        });
    }

    function completedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'completed ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        var dateStr = moment({ year: dateYear, month: parseInt(dateMonth), day: dateDay}).format('YYYY-MM-DD');
        var params = { date: dateStr };
        TempStars.Hygienist.Router.goForwardPage( 'job-completed', params );
    }

    function confirmedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'confirmed ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        var dateStr = moment({ year: dateYear, month: parseInt(dateMonth), day: dateDay}).format('YYYY-MM-DD');
        var params = { date: dateStr };
        TempStars.Hygienist.Router.goForwardPage( 'job-confirmed', params );
    }

    function partialDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'partial ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        var dateStr = moment({ year: dateYear, month: parseInt(dateMonth), day: dateDay}).format('YYYY-MM-DD');
        var params = { date: dateStr };
        TempStars.Hygienist.Router.goForwardPage( 'job-partial', params );
    }

    function todayDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'today ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        TempStars.Hygienist.Router.goForwardPage( 'todays-job' );
    }

    function getJobDate( job ) {
        return moment(job.startDate).startOf('day').toDate();
    }

    function getActionRequiredJobs( job ) {

        if ( job.status == TempStars.Job.status.COMPLETED ) {

            if ( ! job.dentistRating || (job.invoice == null) || (! job.invoice.hygienistMarkedPaid ) ) {
                job.actionRequired = true;
            }
        }
        return job;
    }

    return {
        init: init,
        getData: function( params ) {
            //TempStars.Logging.log( 'getting data for hygienist home page ' );
            return new Promise( function( resolve, reject ) {
                Promise.props({
                    user: TempStars.User.getCurrentUser(),
                    all: TempStars.Hygienist.getAllJobs(),
                    maxJob: TempStars.Hygienist.getMaxAvailableJobId()
                })
                .then( function( data ) {
                    TempStars.Logging.log( 'got data for hygienist home page ' );
                    data.jobs = data.all.jobs;
                    data.pos = data.all.pos;

                    TempStars.Logging.log( 'getting partial jobs for hygienist home page' );
                    data.partial = _(data.pos)
                        .filter( function(o) {
                            if (o.status != 1 && o.status != 2) {
                                return true;
                            }
                            return false;
                        })
                        .map('job')
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting confirmed jobs for hygienist home page' );
                    data.confirmed = _(data.jobs)
                        .filter(['status', TempStars.Job.status.CONFIRMED])
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting completed jobs for hygienist home page' );
                    data.completed = _(data.jobs)
                        .filter(['status', TempStars.Job.status.COMPLETED])
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting action required for hygienist home page' );
                    data.actionRequired = _(data.jobs)
                        .map( getActionRequiredJobs )
                        .filter( 'actionRequired' )
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting available jobs for hygienist home page' );
                    var available = _(data.jobs)
                        .filter(['status', TempStars.Job.status.POSTED])
                        .value();


                    if ( data.maxJob.result > data.user.hygienist.lastJobIdViewed ) {
                        data.haveNewJobs = true;
                    }
                    else {
                        data.haveNewJobs = false;
                    }

                    TempStars.Logging.log( 'finished parsing data for hygienist home page' );
                    resolve( data );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        }
    };

})();

TempStars.Pages.Hygienist.Home.init();
