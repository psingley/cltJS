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
	'views/validation/SuccessView',
	'util/objectUtil',
	'util/validationUtil',
	'util/newsletterUtil',
	'event.aggregator',
	'goalsUtil',
    'services/subscriptionService',
	'util/bingTrackingUtils'
], function ($, _, Backbone, Marionette, App, BaseNewsletterLayout, ErrorView, SuccessView, ObjectUtil, validationUtil, NewsletterUtil, EventAggregator, goalsUtil, subscriptionService, BingTrackingUtils) {
	var NewsletterSignupLayout = BaseNewsletterLayout.extend({
		el: '.newsletter_modal',
		events: {
			'click #newsletterSignUpButton': 'submitForm'
		},
		regions: {
			'messagesRegion': '#newsletter-errorbox'
		},
		ui: {
			'$newsletterSignUpButton': '#newsletterSignUpButton',
			'$mdlCloseButton': '#mdlCloseButton',
			'$newsletterFirstName': '#firstname',
			'$newsletterLastName': '#lastname',
			'$newsletterEmail': '#email',
			'$newsletterConfirmEmail': '#confirm-email',
			'$newsletterMessage': '#newsletterMessage'
		},
		isPrimaryChecked: false,
		initialize: function() {
            validationUtil.preventCopyPaste(this.ui.$newsletterConfirmEmail);

			if(!NewsletterUtil.isGeneralNewsletterModal($(this.$el))) {
				$('.newsletter-signup-modal').unbind('click');
				$('.newsletter-signup-modal').bind('click', function(){
					$('#landing-newsletter-modal').modal('show');
				})
			}

			this.applyLaunchNewsletterModalOptions();
		},
		submitForm: function(e) {
			e.preventDefault();
			this.ui.$newsletterSignUpButton.attr('disabled', 'disabled');

			var requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
				requiredLastname = App.dictionary.get('common.FormValidations.LastName'),
				firstNameEntered = this.ui.$newsletterFirstName.val(),
				lastNameEntered = this.ui.$newsletterLastName.val(),
				emailEntered = this.ui.$newsletterEmail.val(),
				confirmedEmailEntered = this.ui.$newsletterConfirmEmail.val(),
				//phoneEntered = this.ui.$newsletterPhone.length > 0 ? this.ui.$newsletterPhone.val() : '',
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

            if (!ObjectUtil.isNullOrEmpty(firstNameEntered)) {
                var firstNameErrormessage = validationUtil.validateFirstOrLastName(firstNameEntered);
                if (!ObjectUtil.isNullOrEmpty(firstNameErrormessage))
                    errorMessages.push(firstNameErrormessage);
            }

            if (!ObjectUtil.isNullOrEmpty(lastNameEntered)) {
                var lastNameErrormessage = validationUtil.validateFirstOrLastName(lastNameEntered);
                if (!ObjectUtil.isNullOrEmpty(lastNameErrormessage))
                    errorMessages.push(lastNameErrormessage);
            }

			// validate phone field only if it presents on a form
			//if(this.ui.$newsletterPhone.length > 0) {
			//	var phoneErrorMessages = validationUtil.validatePhoneNumber(phoneEntered);
			//	errorMessages = errorMessages.concat(phoneErrorMessages);
			//}

			var emailErrorMessages = validationUtil.validateEmailConfirmEmail(emailEntered, confirmedEmailEntered);
			errorMessages = errorMessages.concat(emailErrorMessages);

			var onComplete = function () {
				viewContext.ui.$newsletterSignUpButton.removeAttr('disabled');
			};

			if (errorMessages.length > 0) {
				this.finalizeTransaction(errorMessages, firstNameEntered, lastNameEntered, emailEntered, null, onComplete);
			} else {
				// if primary option is checked, there is no need to send other options
				var newsletterCodes = this.getCheckedOptionsCodes(checkedOptions);

				subscriptionService.ifUserSubscribed(emailEntered, newsletterCodes)
					.done(function(response) {
						var emailExists = (response.d.toLowerCase() === 'true'.toLowerCase());
						if (emailExists) {
							errorMessages.push(emailAlreadyExists);
						}
						
						viewContext.finalizeTransaction(errorMessages, firstNameEntered, lastNameEntered, emailEntered, newsletterCodes, onComplete);
					});
			}
		},
		finalizeTransaction: function (errorMessages, firstNameEntered, lastNameEntered, emailEntered, newsletterCodes, onComplete) {
			var viewContext = this;
			if (errorMessages.length === 0) {
				//close the error view
				this.messagesRegion.close();
				//google tag manager event tracking
				//try {
				//	dataLayer.push({
				//		'event': 'gaEvent',
				//		'eventCategory': 'Newsletter',
				//		'eventAction': 'Email',
				//		'eventLabel': 'Receive Newsletter Brochure Page'
				//	});
				//} catch (ex) {
				//	console.log(ex);
				//}
				//BingTrackingUtils.trackBingViewJson({ 'ec': 'Newsletter', 'ea': 'Sign Up', 'el': 'News', 'ev': '1' });
				this.logNewsletterTransaction();
				viewContext.subscribeEmailAddress(firstNameEntered, lastNameEntered, emailEntered, newsletterCodes, onComplete);
			} else {
				var errorView = new ErrorView(errorMessages);
				this.messagesRegion.show(errorView);
				if (onComplete) {
					onComplete();
				}
			}
		},

		subscribeEmailAddress: function (firstName, lastName, email, newsletterCodes, onComplete) {
			var viewContext = this;
			var currentItemId = App.siteSettings.currentItemId;
            var newsletterCodes = JSON.stringify(newsletterCodes);
            var checkedOptions = NewsletterUtil.getCheckedOptions(this.$el.find('.optInAgent'));
            var iAmAgent = false;
            if (checkedOptions.length > 0) {
                iAmAgent = true;
            }
            var params = JSON.stringify({ 'firstName': firstName, 'lastName': lastName, 'emailAddress': email, 'phoneNumber': '', 'newsletterCodes': newsletterCodes, 'currentItemId': currentItemId, 'iAmAgent': iAmAgent, 'signupDataSourceId': ''});

			//make ajax request
			$.ajax({
				url: "/Services/Brochures/NewsletterService.asmx/Subscribe",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: params,
				type: 'POST',
				success: function (data) {
                    $("#newsletter-form-signup").replaceWith("<div class='modal-content'><div class='modal-body'>Thank you for successfully signing up!<div></div></div></div>");

					App.Newsletter.cookieValue = data.d;
					App.Newsletter.stop();

					//submit goal for subcribing to newsletter
					//if(viewContext.isPrimaryChecked) {
					//	goalsUtil.emailSignup(email);
					//}
				},
                error: function (errorResponse) {
                    console.log('NewsletterService call failed: Subscribe');
                    console.log(errorResponse.responseText);
				}
			}).always(function() {
				if (onComplete) {
					onComplete();
				}
			});
		},
		getDocumentHeight: function () {
			return Math.max($(document).height(), $(window).height());
		},
		applyLaunchNewsletterModalOptions: function () {
			//launch if launching setting is set and modal is of general type
			if(App.companyInfo.isCoBranding
				|| !NewsletterUtil.isLaunchingSettingsSet()
				|| !NewsletterUtil.isGeneralNewsletterModal($(this.el))) {
				return;
			}

			var waitTime = NewsletterUtil.getWaitTime();
			if (waitTime > 0) {
				setTimeout(function () {
					EventAggregator.trigger('initNewsletterSignUpModal');
				}, waitTime);
			}

			var outerScope = this;
			var scrollPoint = NewsletterUtil.getScrollPoint();
			if (scrollPoint > 0) {
				$(window).scroll(function () {
					if ($(document).scrollTop() > outerScope.getDocumentHeight() * scrollPoint / 100){
						NewsletterUtil.newsletterModalShowCheck(function() {
                            EventAggregator.trigger('initNewsletterSignUpModal');
                        });
					}


				});
			}

			if(NewsletterUtil.isOnMouseLeaveWindow()) {
                NewsletterUtil.newsletterModalShowCheck(function() {
                    $(document).mouseleave(function () {
                        if (!App.newsletterModalShwon) {
                            EventAggregator.trigger('initNewsletterSignUpModal');
                        }
                    });
                });
			}
		},
		getCheckedOptions: function() {
			var $options = this.$el.find('.optIn');

			return _.filter($options, function(opt) {
				return $(opt).is(':checked');
			})
		},
		getCheckedOptionsCodes: function(checkedOptions) {
			var primaryCheckedOption = _.find(checkedOptions, function (opt) {
				return $(opt).attr('isprimary') == 'True';
			});

			var codes = _.map(checkedOptions, function (opt) {
				return $(opt).attr('name');
			});

			return codes && codes.length > 0 ? codes : "";
		}
	});

	return NewsletterSignupLayout;
});