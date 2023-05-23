define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'services/securityService',
    'util/objectUtil',
    'util/validationUtil',
    'views/general/createAccount/textMessageView',
    'renderedLayouts/general/createAccount/baseAccountLayout'
], function ($, _, Backbone, Marionette, App,  EventAggregator, SecurityService, ObjectUtil, ValidationUtil, MessageView, BaseAccountLayout) {
    var CreatePassword = BaseAccountLayout.extend({
        el: "#tp-create-password-section",
        regions:{
            messagesRegion:"#tp-create-password-messages"
        },
        ui: {
            '$back': '#tp-create-password-back-btn',
            '$submit': '#tp-create-password-btn',
            '$login' : "#tp-login"
        },
        show: function(){
            this.$el.show();

            if (App.siteSettings.allowUsername){
                if (App.createAccount && App.createAccount.company
                    && !ObjectUtil.isNullOrEmpty(App.createAccount.company.email)){
                    var item = this.$el.find(".help-block");
                    item.html(item.text().replace("@@CompanyEmail@@", "<strong>" + App.createAccount.company.email + "</strong>"));
                }
            }
            else {
                var $email = $(this.ui.$login);
                if (App.createAccount && App.createAccount.contact
                    && !App.createAccount.contact.accountExists
                    && !ObjectUtil.isNullOrEmpty(App.createAccount.contact.email)) {
                    $email.val(App.createAccount.contact.email)
                }
            }
        },
        initialize: function() {
            var outerScope = this;
            var forms = $("#tp-create-password-form");
            if (forms.length <= 0) {
                return;
            }

            var $login = $(this.ui.$login);
            var $pas = $("#tp-password");
            var $confPas = $("#tp-pas-confirm");

            var $form = forms[0];
            $(this.ui.$submit).click( function () {
                if (!$form.reportValidity || $form.reportValidity()) {
                    outerScope.onFormSubmit($login, $pas, $confPas);
                }
            });

            if (App.siteSettings.allowUsername) {
                forms.on("focusout", this.ui.$login, function () {
                    outerScope.validateUsername();
                });
            }

            forms.submit(function (e) {
                e.preventDefault();
            });

            $(this.ui.$back).click(function () {
                outerScope.messagesRegion.reset();
                $login.val('');
                $pas.val('');
                $confPas.val('');
                outerScope.$el.hide();

                EventAggregator.trigger("backToContactSearch");
            });
        },
        onFormSubmit: function($login, $pas, $confPas){
            var outerScope = this;

            var login = $login.val();
            var password = $pas.val();
            var confirmPassword = $confPas.val();

            if (this.validateForm(login, password, confirmPassword)) {
                $(this.ui.$submit).attr("disabled", "disabled");
                $(this.ui.$back).attr("disabled", "disabled");
                this.showLoading([App.dictionary.get('profile.FreeFormText.CreateUserLoading')]);
                SecurityService.createAccount(login,password)
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (data.success === true) {
                            outerScope.displaySuccess([App.dictionary.get('profile.FreeFormText.CreateAccountSuccess')]);
                            outerScope.$el.find("footer").remove();

                            // open login popup in 5 seconds
                            setTimeout(function(){
                                $('body, html').animate({
                                    'scrollTop': 0
                                });
                                EventAggregator.trigger("openLoginPopup");
                            }, 5000);

                        } else {
                            outerScope.displayErrors([data.message]);
                            $(outerScope.ui.$submit).removeAttr("disabled");
                            $(outerScope.ui.$back).removeAttr("disabled");
                        }
                    })
                    .fail(function () {
                        var errorText = App.dictionary.get('profile.ErrorMessages.CreateAccountFailed');
                        var companyInfo = $("body").data("company");
                        if (companyInfo && companyInfo.callCenterPhoneNumber) {
                            errorText = errorText.replace("{0}", companyInfo.callCenterPhoneNumber)
                        }
                        outerScope.displayErrors([errorText]);
                        $(outerScope.ui.$submit).removeAttr("disabled");
                        $(outerScope.ui.$back).removeAttr("disabled");
                    })
            }
        },
        validateUsername: function(){
            var outerScope = this;
            var login = $(this.ui.$login).val();
            var requiredUsername = App.dictionary.get('profile.ErrorMessages.UsernameIsRequired');

            if (ObjectUtil.isNullOrEmpty(login)) {
                this.displayErrors([requiredUsername]);
            }
            else {
                ValidationUtil.validateUsername(login).done(function (message) {
                    if (ObjectUtil.isNullOrEmpty(message)){
                        outerScope.messagesRegion.reset();
                    }
                    else {
                        outerScope.displayErrors([message]);
                    }
                });
            }
        },
        validateForm: function(login, pas, confPas) {
            var errorMessages = [];

            //validation messages
            var requiredEmail = App.dictionary.get('common.FormValidations.Email-Required');
            var requiredInvalidEmail = App.dictionary.get('common.FormValidations.Email-IsValid');
            var requiredUsername = App.dictionary.get('profile.ErrorMessages.UsernameIsRequired');
            var requiredPassword = App.dictionary.get('profile.ErrorMessages.PasswordIsRequired');
            var requiredConfPassword = App.dictionary.get('profile.ErrorMessages.ConfirmPasswordIsRequired');
            var passwordsDontMatch = App.dictionary.get('profile.ErrorMessages.PasswordsShouldMatch');
            var passwordIsWeak = App.dictionary.get('profile.ErrorMessages.PasswordIsWeak');

            //verify the username has been entered
            if (App.siteSettings.allowUsername) {
                if (ObjectUtil.isNullOrEmpty(login)) {
                    errorMessages.push(requiredUsername);
                }
            }
            else {
                if (ObjectUtil.isNullOrEmpty(login)){
                    errorMessages.push(requiredEmail);
                }
                else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(login)) {
                    ///verify email is a valid email address
                    errorMessages.push(requiredInvalidEmail);
                }
            }

            if (ObjectUtil.isNullOrEmpty(pas)) {
                errorMessages.push(requiredPassword);
            }

            if (ObjectUtil.isNullOrEmpty(confPas)) {
                errorMessages.push(requiredConfPassword);
            }

            if (pas != confPas) {
                errorMessages.push(passwordsDontMatch);
            }

            if (!/^(?=.*[A-Z])(?=.*\d)(?!.*\s).{6,}$/.test(pas)){
                errorMessages.push(passwordIsWeak);
            }

            if (errorMessages.length > 0) {
                this.displayErrors(errorMessages);
                return false;
            }

            return true
        }
    });
    return CreatePassword;
});