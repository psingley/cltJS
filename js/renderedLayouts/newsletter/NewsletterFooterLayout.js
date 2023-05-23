/**
 * Layout for the footer newsletter signup
 *
 * @class NewsletterFooterLayout
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
    'util/validationUtil'
], function ($, _, Backbone, Marionette, App, BaseNewsletterLayout, ErrorView, ObjectUtil, validationUtil) {
    var NewsletterFooterLayout = BaseNewsletterLayout.extend({
        el: '.newsletterFooter',
        events: {
            'submit #newsletterSignupFooterForm': 'submitForm',
            'click .newsletterPPCButton': 'submitForm',
            'focus .newsletterFooterInput': 'showConfirmEmail'
        },
        ui: {
            '$newsletterEmail': '.newsletterFooterInput',
            '$newsletterConfirmEmail': '.newsletterFooterInputConfirm',
            '$newsletterMessage': '.newsletterFooterMessageInput',
            '$newsletterFooterModal': '.newsletterFooterModal',
            '$optInCheckBox': '.optInCheckBox'
        },
        regions: {
            messagesRegion: '.messagesRegion'
        },
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
                message = this.ui.$newsletterMessage.val(),
                errorMessages = [],
                emailAlreadyExists = App.dictionary.get('common.FormValidations.EmailAlreadyExists'),
                viewContext = this;

            //verify the message field is not filled out, this is a hidden field that only bots will see
            if (message != null && message != '') {
                return false;
            }

            var emailErrorMessages = validationUtil.validateEmailConfirmEmail(emailEntered, confirmedEmailEntered);
            errorMessages = errorMessages.concat(emailErrorMessages);

						if (errorMessages.length > 0) {
							this.finalizeTransaction(errorMessages, emailEntered);
						}
						else {
							this.checkEmailExists(emailEntered)
								.done(function(response) {
									var emailExists = (response.d.toLowerCase() === 'true');
									if (emailExists) {
										errorMessages.push(emailAlreadyExists);
									}

									viewContext.finalizeTransaction(errorMessages, emailEntered);
								});
						}
        },
        finalizeTransaction: function (errorMessages, emailEntered) {
            if (errorMessages.length === 0) {
                var viewContext = this,
                    optIn = false,
                    emailOptInValidation = App.dictionary.get('common.FormValidations.OptInNotCheckedEmail');

                //close the error view
                this.messagesRegion.close();

                this.ui.$newsletterFooterModal
                    .dialog({
                        modal: true,
                        title: "Opt In",
                        draggable: false,
                        resizable: false,
                        dialogClass: 'fixed-dialog',
                        buttons: {
                            "Accept": function () {
                                optIn = viewContext.ui.$optInCheckBox.is(':checked');
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

                                if (optIn) {
                                    viewContext.logNewsletterTransaction();
                                    viewContext.subscribeEmailAddress(emailEntered, optIn);
                                } else {
                                    errorMessages.push(emailOptInValidation);

                                    var errorView = new ErrorView(errorMessages);
                                    viewContext.messagesRegion.show(errorView);
                                }
                            }
                        },
                        width: 450,
                        height: 250
                    });
            } else {
                var errorView = new ErrorView(errorMessages);
                this.messagesRegion.show(errorView);
            }
        }
    });
    return NewsletterFooterLayout;
});