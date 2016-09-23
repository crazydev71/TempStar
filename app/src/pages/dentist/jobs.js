
TempStars.Pages.Dentist.Jobs = (function() {

    'use strict';

    var data;
    var sortBy = 'date';

    function init() {

        app.onPageBeforeInit( 'dentist-jobs', function( page ) {
            if ( sortBy == 'date' ) {
                $('#dentist-jobs-date-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.orderBy( data.jobs, ['shifts[0].shiftDate'], ['desc'] );
            }
            else {
                $('#dentist-jobs-hygienist-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.sortBy( data.jobs, 'hygienist.lastName' );
            }

            $('#dentist-jobs-date-sorting-button').on( 'click', sortByDateHandler );
            $('#dentist-jobs-hygienist-sorting-button').on( 'click', sortByHygienistHandler );
            $(document).on( 'click', '.job', jobPageHandler );
        });

        app.onPageBeforeRemove( 'dentist-jobs', function( page ) {
            $('#dentist-jobs-date-sorting-button').off( 'click', sortByDateHandler );
            $('#dentist-jobs-hygienist-sorting-button').off( 'click', sortByHygienistHandler );
            $(document).off( 'click', '.job', jobPageHandler );
        });
    }

    function getData() {

        return new Promise( function( resolve, reject ) {
            TempStars.Api.getJobHistory( TempStars.User.getCurrentUser().dentistId )
            .then( function( jobs ) {

                data = { jobs: jobs };

                if ( sortBy == 'date' ) {
                    data.jobs = _.orderBy( data.jobs, ['invoice.sentOn'], ['desc'] );
                }
                else if ( sortBy == 'name' ) {
                    data.jobs = _.sortBy( data.jobs, 'hygienist.lastName' );
                }

                resolve( data );
            })
            .catch( function( err ) {
                app.alert('Error retrieving jobs. Please try again' );
                reject( err );
            });
        });
    }

    function sortByDateHandler( e ) {
        sortBy = 'date';
        $(this).addClass('active').siblings().removeClass('active');

        if ( data && data.jobs ) {
            data.jobs = _.orderBy( data.jobs, ['invoice.sentOn'], ['desc'] );
            mainView.router.load({
                url:'dentist/jobs.html',
                context: data,
                ignoreCache: true,
                reload: true
            });
        }
    }

    function sortByHygienistHandler( e ) {
        sortBy = 'name';
        $(this).addClass('active').siblings().removeClass('active');

        if ( data && data.jobs ) {
            data.jobs = _.sortBy( data.jobs, 'hygienist.lastName' );
            mainView.router.load({
                url:'dentist/jobs.html',
                context: data,
                ignoreCache: true,
                reload: true
            });
        }
    }

    function jobPageHandler( e ) {
        var id = parseInt( $$(this).attr('data-id') );
        var jobData = _.find( data.jobs, { 'id': id });
        TempStars.Dentist.Router.goForwardPage('job', {}, jobData );
        // mainView.router.load({
        //     url: 'dentist/job.html',
        //     context: jobData,
        //     ignoreCache: true,
        //     reload:true
        // });
    }

    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Dentist.Jobs.init();
