TempStars.Pages.Dentist.Home = (function() {

    function init() {
        app.onPageBeforeInit( 'home', function( page ) {
            mainView.showNavbar();
            displayCalendar();
        });

        app.onPageBeforeRemove( 'home', function( page ) {

        });
    }

    function displayCalendar() {

        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];

        var calendarInline = app.calendar({
            container: '#calendar-inline-container',
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
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
                $$('.calendar-custom-toolbar .left .link').on('click', function () {
                    calendarInline.prevMonth();
                });
                $$('.calendar-custom-toolbar .right .link').on('click', function () {
                    calendarInline.nextMonth();
                });
            },
            onMonthYearChangeStart: function (p) {
                $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
            },
            events: [
                new Date(2016, 7, 10),
                new Date(2016, 7, 23)
            ],

            rangesClasses: [
                {
                    cssClass: 'calendar-openings',
                    range: [
                        new Date(2016, 7, 26),
                        new Date(2016, 7, 29)
                    ]
                },
                {
                    cssClass: 'calendar-offers',
                    range: [
                        new Date(2016, 7, 23),
                        new Date(2016, 7, 24)
                    ]
                },
                {
                    cssClass: 'calendar-booked',
                    range: [
                        new Date(2016, 7, 16),
                        new Date(2016, 7, 17),
                        new Date(2016, 7, 19)
                    ]
                },
                {
                    cssClass: 'calendar-worked',
                    range: [
                        new Date(2016, 7, 2),
                        new Date(2016, 7, 10)
                    ]
                }
            ]
        });
    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.Home.init();
