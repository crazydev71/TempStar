TempStars.Pages.HygienistSignup = (function() {
    var userAccount;

    function init() {

        app.onPageInit( 'hygienist-signup', function( page ) {
            $$('#hygienist-signup-done-button').on( 'click', doneButtonHandler );
            $$('#hygienist-signup-upload-photo-button').on( 'click', addPhotoHandler );
            $$('#hygienist-signup-remove-photo-button').on( 'click', removePhotoHandler );
            $$('#hygienist-signup-logout-link').on( 'click', logoutHandler );
            $$('#hygienist-signup-form input[name="postalCode"]').on( 'focusout', upcasePostalCode );
            $$('#hygienist-signup-form input').on( 'keypress', keyHandler );
            mainView.showNavbar();

            userAccount = TempStars.User.getCurrentUser();
            $$( '#hygienist-signup-email').html( userAccount.email );
        });

        app.onPageBeforeRemove( 'hygienist-signup', function( page ) {
            $$('#hygienist-signup-done-button').off( 'click', doneButtonHandler );
            $$('#hygienist-signup-upload-photo-button').off( 'click', addPhotoHandler );
            $$('#hygienist-signup-remove-photo-button').off( 'click', removePhotoHandler );
            $$('#hygienist-signup-logout-link').off( 'click', logoutHandler );
            $$('#hygienist-signup-form input[name="postalCode"]').off( 'focusout', upcasePostalCode );
            $$('#hygienist-signup-form input').off( 'keypress', keyHandler );
        });

        app.onPageAfterAnimation( 'hygienist-signup', function( page ) {
            displayNotification();
        });

    }

    function removeError(e) {
        $$(this).removeClass( 'error' ).next().html( '' );
    }

    function displayNotification() {
        var min = 0;
        var max = 150;
        var num = Math.floor(Math.random() * (max - min)) + min;

        if ( num < 50 ) {
            return;
        }

        setTimeout( function() {

            var el = app.addNotification({
                title: 'TempStars',
                message: 'There are ' + num + ' job postings right now!'
            });

            setTimeout( function() {
                app.closeNotification( el );
            }, 5000);

        }, 3000 );
    }

    function doneButtonHandler( e ) {

        var constraints = {
            firstName: {
                presence: true
            },
            lastName: {
                presence: true
            },
            address: {
                presence: true
            },
            city: {
                presence: true
            },
            postalCode: {
                presence: true,
                postalCode: true,
                postalCodeIsOntario: true
            },
            phone: {
                presence: true,
                phoneNumber: true
            },
            CDHONumber: {
                presence: true,
                numericality: {
                  onlyInteger: true,
                  strict: true
                },
                length: {
                    is: 6
                }
            }
        };

        // Clear errors
        $$('#hygienist-signup-form .form-error-msg').html('');
        $$('#hygienist-signup-form .field-error-msg').removeClass( 'error' ).html('');

        var formData = app.formToJSON('#hygienist-signup-form');
        var errors = validate(formData, constraints );

        // Check province
        if ( $$('#hygienist-signup-form select[name=province]').val() == "" ) {
            $('#hygienist-signup-form select[name="province"]').next().addClass('error').html( 'Province must be selected' );
        }

        // Save form data
        app.formStoreData('hygienist-signup-form', formData );

        if ( errors ) {
            if ( errors.firstName ) {
                $('#hygienist-signup-form input[name="firstName"]').addClass('error').next().html( errors.firstName[0] );
            }
            if ( errors.lastName ) {
                $$('#hygienist-signup-form input[name="lastName"]').addClass('error').next().html( errors.lastName[0] );
            }
            if ( errors.address ) {
                $$('#hygienist-signup-form input[name="address"]').addClass('error').next().html( errors.address[0] );
            }
            if ( errors.city ) {
                $$('#hygienist-signup-form input[name="city"]').addClass('error').next().html( errors.city[0] );
            }
            if ( errors.province ) {
                $$('#hygienist-signup-form input[name="province"]').addClass('error').next().html( errors.province[0] );
            }
            if ( errors.postalCode ) {
                $$('#hygienist-signup-form input[name="postalCode"]').addClass('error').next().html( errors.postalCode[0] );
            }
            if ( errors.phone ) {
                $$('#hygienist-signup-form input[name="phone"]').addClass('error').next().html( errors.phone[0] );
            }
            if ( errors.CDHONumber ) {
                // Make field name more readable
                var msg = errors.CDHONumber[0].replace( /CDHONumber/i, 'CDHO num');
                $$('#hygienist-signup-form input[name="CDHONumber"]').addClass('error').next().html( msg );
            }
            return;
        }

        app.showPreloader('Setting Up Account');

        // If have a photo, upload it
        uploadPhoto()
        .then( function( photoFileName ) {
            if ( photoFileName ) {
                formData.photoUrl = TempStars.Config.bucket.baseUrl + photoFileName;
            }

            // Add the hygienist id
            formData.id = userAccount.hygienistId;
            formData.isComplete = 1;
            return TempStars.Hygienist.save( formData );
        })
        .then( function() {
            return TempStars.User.refresh();
        })
        .then(function() {
            app.hidePreloader();
            app.formDeleteData('hygienist-signup-form');
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            $$('#hygienist-signup-form .form-error-msg')
                .html('<span class="ti-alert"></span> Setting up account failed. Please try again.')
                .show();
        });
    }

    function addPhotoHandler() {
        navigator.camera.getPicture(
          function( photoURI ) {
              $$('#hygienist-signup-photo').attr('src', photoURI );
              $$('#hygienist-signup-photo-remove').show();
              $$('#hygienist-signup-photo-add').hide();
          },
          function(errmsg) {
              app.alert( errmsg )
          },
          {
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              quality: 80,
              targetWidth: 200,
              targetHeight: 200
        });
    }

    function removePhotoHandler( e ) {
        $$('#hygienist-signup-photo').attr( 'src', 'img/hygienist.png' );
        $$('#hygienist-signup-photo-remove').hide();
        $$('#hygienist-signup-photo-add').show();
    }

    function logoutHandler( e ) {
        app.confirm( 'Are you sure you want to log out?', function() {
            TempStars.User.logout()
            .then( function() {
                mainView.router.loadPage( { url: 'index.html', animatePages: false } );
            });
        });
    }

    function upcasePostalCode( e ) {
        var value = $$(this).val().toLocaleUpperCase();
        $$(this).val( value );
    }

    function uploadPhoto() {
        return new Promise( function( resolve, reject ) {
            var photoURI = $$('#hygienist-signup-photo').attr('src');

            if ( photoURI == 'img/hygienist.png' ) {
                resolve();
                return;
            }
            var options = new FileUploadOptions();
            options.fileName = uuid.v4() + '.jpg';
            var ft = new FileTransfer();
            var uploadURL = TempStars.Config.server.baseUrl + 'containers/tempstars.ca/upload';
            ft.upload( photoURI,
               encodeURI( uploadURL ),
               function( result ) {
                  resolve( options.fileName );
               },
               function( error ) {
                  reject( error );
               },
               options
            );
        });
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#hygienist-signup-done-button').trigger( 'click' );
            return false;
        }
    }

    return {
        init: init
    };

})();

TempStars.Pages.HygienistSignup.init();
