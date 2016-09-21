
TempStars.Pages.Dentist.Job = (function() {
    'use strict';

    function init() {
        app.onPageBeforeInit( 'dentist-job', function( page ) {
            $$('#dentist-job-notes-save-button').on( 'click', saveNotesHandler );
            $$('.detailback').on( 'click', backHandler );
        });

        app.onPageBeforeRemove( 'dentist-job', function( page ) {
            $$('#dentist-job-notes-save-button').off( 'click', saveNotesHandler );
            $$('.detailback').off( 'click', backHandler );
        });

    }

    function saveNotesHandler( e ) {
        var jobId = $$(this).attr('data-id');
        var notes = $$('#dentist-job-notes').val();

        TempStars.Api.updateJob( jobId, { privateNotes: notes} )
        .then( function() {
            backHandler();
        })
        .catch( function( err ) {
            app.alert( 'Error saving notes. Please try again.' );
        });
    }

    // function paidToggleHandler( e ) {
    //     var isChecked = $$(this).prop('checked');
    //     var invoiceId = $$(this).attr('data-id');
    //
    //     if ( isChecked ) {
    //         TempStars.Api.updateInvoice( invoiceId, {dentistMarkedPaid: 1} )
    //         .then( function() {
    //             $$('#dentist-invoice-paid-label').html( 'paid!');
    //             changedData = true;
    //         });
    //     }
    //     else {
    //         TempStars.Api.updateInvoice( invoiceId, {dentistMarkedPaid: 0} )
    //         .then( function() {
    //             $$('#dentist-invoice-paid-label').html( 'NOT paid');
    //             changedData = true;
    //         });
    //     }
    // }

    function backHandler( e ) {

        TempStars.Pages.Dentist.Jobs.getData()
        .then( function( data ) {
            mainView.router.load({
                url: 'dentist/jobs.html',
                context: data,
                ignoreCache: true,
                reload: true
            });
        })
        .catch( function( err ) {
            console.log( 'error getting data');
        });
    }

    return {
        init: init,
        getData: function() {
            return Promise.resolve( {} );
        }
    };

})();

TempStars.Pages.Dentist.Job.init();
