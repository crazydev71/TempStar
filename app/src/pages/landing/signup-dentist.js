
app.onPageAfterAnimation( 'signup-dentist', function( page ) {

    var el = app.addNotification({
        title: 'TempStars',
        message: '133 hygienists are ready to work right now!'
    });

    setTimeout( function() {
        app.closeNotification( el );
    }, 5000);

});


// app.onPageInit( 'signup-dentist', function( page ) {
//     app.alert( 'page init' );
// });
//
// app.onPageBeforeRemove( 'signup-dentist', function( page ) {
//     app.alert( 'page before remove' );
// });
