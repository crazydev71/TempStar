module.exports = function enableAuthentication(server) {
  // Enable authentication
  server.enableAuth();

  // Enable using "me" instead of user id
  var loopback = require('loopback');
  server.middleware('auth', loopback.token({
    model: server.models.accessToken,
    currentUserLiteral: 'me'
  }));

};
