
(function () {
if ( false ) {
//if (Framework7.prototype.device.android) {
      Dom7('head').append(
          '<link rel="stylesheet" href="lib/framework7/css/framework7.material.min.css">' +
          '<link rel="stylesheet" href="lib/framework7/css/framework7.material.colors.min.css">' +
          '<link rel="stylesheet" href="app/app.css">' +
          '<link rel="stylesheet" href="app/android.css">'
      );
  }
  else {
      Dom7('head').append(
          '<link rel="stylesheet" href="lib/framework7/css/framework7.ios.min.css">' +
          '<link rel="stylesheet" href="lib/framework7/css/framework7.ios.colors.min.css">' +
          '<link rel="stylesheet" href="app/app.css">'
      );
  }
})();
