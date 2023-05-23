define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'extensions/marionette/views/RenderedLayout',
    'services/needMoreInfoService',
    'util/validationUtil'
], function ($, _, Backbone, Marionette, App, RenderedLayout, NeedMoreInfoService, validationUtil) {
    var NeedMoreInfoLayout = RenderedLayout.extend({
        el: '.need-more-info-form',
        events: {
            'click #needMoreInfoButton1': 'submitForm'
        },
        ui: {
            '$needMoreInfoButton': '#needMoreInfoButton',
            '$firstName': '#firstnameNeedMore',
            '$lastName': '#lastnameNeedMore',
            '$email': '#emailNeedMore',
            '$confirmEmail': '#confirm-email-needMore',
            '$phone': '#phoneNeedMore',
            '$contactByEmail':'.contactByEmail',
            '$contactByPhone':'.contactByPhone',
            '$optInEmail':'.optInEmail',
            '$iAmAgent':'.optInAgentCheckbox'
        },
        initialize: function () {
            var outerScope = this;

            validationUtil.preventCopyPaste(this.ui.$confirmEmail);

            require(['jquery_validate'], function () {
                // Initialize form validation on the need more info form.
                // It has the name attribute "need-more-info-form"
                $("form[name='need-more-info-form']").validate({
                    // Specify validation rules
                    rules: {
                        // The key name on the left side is the name attribute
                        // of an input field. Validation rules are defined
                        // on the right side
                        firstname: {
                            required: true,
                            onlyTextAllowed: true
                        },
                        lastname: {
                            required: true,
                            onlyTextAllowed: true
                        },
                        email: {
                            required: true,
                            email: true
                        },
                        confirm_email: {
                            required: true,
                            email: true,
                            equalTo:"#emailNeedMore"
                        },
                        contactBy: {
                            required: true
                        },
                        phone: {
                            phoneNumberValidation: true
                        }
                    },
                    // Specify validation error messages
                    messages: {
                        firstname: {
                            required: "Please complete this required field.",
                            onlyTextAllowed: "Please enter valid text"
                        },
                        lastname: "Please complete this required field.",
                        email: {
                            required: "Please complete this required field.",
                            email: "Email must be formatted correctly."
                        },
                        confirm_email: {
                            required: "Please complete this required field.",
                            email: "Email must be formatted correctly.",
                            equalTo: "Email addresses must match."
                        },
                        contactBy: {
                            required:"Please select at least one option."
                        },
                        phone: {
                            phoneNumberValidation: "Please enter valid phone number"
                        }
                    },
                    highlight: function (element, errorClass, validClass) {
                        var options = $(element).parents('.contact-by');
                        if (options.length) {
                            options.addClass('options-error').removeClass('valid');
                        } else {
                            $(element).addClass('error').removeClass('valid2');
                        }
                    },
                    unhighlight: function (element, errorClass, validClass) {
                        var options = $(element).parents('.contact-by');
                        if (options.length) {
                            options.addClass('valid').removeClass('options-error');
                        } else {
                            $(element).addClass('valid2').removeClass('error');
                        }
                    },
                    submitHandler: function (form) {
                        outerScope.submitForm();
                    }
                });

                $.validator.addMethod("onlyTextAllowed", function (value, element) {
                    return this.optional(element) || /^[A-z/-]+$/.test(value);
                }, "Please enter valid text");

                $.validator.addMethod("phoneNumberValidation", function (value, element) {
                    return this.optional(element) || /^[-0-9.+()\s]*$/.test(value);
                }, "Please enter valid phone number");

            });
        },
        getShowHideCallMessage: function (tourDatesCollection) {
            var last = tourDatesCollection.length - 1;
            var lasttourdate = tourDatesCollection.models[last].attributes.endDate;
            var element = document.getElementById('callForMoreDates');
            //if last tour date occurs before  May 1, 2023 - show the call message - else hide the call message
            moment(lasttourdate).isBefore(moment('2023-05-01')) ? element.style.display = "block" : element.style.display = "none";
        },
        submitForm: function () {
            var currentItemId = App.siteSettings.currentItemId;
            var pageTitle = $('h1 .large').html() + ' ' + $('h1 .small').html();

            var formObject = new Object();
            formObject.firstName = this.ui.$firstName.val();
            formObject.lastname = this.ui.$lastName.val();
            formObject.email = this.ui.$email.val();
            formObject.phone = this.ui.$phone.val();
            formObject.contactByEmail = this.ui.$contactByEmail.is(':checked');
            formObject.contactByPhone = this.ui.$contactByPhone.is(':checked');
            formObject.optInEmail = this.ui.$optInEmail.is(':checked');
            formObject.iAmAgent = this.ui.$iAmAgent.is(':checked');
            formObject.tourTitle = pageTitle

            var paramsObj = { 'needMoreInfoObject': JSON.stringify(formObject), 'currentItemId': currentItemId };
            var params = JSON.stringify(paramsObj);
            NeedMoreInfoService.needMoreInfoSignup(params).done(function (response) {
                $("#need-more-info-form-signup").replaceWith("<p><em>Thanks for submitting the form. A Collette agent will reach out to via your preferred method shortly.</em></p>");
            });

        }

    });
    return NeedMoreInfoLayout;
});