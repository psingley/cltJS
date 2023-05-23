define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/validation/ErrorView',
    'services/securityService',
    'util/seoTaggingUtil',
    'util/loginUtil',
    'util/dataLayerUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, ErrorView, SecurityService, SeoTaggingUtil, LoginUtil, DataLayerUtil) {
    var LoginLayout = Backbone.Marionette.Layout.extend({ 
        desktopWidth: 768,
        agentNeedsPageRefresh: function () {
            if ($('#agent-brochure-page') != null || $('#guest-brochure-page') != null) { // Brochure Page
                return true;
            }
            if (App.siteSettings.siteLanguage === 'en-GB' && 
                App.siteSettings.isBookingEngineAvailable.toString().toLowerCase() === 'true' && 
                (App.isNewTourDetailPage || App.isSearch)) { // UK Tour Details and Find Your Tour
                return true;
            }

            return false;
        },
        displayErrors: function (errorMessages) {
            var errorView = new ErrorView(errorMessages);
            App.loginMessagesRegion.show(errorView);
        },
        validateLogin: function(username, password, numberOfAttemps) {
            var requiredUsername = App.dictionary.get('common.FormValidations.Username');
            var requiredPassword = App.dictionary.get('common.FormValidations.Password');

            var message = $("#loginInputMessage").val();
            var limit = $('#numberLoginAttempts').val();
            var errorMessages = [];

            if (numberOfAttemps > limit) {
                var errorMessageSitecore = App.dictionary.get('common.FormValidations.NumberOfLoginAttempts');
                errorMessages.push(errorMessageSitecore);
                this.displayErrors(errorMessages);
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

            if (errorMessages.length > 0) {
                this.displayErrors(errorMessages);
                return false;
            }
            return true
        },
        initLogin: function() {
            var $form = $("#loginForm"); 
            var $username = $("#loginInputUsername");
            var $pas = $("#loginInputPassword");
            var numberOfAttemps = 0;
            $form.data('loading', false);

            // show password checkbox
            var passwordInput = $('#loginInputPassword');
            $('#loginShowPas').click(function(e){
                if (this.checked) {
                    passwordInput.attr("type", "text");
                }
                else {
                    passwordInput.attr("type", "password");
                }
            });

            // I don't have account link
            $('#loginNoAccount').click(function(e){
                $("#signupTabHeaderLink").click();
            });

            //make sure we clean up the fields so they are PCI compliant
            $username.val('');
            $pas.val('');

            var outerScope = this;
            //when the form is submitted, verify the form is valid, then execute the default
            $form.submit(function (e) {
                e.preventDefault();
                App.loginMessagesRegion.reset();

                numberOfAttemps++;
                var username = $username.val();
                var password = $pas.val();
                var rememberMe = false;
                if ($("#loginInputRemember").length > 0){
                    rememberMe = $("#loginInputRemember")[0].checked;
                }

                if (outerScope.validateLogin(username,password,numberOfAttemps)) {
                    LoginUtil.startLoadingAnimation(true);
                    SecurityService.signIn(username, password, rememberMe)
                        .done(function (response) {
                        	var data = JSON.parse(response.d);
                            if (data.success === true) {
                                //google tag manager event tracker
                                try {
                                    dataLayer.push({
                                        'event': 'gaEvent',
                                        'eventCategory': 'Login Register',
                                        'eventAction': 'Account',
                                        'eventLabel': 'Log In Success'
                                    });
                                    DataLayerUtil.LoginForm($username.val(), 'Success');
                                } catch (ex) {
                                    console.log(ex);
                                 
                                }

                                 
                                // if create account or reset passworrd page - redirect to home page
                                // else - stay on the current page
                                if (($("#tp-company-search-section").length > 0) || $("#reset-password-section").length > 0) {
                                    window.location.href = "/";
                                }
                                else {
                                	EventAggregator.trigger('updateUserAccountButton', true, data.name, data.links);
                                    if (outerScope.agentNeedsPageRefresh()) {
                                        window.location.reload();
                                    } else {
                                        LoginUtil.endLoadingAnimation();
                                    }
                                }
                            } else {
                                try {
                                    DataLayerUtil.LoginForm($username.val(), data.message);
                                } catch(ex) {
                                    console.log(ex);
                                }
                            	outerScope.displayErrors([data.message]);
                                LoginUtil.endLoadingAnimation();
                            }
                        })
                        .fail(function (response) {
                            outerScope.displayErrors([response.responseText]);
                            LoginUtil.endLoadingAnimation();
                        });
                }
            });
        },
        initLogout: function(id){
            var outerScope = this;
            //when the form is submitted, verify the form is valid, then execute the default
            $("#" + id).click(function (e) {
                e.preventDefault();
                LoginUtil.startLoadingAnimation(false);
                SecurityService.logout()
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (data === true) {
                        	EventAggregator.trigger('updateUserAccountButton', false);
                        	EventAggregator.trigger('setAgentItineraryPrintView', false);
                        } else {
                            console.log("Logout threw an error");
                            console.log('Response: ', response);
                        }
                    })
                    .fail(function (response) {
                        console.log(response.responseText);
                    })
                    .complete(function () {
                        if (outerScope.agentNeedsPageRefresh()) {
                            window.location.reload();
                        } else {
                            LoginUtil.endLoadingAnimation();
                        }
                    });
            });
        },
        addErrorRegion: function(){
            //define where the error box will live
            App.addRegions({
                loginMessagesRegion: '#loginFormErrorBox'
            });
        }
    });
    return LoginLayout;
});