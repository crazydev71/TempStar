
TempStars.Config = (function() {
    'use strict';

    return {
        env: {
            name: 'production'
        },
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
        },
        stripe: {
            pubKey: 'pk_live_tdijS4i5we1wFCYHo4thvW1j'
        },
        loggly: {
            key: '98a8b7a7-32a0-4d93-baaa-2decead36369'
        }
    };
})();
