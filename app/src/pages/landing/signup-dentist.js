
app.onPageAfterAnimation( 'signup-dentist', function( page ) {

    var min = 0;
    var max = 150;
    var num = Math.floor(Math.random() * (max - min)) + min;

    if ( num < 50 ) {
        return;
    }

    var el = app.addNotification({
        title: 'TempStars',
        message: num + ' hygienists are ready to work right now!'
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
