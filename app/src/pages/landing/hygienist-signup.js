TempStars.Pages.HygienistSignup = (function() {

    var userAccount;
    var maxCDHOLength = 6;
    var CDHOLabel = 'CDHO Reg';

    function init() {

        app.onPageInit( 'hygienist-signup', function( page ) {
            $$('#hygienist-signup-done-button').on( 'click', doneButtonHandler );
            $$('#hygienist-signup-upload-photo-button').on( 'click', addPhotoHandler );
            $$('#hygienist-signup-remove-photo-button').on( 'click', removePhotoHandler );
            $$('#hygienist-signup-upload-resume-button').on( 'click', addResumeHandler );
            $$('#hygienist-signup-remove-resume-button').on( 'click', removeResumeHandler );
            $$('#hygienist-signup-logout-link').on( 'click', logoutHandler );
            $$('#hygienist-signup-form input[name="postalCode"]').on( 'focusout', upcasePostalCode );
            $$('#hygienist-signup-form input').on( 'keypress', keyHandler );
            $$('#hygienist-signup-web-photo').on( 'change', webPhotoHandler );
            $$('#hygienist-signup-web-resume').on( 'change', webResumeHandler );
            $$('#hygienist-signup-province').on( 'change', provinceChangeHandler );
            mainView.showNavbar();

            userAccount = TempStars.User.getCurrentUser();
            $$( '#hygienist-signup-email').html( userAccount.email );
            TempStars.Analytics.track( 'Viewed Hygienist Signup Page' );
        });

        app.onPageBeforeRemove( 'hygienist-signup', function( page ) {
            $$('#hygienist-signup-done-button').off( 'click', doneButtonHandler );
            $$('#hygienist-signup-upload-photo-button').off( 'click', addPhotoHandler );
            $$('#hygienist-signup-remove-photo-button').off( 'click', removePhotoHandler );
            $$('#hygienist-signup-upload-resume-button').off( 'click', addResumeHandler );
            $$('#hygienist-signup-remove-resume-button').off( 'click', removeResumeHandler );
            $$('#hygienist-signup-logout-link').off( 'click', logoutHandler );
            $$('#hygienist-signup-web-photo').off( 'change', webPhotoHandler );
            $$('#hygienist-signup-web-resume').off( 'change', webResumeHandler );
            $$('#hygienist-signup-form input[name="postalCode"]').off( 'focusout', upcasePostalCode );
            $$('#hygienist-signup-form input').off( 'keypress', keyHandler );
            $$('#hygienist-signup-province').off( 'change', provinceChangeHandler );
        });

        // app.onPageAfterAnimation( 'hygienist-signup', function( page ) {
        //     displayNotification();
        // });

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

    function provinceChangeHandler( e ) {
        var value = e.target.value;
        if (value === 'ON') {
            maxCDHOLength = 6;
            CDHOLabel = 'CDHO Reg';
            $$('#hygienist-signup-cdho-label').html('CDHO Reg. #');
            $$('#hygienist-signup-cdho-value').attr('placeholder', 'CDHO Reg');
        }
        else {
            maxCDHOLength = 4;
            CDHOLabel = 'CDHBC Reg';
            $$('#hygienist-signup-cdho-label').html('CDHBC Reg. #');
            $$('#hygienist-signup-cdho-value').attr('placeholder', 'CDHBC Reg');
        }
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
                postalCode: true
            },
            phone: {
                presence: true,
                phoneNumber: true
            },
            CDHONumber: {
                presence: true,
                numericality: {
                  onlyInteger: true,
                  strict: false
                },
                length: {
                    is: maxCDHOLength
                }
            },
            placements: {
                presence: {message: "is required"}
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
            if ( errors ) {
                errors.province = true;
            }
            else {
                errors = {};
                errors.province = true;
            }
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
            // if ( errors.province ) {
            //     $$('#hygienist-signup-form input[name="province"]').addClass('error').next().html( errors.province[0] );
            // }
            if ( errors.postalCode ) {
                $$('#hygienist-signup-form input[name="postalCode"]').addClass('error').next().html( errors.postalCode[0] );
            }
            if ( errors.phone ) {
                $$('#hygienist-signup-form input[name="phone"]').addClass('error').next().html( errors.phone[0] );
            }
            if ( errors.CDHONumber ) {
                // Make field name more readable
                var msg = errors.CDHONumber[0].replace( /CDHONumber/i, CDHOLabel);
                $$('#hygienist-signup-form input[name="CDHONumber"]').addClass('error').next().html( msg );
            }
            if ( errors.placements ) {
                $$('#hygienist-signup-form select[name="placements"]').addClass('error').next().html( errors.placements[0] );
            }

            return;
        }

        if (!validate.validators.validatePostalCodeFromProvince(formData.province, formData.postalCode)) {
            $$('#hygienist-signup-form input[name="postalCode"]').addClass('error').next().html( 'Postal code is not in selected province.' );
            return;
        }

        app.showPreloader('Setting Up Account');

        // Concatenate the Suite into the Address field
        if (formData.suite !== '' && formData.suite !== null)
            formData.address = '#' + formData.suite + '-' + formData.address;
        delete formData['suite'];

        // If have a photo, upload it
        uploadPhoto()
        .then( function( photoFileName ) {
            return new Promise( function( resolve, reject ) {
                if ( photoFileName ) {
                    formData.photoUrl = photoFileName;
                }

                // Add the hygienist id
                formData.id = userAccount.hygienistId;
                formData.isComplete = 1;
                formData.starScore = 4;
                resolve();
            });
        })
        .then( function() {
            return uploadResume();
        })
        .then( function( resumeFileName ) {
            if ( resumeFileName ) {
                formData.resumeUrl = resumeFileName;
            }
            return TempStars.Hygienist.save( formData );
        })
        .then( function() {
            delete window.webresume;
            return TempStars.User.refresh();
        })
        .then(function() {
            app.hidePreloader();
            app.formDeleteData('hygienist-signup-form');
            TempStars.Push.init();
            TempStars.User.updateRegistration();
            TempStars.Analytics.track( 'Hygienist Completed Signup' );
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            $$('#hygienist-signup-form .form-error-msg')
                .html('<span class="ti-alert"></span> Setting up account failed. Please try again.')
                .show();
        });
    }

    function addPhotoHandler(e) {
        e.preventDefault();

        if ( window.cordova ) {
            window.cameraOpen = true;
            navigator.camera.getPicture(
              function( photoURI ) {
                  window.cameraOpen = false;
                  $$('#hygienist-signup-photo').attr('src', photoURI );
                  $$('#hygienist-signup-photo-remove').show();
                  $$('#hygienist-signup-photo-add').hide();
              },
              function(errmsg) {
                  window.cameraOpen = false;
                  app.alert( errmsg );
              },
              {
                  sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                  quality: 80,
                  targetWidth: 200,
                  targetHeight: 200
            });
        }
        else {
            $$('#hygienist-signup-web-photo').click();
        }
    }

    function removePhotoHandler( e ) {
        $$('#hygienist-signup-photo').attr( 'src', 'img/hygienist.png' );
        $$('#hygienist-signup-photo-remove').hide();
        $$('#hygienist-signup-photo-add').show();
    }

    function webPhotoHandler( e ) {
        var f = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            $$('#hygienist-signup-photo-remove').show();
            $$('#hygienist-signup-photo-add').hide();
            $$('#hygienist-signup-photo').attr( 'src', event.target.result );
        };
        reader.readAsDataURL(f);
    }

    function addResumeHandler(e) {
        e.preventDefault();

        if ( window.cordova ) {
            app.alert( 'Resum&eacute;s can\'t be uploaded from your phone/tablet. Sign in to your account from your computer to upload your resum&eacute;.' );
        }
        else {
            $$('#hygienist-signup-web-resume').click();
        }
    }

    function removeResumeHandler( e ) {
        $$('#hygienist-signup-resume').attr( 'src', 'img/no-resume.png' );
        $$('#hygienist-signup-resume-remove').hide();
        $$('#hygienist-signup-resume-add').show();
    }

    function webResumeHandler( e ) {
        var f = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            $$('#hygienist-signup-resume-remove').show();
            $$('#hygienist-signup-resume-add').hide();
            $$('#hygienist-signup-resume').attr( 'src', 'img/resume.png' );
            window.webresume = event.target.result;
        };
        reader.readAsDataURL(f);
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

            if ( window.cordova ) {

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
            }
            else {
                // Browser
                var ext, f;

                f = $('#hygienist-signup-web-photo')[0].files[0];
                switch (f.type) {
                    case 'image/jpeg':
                    case 'image/jpg':
                        ext = '.jpg';
                        break;

                    case 'image/gif':
                        ext = '.gif';
                        break;

                    case 'image/png':
                        ext = '.png';
                        break;

                    default:
                        reject( new Error( 'unknown image type'));
                        return;
                }

                var dataURI = $('#hygienist-signup-photo').attr( "src" );
                var blob = TempStars.File.convertDataURItoBlobSync( dataURI );

                // Rename file
                var fileName = uuid.v4() + ext;

                var uploadURL = 'containers/tempstars.ca/upload';
                var formData = new FormData();
                formData.append( 'photo', blob, fileName );
                TempStars.Ajax.upload( uploadURL, formData )
                .then( function( result ) {
                    resolve( TempStars.Config.bucket.baseUrl + fileName );
                })
                .catch( function( err ) {
                    reject( err );
                });
            }
        });
    }


    function uploadResume() {
        return new Promise( function( resolve, reject ) {
            var resumeURI = $$('#hygienist-signup-resume').attr('src');

            if ( resumeURI == 'img/no-resume.png' ) {
                resolve();
                return;
            }

            if ( ! window.cordova ) {

                // Browser
                var ext, f, dotIndex;

                f = $('#hygienist-signup-web-resume')[0].files[0];

                // If has extension, use it
                // If doesn't have extension, look at mime types
                // else text
                dotIndex = f.name.lastIndexOf('.');
                if ( dotIndex != -1 && f.name.length > dotIndex ) {
                    ext = f.name.substr( dotIndex + 1 );
                }
                else {
                    switch ( f.type ) {
                        case 'application/msword':
                            ext = 'doc';
                            break;

                        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                            ext = 'docx';
                            break;

                        case 'application/pdf':
                            ext = 'pdf';
                            break;

                        case 'application/rtf':
                        case 'text/richtext':
                            ext = 'rtf';
                            break;

                        case 'text/plain':
                        default:
                            ext = 'txt';
                            break;
                    }
                }
                var blob = TempStars.File.convertDataURItoBlobSync( window.webresume );

                // Rename file
                var fileName = uuid.v4() + '.' + ext;

                var uploadURL = 'containers/tempstars.ca/upload';
                var formData = new FormData();
                formData.append( 'resume', blob, fileName );
                TempStars.Ajax.upload( uploadURL, formData )
                .then( function( result ) {
                    resolve( TempStars.Config.bucket.baseUrl + fileName );
                })
                .catch( function( err ) {
                    reject( err );
                });
            }
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
