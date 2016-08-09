
module.exports = function(BlockedDentist) {
    BlockedDentist.disableRemoteMethod('createChangeStream', true);
};
