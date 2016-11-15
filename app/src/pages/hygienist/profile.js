
TempStars.Pages.Hygienist.Profile = (function() {

    'use strict';

    var data;
    var initialized = false;

    function init() {

        app.onPageAfterAnimation( 'hygienist-profile', function( page ) {
            if ( data.photoUrl ) {
                $$('#hygienist-profile-photo').attr('src', data.photoUrl );
                $$('#hygienist-profile-photo-remove').show();
                $$('#hygienist-profile-photo-add').hide();
            }

            if ( data.resumeUrl ) {
                $$('#hygienist-profile-resume').attr('src', 'img/resume.png' );
                $$('#hygienist-profile-resume-remove').show();
                $$('#hygienist-profile-resume-add').hide();
            }

            $$('#hygienist-profile-upload-photo-button').on( 'click', addPhotoHandler );
            $$('#hygienist-profile-remove-photo-button').on( 'click', removePhotoHandler );
            $$('#hygienist-profile-web-photo').on( 'change', webPhotoHandler );

            $$('#hygienist-profile-upload-resume-button').on( 'click', addResumeHandler );
            $$('#hygienist-profile-remove-resume-button').on( 'click', removeResumeHandler );
            $$('#hygienist-profile-web-resume').on( 'change', webResumeHandler );

            $$('#hygienist-profile-form input').on( 'change', formChangeHandler );
            $$('#hygienist-profile-form select').on( 'change', formChangeHandler );
        });

        app.onPageBeforeInit( 'hygienist-profile', function( page ) {

            if ( ! initialized ) {
                $$(document).on( 'click','#hygienist-profile-save-button', submitHandler );
                $$('#hygienist-profile-upload-photo-button').on( 'click', addPhotoHandler );
                $$('#hygienist-profile-remove-photo-button').on( 'click', removePhotoHandler );
                $$('#hygienist-profile-web-photo').on( 'change', webPhotoHandler );
                $$('#hygienist-profile-form input[name="postalCode"]').on( 'focusout', upcasePostalCode );
                $$('#hygienist-profile-form input').on( 'keypress', keyHandler );
                $$('#hygienist-profile-upload-resume-button').on( 'click', addResumeHandler );
                $$('#hygienist-profile-remove-resume-button').on( 'click', removeResumeHandler );
                $$('#hygienist-profile-web-resume').on( 'change', webResumeHandler );
                initialized = true;
            }

            if ( data.photoUrl ) {
                $$('#hygienist-profile-photo').attr('src', data.photoUrl );
                $$('#hygienist-profile-photo-remove').show();
                $$('#hygienist-profile-photo-add').hide();
            }

            if ( data.resumeUrl ) {
                $$('#hygienist-profile-resume').attr('src', data.resumeUrl );
                $$('#hygienist-profile-resume-remove').show();
                $$('#hygienist-profile-resume-add').hide();
            }

            $$('#hygienist-profile-form select[name="province"]').val(data.province).prop('selected', true);
            TempStars.Analytics.track( 'Viewed Profile' );
        });

        app.onPageBeforeRemove( 'hygienist-profile', function( page ) {
            // $(document).off( 'click','#hygienist-profile-save-button', saveHandler );
            // $$('#hygienist-profile-form input[name="postalCode"]').off( 'focusout', upcasePostalCode );
            // $$('#hygienist-profile-form input').off( 'keypress', keyHandler );
        });

    }

    function getData() {

        return new Promise( function( resolve, reject ) {
            TempStars.Api.getHygienist()
            .then( function( profile ) {
                data = profile;
                resolve( data );
            })
            .catch( function( err ) {
                app.alert('Error retrieving profile. Please try again' );
                reject( err );
            });
        });
    }

    function formChangeHandler(e) {
        app.alert( 'Remember to Save changes!' );
    }

    function submitHandler(e) {
        var formData = app.formToJSON('#hygienist-profile-form');

        var constraints = {
            // email: {
            //     presence: true,
            //     email: true
            // },
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
            province: {
                presence: {message: "is required"}
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
                  strict: false
                },
                length: {
                    is: 6
                }
            }
        };

        // Clear errors
        $$('#hygienist-profile-form .form-error-msg').html('');
        $$('#hygienist-profile-form .field-error-msg').removeClass( 'error' ).html('');

        var errors = validate( formData, constraints );
        if ( errors ) {
            // if ( errors.email ) {
            //     $('#hygienist-profile-form input[name="email"]').addClass('error').next().html( errors.email[0] );
            // }
            if ( errors.firstName ) {
                $$('#hygienist-profile-form input[name="firstName"]').addClass('error').next().html( errors.firstName[0] );
            }
            if ( errors.lastName ) {
                $$('#hygienist-profile-form input[name="lastName"]').addClass('error').next().html( errors.lastName[0] );
            }
            if ( errors.address ) {
                $$('#hygienist-profile-form input[name="address"]').addClass('error').next().html( errors.address[0] );
            }
            if ( errors.city ) {
                $$('#hygienist-profile-form input[name="city"]').addClass('error').next().html( errors.city[0] );
            }
            if ( errors.province ) {
                $$('#hygienist-profile-form select[name="province"]').addClass('error').next().html( errors.province[0] );
            }
            if ( errors.postalCode ) {
                $$('#hygienist-profile-form input[name="postalCode"]').addClass('error').next().html( errors.postalCode[0] );
            }
            if ( errors.phone ) {
                $$('#hygienist-profile-form input[name="phone"]').addClass('error').next().html( errors.phone[0] );
            }
            if ( errors.CDHONumber ) {
                // Make field name more readable
                var msg = errors.CDHONumber[0].replace( /CDHONumber/i, 'CDHO num');
                $$('#hygienist-profile-form input[name="CDHONumber"]').addClass('error').next().html( msg );
            }
            return;
        }

        app.modal({
          title:  'Save Profile',
          text: 'Are you sure?',
          buttons: [
              { text: 'No' },
              { text: 'Yes', bold: true, onClick: function() {
                  saveProfile( formData );
                }}
          ]
        });

    }

    function saveProfile( formData ) {

        app.showPreloader('Saving Profile');
        uploadPhoto()
        .then( function( photoFileName ) {
            formData.photoUrl =  photoFileName;
            return uploadResume();
        })
        .then( function( resumeFileName ) {
            formData.resumeUrl =  resumeFileName;
            return TempStars.Api.updateHygienistAccount( data.id, formData );
        })
        .then( function() {
            delete window.webresume;
            return TempStars.User.refresh();
        })
        .then(function() {
            app.hidePreloader();
            TempStars.Analytics.track( 'Updated Profile' );
            TempStars.App.gotoStartingPage();
        })
        .catch( function( err ) {
            app.hidePreloader();
            app.alert( 'Error updating profile.  Please try again.' );
        });
    }

    function addPhotoHandler(e) {
        e.preventDefault();

        if ( window.cordova ) {
            window.cameraOpen = true;
            navigator.camera.getPicture (
              function(result) {
                  window.cameraOpen = false;
                  $$('#hygienist-profile-photo').attr('src', result );
                  $$('#hygienist-profile-photo-remove').show();
                  $$('#hygienist-profile-photo-add').hide();
                  //app.alert( 'Remember to Save changes' );
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
            $$('#hygienist-profile-web-photo').click();
        }

    }

    function removePhotoHandler( e ) {
        $$('#hygienist-profile-photo').attr( 'src', '' );
        $$('#hygienist-profile-photo-remove').hide();
        $$('#hygienist-profile-photo-add').show();
        app.alert( 'Remember to Save changes' );
    }

    function uploadPhoto() {
        return new Promise( function( resolve, reject ) {
            var photoURI = $$('#hygienist-profile-photo').attr('src');

            if ( photoURI == 'img/hygienist.png' ) {
                resolve( '' );
                return;
            }

            // If photo hasn't changed, don't need to upload
            if ( photoURI == data.photoUrl ) {
                resolve( photoURI );
                return;
            }

            // If the photo was removed, don't need to upload
            // TODO remove old photo from server
            if ( photoURI === '' ) {
                resolve( photoURI );
                return;
            }

            // Otherwise new photo so upload
            if ( window.cordova ) {
                // Mobile
                var options = new FileUploadOptions();
                options.fileName = uuid.v4() + '.jpg';
                var ft = new FileTransfer();
                var uploadURL = TempStars.Config.server.baseUrl + 'containers/tempstars.ca/upload';
                ft.upload( photoURI,
                   encodeURI( uploadURL ),
                   function( result ) {
                      resolve( TempStars.Config.bucket.baseUrl + options.fileName );
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

                f = $('#hygienist-profile-web-photo')[0].files[0];
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

                var dataURI = $('#hygienist-profile-photo').attr( "src" );
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


    function webPhotoHandler( e ) {
        var f = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            $$('#hygienist-profile-photo-remove').show();
            $$('#hygienist-profile-photo-add').hide();
            $$('#hygienist-profile-photo').attr( 'src', event.target.result );
        };
        reader.readAsDataURL(f);
    }

    function upcasePostalCode( e ) {
        var value = $$(this).val().toLocaleUpperCase();
        $$(this).val( value );
    }

    function keyHandler( e ) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if ( (code == 13) || (code == 10)) {
            cordova.plugins.Keyboard.close();
            $$('#hygienist-profile-save-button').trigger( 'click' );
            return false;
        }
    }

    function addResumeHandler(e) {
        e.preventDefault();

        if ( ! window.cordova ) {
            $$('#hygienist-profile-web-resume').click();
        }
        else {
            app.alert( 'Resum&eacute;s can\'t be uploaded from your phone/tablet. Sign in to your account from your computer to upload your resum&eacute;.' );
        }

    }

    function removeResumeHandler( e ) {
        $$('#hygienist-profile-resume').attr( 'src', '' );
        $$('#hygienist-profile-resume-remove').hide();
        $$('#hygienist-profile-resume-add').show();
        app.alert( 'Remember to Save changes' );
    }

    function uploadResume() {
        return new Promise( function( resolve, reject ) {
            var resumeURI = $$('#hygienist-profile-resume').attr('src');

            if ( resumeURI == '' || resumeURI == 'img/no-resume.png' ) {
                resolve( '' );
                return;
            }

            // If resume hasn't changed, don't need to upload
            if ( ! window.webresume ) {
                resolve( data.resumeUrl );
                return;
            }

            // Otherwise new resume so upload
            if (  window.cordova ) {
                app.alert( 'Resum&eacute;s can\'t be uploaded from your phone/tablet. Sign in to your account from your computer to upload your resum&eacute;.' );
            }
            else {
                // Browser
                var ext, f, dotIndex;

                f = $('#hygienist-profile-web-resume')[0].files[0];
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


    function webResumeHandler( e ) {
        var f = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            $$('#hygienist-profile-resume-remove').show();
            $$('#hygienist-profile-resume-add').hide();
            $$('#hygienist-profile-resume').attr( 'src', 'img/resume.png' );
            window.webresume = event.target.result;
        };
        reader.readAsDataURL(f);
    }


    return {
        init: init,
        getData: getData
    };

})();

TempStars.Pages.Hygienist.Profile.init();
