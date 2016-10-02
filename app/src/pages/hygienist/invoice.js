
TempStars.Pages.Hygienist.Invoice = (function() {
    'use strict';

    var changedData = false;

    function init() {
        app.onPageBeforeInit( 'hygienist-invoice', function( page ) {
            $$('#hygienist-invoice-paid-checkbox').on( 'change', paidToggleHandler );
            $$('#hygienist-job-resend-button').on( 'click', resendButtonHandler );

        });

        app.onPageBeforeRemove( 'hygienist-invoice', function( page ) {
            $$('#hygienist-invoice-paid-checkbox').off( 'change', paidToggleHandler );
            $$('#hygienist-job-resend-button').off( 'click', resendButtonHandler );
        });

    }

    function paidToggleHandler( e ) {
        var isChecked = $$(this).prop('checked');
        var invoiceId = $$(this).attr('data-id');

        if ( isChecked ) {
            TempStars.Api.updateInvoice( invoiceId, {hygienistMarkedPaid: 1} )
            .then( function() {
                $$('#hygienist-invoice-paid-label').html( 'paid!');
                changedData = true;
            });
        }
        else {
            TempStars.Api.updateInvoice( invoiceId, {hygienistMarkedPaid: 0} )
            .then( function() {
                $$('#hygienist-invoice-paid-label').html( 'NOT paid');
                changedData = true;
            });
        }
    }

    function resendButtonHandler( e ) {
        var jobId = $$(this).attr('data-id');

        app.showPreloader('Resending Invoice');

        TempStars.Api.resendInvoice( jobId )
        .then( function() {
            app.hidePreloader();
            app.alert( 'Invoice Resent.',  function() {
                TempStars.Hygienist.Router.goBackPage();
            });
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error resending invoice. Please try again.' );
        });
    }


    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Hygienist.Invoice.init();
