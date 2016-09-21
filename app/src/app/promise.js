
Promise.prototype.minDelay = function minDelay(ms) {
    return Promise.delay(ms).return(this);
};
