
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
            enabled: true,
            key: '7a96865b-dac0-4059-afcd-e08555fe10b3'
        },
        mixpanel: {
            enabled: true,
            token: '399a45b6eea7aea3f7fb578e85cf9db6'
        },
        debug: false        
    };
})();
