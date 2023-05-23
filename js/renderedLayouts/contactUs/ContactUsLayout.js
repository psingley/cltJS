define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'util/taxonomy/taxonomyDomUtil',
	'util/objectUtil',
	'util/validationUtil', 
    'util/locationsUtil',
    'util/dataLayerUtil',
	'views/validation/ErrorView',
	'extensions/marionette/views/RenderedLayout',
	'goalsUtil'
], function ($, _, Backbone, App, TaxonomyDomUtil, ObjectUtil, ValidationUtil, LocationsUtil, DataLayerUtil, ErrorView, RenderedLayout, goalsUtil) {
    var ContactUsLayout = RenderedLayout.extend({
        el: '#frmContactUs',
        events: {
            'change .countryId': 'updateFormLocations',
            'change .stateId': 'saveState',
            'click .btn': 'submitForm'
        },
        ui: {
            'email': '#Email',
            'firstName': '#FirstName',
            'lastName': '#LastName',
            'message': '#Message',
            'mainQuestion': '#MainQuestionSelected',
            '$subscribe': '#Subscribe',
            '$address': '#Address',
            '$city': '#City',
            'contactBy': '#ContactBy',
            'phone': '#Phone',
            'country': '#Country',
            'state': '#State',
            'zipCode': '#ZipCode',
            'captcha':'#CaptchaInputText'
        },
        initialize: function () {
            var outerScope = this;
            $.when(App.locations.getLocations())
                .done(function () {
                    var countries = App.locations.getAll('countries');
                    var $country = $(outerScope.$el.find('.country'));
                    var $countryId = $(outerScope.$el.find('.countryId'));
                    TaxonomyDomUtil.setAutocomplete(countries, $country, $countryId);
                    if (App.siteSettings.setDefaultCountry && !ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryName)) {
                        outerScope.setDefaultCountry();
                    }
                });
        },
        setDefaultCountry: function () {
            var defaultCountry = App.siteSettings.defaultCountryName;
            var country = App.locations.getLocationItem('countries', defaultCountry);
            if (country != null) {
                this.$el.find('.country').val(country.name);
                this.$el.find('.countryId').val(country.id);
                this.updateFormLocations();
            }
        },
        updateFormLocations: function () {
            var outerScope = this;
            var countryText = this.$el.find('.country').val();
            var countryId = this.$el.find('.countryId').val();
            this.saveCountry(countryId);

            var $stateSelector = outerScope.$el.find('.state');
			
            var $stateIdSelector = outerScope.$el.find('.stateId');
			
            if (countryId == App.locations.getLocationId('countries', countryText)) {

                App.locations.getCountryStates(countryId, function (countryStates) {
                   var states = $.parseJSON(JSON.stringify(countryStates));
                   TaxonomyDomUtil.setAutocomplete(states, $stateSelector, $stateIdSelector);
               
                });

            } else {
                TaxonomyDomUtil.setAutocomplete([], $stateSelector, $stateIdSelector);
            }
        },
        saveState: function (e) {
            var $target = $(e.target);
            var $state = this.$el.find('.stateId');

            var stateId = $state.val();
            var state = App.locations.getLocationItemById(stateId);
            // this.model.set({state: state});
        },
        saveCountry: function (countryId) {
            var country = App.locations.getLocationItemById(countryId); 
            //this.model.set({country: country});
        },
        submitForm: function () {
             

            var requiredEmail = App.dictionary.get('common.FormValidations.Email-IsValid'),
                requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
                requiredLastname = App.dictionary.get('common.FormValidations.LastName'),
                requiredInvalidEmail = App.dictionary.get('common.FormValidations.Email-IsValid'),
                requiredPhone = App.dictionary.get('common.FormValidations.Phone'),
                requiredMessage = App.dictionary.get('common.FormValidations.MainQuestionMessageRequired'),
                requiredCaptcha = "Please enter Captcha characters.";

  

            //verify form is in valid state
            var email = this.ui.email.val(),
                firstName = this.ui.firstName.val(),
                lastName = this.ui.lastName.val(),
                mainQuestion = this.ui.mainQuestion.val(),
                message = this.ui.message.val(),
                contactBy = $('input[name=ContactBy]:checked').val(),
                phone = this.ui.phone.val(),
                address = this.ui.$address.val(),
                city = this.ui.$city.val(),
                state = this.ui.state.val(),
                zipCode = this.ui.zipCode.val(),
                captcha = this.ui.captcha.val();


            var errorMessages = [];
            //verify the message field is not filled out, this is a hidden field that only bots will see
            if (message != null && message != '') {
                return false;
            }

            //first name filled out
            if (ObjectUtil.isNullOrEmpty(firstName.trim())) {
                errorMessages.push(requiredFirstname);
            }

            //last name filled out
            if (ObjectUtil.isNullOrEmpty(lastName.trim())) {
                errorMessages.push(requiredLastname);
            }

            //captcha filled out
            if (ObjectUtil.isNullOrEmpty(captcha.trim())) {
                errorMessages.push(requiredCaptcha);
            }

            //email filled out and valid
            if (ObjectUtil.isNullOrEmpty(email.trim())) {
                errorMessages.push(requiredEmail);
            }
            else if (!this.validateEmail(email)) {
                errorMessages.push(requiredInvalidEmail);
            }

            //How to Direct Your Message filled out
            if (ObjectUtil.isNullOrEmpty(mainQuestion)) {
                errorMessages.push(requiredMessage);
            }

            if (ObjectUtil.isNullOrEmpty(phone) && contactBy === 'Phone') {
                errorMessages.push(requiredPhone);
            }

					//validate phone only if it's entered
            if (!ObjectUtil.isNullOrEmpty(phone)) {
            	var phoneErrors = ValidationUtil.validatePhoneNumber(phone);
            	if (phoneErrors.length > 0) {
            		errorMessages.push(phoneErrors);
            	}
            }
            try {
                let messages = document.getElementById('Comments') ? document.getElementById('Comments').value : "";
                let questions = document.getElementById('Questions') ? document.getElementById('Questions').value : "";
                let country = document.getElementById('Country') ? document.getElementById('Country').value : "";

                const contactObj = {
                    "Email": email,
                    "Firstname": firstName,
                    "Lastname": lastName,
                    "Main Question": mainQuestion,
                    "Message": messages,
                    "Contact By": contactBy,
                    "Phone": phone,
                    "Address": address,
                    "City": city,
                    "State": state,
                    "Country:": country,
                    "Zipcode": zipCode,
                    "Captcha": captcha,
                    "Type": "Contact Us",
                    "Questions About": questions,
                    "Refererr URL": document.referrer
                };

                DataLayerUtil.SitecoreFormPush(contactObj);
                console.log(JSON.stringify(contactObj) + "SUCCESS");
            }
            catch (e) { console.log(e.message); }
            if (contactBy === 'USMail' &&
            (ObjectUtil.isNullOrEmpty(address) ||
                ObjectUtil.isNullOrEmpty(state) ||
                ObjectUtil.isNullOrEmpty(city) ||
                ObjectUtil.isNullOrEmpty(zipCode))) {
                errorMessages.push(App.dictionary.get('common.FormValidations.AddressAllFieldsRequired'));
            }

            //validate zip code only if it's entered
            var zip = $('#ZipCode').val();
            var countryId = $('.countryId').val();
            if (!ObjectUtil.isNullOrEmpty(zip) && !ValidationUtil.validatePostalCode(countryId, false)) {
                errorMessages.push(App.dictionary.get('common.FormValidations.ZipInvalid'));
            }

            if (errorMessages.length == 0) {
                //remove error view and continue with default behavior
                //save to dataLayer
                

            
                App.messagesRegion.close();
                goalsUtil.contactUsFormComplete();
                return true;
            }

            //define where the error box will live
            App.addRegions({
                messagesRegion: '#errorBoxContactUs'
            });

            var errorView = new ErrorView(errorMessages);
            App.messagesRegion.show(errorView);

            //we have a validation issue, prevent post of form
            return false;
        },
        validateEmail: function (email) {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return (true);
            }
            return (false);
        } 
    });
    return ContactUsLayout;
});
