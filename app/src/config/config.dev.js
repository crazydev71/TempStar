
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
            key: '7a96865b-dac0-4059-afcd-e08555fe10b3'
        }
    };
})();
