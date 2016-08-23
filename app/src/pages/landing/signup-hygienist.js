
app.onPageInit( 'signup-hygienist', function(page) {
    $('#hygienist-done-button').on( 'click', function(e) {
        userLoggedIn = true;
        isDentist = true;
        mainView.router.loadPage( { url: 'hygienist/hygienist.html', animatePages: true } );
        setupMenu();
    });
});



app.onPageAfterAnimation( 'signup-hygienist', function( page ) {

    var el = app.addNotification({
        title: 'TempStars',
        message: 'There are 42 job postings right now!'
    });

    setTimeout( function() {
        app.closeNotification( el );
    }, 5000);

});
