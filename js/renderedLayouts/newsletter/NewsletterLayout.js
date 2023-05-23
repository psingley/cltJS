/**
 * Layout for the footer newsletter signup
 *
 * @class NewsletterFooterLayout
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/newsletter/NewsletterFooterLayout',
    'views/validation/ErrorView',
    'views/validation/SuccessView',
    'util/objectUtil',
    'util/validationUtil',
	'util/newsletterUtil',
	'goalsUtil'
], function ($, _, Backbone, Marionette, App, NewsletterFooterLayout, ErrorView, SuccessView, ObjectUtil, validationUtil, NewsletterUtil, goalsUtil) {
	var newsletterLayout = NewsletterFooterLayout.extend({
		el: '.newsletter-signup',
		ui: {
			'$newsletterEmail': '.newsletterPPCInput',
			'$newsletterConfirmEmail': '.newsletterPPCInputConfirm',
			'$newsletterMessage': '.newsletterFooterMessageInput',
			'$newsletterFirstName': '#firstname',
			'$newsletterLastName': '#lastname'
		},
		events: {
			'click .newsletterPPCButton': 'submitForm',
			'focus #newsLetterEmail': 'showConfirmEmail'
		},
		isPrimaryChecked: false,
		submitForm: function (e) {
			e.preventDefault();

			var emailEntered = this.ui.$newsletterEmail.val(),
				confirmedEmailEntered = this.ui.$newsletterConfirmEmail.val(),
				firstNameEntered = this.ui.$newsletterFirstName.val(),
				lastNameEntered = this.ui.$newsletterLastName.val(),
				message = this.ui.$newsletterMessage.val(),
				requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
				requiredLastname = App.dictionary.get('common.FormValidations.LastName'),
				errorMessages = [];

			//verify the message field is not filled out, this is a hidden field that only bots will see
			if (message != null && message != '') {
				return false;
			}

			if (firstNameEntered == null || firstNameEntered == '') {
				errorMessages.push(requiredFirstname);
			}

			if (lastNameEntered == null || lastNameEntered == '') {
				errorMessages.push(requiredLastname);
			}

			var emailErrorMessages = validationUtil.validateEmailConfirmEmail(emailEntered, confirmedEmailEntered);
			errorMessages = errorMessages.concat(emailErrorMessages);

			this.finalizeTransaction(errorMessages, firstNameEntered, lastNameEntered, emailEntered);

			return true;
		},
		finalizeTransaction: function (errorMessages, firstNameEntered, lastNameEntered, emailEntered) {
			if (errorMessages.length === 0) {
				var viewContext = this;
				var checkedOptions = NewsletterUtil.getCheckedOptions(this.$el.find('.optIn'));

				//close the error view
				this.messagesRegion.close();

				viewContext.subscribeEmailAddress(firstNameEntered, lastNameEntered, emailEntered, checkedOptions);
			} else {
				var errorView = new ErrorView(errorMessages);
				this.messagesRegion.show(errorView);
			}
		},
		subscribeEmailAddress: function (firstName, lastName, email, checkedOptions) {
			var datasourceId = '';
			if ($('div.newsletter-signup').length > 0) {
				datasourceId = $('div.newsletter-signup').data('datasourceid');
			}

			var newsletterCodes = JSON.stringify(this.getCheckedOptionsCodes(checkedOptions));

			var viewContext = this;
			var currentItemId = App.siteSettings.currentItemId;
			var params = JSON.stringify({ 'firstName': firstName, 'lastName': lastName, 'emailAddress': email, 'currentItemId': currentItemId, 'signupDataSourceId': datasourceId, newsletterCodes: null });

			//make ajax request
			$.ajax({
				url: "/Services/Brochures/NewsletterService.asmx/Subscribe",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: params,
				type: 'POST',
				success: function (data) {
					console.log('Id of created record is ' + data.d);

					var view = new SuccessView([App.dictionary.get('common.FormValidations.UserIsSubscribedOnAllNews.ThankYouForSigningUp')]);
					viewContext.messagesRegion.show(view);

					App.Newsletter.stop();

					//submit goal for subcribing to newsletter
					if(viewContext.isPrimaryChecked) {
						goalsUtil.emailSignup(email);
					}
				},
				error: function () {
					console.log('NewsletterService call failed: Subscribe');
				}
			});
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

			return codes && codes.length? codes : "";
		}
	});
	return newsletterLayout;
});