
TempStars.Pages.Hygienist.Jobs = (function() {

    'use strict';

    var data;
    var sortBy = 'date';

    function init() {

        app.onPageBeforeInit( 'hygienist-jobs', function( page ) {
            if ( sortBy == 'date' ) {
                $('#hygienist-jobs-date-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.orderBy( data.jobs, ['shifts[0].shiftDate'], ['desc'] );
            }
            else {
                $('#hygienist-jobs-dentist-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.sortBy( data.jobs, 'dentist.practiceName' );
            }

            $('#hygienist-jobs-date-sorting-button').on( 'click', sortByDateHandler );
            $('#hygienist-jobs-dentist-sorting-button').on( 'click', sortByDentistHandler );
            $(document).on( 'click', '.job', jobPageHandler );
            TempStars.Analytics.track( 'Viewed Job History' );                        
        });

        app.onPageBeforeRemove( 'hygienist-jobs', function( page ) {
            $('#hygienist-jobs-date-sorting-button').off( 'click', sortByDateHandler );
            $('#hygienist-jobs-dentist-sorting-button').off( 'click', sortByDentistHandler );
            $(document).off( 'click', '.job', jobPageHandler );
        });
    }

    function getData() {

        return new Promise( function( resolve, reject ) {
            TempStars.Api.getHygienistJobHistory( TempStars.User.getCurrentUser().hygienistId )
            .then( function( jobs ) {

                data = { jobs: jobs };

                if ( sortBy == 'date' ) {
                    data.jobs = _.orderBy( data.jobs, ['invoice.sentOn'], ['desc'] );
                }
                else if ( sortBy == 'name' ) {
                    data.jobs = _.sortBy( data.jobs, 'dentist.practiceName' );
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
            TempStars.Hygienist.Router.reloadPage( 'jobs', {}, data );
        }
    }

    function sortByDentistHandler( e ) {
        sortBy = 'name';
        $(this).addClass('active').siblings().removeClass('active');

        if ( data && data.jobs ) {
            data.jobs = _.sortBy( data.jobs, 'dentist.practiceName' );
            TempStars.Hygienist.Router.reloadPage( 'jobs', {}, data );
        }
    }

    function jobPageHandler( e ) {
        var id = parseInt( $$(this).attr('data-id') );
        var jobData = _.find( data.jobs, { 'id': id });
        TempStars.Hygienist.Router.goForwardPage('job', {}, jobData );
    }

    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Hygienist.Jobs.init();
