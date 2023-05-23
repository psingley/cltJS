define([
    'domReady',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/validation/ErrorView',
    'app',
    'util/seoTaggingUtil',
    'util/animationUtil'
], function (domReady, $, _, Backbone, Marionette, ErrorView, App, SeoTaggingUtil, AnimationUtil) {

    var Collette = {};
    Collette.Security = {};

    Collette.Security.SetupLoginForm = function () {
    	var $form = $("#frmLogin");
	    var $numberOfAttemps = 0;
        $form.data('loading', false);

        //define where the error box will live
        App.addRegions({
            messagesRegion: '#errorBoxSignin'
        });

    	//make sure we clean up the fields so they are PCI compliant
        //$('#txtEmail').val('');
        //$('#txtPassword').val('');

        //when the form is submitted, verify the form is valid, then execute the default
        $form.submit(function (e) {
            e.preventDefault();
            var loading = $form.data('loading');

            if (!loading) {
                $form.data('loading', true);

                var requiredUsername = App.dictionary.get('common.FormValidations.Username');
                var requiredPassword = App.dictionary.get('common.FormValidations.Password');

                //verify form is in valid state
                var username = $('#txtEmail').val();
                var password = $('#txtPassword').val();
                var message = $('#txtMessage').val();
                var numberOfLoginAttempts = $('#numberOfLoginAttempts').val();
                var errorMessages = [];
					
                var displayErrors = function () {
                    var errorView = new ErrorView(errorMessages);
                    App.messagesRegion.show(errorView);
                    
	                AnimationUtil.endItineraryAnimation($("#login-loader"));
                    $form.data('loading', false);
                    return false;
                };

                $numberOfAttemps = $numberOfAttemps + 1;
                if ($numberOfAttemps > numberOfLoginAttempts) {
                	var errorMessageSitecore = App.dictionary.get('common.FormValidations.NumberOfLoginAttempts');
                	errorMessages.push(errorMessageSitecore);
                	displayErrors();
	               return false;
                }

                //verify the message field is not filled out, this is a hidden field that only bots will see
                if (message != null && message != '') {
                    return false;
                }

                //username filled out
                if (username == null || username == '') {
                    errorMessages.push(requiredUsername);
                }

                //password filled out
                if (password == null || password == '') {
                    errorMessages.push(requiredPassword);
                }

                var data = {
                    email: username,
                    password: password,
                    remember: false
                };

            	AnimationUtil.startItineraryAnimation($("#login-loader"));

                $.ajax({
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    url: '/Services/SSO/SSOService.asmx/ValidateSignIn'
                })
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (errorMessages.length == 0 && data.success === true) {

                            //google tag manager event tracker
                            try {
                                dataLayer.push({
                                    'event': 'gaEvent',
                                    'eventCategory': 'Login Register',
                                    'eventAction': 'Account',
                                    'eventLabel': 'Log In Success'
                                });
                            } catch (ex) {
                                console.log(ex);
                            }

                            //remove error view and continue with default behavior
                            App.messagesRegion.close();
                            $form.unbind('submit');

                             
                            $form.submit();
                            return true;
                        } else {
                            errorMessages.push(data.message);
                            displayErrors();
                        }
                    })
                    .fail(function (response) {
                    	errorMessages.push(response.responseText);
		           
                        displayErrors();
                    });
            }
        });
    };

    App.module("Security", function () {
        this.startWithParent = false;

        this.addInitializer(function () {
            //wrap a block of text in the domReady object so
            //that is gets called after the dom has loaded.
            domReady(function () {
                Collette.Security.SetupLoginForm();
            });
        });
    });
});
