
TempStars.Pages.Dentist.Invoice = (function() {
    'use strict';

    var changedData = false;

    function init() {
        app.onPageBeforeInit( 'dentist-invoice', function( page ) {
            $$('#dentist-invoice-paid-checkbox').on( 'change', paidToggleHandler );
            //$$('.detailback').on( 'click', backHandler );
        });

        app.onPageBeforeRemove( 'dentist-invoice', function( page ) {
            $$('#dentist-invoice-paid-checkbox').off( 'change', paidToggleHandler );
            //$$('.detailback').off( 'click', backHandler );
        });

    }

    function paidToggleHandler( e ) {
        var isChecked = $$(this).prop('checked');
        var invoiceId = $$(this).attr('data-id');

        if ( isChecked ) {
            TempStars.Api.updateInvoice( invoiceId, {dentistMarkedPaid: 1} )
            .then( function() {
                $$('#dentist-invoice-paid-label').html( 'paid!');
                changedData = true;
            });
        }
        else {
            TempStars.Api.updateInvoice( invoiceId, {dentistMarkedPaid: 0} )
            .then( function() {
                $$('#dentist-invoice-paid-label').html( 'NOT paid');
                changedData = true;
            });
        }
    }


    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.Invoice.init();
