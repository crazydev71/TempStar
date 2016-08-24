var HygienistSignup = (function() {

app.onPageInit( 'signup-hygienist', function(page) {

    $('#hygienist-done-button').on( 'click', function(e) {
        userLoggedIn = true;
        isDentist = true;
        mainView.router.loadPage( { url: 'hygienist/hygienist.html', animatePages: true } );
        setupMenu();
    });

    $$('#signup-hygienist-upload-photo-button').on( 'click', function(e) {
        navigator.camera.getPicture (
          function(result) {
              //var image = document.getElementById('signup-hygienist-photo');
              //image.src = "data:image/jpeg;base64," + result;

              $$('#signup-hygienist-photo').attr('src', result );
              $$('#signup-hygienist-photo-remove').show();
              $$('#signup-hygienist-photo-add').hide();
          },
          function(errmsg) { app.alert( errmsg ) },
          {
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              quality: 80,
              targetWidth: 200,
              targetHeight: 200
//              cameraDirection: FRONT
        });
    });

    $$('#signup-hygienist-remove-photo-button').on('click', function(e) {
        $$('#signup-hygienist-photo-remove').hide();
        $$('#signup-hygienist-photo-add').show();
    });
});


app.onPageAfterAnimation( 'signup-hygienist', function( page ) {

    var min = 0;
    var max = 150;
    var num = Math.floor(Math.random() * (max - min)) + min;

    if ( num < 50 ) {
        return;
    }

    var el = app.addNotification({
        title: 'TempStars',
        message: 'There are ' + num + ' job postings right now!'
    });

    setTimeout( function() {
        app.closeNotification( el );
    }, 5000);

});


})();
