define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'util/taxonomy/taxonomyDomUtil',
	'util/objectUtil',
	'util/validationUtil',
	'views/validation/ErrorView',
	'views/validation/SuccessView',
	'extensions/marionette/views/RenderedLayout',
	'goalsUtil'
], function($, _, Backbone, App, TaxonomyDomUtil, ObjectUtil, ValidationUtil, ErrorView, SuccessView, RenderedLayout, goalsUtil) {
	var CaresContactUsLayout = RenderedLayout.extend({
        el: '.contact-us-form',
        events: {
            'click button': 'submitForm'
        },
        ui: {
        	'$firstName': '#first-name',
        	'$lastName': '#last-name',
        	'$email': '#email',
        	'$confirmEmail': '#confirm-email',
        	'$subject': '#subject',
        	'$message': '#message'
        },
        initialize: function () {
	        console.log('caresContactUsLayout initialized');
        },
        validate: function() {
	        
        },
        submitForm: function (e) {

           e.preventDefault();
           var requiredMessage = App.dictionary.get('common.FormValidations.Message'),
               requiredSubject = App.dictionary.get('common.FormValidations.Subject'),
               requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
               requiredLastname = App.dictionary.get('common.FormValidations.LastName');

            //verify form is in valid state
            var email = this.ui.$email.val(),
                confirmEmail = this.ui.$confirmEmail.val(),
                firstName = this.ui.$firstName.val(),
                lastName = this.ui.$lastName.val(),
                subject = this.ui.$subject.val(),
                message = this.ui.$message.val();

            var errorMessages = [];

            if (firstName == null || firstName == '') {
            	errorMessages.push(requiredFirstname);
            }

            if (lastName == null || lastName == '') {
            	errorMessages.push(requiredLastname);
            }

            var emailErrorMessages = ValidationUtil.validateEmail(email, confirmEmail);
            errorMessages = errorMessages.concat(emailErrorMessages);

            if (subject == null || subject == '') {
            	errorMessages.push(requiredSubject);
            }

            if (message == null || message == '') {
            	errorMessages.push(requiredMessage);
            }

            //define where the messages will live
            App.addRegions({
               messagesRegion: '#contact-us-messages'
            });

            if (errorMessages.length == 0) {
               var successView = new SuccessView([App.dictionary.get('common.Misc.ThankYou')]);
               App.messagesRegion.show(successView);

               goalsUtil.contactUsFormComplete();

               return true;
            }

            var errorView = new ErrorView(errorMessages);
            App.messagesRegion.show(errorView);

            //we have a validation issue, prevent post of form
            return false;
        }
    });
	return CaresContactUsLayout;
});
