
TempStars.Pages.Hygienist.Invoices = (function() {

    'use strict';

    var data;
    var sortBy = 'date';

    function init() {

        app.onPageBeforeInit( 'hygienist-invoices', function( page ) {

            if ( sortBy == 'date' ) {
                $('#hygienist-invoices-date-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.orderBy( data.jobs, ['invoice.sentOn'], ['desc'] );
            }
            else {
                $('#hygienist-invoices-dentist-sorting-button').addClass('active').siblings().removeClass('active');
                data.jobs = _.sortBy( data.jobs, 'hygienist.lastName' );
            }

            $('#hygienist-invoices-date-sorting-button').on( 'click', sortByDateHandler );
            $('#hygienist-invoices-dentist-sorting-button').on( 'click', sortByDentistHandler );
            $(document).on( 'click', '.invoice', invoicePageHandler );
            TempStars.Analytics.track( 'Viewed Invoices' );            
        });

        app.onPageBeforeRemove( 'hygienist-invoices', function( page ) {
            $('#hygienist-invoices-date-sorting-button').off( 'click', sortByDateHandler );
            $('#hygienist-invoices-dentist-sorting-button').off( 'click', sortByDentistHandler );
            $(document).off( 'click', '.invoice', invoicePageHandler );
        });
    }

    function getData() {

        return new Promise( function( resolve, reject ) {
            TempStars.Api.getHygienistInvoices( TempStars.User.getCurrentUser().hygienistId )
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
            TempStars.Hygienist.Router.reloadPage( 'invoices', {}, data );
        }
    }

    function sortByDentistHandler( e ) {
        sortBy = 'name';
        $(this).addClass('active').siblings().removeClass('active');

        if ( data && data.jobs ) {
            data.jobs = _.sortBy( data.jobs, 'dentist.practiceName' );
            TempStars.Hygienist.Router.reloadPage( 'invoices', {}, data );
        }
    }

    function invoicePageHandler( e ) {
        var id = parseInt( $$(this).attr('data-id') );
        var invoiceData = _.find( data.jobs, { 'id': id });

        // If it has an invoice view it
        if ( invoiceData.invoice ) {
            TempStars.Hygienist.Router.goForwardPage( 'invoice', {}, invoiceData );
        }
        else {
            TempStars.Hygienist.gotoInvoicePage(invoiceData);
        }
    }

    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Hygienist.Invoices.init();
