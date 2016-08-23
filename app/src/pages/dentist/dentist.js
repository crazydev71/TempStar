
// app.onPageInit( 'dentist', function( page ) {
//     var someName;
//
//     someName = app.alert( 'dentist init' );
// });


app.onPageBeforeInit( 'dentist', function( page ) {
    //mainView.showNavbar();
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

});



app.onPageBeforeInit( 'dentist', function( page ) {
    mainView.showNavbar();
});



app.onPageBeforeInit( 'post-job', function( page ) {

    var jobCalendar = app.calendar({
        input: '#job-calendar-input',
        multiple: false
    });

    var today = new Date();

    var jobStartTime = app.picker({
        input: '#job-start-time-input',
        toolbar: false,
        rotateEffect: true,
        value: [ '08:00'],
        cols: [
            { values: (function() {
                    var vals = [],
                        timeStr;
                    for ( var i = 0; i < 24; i++ ) {
                        for ( var j = 0; j <  60; j = j + 15 ) {
                            timeStr = ('00' + i).slice(-2);
                            timeStr += ':' + ('00' + j).slice(-2);
                            vals.push( timeStr );
                        }
                    }
                    return vals;
                })()
        }]
    });

    var jobEndTime = app.picker({
        input: '#job-end-time-input',
        toolbar: false,
        rotateEffect: true,
        value: [ '05:00'],
        cols: [
            { values: (function() {
                    var vals = [],
                        timeStr;
                    for ( var i = 0; i < 24; i++ ) {
                        for ( var j = 0; j <  60; j = j + 15 ) {
                            timeStr = ('00' + i).slice(-2);
                            timeStr += ':' + ('00' + j).slice(-2);
                            vals.push( timeStr );
                        }
                    }
                    return vals;
                })()
        }]
    });

    $$('#job-post-button').on( 'click', function(e) {
        app.confirm('Are you sure?', 'Post Job', function() {
            app.alert( 'Job posted!', function() {
                mainView.router.back( { pageName: 'dentist'});
            });
        });
    });

});
