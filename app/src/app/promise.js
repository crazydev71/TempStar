
Promise.prototype.minDelay = function minDelay(ms) {
    'use strict';
    return Promise.delay(ms).return(this);
};
