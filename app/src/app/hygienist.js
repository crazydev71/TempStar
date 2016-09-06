
TempStars.Hygienist = (function() {
    'use strict';

    return {
        save: function save( data ) {
            return TempStars.Api.saveHygienist( data );
        }
    };
})();
