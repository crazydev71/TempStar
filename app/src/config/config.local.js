
TempStars.Config = (function() {
    'use strict';

    return {
        env: {
            name: 'local'
        },
        server: {
            authUserName: '',
            authPassword: '',
            baseUrl: 'http://10.0.1.45:3000/v2/'
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
        },
        mixpanel: {
            token: '399a45b6eea7aea3f7fb578e85cf9db6'
        }
    };
})();
