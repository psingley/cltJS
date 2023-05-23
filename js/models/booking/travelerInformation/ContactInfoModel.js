define([
    'jquery',
    'underscore',
    'app',
    'backbone',
    'models/taxonomy/TaxonomyModel',
    'util/objectUtil',
    'util/validationUtil'
], function ($, _, App, Backbone, TaxonomyModel, ObjectUtil, ValidationUtil) {
    var ContactInfoModel = Backbone.Model.extend({
        defaults: {
            iataCode: 0,
            phone: '',
            email: '',
            mobile: '',
            country: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            confirmEmail: ''
        },
        errorMessages: null,
        validate: function () {
            var outerScope = this;
            this.errorMessages = [];

            this.validatePhone();
            this.validateMobile();
            this.validateEmail();
            this.validateAddress();
            this.validateState();
            this.validateCountry();
            this.validateCity();
            this.validateZip();

            return this.errorMessages;
        },
        validateZip: function () {
           var outerScope = this;
           var zip = this.get('zipCode');
           var country = this.get('country');
            if (ObjectUtil.isNullOrEmpty(zip)) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.Zip'));
            } else if (!ObjectUtil.isNullOrEmpty(country) && !ObjectUtil.isNullOrEmpty(country.id)) {
					var validZipCode = true;
					switch (country.id) {
						case '{EEDB78F3-A560-428D-83BF-F5BF0DD10135}': //uk
							{
								validZipCode = ValidationUtil.validateUKPostCode(zip, false);
								break;
							}
						case '{06D891A9-E7EF-4F8C-8700-379DBE2662DA}': //us
							{
								validZipCode = ValidationUtil.validateUSPostCode(zip, false);
								break;
							}
						case '{6154B7EE-709B-4EDB-85B9-A9BE188BE2B1}': //canada
							{
								validZipCode = ValidationUtil.validateCAPostCode(zip, false);
								break;
							}
						case '{3C6D851A-F4F2-4206-9E3C-1158FE1A5A1D}': //australia
							{
								validZipCode = ValidationUtil.validateAUPostCode(zip, false);
								break;
							}
						default:
							{
								if (ObjectUtil.isNullOrEmpty(zip)) {
									validZipCode = false;
								}
								break;
							}
					}

					if (!validZipCode) {
						outerScope.errorMessages.push(App.dictionary.get('common.FormValidations.ZipInvalid'));
					}
				}
        },
        validateCity: function () {
            if (ObjectUtil.isNullOrEmpty(this.get('city').trim())) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.City'));
            }
        },
        validatePhone: function () {
            //many checks for phone number, isolating into it's own function
            var phone = this.get('phone');
            this.errorMessages = this.errorMessages.concat(ValidationUtil.validatePhoneNumber(phone));
        },
        validateMobile: function () {
            //validate mobile if needed, not required field
            var mobile = this.get('mobile');
            if (!ObjectUtil.isNullOrEmpty(mobile)) {
                this.errorMessages = this.errorMessages.concat(ValidationUtil.validatePhoneNumber(mobile));
            }
        },
        validateEmail: function () {
            //also for email, many checks, isolating
            var email = this.get('email');
            var confirmEmail = this.get('confirmEmail');
            this.errorMessages = this.errorMessages.concat(ValidationUtil.validateEmailConfirmEmail(email, confirmEmail));
        },
        validateCountry: function () {
            //validate the country is selected and that it has a proper id
            var country = this.get('country');
            if (country == null || ObjectUtil.isNullOrEmpty(country.name)) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.Country'));
            } else if (country.neoId == null || country.neoId == 0) {
                this.errorMessages.push(App.dictionary.get('tourRelated.Booking.TravelerInfo.CountryId'));
            }
        },
        validateState: function () {
            //validate the state is selected and that it has a proper id
            var state = this.get('state');
            var country = this.get('country');

            //check if state is null and country is either US, Canada, Australia
            if (ObjectUtil.isNullOrEmpty(state)) {
                if (country != null) {
                    if (country.id == "{06D891A9-E7EF-4F8C-8700-379DBE2662DA}" || country.id == "{3C6D851A-F4F2-4206-9E3C-1158FE1A5A1D}" || country.id == "{6154B7EE-709B-4EDB-85B9-A9BE188BE2B1}") {
                        this.errorMessages.push(App.dictionary.get('common.FormValidations.State'));
                    }
                }
            }
            else {
                
                    if (/^[a-z]+$/i.test(state)) {
                        this.errorMessages.push(App.dictionary.get('tourRelated.Booking.TravelerInfo.StateId'));
                    }

            }

        },
        validateAddress: function () {
            if (ObjectUtil.isNullOrEmpty(this.get('address1').trim())) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.Address'));
            }
        }
    });
    return ContactInfoModel;
});