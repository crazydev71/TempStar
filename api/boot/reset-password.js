
module.exports = function(server) {

var TSUser = server.models.TSUser;
var AccessToken = server.models.AccessToken;

// Show password reset form
server.get( '/reset-password', function(req, res, next) {
  if (!req.query.access_token) return res.sendStatus(401);
  res.render('reset-password', {
    accessToken: req.query.access_token
  });
});

// Reset the user's pasword
server.post('/reset-password', function(req, res, next) {

  if (!req.query.access_token) return res.sendStatus(401);

  // Verify passwords match
  if (!req.body.password ||
      !req.body.confirmation ||
      req.body.password !== req.body.confirmation) {
    return res.sendStatus(400, new Error('Passwords do not match'));
  }

  // Get the AcccessToken from the token
  AccessToken.findById( req.query.access_token )
  .then( function( accessToken ) {
      return TSUser.findById( accessToken.userId );
  })
  .then( function( user ) {
      return user.updateAttribute('password', req.body.password );
  })
  .then( function() {
      res.render('password-reset-complete');
  })
  .catch( function( err ) {
      console.dir( err );
  });

});

};
