
TempStars.Pages.Dentist.PostJob = (function() {

    function init() {

    }


    return {
        init: init,
        
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();
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
                mainView.router.back( { pageName: 'home'});
            });
        });
    });

});
