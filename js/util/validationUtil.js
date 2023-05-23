define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'util/objectUtil',
    'services/securityService'
], function ($, _, Backbone, App, ObjectUtil, SecurityService) {
    var validationUtil = {
        hasWhiteSpace : function (s) {
            return /\s/g.test(s);
        },
        validateEmailConfirmEmail: function (email, confirmEmail) {
            //validation messages
            var requiredEmailsMatch = App.dictionary.get('common.FormValidations.Email-Match');
            var requiredConfirmEmail = App.dictionary.get('common.FormValidations.Email-ConfirmRequired');

            var errorMessages = this.validateEmail(email);
            if (errorMessages.length === 0) {
                if (confirmEmail === null || confirmEmail === '') {
                    //is the confirm email filled out?
                    errorMessages.push(requiredConfirmEmail);
                    return errorMessages;
                } else if (confirmEmail !== email) {
                    //does the confirm email match the email field?
                    errorMessages.push(requiredEmailsMatch);
                    return errorMessages;
                }
            }
            console.log(errorMessages);
            return errorMessages;
        },
        validateEmail: function (email) {
            var errorMessages = [];
            //validation messages
            var requiredEmail = App.dictionary.get('common.FormValidations.Email-Required');
            var requiredInvalidEmail = App.dictionary.get('common.FormValidations.Email-IsValid');

            //verify the email has been entered
            if (email === null || email === '' || this.hasWhiteSpace(email)) {
                errorMessages.push(requiredEmail);
                return errorMessages;
            }

            if (!/^(?:[a-z0-9])(?:[a-z0-9\.!#$%*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i.test(email)) {
                ///verify email is a valid email address
                errorMessages.push(requiredInvalidEmail);
                return errorMessages;
            }

            return errorMessages;
        },
        validateUSPostCode: function (postCode, allowPartialZipcode) {
            if (ObjectUtil.isNullOrEmpty(postCode)) {
                return false;
            }

            if (allowPartialZipcode === true) {
                var partialpattern = /^([0-9]{5})([-\s]+([0-9]{0,4}))$|^([0-9]{1,5})$/;
                return partialpattern.test(postCode);
            }
            else {
                var us = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/;
                return us.test(postCode);
            }
        },
        validateCAPostCode: function (postCode, allowPartialZipcode) {
            if (ObjectUtil.isNullOrEmpty(postCode)) {
                return false;
            }
            if (allowPartialZipcode === true) {
                var partialpattern = /^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d{0,1})$|^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d{0,1})$|^([ABCEGHJKLMNPRSTVXY]\d{0,1})$/;
                return partialpattern.test(postCode.toUpperCase());
            }
            var ca = /^([ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ])\ {0,1}(\d[ABCEGHJKLMNPRSTVWXYZ]\d)$/;
            return ca.test(postCode.toUpperCase());
        },
        validateUKPostCode: function (postCode, allowPartialZipcode) {

            if (ObjectUtil.isNullOrEmpty(postCode)) {
                return false;
            }
            if (allowPartialZipcode === true) {
                var partialpattern = /^([A-PR-UWYZ](([A-HK-Y]{1}[0-9]{1}[ABEHMNPRVWXY0-9]{0,1})|([0-9]{1}[A-HJKSTUW0-9]{0,1})) [0-9]{1}[ABD-HJLNP-UW-Z]{0,2})$|^([A-PR-UWYZ](([A-HK-Y]{1}[0-9]{1}[ABEHMNPRVWXY0-9]{0,1})|([0-9]{1}[A-HJKSTUW0-9]{0,1}))\ {0,1})$|^([A-PR-UWYZ][A-HK-Y]{0,1})$|^GIR 0AA$/;
                return partialpattern.test(postCode.toUpperCase());
            }
            if (postCode.length > 8) {
                return false;
            }
            var regex = /([A-PR-UWYZ](([A-HK-Y]{1}[0-9]{1}[ABEHMNPRVWXY0-9]{0,1})|([0-9]{1}[A-HJKSTUW0-9]{0,1})) [0-9]{1}[ABD-HJLNP-UW-Z]{2})|GIR 0AA/;
            return regex.test(postCode.toUpperCase());
        },
        validateAUPostCode: function (postCode, allowPartialZipcode) {
            if (ObjectUtil.isNullOrEmpty(postCode)) {
                return false;
            }
            if (allowPartialZipcode === true) {
                var partialpattern = /^(0[289][0-9]{0,2})$|^([1345689][0-9]{0,3})$|^(2[0-8][0-9]{0,2})$|^(290[0-9]{0,1})$|^(291[0-4]{0,1})$|^(7[0-4][0-9]{0,2})$|^(7[8-9][0-9]{0,2})$|^(29)$|^(0)$|^(2)$|^(7)$/;
                return partialpattern.test(postCode);
            }
            var au = /^(0[289][0-9]{2})$|^([1345689][0-9]{3})$|^(2[0-8][0-9]{2})$|^(290[0-9])$|^(291[0-4])$|^(7[0-4][0-9]{2})$|^(7[8-9][0-9]{2})$/;
            return au.test(postCode);
        },
        validatePostalCode: function (counrtyId, forLocationsUsedOnAddresses) {
            //should we be validating the postal code against this country?
            var params = JSON.stringify({ 'countryId': counrtyId, 'forLocationsUsedOnAddresses': forLocationsUsedOnAddresses });

            //make ajax request
            var result = $.ajax({
                url: "/Services/SiteSettings/SiteSettingsService.asmx/ValidatePostalCode",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: params,
                type: 'POST',
                error: function () {
                    console.log('Validate Country call failed');
                }
            });

            return result;
        },
        isPostalCodeValidForCountry: function (data, countryId, zip) {
            //use after call to validatePostalCode
            var valid = true;
            if (data.d) {
                switch (countryId) {
                    case '{EEDB78F3-A560-428D-83BF-F5BF0DD10135}'://uk
                        {
                            valid = this.validateUKPostCode(zip);
                            break;
                        }
                    case '{06D891A9-E7EF-4F8C-8700-379DBE2662DA}': //us
                        {
                            valid = this.validateUSPostCode(zip);
                            break;
                        }
                    case '{6154B7EE-709B-4EDB-85B9-A9BE188BE2B1}': //canada
                        {
                            valid = this.validateCAPostCode(zip);
                            break;
                        }
                    case '{3C6D851A-F4F2-4206-9E3C-1158FE1A5A1D}': //australia
                        {
                            valid = this.validateAUPostCode(zip);
                            break;
                        }
                    default:
                        {
                            if (ObjectUtil.isNullOrEmpty(zip)) {
                                valid = false;
                            }
                            break;
                        }
                }
            }
            return valid;
        },
        validateState: function (countryId, forLocationsUsedOnAddresses) {
            var data = { countryId: countryId, forLocationsUsedOnAddresses: forLocationsUsedOnAddresses };
            var result = $.ajax({
                url: "/Services/SiteSettings/SiteSettingsService.asmx/ValidateState",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                type: 'POST',
                success: function (response) {
                    console.log(response);
                },
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });

            return result;
        },
        validatePromoCode: function (promoCode) {
            if (promoCode == '' || !(promoCode.length == 12 || promoCode.length == 4 || promoCode.length == 5)) {
                return false;
            }
            // should be 10 digit or 4 or 5
            var formatValidation = new RegExp("^([A-Za-z0-9]{4}-[A-Za-z][A-Za-z0-9]{2}-[A-Za-z0-9]{3})$|^([A-Za-z0-9]{4})$|^([A-Za-z0-9]{5})$");
            return formatValidation.test(promoCode);
        },
        validatePhoneNumber: function (phone) {
   
            var errorMessages = [];
            if (ObjectUtil.isNullOrEmpty(phone)) {

                errorMessages.push(App.dictionary.get('common.FormValidations.Phone'));
                return errorMessages;
            }

            if (!/^[-0-9.+()\s]*$/i.test(phone)) {
                errorMessages.push(App.dictionary.get('common.FormValidations.PhoneInvalidCharacters'));
                return errorMessages;
            }

            //get only digits
            var phoneLen = phone.replace(/[^0-9]/g, "").length;

            //lets check length of phone number
            if (phoneLen < 10 || phone.length > 25) {
                errorMessages.push(App.dictionary.get('common.FormValidations.PhoneLength'));
                return errorMessages;
            }

            return errorMessages;
        },
        isDigitString: function (string) {
            return /^\d+$/.test(string);
        },
        validateUsername: function (username) {
            var df = $.Deferred();
            SecurityService.checkUsername(username)
                .done(function (response) {
                    var data = JSON.parse(response.d);
                    if (!data.success) {
                        df.resolve(data.message);
                    }
                    else {
                        df.resolve();
                    }
                })
                .fail(function () {
                    var message = App.dictionary.get('profile.ErrorMessages.CreateAccountFailed');
                    var companyInfo = $("body").data("company");
                    if (companyInfo && companyInfo.webHelpPhoneNumber) {
                        message = message.replace("{0}", companyInfo.webHelpPhoneNumber);
                    }
                    df.resolve(message);
                });
            return $.when(df).promise();
        },
        validateFirstOrLastName: function (name) {
            var nameErrorMessage = "Please enter valid text in First/Last name fields"
            var regName = /^[A-z/-]+$/;
            if (ObjectUtil.isNullOrEmpty(name)) {
                return;
            }
            if (!regName.test(name)) {
                return nameErrorMessage;
            }

            return '';
        },
        validateZip: function (zip, countryid) {
            let errorMessages = [];
            console.log(ObjectUtil.isNullOrEmpty(zip));
            var outerScope = this;
            if (ObjectUtil.isNullOrEmpty(zip)) {
                errorMessages.push(App.dictionary.get('common.FormValidations.Zip'));
                return errorMessages;
            }
            else if (!ObjectUtil.isNullOrEmpty(countryid)) {
                var validZipCode = true;
                switch (countryid) {
                    case '{EEDB78F3-A560-428D-83BF-F5BF0DD10135}': //uk
                        {
                            validZipCode = this.validateUKPostCode(zip, false);
                            break;
                        }
                    case '{06D891A9-E7EF-4F8C-8700-379DBE2662DA}': //us
                        {
                            validZipCode = this.validateUSPostCode(zip, false);
                            break;
                        }
                    case '{6154B7EE-709B-4EDB-85B9-A9BE188BE2B1}': //canada
                        {
                            validZipCode = this.validateCAPostCode(zip, false);
                            break;
                        }
                    case '{3C6D851A-F4F2-4206-9E3C-1158FE1A5A1D}': //australia
                        {
                            validZipCode = this.validateAUPostCode(zip, false);
                            break;
                        }
                    default:
                        {
                            if (ObjectUtil.isNullOrEmpty(zip)) {
                                validZipCode = false;
                            }
                            break;
                        }
                }

                if (!validZipCode) {
                    errorMessages.push(App.dictionary.get('common.FormValidations.ZipInvalid'));
                    return errorMessages;
                }
       
                return errorMessages;
            }
        },
        validateCountry: function (country) {
            //validate the country is selected and that it has a proper id
            let errorMessages = [];
            if (country == null || ObjectUtil.isNullOrEmpty(country.name)) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.Country'));
            } else if (country.neoId == null || country.neoId == 0) {
                this.errorMessages.push(App.dictionary.get('tourRelated.Booking.TravelerInfo.CountryId'));
            }
            return errorMessages;
        },
        /**
         * Make sure that confirm email cannot be copied
         *
         * @method preventCopyPaste
         */
        preventCopyPaste: function ($selector) {
            $selector.keydown(function (event) {
                if (event.ctrlKey == true && (event.which == '118' || event.which == '86')) {
                    event.preventDefault();
                }
            });
        }
    };

    return validationUtil;
});