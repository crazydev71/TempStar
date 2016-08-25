'use strict';

TempStars.Api = (function() {

    return {
        getDentists: function getDentists() {
            return TempStars.Ajax.get('dentists');
        },

        login: function login( email, password ) {
            return TempStars.Ajax.post( 'users/login', { email: email, password: password });
        }
    };

})();
