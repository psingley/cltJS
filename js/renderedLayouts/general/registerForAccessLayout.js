define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'util/taxonomy/taxonomyDomUtil',
    'util/validationUtil',
    'util/uriUtil',
    'collections/validation/MessagesCollection',
    'collections/general/ValidationSettingsCollection',
    'models/general/ValidationSettingModel',
    'views/validation/NumericMessageListView',
    'enums/countriesIdsEnum',
    'enums/companyNumberTypesIdsEnum',
    'services/securityService',
    'renderedLayouts/general/createAccount/baseAccountLayout'
], function ($, _, Backbone, Marionette, App,  ObjectUtil, TaxonomyDomUtil, ValidationUtil, UriUtil, MessageCollection, ValidationSettingsCollection, ValidationSettingModel, NumericMessageListView, CountriesIdsEnum, CompanyNumberTypesIdsEnum, SecurityService, BaseAccountLayout) {
    var RegisterForAccess = BaseAccountLayout.extend({
        el: "#tp-register-for-access-section",
        regions:{
            validationErrorMessagesRegion:"#tp-errors-list",
            messagesRegion:"#registration-messages"
        },
        ui: {
            '$submit': '#submit-btn',
            '$companyCountryName': '#ci-country',
            '$companyCountryId' : '#ci-country-id',
            '$companyStateName': '#ci-state',
            '$companyNumber': '#ci-company-number',
            '$companyName': '#ci-company-name',
            '$companyAddress1': '#ci-address-1',
            '$companyAddress2': '#ci-address-2',
            '$companyCity': '#ci-city',
            '$companyStateId': '#ci-state-id',
            '$companyPostalCode': '#ci-postal-code',
            '$companyPhone': '#ci-phone',
            '$companyFax': '#ci-fax',
            '$companyEmail': '#ci-email',
            '$username': '#tpi-username',
            '$firstName': '#tpi-first-name',
            '$lastName': '#tpi-last-name',
            '$contactPhone': '#tpi-phone',
            '$contactFax': '#tpi-fax',
            '$contactEmail': '#tpi-email',
            '$contactContactEmail': '#tpi-confirm-email',
            '$contactAddress1': '#tpi-address-1',
            '$contactAddress2': '#tpi-address-2',
            '$contactCity': '#tpi-city',
            '$contactStateId': '#tpi-state-id',
            '$contactStateName': '#tpi-state',
            '$contactPostalCode': '#tpi-postal-code',
            '$contactCountryId': '#tpi-country-id',
            '$companyNumberType': 'input[name="company-number-type"]',
            '$validationErrorsSection': '#validation-errors',
            '$contactAddress': '#home-agent-address',
            '$agentType': 'input[name="agent-type"]'
        },
        events: {
            'change input[type="radio"][name="agent-type"]': 'agentTypeChange',
            'change input[name="country"]': 'updateFormLocations',
            'change #ci-country-id': 'clearSelectedCompanyState',
            'change #tpi-country-id': 'clearSelectedContactState'
        },
        companyInfoIsPrepopulated: true,
        initialize: function() {
            var outerScope = this;

            var forms = $("#tp-register-form");
            if (forms.length <= 0) {
                return;
            }

            if($(this.ui.$companyName).val() === ""){
                this.enableSection("#new-company-fieldset");
                this.companyInfoIsPrepopulated = false;
            }

            if (App.siteSettings.allowUsername && this.companyInfoIsPrepopulated){
                $(this.ui.$contactEmail).val($(this.ui.$companyEmail).val());
                $(this.ui.$contactPhone).val($(this.ui.$companyPhone).val());
                $(this.ui.$contactFax).val($(this.ui.$companyFax).val());
            }

            this.initValidationItems();

            _.each(this.validationItems.models, function(model){
                var asyncInput = model.get("asyncInput");
                var functionName = model.get("functionName");
                if (asyncInput != null){
                    forms.on("focusout", asyncInput, function (e) {
                        outerScope[functionName](e.target).done(function () {
                            outerScope.updateErrorsView();
                        });
                    });
                }
                else {
                    _.each(model.get("inputs").models, function (input) {
                        var el = input.get("el");
                        forms.on("focusout", el, function (e) {
                            if (!input.get("checkRequiredAttr") || $(el).attr("required")) {
                                var dependency = input.get("dependency");
                                if (!input.get("required")) {
                                    outerScope[functionName](e.target, false);
                                } else if (!ObjectUtil.isNullOrEmpty(dependency)) {
                                    outerScope[functionName](e.target, dependency);
                                } else {
                                    outerScope[functionName](e.target);
                                }
                            } else {
                                outerScope.removeErrorMessage(el);
                            }
                            outerScope.updateErrorsView();
                        });
                    });
                }
            });

            this.errorMessages = [];

            $(this.ui.$submit).click( function () {
                outerScope.validation();
            });

            forms.submit(function (e) {
                e.preventDefault();
            });

            this.contactAddressRequiredFields = $(this.ui.$contactAddress + " [required]");
            this.contactAddressRequiredFields.removeAttr("required");

            this.initializeLocations();
        },

        // validation settings
        initValidationItems: function(){
            this.validationItems = new ValidationSettingsCollection([
                new ValidationSettingModel({
                    functionName: "validateNotEmpty",
                    inputs: [
                        // company info
                        this.ui.$companyName,
                        this.ui.$companyAddress1,
                        this.ui.$companyCity,
                        {
                            el: this.ui.$companyStateId,
                            checkRequiredAttr: true
                        },
                        // contact info
                        this.ui.$firstName,
                        this.ui.$lastName,
                        {
                            el: this.ui.$contactAddress1,
                            checkRequiredAttr: true
                        },
                        {
                            el: this.ui.$contactCity,
                            checkRequiredAttr: true
                        },
                        {
                            el: this.ui.$contactStateId,
                            checkRequiredAttr: true
                        }
                    ]
                }),
                new ValidationSettingModel({
                    functionName: "validateCountry",
                    inputs: [
                        this.ui.$companyCountryId,
                        {
                            el: this.ui.$contactCountryId,
                            checkRequiredAttr: true
                        }
                    ]
                }),
                new ValidationSettingModel({
                    functionName: "validatePhoneNumber",
                    inputs: [
                        this.ui.$companyPhone,
                        this.ui.$contactPhone,
                        {
                            el: this.ui.$companyFax,
                            required: false
                        },
                        {
                            el: this.ui.$contactFax,
                            required: false
                        }
                    ]
                }),
                new ValidationSettingModel({
                    functionName: "validatePostalCode",
                    inputs: [
                        {
                            el: this.ui.$companyPostalCode,
                            dependency: this.ui.$companyCountryId
                        },
                        {
                            el: this.ui.$contactPostalCode,
                            dependency: this.ui.$contactCountryId,
                            checkRequiredAttr: true
                        }
                    ]
                }),
                new ValidationSettingModel({
                    functionName: "validateCompanyNumber",
                    inputs: [
                        {
                            el: this.ui.$companyNumber,
                            dependency: this.ui.$companyNumberType
                        }
                    ]
                }),
                new ValidationSettingModel({
                    functionName: "validateAgentType",
                    inputs: [
                        this.ui.$agentType
                    ]
                })
            ]);
            if (App.siteSettings.allowUsername) {
                this.validationItems.add(new ValidationSettingModel({
                    functionName: "validateEmail",
                    inputs: [
                        this.ui.$companyEmail,
                        {
                            el: this.ui.$contactEmail,
                            required: false
                        }
                    ]
                }));
                this.validationItems.add(new ValidationSettingModel({
                    functionName: "validateUsername",
                    asyncInput: this.ui.$username
                }));
            }
            else {
                this.validationItems.add(new ValidationSettingModel({
                    functionName: "validateEmailWithConfirmation",
                    inputs: [
                        {
                            el: this.ui.$contactEmail,
                            dependency: this.ui.$contactContactEmail
                        }
                    ]
                }));
            }
        },
        updateErrorsView: function(submitOnSuccess){
            if (this.errorMessages.length === 0) {
                this.clearErrorsScreen(submitOnSuccess)
            } else {
                this.showErrors();
            }
        },
        validateNotEmpty: function(input){
            var text = input.value;
            var uiSelector = "#" + input.id;
            if(ObjectUtil.isNullOrEmpty(text)) {
                this.fieldIsInvalid(uiSelector);
            }
            else {
                this.removeErrorMessage(uiSelector);
            }
        },
        validateUsername: function(input){
            var outerScope = this;
            var df = $.Deferred();
            var un = input.value;
            var uiSelector = "#" + input.id;
            if(ObjectUtil.isNullOrEmpty(un)) {
                this.fieldIsInvalid(uiSelector);
                df.resolve();
            }
            else {
                ValidationUtil.validateUsername(un).done(function (message) {
                    if (ObjectUtil.isNullOrEmpty(message)){
                        outerScope.removeErrorMessage(uiSelector);
                    }
                    else {
                        outerScope.fieldIsInvalid(uiSelector, message);
                    }
                    df.resolve();
                });
            }
            return $.when(df).promise();
        },
        validateAgentType: function(input){
            var agentTypeRequired = App.dictionary.get("profile.ErrorMessages.AgentTypeRequired");
            var uiSelector ='input[name="' + input.name + '"]';

            var agentType = _.find($(uiSelector), function(checkbox) {
                return $(checkbox).is(":checked");
            });
            if(ObjectUtil.isNullOrEmpty(agentType)) {
                this.fieldIsInvalid(uiSelector, agentTypeRequired)
            }
            else {
                this.removeErrorMessage(uiSelector);
            }
        },
        validation: function(){
            var outerScope = this;
            this.errorMessages = [];

            var syncFields = _.filter(this.validationItems.models, function(model) {
                var asyncInput = model.get("asyncInput");
                return asyncInput === null;
            });

            _.each(syncFields, function(model){
                var functionName = model.get("functionName");
                _.each(model.get("inputs").models, function (input) {
                    var el = $(input.get("el"));
                    if (!input.get("checkRequiredAttr") || el.attr("required")) {
                        var dependency = input.get("dependency");
                        if (!input.get("required")) {
                            outerScope[functionName](el[0], false);
                        } else if (!ObjectUtil.isNullOrEmpty(dependency)) {
                            outerScope[functionName](el[0], dependency);
                        } else {
                            outerScope[functionName](el[0]);
                        }
                    }
                });
            });

            var asyncField = _.find(this.validationItems.models, function(model) {
                var asyncInput = model.get("asyncInput");
                return asyncInput != null;
            });

            if (asyncField != null) {
                var functionName = asyncField.get("functionName");
                var asyncInput = asyncField.get("asyncInput");
                outerScope[functionName]($(asyncInput)[0]).done(function () {
                    outerScope.updateErrorsView(true);
                });
            }
            else {
                outerScope.updateErrorsView(true);
            }
        },
        removeErrorMessage: function(uiElement){
            this.errorMessages = _.filter(this.errorMessages, function(item){
                return item.element != uiElement;
            });
        },
        addErrorMessage: function(uiElement, messages){
            this.removeErrorMessage(uiElement);
            this.errorMessages.push({
                element: uiElement,
                messages: messages
            });
        },
        clearErrorsScreen: function(submitOnSuccess){
            this.validationErrorMessagesRegion.reset();
            this.messagesRegion.reset();
            $(this.ui.$validationErrorsSection).hide();
            this.resetErrorsDivs();
            if (submitOnSuccess) {
                this.submitForm();
            }
        },
        showErrors: function() {
            var outerScope = this;
            this.resetErrorsDivs();
            var messageCollection = new MessageCollection();
            var messagesArray = [];
            _.each(this.errorMessages,function(error) {
                outerScope.markDivAsInvalid(error.element);
                _.each(error.messages, function(message) {
                    messagesArray.push(message)
                });
            });
            messageCollection.setMessages(_.uniq(messagesArray));
            var messageListView = new NumericMessageListView({collection: messageCollection});
            this.validationErrorMessagesRegion.show(messageListView);
            $(this.ui.$validationErrorsSection).show();
        },
        agentTypeChange: function(e){
            if (e.target.value === "true"){
                $(this.ui.$contactAddress).show();
                this.contactAddressRequiredFields.attr("required", true);
            }
            else {
                $(this.ui.$contactAddress).hide();
                this.contactAddressRequiredFields.removeAttr("required");
            }

            if (this.homeAgentWasOpened) {
                this.contactAddressRequiredFields.trigger("focusout");
            }
            else {
                this.homeAgentWasOpened = true;
            }
        },
         getLabelText: function(inputSelector) {
            var inputId = inputSelector.substring(1);
            return this.$el.find("label[for="+ inputId +"]").text();
        },
        resetErrorsDivs: function() {
            var divsToReset = this.$el.find("div.input.error");
            divsToReset.removeClass("error");
        },
        markDivAsInvalid: function(element) {
            var $element = $(element);
            var elementDiv = $element.closest('div.input')[0];
            $(elementDiv).addClass("error");
        },
        fieldIsInvalid: function(uiSelector, errorMessage) {
            if(ObjectUtil.isNullOrEmpty(errorMessage)) {
                var fieldName = this.getLabelText(uiSelector);
                var requiredFieldMessage = App.dictionary.get("profile.ErrorMessages.IsARequiredField").replace("@@fieldName@@", fieldName);
                this.addErrorMessage(uiSelector, [requiredFieldMessage]);
            } else {
                this.addErrorMessage(uiSelector, [errorMessage]);
            }
        },
        updateFormLocations: function (e) {
            if (e == null){
                this.updateLocationsForSelector($(this.ui.$companyCountryId));
                this.updateLocationsForSelector($(this.ui.$contactCountryId));
            }
            else {
                this.updateLocationsForSelector($(e.target));
            }
        },
        updateLocationsForSelector: function($countryId){
            var countryId = $countryId.val();
            var countryText = $countryId.prev().val();
            var $stateIdSelector = $("#" + $countryId.data("state-selector"));
            var $stateSelector = $stateIdSelector.prev();

            var country = App.locations.getLocationItem('countries', countryText);
            if (country != null) {
                if (countryId == country.id) {
                    App.locations.getCountryStates(countryId, function (countryStates) {
                        var states = $.parseJSON(JSON.stringify(countryStates));
                        TaxonomyDomUtil.setAutocomplete(states, $stateSelector, $stateIdSelector);
                    });
                } else {
                    TaxonomyDomUtil.setAutocomplete([], $stateSelector, $stateIdSelector);
                }

                var input = $stateIdSelector.parents(".input");
                if (country.validateAgainstState){
                    $stateIdSelector.attr("required", true);
                    if (!input.hasClass("required")){
                        input.addClass("required");
                    }
                }
                else{
                    $stateIdSelector.removeAttr("required");
                    if (input.hasClass("required")){
                        input.removeClass("required");
                    }
                }
            }
        },
        initializeLocations: function () {
            var outerScope = this;
            var countries = App.locations.getAll('countries');
            var $companyCountryId = $(this.ui.$companyCountryId);
            var $contactCountryId = $(this.ui.$contactCountryId);
            var $companyCountry = $companyCountryId.prev();
            var $contactCountry = $contactCountryId.prev();

            TaxonomyDomUtil.setAutocomplete(countries, $companyCountry, $companyCountryId);
            TaxonomyDomUtil.setAutocomplete(countries, $contactCountry, $contactCountryId);

            var prepCompanyCountryName = $(this.ui.$companyCountryName).val();
            var prepCompanyStateName = $(this.ui.$companyStateName).val();
            if(this.companyInfoIsPrepopulated && !ObjectUtil.isNullOrEmpty(prepCompanyCountryName)) {
                this.setCountry(prepCompanyCountryName);

                if(!ObjectUtil.isNullOrEmpty(prepCompanyStateName)){
                    this.setState(prepCompanyStateName);
                }
            } else if(App.siteSettings.setDefaultCountry && !ObjectUtil.isNullOrEmpty(App.siteSettings.defaultCountryName)){
                this.setDefaultCountry();
            }

            $companyCountry.on("focusout", function(){
                $companyCountryId.trigger("focusout");
            });
            $contactCountry.on("focusout", function(){
                $contactCountryId.trigger("focusout");
            });
            $(this.ui.$companyStateName).on("focusout", function(){
                $(outerScope.ui.$companyStateId).trigger("focusout");
            });
            $(this.ui.$contactStateName).on("focusout", function(){
                $(outerScope.ui.$contactStateId).trigger("focusout");
            });
        },
        setDefaultCountry: function () {
            var defaultCountry = App.locations.getLocationItem('countries', App.siteSettings.defaultCountryName);
            var company =  $(this.ui.$companyCountryId);
            company.val(defaultCountry.id);
            company.prev().val(defaultCountry.name);

            var contact =  $(this.ui.$contactCountryId);
            contact.val(defaultCountry.id);
            contact.prev().val(defaultCountry.name);
            this.updateFormLocations();
        },
        clearSelectedCompanyState: function() {
            var state = $(this.ui.$companyStateId);
            state.val('');
            state.prev().val('');
        },
        clearSelectedContactState: function() {
            var state = $(this.ui.$contactStateId);
            state.val('');
            state.prev().val('');
        },
        validatePostalCode: function(input, countryIdSel) {
            var outerScope = this;

            var code = $(input).val();
            var uiSelector = "#" + input.id;
            var countryId = $(countryIdSel).val();
            if (ObjectUtil.isNullOrEmpty(code)) {
                this.fieldIsInvalid(uiSelector);
                return;
            } else if (!ObjectUtil.isNullOrEmpty(countryId)) {
                var validZipCode = true;
                switch (countryId) {
                    case CountriesIdsEnum.uk:
                        validZipCode = ValidationUtil.validateUKPostCode(code, false);
                        break;
                    case CountriesIdsEnum.us:
                        validZipCode = ValidationUtil.validateUSPostCode(code, false);
                        break;
                    case CountriesIdsEnum.ca:
                        validZipCode = ValidationUtil.validateCAPostCode(code, false);
                        break;
                    case CountriesIdsEnum.au:
                        validZipCode = ValidationUtil.validateAUPostCode(code, false);
                        break;
                    default:
                        break;
                }

                if (!validZipCode) {
                    outerScope.addErrorMessage(uiSelector, [App.dictionary.get('common.FormValidations.ZipInvalid')]);
                    return;
                }
            }
            this.removeErrorMessage(uiSelector);
        },
        validateEmailWithConfirmation: function(emailInput, confirmEmailSelector) {
            var emailSelector = "#" + emailInput.id;
            var email = $(emailSelector).val();
            var confirmedEmail = $(confirmEmailSelector).val();
            if (ObjectUtil.isNullOrEmpty(email)) {
                this.fieldIsInvalid(emailSelector);
                return;
            } else {
            	var emailErrorMessages = ValidationUtil.validateEmailConfirmEmail(email, confirmedEmail);
                if (emailErrorMessages && emailErrorMessages.length > 0) {
                    this.addErrorMessage(emailSelector, emailErrorMessages);
                    return;
                }
            }
            this.removeErrorMessage(emailSelector);
        },
        validateEmail: function(input, required) {
            this.validateTypedField(input, required, ValidationUtil.validateEmail);
        },
        validatePhoneNumber: function(input, required) {
            this.validateTypedField(input, required, ValidationUtil.validatePhoneNumber);
        },
        validateTypedField: function(input, required, callback) {
            // required by default
            if (required === undefined) {
                required = true;
            }
            var email = input.value;
            var uiSelector = "#" + input.id;
            if (ObjectUtil.isNullOrEmpty(email)) {
                if (required) {
                    this.fieldIsInvalid(uiSelector);
                    return;
                }
            } else {
                var messages = callback(email);
                if (messages && messages.length > 0) {
                    this.addErrorMessage(uiSelector, messages);
                    return;
                }
            }
            this.removeErrorMessage(uiSelector);
        },
        validateCountry: function(input) {
            var country = $(input);
            var countrySelector = "#" + input.id;
            var companyCountryId = country.val();
            var countryCompanyText = country.prev().val();
            if(ObjectUtil.isNullOrEmpty(countryCompanyText) || ObjectUtil.isNullOrEmpty(companyCountryId)) {
                this.fieldIsInvalid(countrySelector);
            }
            else {
                this.removeErrorMessage(countrySelector);
            }
        },
        validateCompanyNumber: function(input, typeSelector) {
            var companyNumberType = _.find($(typeSelector), function(checkbox) {
                return $(checkbox).is(":checked");
            });
            var companyNumber = $(input).val().trim();
            var uiSelector = "#" + input.id;

            //check all data is entered
            if(ObjectUtil.isNullOrEmpty(companyNumber) || ObjectUtil.isNullOrEmpty(companyNumberType)) {
                var companyNumberAndTypeRequired = App.dictionary.get("profile.ErrorMessages.CompanyNumberAndTypeRequired");
                this.fieldIsInvalid(uiSelector, companyNumberAndTypeRequired);
                return;
            }

            var companyNumberIsValid = true;
            var numberTypeId = $(companyNumberType).val();
            var errorMessage;

            //validate company number
            switch (numberTypeId.toUpperCase()) {
                case CompanyNumberTypesIdsEnum.ABTA:
                case CompanyNumberTypesIdsEnum.TTA:
                    if(companyNumber.length !== 5) {
                        companyNumberIsValid = false;
                        errorMessage = App.dictionary.get("profile.ErrorMessages.ABTATTACompanyNumberLengthInvalid");
                    }
                    break;
                case CompanyNumberTypesIdsEnum.ABN:
                    if(!ValidationUtil.isDigitString(companyNumber) || companyNumber.length < 9 || companyNumber.length > 12) {
                        companyNumberIsValid = false;
                        errorMessage = App.dictionary.get("profile.ErrorMessages.ABNCompanyNumberLengthInvalid");
                    }
                    break;
                case CompanyNumberTypesIdsEnum.CLIA:
                    var leadingNumbers = companyNumber.substr(0, 2);
                    if(!ValidationUtil.isDigitString(companyNumber) || companyNumber.length !== 8 || leadingNumbers !== "00") {
                        companyNumberIsValid = false;
                        errorMessage = App.dictionary.get("profile.ErrorMessages.CLIACompanyNumberLeadingCharactersInvalid");
                    }
                    break;
                case CompanyNumberTypesIdsEnum.IATA:
                    if(!ValidationUtil.isDigitString(companyNumber) || companyNumber.length !== 8) {
                        companyNumberIsValid = false;
                        errorMessage = App.dictionary.get("profile.ErrorMessages.IATACompanyNumberLengthInvalid");
                    }
                    break;
                default :
                    break;
            }
            if(!companyNumberIsValid) {
                this.fieldIsInvalid(uiSelector, errorMessage);
            }
            else {
                this.removeErrorMessage(uiSelector);
            }
        },
        setCountry: function(countryName) {
            var country = App.locations.getLocationItem('countries', countryName);
            var company =  $(this.ui.$companyCountryId);
            company.val(country.id);
            company.prev().val(country.name);
            this.updateFormLocations();
        },
        setState: function(stateName) {
            var state = App.locations.getLocationItem('states', stateName);
            var company =  $(this.ui.$companyStateId);
            company.val(state.id);
            company.prev().val(state.name);
        },
        showSuccessfulScreen: function() {
            var companyInfo = $("body").data("company");
            if (companyInfo && companyInfo.webHelpPhoneNumber) {
                var $successMessage = $(this.$el.find("#successful-register-messages .alert-content"));
                var message = $successMessage.html();
                message = message.replace("@@phoneNumber@@", companyInfo.webHelpPhoneNumber);
                $successMessage.html(message);
                $("#successful-register-messages").show();
            }
        },
        submitForm: function() {
            var companyNumberType = _.find($(this.ui.$companyNumberType), function(checkbox) {
                return $(checkbox).is(":checked");
            });

            var companyInfo = {
                Name: $(this.ui.$companyName).val(),
                Address1: $(this.ui.$companyAddress1).val(),
                Address2: $(this.ui.$companyAddress2).val(),
                City: $(this.ui.$companyCity).val(),
                StateId: $(this.ui.$companyStateId).val(),
                CountryId: $(this.ui.$companyCountryId).val(),
                CompanyNumber: $(this.ui.$companyNumber).val(),
                CompanyNumberType: $(companyNumberType).val(),
                Zip: $(this.ui.$companyPostalCode).val(),
                Phone: $(this.ui.$companyPhone).val(),
                Fax: $(this.ui.$companyFax).val()
            };

            var agentType = _.find($(this.ui.$agentType), function(checkbox) {
                return $(checkbox).is(":checked");
            });

            var contactInfo = {
                FirstName: $(this.ui.$firstName).val(),
                LastName: $(this.ui.$lastName).val(),
                Address1: $(this.ui.$contactAddress1).val(),
                Address2: $(this.ui.$contactAddress2).val(),
                City: $(this.ui.$contactCity).val(),
                StateId: $(this.ui.$contactStateId).val(),
                CountryId: $(this.ui.$contactCountryId).val(),
                Zip: $(this.ui.$contactPostalCode).val(),
                Phone: $(this.ui.$contactPhone).val(),
                Fax: $(this.ui.$contactFax).val(),
                Email: $(this.ui.$contactEmail).val(),
                IsHomeAgent: $(agentType).val() !== "false"
            };

            if (App.siteSettings.allowUsername) {
                companyInfo.Email = $(this.ui.$companyEmail).val();
                contactInfo.Username = $(this.ui.$username).val();
            }

            var outerScope = this;
            $(this.ui.$submit).attr("disabled", "disabled");
            this.showLoading([App.dictionary.get('profile.FreeFormText.RegisterForAccessLoading')]);
            SecurityService.submitRegisterForAccess(companyInfo, contactInfo)
                .done(function(response) {
                    var data = JSON.parse(response.d);
                    if(data.success === true) {
                        outerScope.showSuccessfulScreen();
                        outerScope.$el.find("footer").hide();
                        outerScope.disableSection("#new-contact-fieldset");
                        outerScope.removeAutoCompleteStyles("#new-contact-fieldset");
                        outerScope.disableSection("#new-company-fieldset");
                        outerScope.removeAutoCompleteStyles("#new-company-fieldset");
                    } else {
                        outerScope.displayErrors([data.message])
                    }
                })
                .fail(function() {
                    var message = App.dictionary.get('profile.ErrorMessages.SubmitTravelProfessionalAccountCreationFailed');
                    var companyInfo = $("body").data("company");
                    if (companyInfo && companyInfo.webHelpPhoneNumber) {
                        message = message.replace("{0}", companyInfo.webHelpPhoneNumber);
                    }
                    outerScope.displayErrors([message]);
                })
                .complete(function() {
                    $(outerScope.ui.$submit).removeAttr("disabled");
                    outerScope.messagesRegion.reset();
                })
        },
        removeAutoCompleteStyles: function(selector) {
            var block = this.$el.find(selector);
            var autoInput = block.find("input[name=ignore].state");
            autoInput.attr("style", "");
        }
    });
    return RegisterForAccess;
});