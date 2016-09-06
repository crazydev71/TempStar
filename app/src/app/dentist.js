
TempStars.Dentist = (function() {
    'use strict';

    return {
        setupAccount: function setupAccount( data ) {
            var dentistId = data.user.dentistId;
            return TempStars.Api.setupDentistAccount( dentistId, data );
        }
    };
})();
