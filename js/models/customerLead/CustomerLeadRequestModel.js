// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'util/objectUtil',
    'util/validationUtil',
    'collections/customerLead/CustomerLeadBrochureCollection'
], function ($, _, Backbone, App, ObjectUtil, ValidationUtil, CustomerLeadBrochureCollection) {
	var CustomerLeadRequestModel = Backbone.Model.extend({
		defaults: {
			currentItemId: '',
			formType: '',
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			isTravelAgent: '',
			workingWithTravelAgent: '',
			agentWithMoreTravelers: '',
			sourceUrl: '',
			requestSource: '',
			promoName: '',
			tourId: '',
			tourDepartureDate: '',
			validatePhoneNumber: true,
			optInEmail: '',
			customerLeadBrochures: CustomerLeadBrochureCollection
		},

		errorMessages: null,
		validate: function () {
			this.errorMessages = [];
			this.validateFirstName();
			this.validateLastName();
			this.validateEmail();
			if (this.get('validatePhoneNumber')) {
				this.validatePhone();
			}

			return this.errorMessages;
		},
		validateFirstName: function () {
			var firstName = this.get('firstName');
			if (ObjectUtil.isNullOrEmpty(firstName.trim())) {
				this.errorMessages.push(App.dictionary.get('common.FormValidations.FirstName'));
			}
		},
		validateLastName: function () {
			var lastName = this.get('lastName');
			if (ObjectUtil.isNullOrEmpty(lastName.trim())) {
				this.errorMessages.push(App.dictionary.get('common.FormValidations.LastName'));
			}
		},
		validatePhone: function () {
			var phone = this.get('phone');
			this.errorMessages = this.errorMessages.concat(ValidationUtil.validatePhoneNumber(phone));
		},
		validateEmail: function () {
			var email = this.get('email');
			var optInEmail = this.get('optInEmail');
			
			if (App.isUKSite || App.isThomasCookSite) {
				if (!ObjectUtil.isNullOrEmpty(email)) {
					this.errorMessages = this.errorMessages.concat(ValidationUtil.validateEmailConfirmEmail(email, email));
					if (!optInEmail) {
						this.errorMessages.push(App.dictionary.get('common.FormValidations.OptInNotCheckedEmail'));
					}
				}
				if (optInEmail && ObjectUtil.isNullOrEmpty(email)) {
					this.errorMessages.push(App.dictionary.get('common.FormValidations.EmailOptIn'));
				}
			} else {
				this.errorMessages = this.errorMessages.concat(ValidationUtil.validateEmail(email, email));
			}
		}

	});
	// Return the model for the module
	return CustomerLeadRequestModel;
});