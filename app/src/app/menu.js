
TempStars.Menu = (function() {
    'use strict';

    return {
        logout: function logout() {
            app.confirm( 'Are you sure you want to log out?', function() {
                app.closePanel();
                TempStars.User.logout()
                .then( function() {
                    mainView.router.loadPage( { url: 'index.html', animatePages: false } );
                });                
            });
        }
    };

})();
