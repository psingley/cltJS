define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/taxonomy/taxonomyUtil',
    'util/taxonomy/taxonomyDomUtil',
    'event.aggregator',
    'views/validation/ErrorView',
    'util/booking/bookingUtil',
    'util/objectUtil',
    'util/validationUtil',
    'util/dataLayerUtil',
    'util/paymentFormUtil',
    'util/animationUtil'
], function ($, _, Backbone, Marionette, App, TaxonomyUtil, TaxonomyDomUtil, EventAggregator, ErrorView, BookingUtil, ObjectUtil, ValidationUtil, DataLayerUtil, PaymentFormUtil, AnimationUtil) {
    var PaymentFormLayout = Backbone.Marionette.Layout.extend({
        el: '#frmPaymentInfo',
        regions: {
            'messagesRegion': '.messagesRegion',
            'travelersRegion': '.travelers'
        },
        events: {
            'change #CountryId': 'updateFormLocations',
            'click #btnConfirm': 'validateForm',
            'change .travelers': 'populateForm',
            'change #ExpiryMonth': 'toggleBorderColor',
            'change #ExpiryYear': 'toggleBorderColor',
            'keydown #CardNumber': 'getCardType',
            'keyup #CardNumber': 'getCardType',
            'keydown #SecureCode': 'getCardTypeSCode',
            'keyup #SecureCode': 'getCardTypeSCode',
            'click #AcceptHazardousMaterials': 'toggleRed',
            'click #Accept': 'toggleRed',
            'change .payment_table input': 'toggleBorderColor',
            'keyup .payment_table input': 'toggleBorderColor',
            'keydown .payment_table input': 'toggleBorderColor',
            'blur .payment_table input[type=text]': 'toggleBorderColor'
        },
        initialize: function () {
            var outerScope = this;
            this.formSubmitted = false;

            var $country = this.$el.find('#Country');
            var $countryId = this.$el.find('#CountryId');

            var countries = App.locations.getAll('countries');
            TaxonomyDomUtil.setAutocomplete(countries, $country, $countryId);


            EventAggregator.on('getBookingComplete', function () {
                outerScope.setTravelersDropDown();
            });

            EventAggregator.on('submitTourDateComplete', function () {
                var $cartInput = outerScope.$el.find('#hCartId');
                var $packageDateIdInput = outerScope.$el.find('#hPackageDateId');

                $cartInput.val(App.Booking.cartId);
                $packageDateIdInput.val(App.Booking.packageDateId);
            });

        },
        setTravelersDropDown: function () {
            var travelers = [];
            var theTravelers = [];
            App.Booking.travelers.each(function (traveler) {
                contactinfo = traveler.get('contactInfo');
                travelers.push({ id: traveler.get('id'), name: traveler.get('firstName') });
                if (contactinfo.get('country') !== null && contactinfo.get('state') !== null) {
                    theTravelers.push({
                        firstname: traveler.get('firstName'),
                        lastname: traveler.get('lastName'),
                        address1: contactinfo.get('address1'),
                        address2: contactinfo.get('address2'),
                        city: contactinfo.get('city'),
                        country: contactinfo.get('country').name,
                        countryid: contactinfo.get('country').id,
                        state: contactinfo.get('state').name,
                        stateid: contactinfo.get('state').id,
                        zip: contactinfo.get('zipCode'),
                        id: traveler.get('id')
                    });
                }
            });
            localStorage.theTravelers = JSON.stringify(theTravelers);
            var $travelersDD = this.$el.find('.travelers.old_select');
            TaxonomyDomUtil.setCustomOptions(travelers, $travelersDD);
            $travelersDD.trigger('update');
        },
        clearForm: function () {
            this.$el.find('#Fullname').val('');
            this.$el.find('#Address1').val('');
            this.$el.find('#Address2').val('');
            this.$el.find('#City').val('');
            this.$el.find('#Zip').val('');
            this.$el.find('#State').val('');
            this.$el.find('#StateId').val('');
            this.$el.find('#Country').val('');
            this.$el.find('#CountryId').val('');
            this.$el.find('#hPackageDateId').val('');
            this.$el.find('#CardNumber').val('');
            document.getElementById('paymentForm').querySelectorAll('.current a')[1].textContent = 'Month';
            document.getElementById('paymentForm').querySelectorAll('.current a')[2].textContent = 'Year';
        },
        populateForm: function (e) {

            var $target = $(e.target);
            var selectedTraveler = $($target).find(":selected");
            if (selectedTraveler == undefined) {
                this.clearForm();
                return;
            }

            var selectedId = $(selectedTraveler).attr('data-id');
            if (selectedId == null || selectedId == '') {
                this.clearForm();
                return;
            }

            var traveler = App.Booking.travelers.find(function (traveler) {
                return traveler.get('id') == selectedId;
            });

            if (traveler == undefined) {
                return;
            }

            var contactInfo = traveler.get('contactInfo');
            var firstName = traveler.get('firstName');
            var lastName = traveler.get('lastName');
            var id = traveler.get('id');

            var fullname = firstName + " " + lastName;
            var address1 = contactInfo.get('address1');
            var address2 = contactInfo.get('address2');
            var city = contactInfo.get('city');
            var state = contactInfo.get('state');
            var country = contactInfo.get('country');
            var zip = contactInfo.get('zipCode');

            if (state != undefined) {
                this.$el.find('#State').val(state.name);
                this.$el.find('#StateId').val(state.id);
            }

            if (country != undefined) {
                this.$el.find('#Country').val(country.name);
                this.$el.find('#CountryId').val(country.id);
            }

            if (!ObjectUtil.isNullOrEmpty(country) && ObjectUtil.isNullOrEmpty(state)) {
                this.updateFormLocations();
            }

            this.$el.find('#Fullname').val(fullname);
            this.$el.find('#Address1').val(address1);
            this.$el.find('#Address2').val(address2);
            this.$el.find('#City').val(city);
            this.$el.find('#Zip').val(zip);

            if (id !== undefined) {
                this.$el.find('#hPassengerId').val(id.toString());
            }

            messages = [
                App.dictionary.get('common.FormValidations.FullName'),
                App.dictionary.get('common.FormValidations.Address'),
                App.dictionary.get('common.FormValidations.City'),
                App.dictionary.get('common.FormValidations.State'),
                App.dictionary.get('common.FormValidations.Country'),
                App.dictionary.get('common.FormValidations.Zip')
            ];
            PaymentFormUtil.ValidatePayForm(messages, "red");

        },
        updateFormLocations: function () {
            var outerScope = this;
            var $countryDD = this.$el.find('#Country');
            var countryId = this.$el.find('#CountryId').val();
            var countryName = $countryDD.val();

            if (countryId == App.locations.getLocationId('countries', countryName)) {

                App.locations.getCountryStates(countryId, function (countryStates) {
                    var states = $.parseJSON(JSON.stringify(countryStates));
                    var $stateSelector = outerScope.$el.find('#State');
                    var $stateIdSelector = outerScope.$el.find('#StateId');
                    TaxonomyDomUtil.setAutocomplete(states, $stateSelector, $stateIdSelector);

                });
            }
        },
        
        validateAddressForm: function () {
            var requiredFullname = App.dictionary.get('common.FormValidations.FullName');
            var requiredAddress = App.dictionary.get('common.FormValidations.Address');
            var requiredCity = App.dictionary.get('common.FormValidations.City');
            var requiredState = App.dictionary.get('common.FormValidations.State');
            var requiredCountry = App.dictionary.get('common.FormValidations.Country');
            var requiredZip = App.dictionary.get('common.FormValidations.Zip');

            var txtFullname = this.$el.find('#Fullname').val();
            var txtAddress = this.$el.find('#Address1').val();
            var txtCity = this.$el.find('#City').val();
            var txtState = this.$el.find('#State').val();
            var stateId = this.$el.find('#StateId').val();
            var ddlCountry = this.$el.find('#Country').val();
            var countryId = this.$el.find('#CountryId').val();
            var txtZip = this.$el.find('#Zip').val().toUpperCase();

            var errorMessages = [];

            if (ObjectUtil.isNullOrEmpty(txtFullname.trim())) {
                errorMessages.push(requiredFullname);
            }

            if (ObjectUtil.isNullOrEmpty(txtAddress.trim())) {
                errorMessages.push(requiredAddress);
            }

            if (ObjectUtil.isNullOrEmpty(txtCity.trim())) {
                errorMessages.push(requiredCity);
            }

            //it-28432 - if country is US, Canada, or AUS - state is required
            if (countryId === "{06D891A9-E7EF-4F8C-8700-379DBE2662DA}" ||
                countryId === "{3C6D851A-F4F2-4206-9E3C-1158FE1A5A1D}" ||
                countryId === "{6154B7EE-709B-4EDB-85B9-A9BE188BE2B1}" ||
                ObjectUtil.isNullOrEmpty(countryId)) {
                if (txtState === null || txtState === '' || ObjectUtil.isNullOrEmpty(stateId)) {
                    errorMessages.push(requiredState);
                }
            }

            if (ddlCountry === null || ddlCountry === '' || ObjectUtil.isNullOrEmpty(countryId)) {
                errorMessages.push(requiredCountry);
            }

            if (ObjectUtil.isNullOrEmpty(txtZip.trim())) {
                errorMessages.push(requiredZip);
            } else {
                var data = { d: true };
                var valid = ValidationUtil.isPostalCodeValidForCountry(data, countryId, txtZip);
                if (!valid) {
                    errorMessages.push(requiredZip);
                }
            }
            try {
                PaymentFormUtil.ValidatePayForm(errorMessages, 'red');
            } catch (error) {
                console.error(error);
            }
            return errorMessages;
        },
        getCardTypefromCode: function (code) {
            if (code === "AX") return "{7E122C48-85F4-4523-B944-46683CF84CB9}";
            if (code === "VI") return "{3CE8FE21-A935-4E6B-9A5C-1C3894568DBC}";
            if (code === "MC") return "{7721089C-0A70-4A0B-80E5-56AD2E8AAADC}";
            if (code === "dc") return "{6C18900B-0099-49A7-AA0C-550C4BAD0811}";
        },
        validateBillingForm: function () {
            var requiredCardType = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardType');
            var requiredCardNumber = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardNumber');
            var requiredExpMonth = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.ExpirationMonth');
            var requiredExpYear = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.ExpirationYear');
            var cardExpired = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardExpirationDateInvalid');
            var requiredSecurityCode = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.SecurityCode');
            var requiredPaymentAmt = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmount');
            var paymentTooMuch = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmountTooMuch');
            var paymentNotEnough = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmountNotEnough');
            var requiredAcceptTerms = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AcceptTerms');
            var requiredHazardousMaterialsTerms = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AcceptHazardousMaterialsTerms');

            var txtCardNumber = this.$el.find('#CardNumber').val().replaceAll(" ", "");

            var txtSecurityCode = this.$el.find('#SecureCode').val();

            var cbxAcceptUnchecked = this.$el.find('#Accept').not(':checked').length > 0;
            var hzdAcceptUnchecked = this.$el.find('#AcceptHazardousMaterials').not(':checked').length > 0;

            var ddlCardType2 = this.getCardTypefromCode(document.getElementById('ccHidden').value);
            var ddlCardType = this.$el.find("#CardType").next('.new_select').find('li.selected').attr('data-value');

            if (ddlCardType2 === undefined) {
                document.getElementById('noValid').style.display = "block";
            }

            var ddlExpirationMonth = this.$el.find("#ExpiryMonth").next('.new_select').find('li.selected').attr('data-value');

            var ddlExpirationYear = this.$el.find("#ExpiryYear").next('.new_select').find('li.selected').attr('data-value');

            var errorMessages = [];

            if (ddlCardType === null || ddlCardType === '') {
                errorMessages.push(requiredCardType);
            }

            if (txtCardNumber === null || txtCardNumber === '') {
                errorMessages.push(requiredCardNumber);
            } else {

                var code = document.getElementById('ccHidden').value;
                var format = code + txtCardNumber;

                var cardErrorMessages = PaymentFormUtil.validateCreditCardNumber(format);
                if (cardErrorMessages.length > 0) {
                    errorMessages = errorMessages.concat(cardErrorMessages);
                }
            }

            if (ddlExpirationMonth === undefined || ddlExpirationMonth === '') {
                errorMessages.push(requiredExpMonth);
            }

            if (ddlExpirationYear === undefined || ddlExpirationYear === '') {
                errorMessages.push(requiredExpYear);
            }

            if (ddlExpirationYear && ddlExpirationMonth) {
                var today = new Date();
                var expireDate = new Date();

                // set the expiration date to the first day of the following month
                expireDate.setFullYear(ddlExpirationYear, ddlExpirationMonth, 1);
                document.getElementById("expLblText").style.color = 'black';
                if (expireDate <= today) {
                    errorMessages.push(cardExpired);
                    document.getElementById("expLblText").style.color = 'red';
                }
            }

            if (ObjectUtil.isNullOrEmpty(txtSecurityCode.trim())) {
                errorMessages.push(requiredSecurityCode);

            }

            var minAmount = App.Booking.depositAmount;
            var maxAmount = BookingUtil.getGrandTotal();

            localStorage.minAmount = minAmount;
            localStorage.maxAmount = maxAmount;

        
            var enteredAmount = PaymentFormUtil.getEnteredAmount();
            if (enteredAmount === 0) {
                errorMessages.push(requiredPaymentAmt);
            } else if (enteredAmount < minAmount) {
                errorMessages.push(paymentNotEnough);
            }
            else if (enteredAmount > maxAmount) {
                errorMessages.push(paymentTooMuch);
            }

            if (hzdAcceptUnchecked) {
                errorMessages.push(requiredHazardousMaterialsTerms);
            }

            if (cbxAcceptUnchecked) {
                errorMessages.push(requiredAcceptTerms);
            }
            try {
                PaymentFormUtil.ValidatePayForm(errorMessages, '#B92E45');
                if (!errorMessages.includes('security')) {
                    PaymentFormUtil.SecureCodeLength(txtSecurityCode);
                }
            } catch (error) {
                console.error(error);
            }
            return errorMessages;
        },
        validateForm: function (e) {
            var addressErrorMessages = this.validateAddressForm();
            var billingErrorMessages = this.validateBillingForm();
            var errorMessages = addressErrorMessages.concat(billingErrorMessages);

            if (errorMessages.length === 0 && !this.formSubmitted) {
                this.messagesRegion.close();

                try {
                    var offerCode = $('#txtPromotionCode').val();
                    dataLayer.push({
                        'event': 'gaEvent',
                        'eventCategory': 'Summary and Payment',
                        'eventAction': 'Booking',
                        'eventLabel': 'Offer Code Applied - ' + offerCode
                    });

                    var price = Number($('#grandTotal').text().replace(/[^0-9\.]+/g, ""));
                    dataLayer.push({
                        'event': 'gaEvent',
                        'eventCategory': 'Summary and Payment',
                        'eventAction': 'Booking',
                        'eventLabel': 'Payment Confirmed',
                        'eventvalue': price
                    });
                } catch (ex) {
                    console.log(ex);
                }

                let paymentInfo = {
                    "fullname": document.getElementById("Fullname").value,
                    "address1": document.getElementById("Address1").value,
                    "address2": document.getElementById("Address2").value,
                    "state" : document.getElementById("State").value,
                    "country" :  document.getElementById("Country").value,
                    "city": document.getElementById("City").value,
                    "zip": document.getElementById("Zip").value,
                    "cartid": document.getElementById("hCartId").value,
                    "passengerid": document.getElementById("hPassengerId").value,
                    "pagkagedateid": document.getElementById("hPackageDateId").value,
                }

                localStorage.paymentInfo = JSON.stringify(paymentInfo);
                this.formSubmitted = true;
                DataLayerUtil.PaymentDataLayer('Form Submitted');
                AnimationUtil.showProgressBar();

            } else if (!this.formSubmitted) {
                e.preventDefault();
                DataLayerUtil.PaymentDataLayer(errorMessages);
                var errorView = new ErrorView(errorMessages);
                //this.messagesRegion.show(errorView);
                errorMessages.forEach((c) => {
                    if (c.includes("state")) {
                        document.getElementById("State").style.borderColor = "red";
                        document.querySelector('.State.errorText').textContent = c;
                    }
                    if (c.includes("country")) {
                        document.getElementById("Country").style.borderColor = "red";
                        document.querySelector('.Country.errorText').textContent = c;
                    }
                    if (c.includes("number")) {
                        document.getElementById("CardNumber").value = "";
                    }
                    if (c.includes("month")) {
                        document.getElementById('paymentForm').querySelectorAll('.current a')[1].textContent = 'Month';
                        document.getElementById('lblmonth').textContent = c;
                    }
                    if (c.includes("year")) {
                        document.getElementById('paymentForm').querySelectorAll('.current a')[2].textContent = 'Year';
                        document.getElementById('lblyear').textContent = c;
                    }
                });
                console.log(errorMessages);
          
            }
         
            EventAggregator.trigger('PaymentFormValidateComplete');
        },
        getSelectedCreditCardCode: function (ccType) {
            var selectedCardType = this.$el.find("#CardType").next('.new_select').find('li.selected');
            return $(selectedCardType).attr('data-code');
        },
        updateAmountDue: function () {
            var $depositAmount = $('#depositAmount');
            $('#Amount').val($depositAmount.html());
        },
        getCardType: function (e) {
            let outerscope = this;
            const xAE = document.getElementById('ae-color');
            const yAE = document.getElementById('ae-grey');
            const xVS = document.getElementById('vs-color');
            const yVS = document.getElementById('vs-grey');
            const xMC = document.getElementById('mc-color');
            const yMC = document.getElementById('mc-grey');
            const xDS = document.getElementById('ds-color');
            const yDS = document.getElementById('ds-grey');
            const ccColorArray = [xAE, xVS, xMC, xDS];
            const ccGreyArray = [yAE, yVS, yMC, yDS]
            let cctype = "";
            const sc = document.getElementById('SecureCode');
            const cn = document.getElementById('CardNumber');
            let value = e.currentTarget.value;
            if (/^(34|37)/.test(value)) {
                cctype = "AX";
                PaymentFormUtil.SelectCCIcon(xAE, yAE, 1, ccColorArray, ccGreyArray);
            }
            else if (/^4/.test(value)) {
                cctype = "VI";
                PaymentFormUtil.SelectCCIcon(xVS, yVS, 4, ccColorArray, ccGreyArray);

            }
            else if (/^5[0-5]/.test(value)) {
                cctype = "MC";
                PaymentFormUtil.SelectCCIcon(xMC, yMC, 3, ccColorArray, ccGreyArray);
            }
            else if (/^(6011|622|64[4-9]|65)/.test(value)) {
                cctype = "dc";
                PaymentFormUtil.SelectCCIcon(xDS, yDS, 3, ccColorArray, ccGreyArray);
            } else {
                cctype = "";
                if (cn.value.length !== 0) {
                    ccColorArray.map(cc => cc.style.display = 'none');
                    ccGreyArray.map(cc => cc.style.display = 'block');
                }
                else {
                    ccColorArray.map(cc => cc.style.display = 'block');
                    ccGreyArray.map(cc => cc.style.display = 'none');
                }
                if (sc.value.length > 3) sc.value = "";
                document.getElementById('CardType').nextSibling.querySelector('ul').querySelectorAll('li')[0].click();
            }

            document.getElementById('ccHidden').value = cctype;
            if (cctype === "AX" || cctype === "VI" || cctype === "MC" || cctype === "dc") {
                document.getElementById('CardType').value = this.getCardTypefromCode(cctype);
            }

            PaymentFormUtil.ToggleValidMessage();
        },
        getCardTypeSCode: function (e) {
            const ccType = document.getElementById('ccHidden').value;
            const sc = document.getElementById('SecureCode');
            this.toggleBorderColor(e);
            ccType === 'AX' ? sc.maxLength = "4" : sc.maxLength = "3";
            PaymentFormUtil.SecureCodeLength(sc.value);
        },
        toggleBorderColor: function (e) {
            let message = [];
            switch (e.currentTarget.id) {
                case 'Fullname':
                    message.push(App.dictionary.get('common.FormValidations.FullName'));
                    break;
                case 'Address1':
                    message.push(App.dictionary.get('common.FormValidations.Address'));
                    break;
                case 'State':
                case 'StateId':
                    message.push(App.dictionary.get('common.FormValidations.State'));
                    break;
                case 'CountryId':
                case 'Country':
                    message.push(App.dictionary.get('common.FormValidations.Country'));
                    break;
                case 'City':
                case 'cityId':
                    message.push(App.dictionary.get('common.FormValidations.City'));
                    break;
                case 'Zip':
                    message.push(App.dictionary.get('common.FormValidations.Zip'));
                    break;
                case 'CardNumber': 
                    message.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardNumber')); 
                    break;
                case 'Amount':
                    message.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmount'));
                    break;
                case 'SecureCode':
                    message.push("Please enter your card's security code");
                    break;
                case 'month':
                case 'ExpiryMonth':
                    message.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.ExpirationMonth'));
                    break;
                case 'year':
                case 'ExpiryYear':
                    message.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.ExpirationYear'));
                    break;
            }
            if (e.which === undefined) {
                PaymentFormUtil.ValidatePayForm(message, 'red');
               
            }
            if (e.which === 32 || e.which === 8 || e.which >= 48 || e.which >= 96 && e.which <= 105 || e.which === 0) {
                PaymentFormUtil.ValidatePayForm(message, 'red');
            }
        },
        toggleRed: function (e) {
            let message = [];
            switch (e.currentTarget.id) {
                case 'AcceptHazardousMaterials':
                    message.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AcceptHazardousMaterialsTerms'));
                    break;
                case 'Accept':
                    message.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AcceptTerms'));
                    break;
            }
            PaymentFormUtil.ToggleCheckBox(e.currentTarget.id, e.currentTarget.checked, message);
        }
    });
    return PaymentFormLayout;
});