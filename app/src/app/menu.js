
TempStars.Menu = (function() {
    'use strict';

    return {
        logout: function logout() {
            app.closePanel();
            TempStars.User.logout()
            .then( function() {
                mainView.router.loadPage( { url: 'index.html', animatePages: false } );
            });
        }
    };
    
})();
