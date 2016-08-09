
module.exports = function(BlockedHygienist) {
    BlockedHygienist.disableRemoteMethod('createChangeStream', true);
};
