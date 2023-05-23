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
    'views/general/createAccount/newAccountMessageView',
    'collections/general/createAccount/contactCollection',
    'views/general/createAccount/contactsTableView',
    'renderedLayouts/general/createAccount/createPasswordLayout',
    'renderedLayouts/general/createAccount/baseAccountLayout'
], function ($, _, Backbone, Marionette, App,  EventAggregator, SecurityService, ObjectUtil, MessageView, NewAccountMessageView, ContactCollection, ContactsTableView, CreatePasswordLayout, BaseAccountLayout) {
    var ContactSearch = BaseAccountLayout.extend({
        el: "#tp-contact-search-section",
        regions:{
            messagesRegion:"#tp-contact-search-messages",
            successListRegion: "#tp-contact-search-success-list"
        },
        ui: {
            '$back': '#tp-name-back-btn',
            '$submit': '#tp-name-lookup-btn',
            '$select': '#tp-name-select-btn',
            '$confirm': '#tp-name-confirm-btn',
            '$successDescription': '#tp-contact-search-success-info'
        },
        show: function(){
            this.$el.show();
        },
        searchAgainButtonIsActive: false,
        initialize: function() {
            var createPasswordLayout = new CreatePasswordLayout();
            this.ui.interchangeableButtons = [this.ui.$submit, this.ui.$select, this.ui.$confirm];

            var outerScope = this;
            var forms = $("#tp-contact-search-form");
            if (forms.length <= 0) {
                return;
            }

            var $lastName = $("#last-name");

            var $form = forms[0];
            $(this.ui.$submit).click( function () {
                if (!$form.reportValidity || $form.reportValidity()) {
                    outerScope.onFormSubmit($lastName);
                }
            });

            forms.submit(function (e) {
                e.preventDefault();
            });

            $(this.ui.$confirm).click(function(){
                if (App.createAccount != undefined && App.createAccount.contact != undefined) {
                    if(App.createAccount.contact.accountExists) {
                        outerScope.verifyExistingContact();
                    } else {
                        createPasswordLayout.show();
                        outerScope.disableSection();
                        outerScope.messagesRegion.$el.hide();
                    }

                    outerScope.hideBlocksOnNameConfirm();
                    outerScope.scrollToSection();

                    outerScope.$el.find("footer").hide();
                }
            });

            $(this.ui.$back).click(function () {
                outerScope.messagesRegion.reset();
                outerScope.successListRegion.reset();
                $(outerScope.ui.$successDescription).hide();
                outerScope.hideSearchAgainButton();
                outerScope.scrollToSection();
                $lastName.val('');

                outerScope.$el.hide();

                EventAggregator.trigger("backToCompanySearch");
                outerScope.showButton(outerScope.ui.$submit);
            });

            EventAggregator.on("backToContactSearch", function(){
                outerScope.showBlocksOnBackBtnClick();
                outerScope.$el.find("footer").show();
                outerScope.enableSection();
                outerScope.scrollToSection();
            });
        },
        onFormSubmit: function($lastName){
            var outerScope = this;
            var successDescription = $(outerScope.ui.$successDescription);
            successDescription.hide();
            outerScope.successListRegion.reset();

            var lastName = $lastName.val();

            if (this.validateForm(lastName)) {
                $(this.ui.$submit).attr("disabled", "disabled");
                $(this.ui.$back).attr("disabled", "disabled");
                this.showLoading([App.dictionary.get('profile.FreeFormText.ContactSearchLoading')]);
                SecurityService.contactSearch(lastName)
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (data.success === true) {
                            outerScope.contacts = new ContactCollection(data.contacts);
                            successDescription.show();
                            outerScope.showSuccess(outerScope.contacts);
                        } else {
                            outerScope.displayNoContactError();
                        }
                    })
                    .fail(function () {
                        outerScope.displayNoContactError();
                    })
                    .complete(function () {
                        if(outerScope.searchAgainButtonIsActive) {
                            outerScope.scrollToSection();
                        }

                        $(outerScope.ui.$submit).removeAttr("disabled");
                        $(outerScope.ui.$back).removeAttr("disabled");
                    });
            }
        },
        validateForm: function(lastName) {
            var requiredLastName = App.dictionary.get('common.FormValidations.LastName');

            //last name filled out
            if (lastName == null || lastName == '') {
                this.displayErrors([requiredLastName]);
                return false;
            }
            return true
        },
        showSuccess: function(contacts){
            var outerScope = this;
            outerScope.showButton(this.ui.$select);
            outerScope.showSearchAgainButton();

            var resultsTable = new ContactsTableView({collection:contacts});
            this.successListRegion.show(resultsTable);

            $("#tp-names-list tr").click(function(e){
                if (!$(e.target).is("input[name='tp-name']")) {
                    var checkbox = $(this).find("input[name='tp-name']");
                    if (checkbox.length > 0 && !checkbox[0].checked) {
                        checkbox[0].checked = true;
                        checkbox.trigger("change");
                    }
                }
            });

            $("#tp-names-list input[name='tp-name']").change(function(){
                var value = $(this).val();
                if (!ObjectUtil.isNullOrEmpty(value) &&
                    outerScope.contacts != undefined && outerScope.contacts.models.length > 0){
                    var contact = _.find(outerScope.contacts.models, function(item){
                        return item.get("id") == value;
                    });
                    App.createAccount.contact = {
                        id: value,
                        email: contact.get("email"),
                        accountExists: contact.get("accountExists")
                    };
                   outerScope.showButton(outerScope.ui.$confirm);
                   outerScope.showSearchAgainButton();
                }
            });

            var successView = new NewAccountMessageView({type: "info", messages: [App.dictionary.get('profile.FreeFormText.NameNotFound')]});
            this.messagesRegion.show(successView);
        },
        showButton: function(button){
            _.each (this.ui.interchangeableButtons, function(button){
                $(button).hide();
            });
            $(button).show();
        },
        displayNoContactError: function(){
            var text = App.dictionary.get('profile.ErrorMessages.NoContact');
            var buttonText = App.dictionary.get('profile.Buttons.CreateNewAccount');
            text = text.replace("@@CreateAccount@@", buttonText);
            text = text.replace("@@CompanyName@@", App.createAccount.company.name);

            var errorView = new NewAccountMessageView({type: "error", messages: [text]});
            this.messagesRegion.show(errorView);
        },
        hideBlocksOnNameConfirm: function() {
            var contactResults = $(this.successListRegion.el).find('tbody tr');
            var resultsToHide = $(contactResults).has("input[name='tp-name']:not(:checked)");
            resultsToHide.hide();

            $(this.ui.$successDescription).hide();
        },
        showBlocksOnBackBtnClick: function() {
            var contactResults = $(this.successListRegion.el).find('tbody tr');
            contactResults.show();

            $(this.ui.$successDescription).show();
            this.messagesRegion.$el.show();
        },
        showSearchAgainButton: function() {
            var searchButton = $(this.ui.$submit);
            searchButton.find(".text-default").hide();
            searchButton.find(".text-updated").show();
            searchButton.find(".fa-arrow-right").hide();
            this.searchAgainButtonIsActive = true;

            searchButton.show();
        },
        hideSearchAgainButton: function() {
            var searchButton = $(this.ui.$submit);
            searchButton.find(".text-default").show();
            searchButton.find(".text-updated").hide();
            searchButton.find(".fa-arrow-right").show();

            this.searchAgainButtonIsActive = false;
        },
        scrollToSection: function() {
            var outerScope = this;
            var header = $("nav.header-navbar.sticky.affix");
            var headerHeight = header ? header.height() : 0;

            $('body, html').animate({
                'scrollTop': outerScope.$el.offset().top - headerHeight
            });
        },
        verifyExistingContact: function() {
            var outerScope = this;
            this.showLoading([App.dictionary.get('profile.FreeFormText.VerifyAccountLoading')]);

            SecurityService.verifyTravelProfessionalAccount()
                .done(function (response) {
                    var data = JSON.parse(response.d);
                    if (data.success === true) {
                        var message = App.dictionary.get('profile.FreeFormText.UserIsAlreadyRegistered');
                        message = message.replace("@@userEmail@@", data.message);
                        message = message.replace("@@forgotPasswordLink@@", App.siteSettings.forgotPasswordUrl);
                        var companyInfo = $("body").data("company");
                        if (companyInfo && companyInfo.webHelpPhoneNumber) {
                            message = message.replace("@@phone@@", companyInfo.webHelpPhoneNumber);
                        }

                        var successView = new MessageView({type: "success", messages: [message]});
                        outerScope.messagesRegion.show(successView);

                        // open login popup in 5 seconds
                        setTimeout(function(){
                            $('body, html').animate({
                                'scrollTop': 0
                            });
                            EventAggregator.trigger("openLoginPopup");
                            outerScope.disableSection();
                        }, 5000);
                    } else {
                        outerScope.displayAccountVerificationFailed(data.message);
                    }
                })
                .fail(function() {
                    var message = App.dictionary.get('profile.ErrorMessages.TravelAccountVerificationFailed');
                    var companyInfo = $("body").data("company");
                    if (companyInfo && companyInfo.webHelpPhoneNumber) {
                        message = message.replace("{0}", companyInfo.webHelpPhoneNumber);
                    }
                    outerScope.displayErrors([message]);
                })
        },
        displayAccountVerificationFailed: function(text) {
            var buttonText = App.dictionary.get('profile.Buttons.CreateNewAccount');
            text = text.replace("@@CreateAccount@@", buttonText);

            var errorView = new NewAccountMessageView({type: "error", messages: [text]});
            this.messagesRegion.show(errorView);
        }
    });
    return ContactSearch;
});