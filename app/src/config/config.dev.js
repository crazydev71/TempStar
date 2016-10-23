
TempStars.Config = (function() {
    'use strict';

    return {
        env: {
            name: 'dev'
        },
        server: {
            authUserName: 'riff',
            authPassword: 'raff',
            baseUrl: "https://api.tempstars.net/v2/"
        },
        bucket: {
            baseUrl: 'https://s3.amazonaws.com/tempstars.ca/'
        },
        push: {
            senderID: '210360814619'
        },
        stripe: {
            pubKey: 'pk_test_yzhl7dmUrMvdEB9BaKuKhgpL'
        },
        loggly: {
            key: '98a8b7a7-32a0-4d93-baaa-2decead36369'
        }
    };
})();
