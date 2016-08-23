
app.onPageBeforeInit( 'jobs', function( page ) {

    $('#jobs-office-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

    $('#jobs-date-sorting-button').on( 'click', function(e) {
        $(this).addClass('active').siblings().removeClass('active');
    });

});
