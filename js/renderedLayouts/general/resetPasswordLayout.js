define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'services/securityService',
    'util/objectUtil',
    'util/UriUtil',
    'views/general/createAccount/textMessageView',
    'renderedLayouts/general/createAccount/baseAccountLayout'
], function ($, _, Backbone, Marionette, App, EventAggregator,  SecurityService, ObjectUtil, UriUtil, MessageView, BaseAccountLayout) {
    var ResetPassword = BaseAccountLayout.extend({
        el: "#reset-password-section",
        regions:{
            messagesRegion:"#reset-password-messages"
        },
        ui: {
            '$submit': '#reset-password-btn'
        },
        initialize: function() {
            var outerScope = this;
            var forms = $("#reset-password-form");
            if (forms.length <= 0) {
                return;
            }

            var $pas = $("input[name='password']");
            var $confPas = $("input[name='confirm-password']");

            var $form = forms[0];
            $(this.ui.$submit).click( function () {
                if (!$form.reportValidity || $form.reportValidity()) {
                    outerScope.onFormSubmit($pas, $confPas);
                }
            });

            forms.submit(function (e) {
                e.preventDefault();
            });
        },
        onFormSubmit: function($pas, $confPas){
            var outerScope = this;
            var pas = $pas.val();
            var confPas = $confPas.val();

            if (this.validateForm(pas, confPas)) {
                $(this.ui.$submit).attr("disabled", "disabled");
                this.showLoading([App.dictionary.get('profile.FreeFormText.ResetPasswordLoading')]);
                SecurityService.resetPassword(pas, UriUtil.getParameterByName("rst"))
                    .done(function (response) {
                        var data = JSON.parse(response.d);
                        if (data.success === true) {
                            outerScope.displaySuccess([App.dictionary.get('profile.FreeFormText.ResetPasswordSuccess')]);
                            $(outerScope.ui.$submit).remove();

                            // open login popup in 5 seconds
                            setTimeout(function(){
                                EventAggregator.trigger("openLoginPopup");
                            }, 5000);

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
        validateForm: function(pas, confPas) {
            var requiredPassword = App.dictionary.get('profile.ErrorMessages.PasswordIsRequired');
            var requiredConfPassword = App.dictionary.get('profile.ErrorMessages.ConfirmPasswordIsRequired');
            var passwordsDontMatch = App.dictionary.get('profile.ErrorMessages.PasswordsShouldMatch');
            var passwordIsWeak = App.dictionary.get('profile.ErrorMessages.PasswordIsWeak');

            var errorMessages = [];

            if (pas == null || pas == '') {
                errorMessages.push(requiredPassword);
            }

            if (confPas == null || confPas == '') {
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
    return ResetPassword;
});