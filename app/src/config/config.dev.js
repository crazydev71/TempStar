
TempStars.Config = (function() {
    'use strict';

    return {
        env: {
            name: 'dev'
        },
        server: {
            authUserName: 'riff',
            authPassword: 'raff',
            baseUrl: "https://api.tempstars.info/v2/"
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
            enabled: true,
            key: '7a96865b-dac0-4059-afcd-e08555fe10b3'
        },
        mixpanel: {
            enabled: true,
            token: '399a45b6eea7aea3f7fb578e85cf9db6'
        },
        web: {
            appUrl: 'https://app.tempstars.info'
        },
        debug: true
    };
})();
