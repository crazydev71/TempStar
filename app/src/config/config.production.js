
TempStars.Config = (function() {
    'use strict';

    return {
        server: {
            authUserName: '',
            authPassword: '',
            baseUrl: "https://api.tempstars.ca/v2/"
        },
        bucket: {
            baseUrl: 'https://s3.amazonaws.com/tempstars.ca/'
        },
        push: {
            senderID: '210360814619'
        }
    };
})();
