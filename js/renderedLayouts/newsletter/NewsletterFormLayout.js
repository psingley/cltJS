/**
 * Created by ssinno on 5/30/2014.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/newsletter/BaseNewsletterLayout',
    'views/validation/ErrorView',
    'util/objectUtil',
    'util/validationUtil',
    'util/newsletterUtil',
	'services/subscriptionService'
], function ($, _, Backbone, Marionette, App, BaseNewsletterLayout, ErrorView, ObjectUtil, validationUtil, NewsletterUtil, subscriptionService) {
    var NewsletterFormLayout = BaseNewsletterLayout.extend({
        el: '.newsletterSignupForm',
        events: {
            'submit #newsletterBrochureRequestForm': 'submitForm'
        },
        regions: {
            'messagesRegion': '.newsletter .error_box'
        },
        ui: {
				'$newsletterFirstName': '#firstname',
				'$newsletterLastName': '#lastname',
				'$newsletterEmail': '#newsletterEmail',
				'$newsletterConfirmEmail': '#newsletterConfirmEmail',
				'$newsletterMessage': '#newsletterMessage'
        },
        isPrimaryChecked :false,
        initialize: function () {
            validationUtil.preventCopyPaste(this.ui.$newsletterConfirmEmail);
        },
        submitForm: function (e) {
            e.preventDefault();

        	var requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
					requiredLastname = App.dictionary.get('common.FormValidations.LastName'),
					firstNameEntered = this.ui.$newsletterFirstName.val(),
					lastNameEntered = this.ui.$newsletterLastName.val(),
					emailEntered = this.ui.$newsletterEmail.val(),
					confirmedEmailEntered = this.ui.$newsletterConfirmEmail.val(),
					message = this.ui.$newsletterMessage.val(),
					errorMessages = [],
					optInValidation = App.dictionary.get('common.FormValidations.OptInNotCheckedEmail'),
					emailAlreadyExists = App.dictionary.get('common.FormValidations.EmailAlreadyExists'),
					viewContext = this;

	        
            //verify the message field is not filled out, this is a hidden field that only bots will see
            if (message != null && message != '') {
                return false;
            }

            // at least one option should be checked
            var checkedOptions = NewsletterUtil.getCheckedOptions(this.$el.find('.optIn'));
            if (!checkedOptions || checkedOptions.length == 0) {
                errorMessages.push(optInValidation);
            }

            if (firstNameEntered == null || firstNameEntered == '') {
            	errorMessages.push(requiredFirstname);
            }

            if (lastNameEntered == null || lastNameEntered == '') {
            	errorMessages.push(requiredLastname);
            }

            var emailErrorMessages = validationUtil.validateEmailConfirmEmail(emailEntered, confirmedEmailEntered);
            errorMessages = errorMessages.concat(emailErrorMessages);

            if (errorMessages.length > 0) {
                this.finalizeTransaction(errorMessages, emailEntered);
            } else {
                // if primary option is checked, there is no need to send other options
                var newsletterCodes = this.getCheckedOptionsCodes(checkedOptions);

            	subscriptionService.ifUserSubscribed(emailEntered, newsletterCodes)
                    .done(function (response) {
                        var emailExists = (response.d.toLowerCase() === 'true');
                        if (emailExists) {
                            errorMessages.push(emailAlreadyExists);
                        }

                        viewContext.finalizeTransaction(errorMessages, firstNameEntered, lastNameEntered, emailEntered, newsletterCodes);
                    });
            }
        },
        finalizeTransaction: function (errorMessages, firstNameEntered, lastNameEntered, emailEntered, newsletterCodes) {
            if (errorMessages.length === 0) {
                //close the error view
                this.messagesRegion.close();
                //google tag manager event tracking
                try {
                    dataLayer.push({
                        'event': 'gaEvent',
                        'eventCategory': 'Newsletter',
                        'eventAction': 'Email',
                        'eventLabel': 'Receive Newsletter Brochure Page'
                    });
                } catch (ex) {
                    console.log(ex);
                }

                this.logNewsletterTransaction();
                this.subscribeEmailAddress(firstNameEntered, lastNameEntered, emailEntered, newsletterCodes, this.isPrimaryChecked);
            } else {
                var errorView = new ErrorView(errorMessages);
                this.messagesRegion.show(errorView);
            }
        },
        getCheckedOptionsCodes: function(checkedOptions) {
            var primaryCheckedOption = _.find(checkedOptions, function (opt) {
                return $(opt).attr('isprimary') == 'True';
            });

            if (primaryCheckedOption) {
                this.isPrimaryChecked = true;
                return [$(primaryCheckedOption).attr('name')];
            }

            var codes = _.map(checkedOptions, function (opt) {
                return $(opt).attr('name');
            });

            return codes && codes.length > 0 ? codes : "";
        }
    });
    return NewsletterFormLayout;
});