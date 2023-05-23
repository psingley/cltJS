define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'util/objectUtil',
    'views/validation/SuccessView',
    'views/validation/ErrorView',
    'util/tourDetailUtil',
    'services/emailService',
    'extensions/marionette/views/RenderedLayout',
    'goalsUtil'
], function ($, _, Backbone, App, ObjectUtil, SuccessView, ErrorView, TourDetailUtil, EmailService, RenderedLayout, goalsUtil) {
    var ShareEmailLayout = RenderedLayout.extend({
        el: '#email-tour-modal',
        events: {
            'click #sendTourEmail': 'submitForm'
        },
        ui: {
            'email': '#emailText',
            'name': '#nameText',
            'optionalMessage': '#optionalMessageArea'
        },
        submitForm: function (e) {
            e.preventDefault();
            var requiredEmail = App.dictionary.get('common.FormValidations.Email-IsValid');
            var requiredName = App.dictionary.get('common.FormValidations.FirstName');
            var requiredInvalidEmail = App.dictionary.get('common.FormValidations.Email-IsValid');

            //verify form is in valid state
            var name = this.ui.name.val();
            var email = this.ui.email.val();
            var optionalMessage = this.ui.optionalMessage.val();

            var to = "";
            $("#recipientEmailRows input").each(function (id,item){
                if (item.value != "")
                    to += to === "" ? item.value : "; " + item.value;
            });

            var packageDateId = $("#emailButton").attr("value");

            var errorMessages = [];

            //first name filled out
            if (name == null || name == '') {
                errorMessages.push(requiredName);
            }

            //email filled out and valid
            if (email != null && email != '' && !this.validateEmail(email)) {
                errorMessages.push(requiredInvalidEmail);
            }

            //email filled out and valid
            if (to == null || to == '') {
                errorMessages.push(requiredEmail);
            }
            else {
                var notValidEmail = false;
                var outerScope = this;
                $("#recipientEmailRows input").each(function (id,item){
                    if (item.value != "" && !outerScope.validateEmail(item.value)) {
                        notValidEmail = true;
                    }
                });
                if (notValidEmail){
                    errorMessages.push(requiredInvalidEmail);
                }
            }

            //define where the error box will live
            App.addRegions({
                messagesRegion: '#resultInfo'
            });

            if (errorMessages.length != 0) {
                var errorView = new ErrorView(errorMessages);
                App.messagesRegion.show(errorView);
            }
            else
            {
                //remove error view and continue with default behavior
                App.messagesRegion.close();
                var $body = $('body');

                var isCoBranding = $body.data('company').isCoBranding;
                var partnerId = null;
                if (isCoBranding) {
                    var partner = $body.data('company').partner;
                    if (partner != null) {
                        partnerId = partner.sitecoreId;
                    }
                }
                this.sendEmail(name, email, to, optionalMessage, packageDateId, isCoBranding, partnerId);
            }
        },
        sendEmail: function (name, email, to, optionalMessage, packageDateId, isCoBranding, partnerId) {
            EmailService.sendShareEmail(name, email, to, optionalMessage, App.siteSettings.currentItemId, packageDateId, isCoBranding, partnerId)
                .fail(function (response) {
                    console.log('there was an issue sending emails');
                    var messages = [App.dictionary.get('tourRelated.PrintAndShare.ErrorSending')];
                    var errorView = new ErrorView(messages);
                    App.messagesRegion.show(errorView);
                });

            var messages = [App.dictionary.get('tourRelated.PrintAndShare.EmailSent')];
            var successView = new SuccessView(messages);
            App.messagesRegion.show(successView);

            goalsUtil.socialSharing('email');
	        goalsUtil.shareEmail();
        },
        validateEmail: function (email) {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return (true);
            }
            return (false);
        }
    });
    return ShareEmailLayout;
});
