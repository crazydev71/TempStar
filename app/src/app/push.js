TempStars.Push = (function() {
    'use strict';
    var initialized = false;
    var push;

    function init() {
        console.log( 'push init' );
        
        if ( window.device.platform == 'iOS' || window.device.platform == 'Android' ) {
            console.log( 'push init' );
            push = PushNotification.init({
                android: {
                    senderID: TempStars.Config.push.senderID
                },
                ios: {
                    senderID: TempStars.Config.push.senderID,
                    alert: "true",
                    badge: "true",
                    sound: "true",
                    gcmSandbox: true
                },
                windows: {}
            });

            push.on('registration', function(data) {
                // data.registrationId
                console.log( 'push reg: ' + data.registrationId );
                window.registrationId = data.registrationId;
                TempStars.User.updateRegistration();
            });

            push.on('notification', function(data) {
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
                console.log( 'push notification: ' + data.message);
            });

            push.on('error', function(e) {
                // e.message
                console.log( e.message );
            });

            initialized = true;
        }
    }
    return {
        init: init
    };

})();
