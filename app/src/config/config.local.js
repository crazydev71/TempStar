
TempStars.Config = (function() {
    'use strict';

    return {
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
        }
    };
})();
