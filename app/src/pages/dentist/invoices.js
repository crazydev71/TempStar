
TempStars.Pages.Dentist.Invoices = (function() {

    'use strict';

    var data;
    var sortBy = 'date';

    function init() {

        app.onPageBeforeInit( 'dentist-invoices', function( page ) {
            console.log( 'sort by:' + sortBy );
            if ( sortBy == 'date' ) {
                $('#dentist-invoices-date-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.orderBy( data.jobs, ['invoice.sentOn'], ['desc'] );
            }
            else {
                $('#dentist-invoices-hygienist-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.sortBy( data.jobs, 'hygienist.lastName' );
            }

            $('#dentist-invoices-date-sorting-button').on( 'click', sortByDateHandler );
            $('#dentist-invoices-hygienist-sorting-button').on( 'click', sortByHygienistHandler );
            $(document).on( 'click', '.invoice', invoicePageHandler );
            TempStars.Analytics.track( 'Viewed Invoices' );                        
        });

        app.onPageBeforeRemove( 'dentist-invoices', function( page ) {
            $('#dentist-invoices-date-sorting-button').off( 'click', sortByDateHandler );
            $('#dentist-invoices-hygienist-sorting-button').off( 'click', sortByHygienistHandler );
            $(document).off( 'click', '.invoice', invoicePageHandler );
        });
    }

    function getData() {

        return new Promise( function( resolve, reject ) {
            TempStars.Api.getDentistInvoices( TempStars.User.getCurrentUser().dentistId )
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
                app.alert('Error retrieving invoices. Please try again' );
                reject( err );
            });
        });
    }

    function sortByDateHandler( e ) {
        sortBy = 'date';
        $(this).addClass('active').siblings().removeClass('active');

        if ( data && data.jobs ) {
            data.jobs = _.orderBy( data.jobs, ['invoice.sentOn'], ['desc'] );
            TempStars.Dentist.Router.reloadPage( 'invoices', {}, data );

            // mainView.router.load({
            //     url:'dentist/invoices.html',
            //     context: data,
            //     ignoreCache: true,
            //     reload: true
            // });
        }
    }

    function sortByHygienistHandler( e ) {
        sortBy = 'name';
        $(this).addClass('active').siblings().removeClass('active');

        if ( data && data.jobs ) {
            data.jobs = _.sortBy( data.jobs, 'hygienist.lastName' );
            TempStars.Dentist.Router.reloadPage( 'invoices', {}, data );

            // mainView.router.load({
            //     url:'dentist/invoices.html',
            //     context: data,
            //     ignoreCache: true,
            //     reload: true
            // });
        }
    }

    function invoicePageHandler( e ) {
        var id = parseInt( $$(this).attr('data-id') );
        var invoiceData = _.find( data.jobs, { 'id': id });
        TempStars.Dentist.Router.goForwardPage( 'invoice', {}, invoiceData );

        // mainView.router.load({
        //     url: 'dentist/invoice.html',
        //     context: invoiceData,
        //     ignoreCache: true,
        //     reload:true
        // });
    }

    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Dentist.Invoices.init();
