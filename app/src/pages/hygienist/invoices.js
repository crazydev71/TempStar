

app.onPageBeforeInit( 'invoices', function( page ) {

    $('#invoices-office-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $('#invoices-date-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $$('#invoices-create-manual-button').on( 'click', function(e) {
        app.modal( { title: 'Create Manual Invoice',
            text: 'Apple Valley Dental<br>Aug 16, 2016<br>8am - 6pm',
            afterText: '<br>Offered hours:<br>from <input type="text" value="9:00"><br>to&nbsp;&nbsp;&nbsp; <input type="text" value="3:00">',
            buttons: [
                { text: 'Cancel'},
                { text: 'Send Invoice', bold: true, onClick: sendInvoice }
            ]
        });
    });
});
