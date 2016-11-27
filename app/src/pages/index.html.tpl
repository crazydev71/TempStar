<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *; connect-src http://localhost.com:3000 https://localhost:3000"> -->
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src *; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"> -->
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src * data: gap: ; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.stripe.com http://0.0.0.0:35729; connect-src http://10.0.1.45:3000; img-src * data: 'unsafe-inline'" /> -->
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src * data: gap: 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.stripe.com http://0.0.0.0:35729 http://10.0.1.45:3000" /> -->
    <!-- <meta http-equiv="Content-Security-Policy" content="default-src * data: gap: 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.stripe.com http://0.0.0.0:35729 http://10.0.1.45:3000; connect-src: http://10.0.1.45:3000 http://10.0.1.45" /> -->
    <meta http-equiv="Content-Security-Policy-Report-Only: default-src 'none'" />
    <title>TempStars</title>
    <link rel="stylesheet" href="lib/font-awesome/font-awesome.css">
    <link rel="stylesheet" href="lib/themify-icons/themify-icons.css">
    @@include( '<%- cssfile %>' )
    <script type="text/javascript" src="https://js.stripe.com/v2/"></script>
    <script type="text/javascript">(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
        for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="lib/mixpanel.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
    </script>
    <script>
     (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
     (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
     })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
     ga('create', 'UA-87613443-3', 'auto');
     ga('send', 'pageview');
    </script>
  </head>
  <body>
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
                                          <div class="field-error-msg"></div>
                                        </div>
                                      </div>
                                    </li>
                                    <li class="item-content">
                                      <div class="item-inner">
                                        <div class="item-title label">Password</div>
                                        <div class="item-input">
                                          <input type="password" name="password" autocapitalize="none" autocorrect="off" maxlength="50" placeholder="your password"/>
                                          <div class="field-error-msg"></div>
                                        </div>
                                      </div>
                                    </li>
                                  </ul>
                                </div>

                                <div class="row">
                                    <div class="col-20">&nbsp;</div>
                                    <div class="col-60">
                                        <a id="login-button" href="#" class="button button-round">Log In</a>
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
                                  <a href="mailto:help@tempstars.ca" class="external">Contact Support</a>
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

    @@include( 'hygienist/popover-map.html' )

    <script src="cordova.js"></script>
    <script src="lib/loggly.tracker-2.1.min.js"></script>
    <script src="lib/framework7/js/framework7.js"></script>
    <script src="lib/jquery.min.js"></script>
    <script src="lib/lodash.min.js"></script>
    <script src="lib/bluebird.min.js"></script>
    <script src="lib/moment.min.js"></script>
    <script src="lib/uuid.js"></script>
    <script src="lib/validate.min.js"></script>
    <script src="lib/platform.js"></script>
    <script src="js/tempstars.app.js"></script>
    <script src="js/tempstars.version.js"></script>
    <script src="js/tempstars.dentist.js"></script>
    <script src="js/tempstars.hygienist.js"></script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAJMD7G1zt5F7KT3QkyqMeTKssPBz5o_UI&callback=TempStars.Map.init"></script>
  </body>
</html>
