define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'services/securityService',
    'util/objectUtil',
    'views/general/createAccount/textMessageView',
    'renderedLayouts/general/createAccount/contactSearchLayout',
    'renderedLayouts/general/createAccount/baseAccountLayout'
], function ($, _, Backbone, Marionette, App, EventAggregator,  SecurityService, ObjectUtil, MessageView, ContactSearchLayout, BaseAccountLayout) {
    var CompanySearch = BaseAccountLayout.extend({
        el: "#tp-company-search-section",
        regions:{
            messagesRegion:"#tp-company-search-messages"
        },
        ui: {
            '$submit': '#tp-company-lookup-btn',
            '$nextStep': '#tp-company-confirm-btn'
        },
        initialize: function() {
            var outerScope = this;
            var contactSearchLayout = new ContactSearchLayout();

            var forms = $("#tp-company-search-form");
            if (forms.length <= 0) {
                return;
            }

            var $number = $("#member-number");
            var $zip = $("#postal-code");
            var $types = $("input[name='member-number-type']");

            var $form = forms[0];
            $(this.ui.$submit).click( function () {
                if (!$form.reportValidity || $form.reportValidity()) {
                    outerScope.onFormSubmit($number, $zip, $types);
                }
            });

            forms.submit(function (e) {
                e.preventDefault();
            });

            $(this.ui.$nextStep).click(function(){
                contactSearchLayout.show();
                outerScope.$el.find("footer").hide();
                outerScope.disableSection();
            });

            EventAggregator.on("backToCompanySearch", function(){
                outerScope.enableSection();
                outerScope.$el.find("footer").show();
                $('html, body').animate({
                    'scrollTop': outerScope.$el.offset().top
                });
            });
        },
        onFormSubmit: function($number, $zip, $types){
            var outerScope = this;
            var successDescription = $("#tp-company-search-success-info");
            successDescription.hide();
            outerScope.hideNextStepButtons();

            var number = $number.val();
            var zip = $zip.val();
            var type;
            var chosenType = $types.filter(":checked");
            if (chosenType.length == 1) {
                type = chosenType.val();
            }

            if (this.validateForm(type, number, zip)) {
                $(this.ui.$submit).attr("disabled", "disabled");
                this.showLoading([App.dictionary.get('profile.FreeFormText.CompanySearchLoading')]);
                SecurityService.companySearch(number, type, zip)
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (data.success === true) {
                            if (App.siteSettings.allowUsername && ObjectUtil.isNullOrEmpty(data.email)){
                                outerScope.showCompanyEmailError(data.companyName);
                            }
                            else {
                                outerScope.displaySuccess([outerScope.getCompanyNameText(data.companyName)]);
                                successDescription.show();
                                outerScope.showNextStepButtons();
                                App.createAccount = {
                                    company: {
                                        name: data.companyName,
                                        id: data.companyId,
                                        zip: data.zipCode,
                                        type: type,
                                        companyNumber: number,
                                        email: data.email
                                    }
                                };
                            }
                        } else {
                            outerScope.showNoCompanyError();
                        }
                    })
                    .fail(function () {
                        outerScope.showNoCompanyError();
                    })
                    .complete(function () {
                        $(outerScope.ui.$submit).removeAttr("disabled");
                    });
            }
        },
        getCompanyNameText: function(companyName){
            return "<strong>" + App.dictionary.get('profile.FreeFormText.CompanyName') + "</strong> " + companyName;
        },
        showNoCompanyError: function(){
            var errorText = App.dictionary.get('profile.ErrorMessages.NoCompany');
            var companyInfo = $("body").data("company");
            if (companyInfo && companyInfo.webHelpPhoneNumber) {
                errorText = errorText.replace("{0}", companyInfo.webHelpPhoneNumber)
            }
            this.displayErrors([errorText]);
        },
        showCompanyEmailError: function(companyName){
            var message = this.getCompanyNameText(companyName) + "<br><br>";
            var errorText = App.dictionary.get('profile.ErrorMessages.CompanyNeedsEmail');
            var companyInfo = $("body").data("company");
            if (companyInfo && companyInfo.webHelpPhoneNumber) {
                errorText = errorText.replace("{0}", companyInfo.webHelpPhoneNumber)
            }
            this.displayErrors([message + errorText]);
        },
        validateForm: function(type, number, zip) {
            var requiredType = App.dictionary.get('profile.ErrorMessages.MemberNumberTypeRequired');
            var requiredNumber = App.dictionary.get('profile.ErrorMessages.MemberNumberRequired');
            var requiredZip = App.dictionary.get('profile.ErrorMessages.PostalCodeRequired');

            var errorMessages = [];

            //postal code filled out
            if (type == null || type == '') {
                errorMessages.push(requiredType);
            }

            //username filled out
            if (number == null || number == '') {
                errorMessages.push(requiredNumber);
            }

            //postal code filled out
            if (zip == null || zip == '' || zip.length < 4) {
                errorMessages.push(requiredZip);
            }

            if (errorMessages.length > 0) {
                this.displayErrors(errorMessages);
                return false;
            }
            return true
        },
        showNextStepButtons: function(){
            $(this.ui.$nextStep).show();
            var searchButton = $(this.ui.$submit);
            searchButton.find(".text-default").hide();
            searchButton.find(".text-updated").show();
            searchButton.find(".fa-arrow-right").hide();
        },
        hideNextStepButtons: function(){
            $(this.ui.$nextStep).hide();
            var searchButton = $(this.ui.$submit);
            searchButton.find(".text-default").show();
            searchButton.find(".text-updated").hide();
            searchButton.find(".fa-arrow-right").show();
        }
    });
    return CompanySearch;
});