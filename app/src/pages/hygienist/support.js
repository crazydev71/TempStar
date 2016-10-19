
TempStars.Pages.Hygienist.Support = (function() {

    'use strict';

    return {
        getData: function() {
            return Promise.resolve( {
                isBrowser: (window.cordova) ? false : true,
                version: TempStars.version,
                platform: device.platform,
                platformVersion: device.version,
                manufacturer: device.manufacturer,
                model: device.model
            });
        }
    };

})();
