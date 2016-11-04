TempStars.Pages.Dentist.Home = (function() {
    'use strict';

    function init() {
        app.onPageBeforeInit( 'home', function( page ) {
            mainView.showNavbar();
            displayCalendar( page.context );
            TempStars.Analytics.track( 'Viewed Home Page' );            

        });

        app.onPageBeforeRemove( 'home', function( page ) {

        });
    }

    function displayCalendar( data ) {

        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];

        var calendarInline = app.calendar({
            container: '#dentist-calendar-inline-container',
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
                    calendarInline.prevMonth();
                });
                $$('.calendar-custom-toolbar .right .link').on('click', function () {
                    calendarInline.nextMonth();
                });
            },
            onMonthYearChangeStart: function (p) {
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
            },
            events: data.actionRequired,

            rangesClasses: [
                {
                    cssClass: 'calendar-posted',
                    range: data.posted
                },
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
        TempStars.Dentist.Router.goForwardPage( 'job-completed', params );
    }

    function confirmedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'confirmed ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        var dateStr = moment({ year: dateYear, month: parseInt(dateMonth), day: dateDay}).format('YYYY-MM-DD');
        var params = { date: dateStr };
        TempStars.Dentist.Router.goForwardPage( 'job-confirmed', params );
    }

    function partialDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'partial ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        var dateStr = moment({ year: dateYear, month: parseInt(dateMonth), day: dateDay}).format('YYYY-MM-DD');
        var params = { date: dateStr };
        TempStars.Dentist.Router.goForwardPage( 'job-partial', params );
    }

    function postedDayHandler(picker, dayContainer, dateYear, dateMonth, dateDay) {
        console.log( 'posted ' + dateYear + ' ' + dateMonth + ' ' + dateDay );
        var dateStr = moment({ year: dateYear, month: parseInt(dateMonth), day: dateDay}).format('YYYY-MM-DD');
        var params = { date: dateStr };
        TempStars.Dentist.Router.goForwardPage( 'job-posted', params );
    }

    function getJobDate( job ) {
        return moment(job.startDate).startOf('day').toDate();
    }

    function getActionRequiredJobs( job ) {

        if ( job.status == TempStars.Job.status.COMPLETED ) {

            if ( ! job.hygienistRating || job.invoice && (! job.invoice.dentistMarkedPaid ) ) {
                job.actionRequired = true;
            }
        }
        return job;
    }

    return {
        init: init,
        getData: function( params ) {
            TempStars.Logging.log( 'getting data for dentist home page' );
            return new Promise( function( resolve, reject ) {
                Promise.props({
                    user: TempStars.User.getCurrentUser(),
                    jobs: TempStars.Dentist.getAllJobs()
                })
                .then( function( data ) {
                    TempStars.Logging.log( 'got data for dentist home page' );

                    TempStars.Logging.log( 'getting posted jobs for dentist home page' );

                    data.posted = _(data.jobs)
                        .filter(['status', TempStars.Job.status.POSTED])
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting partial jobs for dentist home page' );
                    data.partial = _(data.jobs)
                        .filter(['status', TempStars.Job.status.PARTIAL])
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting confirmed jobs for dentist home page' );
                    data.confirmed = _(data.jobs)
                        .filter(['status', TempStars.Job.status.CONFIRMED])
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting completed jobs for dentist home page' );
                    data.completed = _(data.jobs)
                        .filter(['status', TempStars.Job.status.COMPLETED])
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'getting action required for dentist home page' );
                    data.actionRequired = _(data.jobs)
                        .map( getActionRequiredJobs )
                        .filter( 'actionRequired' )
                        .map( getJobDate )
                        .value();

                    TempStars.Logging.log( 'finished parsing data for dentist home page' );
                    resolve( data );
                })
                .catch( function( err ) {
                    reject( err );
                });
            });
        }
    };

})();

TempStars.Pages.Dentist.Home.init();
