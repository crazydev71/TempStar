<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; connect-src http://localhost.com:3000 https://localhost:3000"> -->
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"> -->
    <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.stripe.com http://0.0.0.0:35729; img-src * data: 'unsafe-inline'" />
    <title>TempStars</title>
    <link rel="stylesheet" href="lib/font-awesome/font-awesome.css">
    <link rel="stylesheet" href="lib/themify-icons/themify-icons.css">
    @@include( '<%- cssfile %>' )
    <script type="text/javascript" src="https://js.stripe.com/v2/"></script>
  </head>
  <body>
    @@include( 'hygienist/popover-office-info.html' )
    @@include( 'hygienist/popover-office-notes.html' )
    @@include( 'hygienist/popover-office-full.html' )
    @@include( 'dentist/popover-hygienist-info.html' )
    @@include( 'dentist/popover-hygienist-notes.html' )

    <div class="statusbar-overlay"></div>
    <div class="panel-overlay"></div>

    <!-- right panel menu -->
    <div class="panel panel-right panel-reveal">
        <div id="panel-menu" class="content-block menu">
            <p>default menu</p>
        </div>
    </div>

    @@include( 'dentist/menu.html' )
    @@include( 'hygienist/menu.html' )

    <div class="views">
        <div class="view view-main" >

            <!-- navbar -->
            <div class="navbar landing-navbar">
                <div data-page="index" class="navbar-inner">
                </div>
            </div>

            <div class="pages navbar-through toolbar-fixed">

                <!-- landing  -->
                <div data-page="index" class="page no-swipeback landing">
                    <div class="page-content center" style="padding-top:8px;">
                        <div class="content-block" style="margin:50px auto 30px auto;width:240px;">
                            <img class="centerimg" src="img/logo.png" style="width:150px;">
                        </div>
                            <div class="content-block-title" style="margin-top:20px;color:#333;font-size:15px;letter-spacing:0.03em;">Getting Started</div>
                        <div class="content-block">
                            <div class="row" style="margin-top:20px;margin-bottom:0px;">
                                <div class="col-20">&nbsp;</div>
                                <div class="col-60">
                                    <a href="landing/signup.html" class="button button-round">Create Free Account</a>
                                </div>
                                <div class="col-20">&nbsp;</div>
                            </div>
                        </div>
                        <div class="content-block-title" style="margin-top:40px;margin-bottom:0;color:#333;font-size:15px;letter-spacing:0.03em;">Already Registered?</div>
                        <div class="content-block" style="margin-top:0;">
                            <form id="login-form">
                                <div class="list-block inset" style="margin:4px 0 10px 20px;">
                                    <div class="form-error-msg"></div>
                                  <ul>
                                    <li class="item-content">
                                      <div class="item-inner">
                                        <div class="item-title label">Email</div>
                                        <div class="item-input">
                                          <input type="email" name="email" autocapitalize="none" autocorrect="off" maxlength="50" placeholder="your email address"/>
                                          <div class="field-error-msg"><div>
                                        </div>
                                      </div>
                                    </li>
                                    <li class="item-content">
                                      <div class="item-inner">
                                        <div class="item-title label">Password</div>
                                        <div class="item-input">
                                          <input type="password" name="password" autocapitalize="none" autocorrect="off" maxlength="50" placeholder="your password"/>
                                          <div class="field-error-msg"><div>
                                        </div>
                                      </div>
                                    </li>
                                  </ul>
                                </div>

                                <div class="row">
                                    <div class="col-20">&nbsp;</div>
                                    <div class="col-60">
                                        <a id="login-button" href="#" class="button button-round">Log In</a></li>
                                    </div>
                                    <div class="col-20">&nbsp;</div>
                                </div>
                            </form>
                        </div>

                    </div>

                    <div class="footer toolbar" style="height:70px !important;font-size:.8em;padding-top:20px;background-color:#fff">
                          <div class="row">
                              <div class="col-33" style="text-align:center;">
                                  <a href="landing/forgot-password.html">Forgot Password?</a>
                              </div>
                              <div class="col-33" style="text-align:center;">
                                  <a href="landing/privacy-policy.html">Privacy Policy</a>
                              </div>
                              <div class="col-33" style="text-align:center;">
                                  <a href="mailto:support@tempstars.net" class="external">Contact Support</a>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-auto" style="text-align:center;padding:10px;ffffont-size:.8em;color:#999">
                                  Copyright &copy; 2016 Sudden Turtle Dental Consulting, Inc.
                              </div>
                          </div>
                    </div>

                </div>

            </div>
        </div>
    </div>

    @@include( 'shared/popup-privacy.html' )
    @@include( 'hygienist/popup-available-jobs.html' )
    @@include( 'hygienist/popup-offered-jobs.html' )
    @@include( 'hygienist/popup-booked-jobs.html' )
    @@include( 'hygienist/popup-worked-jobs.html' )
    @@include( 'hygienist/dentist-list.html' )

    <script src="cordova.js"></script>
    <script src="lib/framework7/js/framework7.min.js"></script>
    <script src="lib/jquery.min.js"></script>
    <script src="lib/lodash.min.js"></script>
    <script src="lib/bluebird.min.js"></script>
    <script src="lib/moment.min.js"></script>
    <script src="lib/uuid.js"></script>
    <script src="lib/validate.min.js"></script>
    <script src="js/tempstars.app.js"></script>
    <script src="js/tempstars.dentist.js"></script>
    <script src="js/tempstars.hygienist.js"></script>
    <script>
        TempStars.App.init();
    </script>
  </body>
</html>
