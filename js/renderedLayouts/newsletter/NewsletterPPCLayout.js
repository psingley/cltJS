/**
 * Created by ssinno on 5/30/2014.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/newsletter/BaseNewsletterLayout',
    'views/validation/ErrorView',
    'util/objectUtil',
    'util/validationUtil',
    'util/newsletterUtil',
	'services/subscriptionService'
], function ($, _, Backbone, Marionette, App, BaseNewsletterLayout, ErrorView, ObjectUtil, validationUtil, NewsletterUtil, subscriptionService) {
    var NewsletterPPCLayout = BaseNewsletterLayout.extend({
        el: '#newsletterSignupPPCForm',
        events: {
            'click #btnNewsletterSubscribe': 'submitForm',
            'focus #newsletterEmail': 'showConfirmEmail'
        },
        ui: {
            '$newsletterEmail': '.newsletterPPCInput',
            '$newsletterConfirmEmail': '.newsletterPPCInputConfirm',
            '$newsletterMessage': '#newsletterPPCMessageInput',
            '$newsletterPPCModal' : '.newsletterPPCModal',
            '$optInCheckBox': '.optIn',
            '$newsletterFirstName': '#firstname',
            '$newsletterLastName': '#lastname',
            '$newsletterSignupComplete': '.newsletterSignupComplete'
        },
        regions: {
            'messagesRegion' : '.messagesRegion'
        },
        isPrimaryChecked: false,
        showConfirmEmail: function () {
            this.ui.$newsletterConfirmEmail.show();
        },
        initialize: function () {
            validationUtil.preventCopyPaste(this.ui.$newsletterConfirmEmail);
        },
        submitForm: function (e) {
            e.preventDefault();

            var emailEntered = this.ui.$newsletterEmail.val(),
                confirmedEmailEntered = this.ui.$newsletterConfirmEmail.val(),
                firstNameEntered = this.ui.$newsletterFirstName.val(),
                lastNameEntered = this.ui.$newsletterLastName.val(),
                message = this.ui.$newsletterMessage.val(),
                errorMessages = [],
                emailAlreadyExists = App.dictionary.get('common.FormValidations.EmailAlreadyExists'),
                requiredFirstname = App.dictionary.get('common.FormValidations.FirstName'),
                requiredLastname = App.dictionary.get('common.FormValidations.LastName'),
                viewContext = this;

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

            if (errorMessages.length > 0) {
                this.finalizeTransaction(errorMessages, firstNameEntered, lastNameEntered, emailEntered);
            } else {
                var newsletterCodes = this.getCheckedOptionsCodes(this.$el.find('.optIn'));

            	subscriptionService.ifUserSubscribed(emailEntered, newsletterCodes)
                    .done(function(response) {
                        var emailExists = (response.d.toLowerCase() === 'true');
                        if (emailExists) {
                            errorMessages.push(emailAlreadyExists);
                        }

                        viewContext.finalizeTransaction(errorMessages, firstNameEntered, lastNameEntered, emailEntered);
                    });
            }
        },
        finalizeTransaction: function (errorMessages, firstNameEntered, lastNameEntered, emailEntered) {
            if (errorMessages.length === 0) {
                var viewContext = this;

                this.messagesRegion.close();

                this.ui.$newsletterPPCModal
                    .dialog({
                        modal: true,
                        title: "Opt In",
                        draggable: false,
                        resizable: false,
                        dialogClass: 'fixed-dialog',
                        buttons: {
                            "Accept": function () {
                                $(this).dialog("close");

                                try {
                                    var $page = $(location).attr('pathname');

                                    dataLayer.push({
                                        'event': 'gaEvent',
                                        'eventCategory': 'Newsletter',
                                        'eventAction': 'Email',
                                        'eventLabel': 'Receive Newsletter Footer Link - ' + $page
                                    });
                                } catch (ex) {
                                    console.log(ex);
                                }
                                var checkedOptions = NewsletterUtil.getCheckedOptions($(this).find('.optIn'));
                                var newsletterCodes = viewContext.getCheckedOptionsCodes(checkedOptions);

                                viewContext.logNewsletterTransaction();
                                viewContext.subscribeEmailAddress(firstNameEntered, lastNameEntered, emailEntered, newsletterCodes, viewContext.isPrimaryChecked);
                            }
                        },
                        width: 450,
                        height: 250
                    });
            } else {
                var errorView = new ErrorView(errorMessages);
                this.messagesRegion.show(errorView);
            }
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

            return codes && codes.length > 0 ? codes : "";
        }
    });
    return NewsletterPPCLayout;
});