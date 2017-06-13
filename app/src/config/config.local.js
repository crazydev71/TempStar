
TempStars.Config = (function() {
    'use strict';

    return {
        env: {
            name: 'local'
        },
        server: {
            authUserName: '',
            authPassword: '',
            baseUrl: 'http://127.0.0.1:3000/v2/'
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
            enabled: false,
            key: 'xxx'
        },
        mixpanel: {
            enabled: false,
            token: 'xxx'
        },
        web: {
            appUrl: 'https://app2.tempstars.ca'
        },
        debug: true
    };
})();
