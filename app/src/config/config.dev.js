
TempStars.Config = (function() {
    'use strict';

    return {
        server: {
            authUserName: 'riff',
            authPassword: 'raff',
            baseUrl: "https://api.tempstars.net/v2/"
        },
        bucket: {
            baseUrl: 'https://s3.amazonaws.com/tempstars.ca/'
        }        
    };
})();
