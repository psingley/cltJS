define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app', 
    'util/taxonomy/taxonomyDomUtil',
    'services/bookingService',
    'event.aggregator',
    'views/validation/ErrorView',
    'util/booking/bookingUtil',
    'util/objectUtil',
    'util/validationUtil',
    'util/dataLayerUtil',
    'util/paymentFormUtil',
    'util/travelerUtil',
    'util/animationUtil'
], function ($, _, Backbone, Marionette, App, TaxonomyDomUtil, BookingService, EventAggregator, ErrorView, BookingUtil, ObjectUtil, ValidationUtil, DataLayerUtil, PaymentFormUtil, TravelerUtil, AnimationUtil) {
    $("#btnConfirm").on("click", function (e) {
        e.preventDefault(); 
        validateAddressForm();
    });
    $("#ExpiryMonth, #ExpiryYear").on("change", (e) => { PaymentFormUtil.toggleBorderColor(e); });
    $("#Amount").on("change keydown keyup focusout", (e) => { PaymentFormUtil.toggleBorderColor(e); });
    $("#CardNumber").on("keydown keyup", (e) => { PaymentFormUtil.getCardType(e); });
    $("#SecureCode").on("keydown keyup", (e) => { PaymentFormUtil.getCardTypeSCode(e); });
    $(".payment_table input").on('keyup keydown change', function (e) { PaymentFormUtil.toggleBorderColor(e); });
    $(".payment_table input[type=text]").focusout(function (e) { PaymentFormUtil.toggleBorderColor(e); });
    $("#CountryId").on("change", () => { updateFormLocations(); });
    $(".travelers").on("change", () => { populateForm("selected"); });
    function ValidatePayForm2(messages, color) {

        let msgInputs2 = {
            "card number": 'CardNumber',
            "security code": 'SecureCode',
            "payment amount": 'Amount',
            "month": 'ExpiryMonth',
            "year": "ExpiryYear",
            "full name": 'Fullname',
            "address": 'Address1',
            "city": "City",
            "state": "State",
            'country': "Country",
            "zipcode": "Zip"
        }
        if (messages !== undefined) {
            messages.forEach((m) => {
                console.log(m);
                Object.keys(msgInputs2).forEach(key => {
                    if (m.includes(key)) {
                        if (key === "month" || key === "year") {
                            PaymentFormUtil.ToggleVisual("#b2b8bd", "red", key, "border-color", m);
                        }
                        else {
                            if (key === "security code") {
                                m = m.replace("credit ", "");
                            }
                            PaymentFormUtil.ToggleVisual("#b2b8bd", "red", msgInputs2[key], "border-color", m);
                        }
                        PaymentFormUtil.ToggleVisual("#b2b8bd", "red", msgInputs2[key], "border-color", m);
                    }
                });
            });
        }
    }
    function validateAddressForm() {
        const requiredFullname = App.dictionary.get('common.FormValidations.FullName');
        const requiredAddress = App.dictionary.get('common.FormValidations.Address');
        const requiredCity = App.dictionary.get('common.FormValidations.City');
        const requiredState = App.dictionary.get('common.FormValidations.State');
        const requiredCountry = App.dictionary.get('common.FormValidations.Country');
        const requiredZip = App.dictionary.get('common.FormValidations.Zip');

        let txtFullname = document.getElementById('Fullname').value;
        let txtAddress = document.getElementById('Address1').value;
        let txtCity = document.getElementById('City').value;
        let ddlCountry = document.getElementById('Country').value;
        let countryId = document.getElementById('CountryId').value;
        let txtState = document.getElementById('State').value;
        let stateId = document.getElementById('StateId').value;
        let txtZip = document.getElementById('Zip').value.toUpperCase();

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
            ValidatePayForm2(errorMessages, 'red');
        } catch (error) {
            console.error(error);
        }
        validateBillingForm(errorMessages, 'red');
    }


    function validateBillingForm(em, color) {
        const requiredCardType = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardType');
        const requiredCardNumber = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardNumber');
        const requiredExpMonth = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.ExpirationMonth');
        const requiredExpYear = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.ExpirationYear');
        const cardExpired = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardExpirationDateInvalid');
        const requiredSecurityCode = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.SecurityCode');
        const requiredPaymentAmt = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmount');
        const paymentTooMuch = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmountTooMuch');
        const paymentNotEnough = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmountNotEnough');

        let txtCardNumber = document.getElementById('CardNumber').value.replaceAll(" ", "");
        let txtSecurityCode = document.getElementById('SecureCode').value;

        let ddlCardType2 = document.getElementById('ccHidden').value;
        if (ddlCardType2 === undefined) {
            document.getElementById('noValid').style.display = "block";
        }

        let ddlExpirationMonth = document.getElementById("ExpiryMonth").value;
        let ddlExpirationYear = document.getElementById("ExpiryYear").value;


        var errorMessages = [...em];

        if (ddlCardType2 === null) {
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

        var minAmount = localStorage.getItem('minAmount');
        var maxAmount = localStorage.getItem('maxAmount');
        var enteredAmount = PaymentFormUtil.getEnteredAmount();
        if (enteredAmount === 0) {
            errorMessages.push(requiredPaymentAmt);
        } else if (enteredAmount < minAmount) {
            errorMessages.push(paymentNotEnough);
        }
        else if (enteredAmount > maxAmount) {
            errorMessages.push(paymentTooMuch);
        }

        try {
            ValidatePayForm2(errorMessages, '#B92E45');

            if (!errorMessages.includes('security')) {
                PaymentFormUtil.SecureCodeLength(txtSecurityCode);
            }
            if (errorMessages.length === 0) {
                AnimationUtil.showProgressBar();
                document.getElementById("errorForm").submit();
            }
            else {
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
            }
        } catch (error) {
            console.error(error);
        }
    }
    function populateForm(p) {
        if (p === 'onload') {
            if (localStorage.getItem('paymentInfo')) {
                let x = JSON.parse(localStorage.getItem('paymentInfo'));
                document.getElementById("Fullname").value = x.fullname;
                document.getElementById("Address1").value = x.address1;
                document.getElementById("Address2").value = x.address2;
                document.getElementById("Country").value = x.country;
                document.getElementById("State").value = x.state;
                document.getElementById("City").value = x.city;
                document.getElementById("Zip").value = x.zip;
                document.getElementById("hCartId").value = x.cartid;
                document.getElementById("hPassengerId").value = x.passengerid;
                document.getElementById("hPackageDateId").value = x.pagkagedateid
            }
        }
        if (p === 'selected') {
            let t = JSON.parse(localStorage.getItem('theTravelers'));
            let id = document.querySelector('.travelers.old_select').getElementsByTagName("option")[document.querySelector('.travelers.old_select').selectedIndex].dataset.id;
            let traveler = [];
            t.forEach(function (d) {
                if (Number(d.id) === Number(id)) {
                    traveler.push({ d });
                }
            })
            setTimeout(function () {
                if (traveler[0] !== undefined) {
                    document.getElementById("Fullname").value = traveler[0].d.firstname + " " + traveler[0].d.lastname;
                    document.getElementById("Address1").value = traveler[0].d.address1;
                    document.getElementById("Address2").value = traveler[0].d.address2;
                    document.getElementById("Country").value = traveler[0].d.country;
                    document.getElementById("State").value = traveler[0].d.state;
                    document.getElementById("City").value = traveler[0].d.city;
                    document.getElementById("Zip").value = traveler[0].d.zip;
                }
                else {
                    document.getElementById("Fullname").value = "";
                    document.getElementById("Address1").value = "";
                    document.getElementById("Address2").value = "";
                    document.getElementById("Country").value = "";
                    document.getElementById("State").value = "";
                    document.getElementById("City").value = "";
                    document.getElementById("Zip").value = "";
                }

            }, 20);
        }
    }
    function updateFormLocations() {
        var $el = $('.passenger_payment_address');
        var $countryDD = $el.find('#Country');
        var countryId = document.getElementById("CountryId").value;
        if (countryId !== "") {
            App.locations.getCountryStates(countryId, function (countryStates) {
                var states = $.parseJSON(JSON.stringify(countryStates));
                var $stateSelector = $el.find('#State');
                var $stateIdSelector = $el.find('#StateId');
                TaxonomyDomUtil.setAutocomplete(states, $stateSelector, $stateIdSelector);

            });
        }
    }
    App.module("Error-Payment-Form", function (e) {

 
        if (document.getElementById("frmErrorPaymentInfo")) {

            let a = document.getElementById('Amount');
            let b = localStorage.getItem('minAmount');
            let c = localStorage.getItem("maxAmount");
            if (a !== null & b !== null && c !== null) {
                b = Number(b).toFixed(2);
                c = Number(c).toFixed(2);
                a.value = b.formatPrice();
                document.getElementById("minamount").textContent = b.formatPrice();
                document.getElementById("totalamount").textContent = c.formatPrice();
            }

            var $el = $('.passenger_payment_address');
            var $country = $el.find('#Country');
            var $countryId = $el.find('#CountryId');

            var countries = App.locations.getAll('countries');
            TaxonomyDomUtil.setAutocomplete(countries, $country, $countryId);



            populateForm('onload');
            updateFormLocations();
            setTimeout(function () { jQuery('#Country').focus() }, 20);
            setTimeout(function () { jQuery('#State').focus() }, 40);
            setTimeout(function () { jQuery('#State').blur() }, 60);

            let t = JSON.parse(localStorage.getItem('theTravelers'));
            var travelers = [];
            t.forEach(function (traveler) {
                travelers.push({ name: traveler.firstname, id: traveler.id });

            });

            var $ele = $('.passenger_payment_choice');
            var $travelersDD = $ele.find('.travelers.old_select');
            TaxonomyDomUtil.setCustomOptions(travelers, $travelersDD);
            $travelersDD.trigger('update');
        }
    });
})