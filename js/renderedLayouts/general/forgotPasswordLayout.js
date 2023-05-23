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
    'renderedLayouts/general/createAccount/baseAccountLayout'
], function ($, _, Backbone, Marionette, App, EventAggregator,  SecurityService, ObjectUtil, MessageView, BaseAccountLayout) {
    var ForgotPassword = BaseAccountLayout.extend({
        el: "#forgot-password-section",
        regions:{
            messagesRegion:"#forgot-password-messages"
        },
        ui: {
            '$submit': '#forgot-password-btn'
        },
        initialize: function() {
            var outerScope = this;
            var forms = $("#forgot-password-form");
            if (forms.length <= 0) {
                return;
            }

            var $login = $("input[name='username']");

            var $form = forms[0];
            $(this.ui.$submit).click( function () {
                if (!$form.reportValidity || $form.reportValidity()) {
                    outerScope.onFormSubmit($login);
                }
            });

            forms.submit(function (e) {
                e.preventDefault();
            });
        },
        onFormSubmit: function($login){
            var outerScope = this;
            var login = $login.val();

            if (this.validateForm(login)) {
                $(this.ui.$submit).attr("disabled", "disabled");
                this.showLoading([App.dictionary.get('profile.FreeFormText.ForgotPasswordLoading')]);
                SecurityService.forgotPassword(login)
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (data.success === true) {
                            var message = App.dictionary.get('profile.FreeFormText.EmailSent').replace("@@Email@@", data.message);
                            outerScope.displaySuccess([message]);

                            $(outerScope.ui.$submit).remove();
                        } else {
                            outerScope.displayErrors([data.message]);
                            $(outerScope.ui.$submit).removeAttr("disabled")
                        }
                    })
                    .fail(function () {
                        var errorText = App.dictionary.get('profile.ErrorMessages.PasswordResetFailed');
                        var companyInfo = $("body").data("company");
                        if (companyInfo && companyInfo.webHelpPhoneNumber) {
                            errorText = errorText.replace("{0}", companyInfo.webHelpPhoneNumber)
                        }
                        outerScope.displayErrors([errorText]);
                        $(outerScope.ui.$submit).removeAttr("disabled");
                    });
            }
        },
        validateForm: function(login) {
            var requiredLogin = App.dictionary.get('common.FormValidations.Username');

            //postal code filled out
            if (login == null || login == '') {
                this.displayErrors([requiredLogin]);
                return false;
            }
            return true
        }
    });
    return ForgotPassword;
});