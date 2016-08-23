
app.onPageInit( 'signup-dentist3', function(page) {
    $('#dentist-done-button').on( 'click', function(e) {
        userLoggedIn = true;
        isDentist = true;
        mainView.router.loadPage( { url: 'dentist/dentist.html', animatePages: true } );
        setupMenu();
    });
});
