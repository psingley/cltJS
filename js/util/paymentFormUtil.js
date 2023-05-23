define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/dateUtil',
    'util/objectUtil',
    'util/uriUtil',
    'util/booking/bookingUtil'

], function ($, _, Backbone, Marionette, App, DateUtil, ObjectUtil, UrilUtil, BookingUtil) {
    var paymentFormUtil = {
        msgInputs: {
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
            "zipcode": "Zip",
            "materials": "AcceptHazardousMaterials",
            "terms": "Accept"
        },

        ValidatePayForm: function (messages, color) {
           
            if (messages !== undefined) {
                messages.forEach((m) => {
                    Object.keys(this.msgInputs).forEach(key => {
                        if (m.includes(key)) {
                            if (key === "materials" || key === "terms") {
                                document.getElementById(this.msgInputs[key]).parentNode.querySelector('strong').style.color = color;
                            }
                            else if (key === "month" || key === "year") {
                                this.ToggleVisual("#b2b8bd", "red", key, "border-color", m);
                            }
                            else {
                                if (key === "security code") {
                                    m = m.replace("credit ", "");
                                }
                                this.ToggleVisual("#b2b8bd", "red", this.msgInputs[key], "border-color", m);
                            }
                           
                        }
                    });

                });
            }
        },
     
        SetStateValidation: function (el, lbl, prop, valid, invalid, message) {
            let countryId = document.getElementById("CountryId").value;
            let rs = document.getElementById("stateRedStar");
            if (countryId === "{06D891A9-E7EF-4F8C-8700-379DBE2662DA}" ||
                countryId === "{3C6D851A-F4F2-4206-9E3C-1158FE1A5A1D}" ||
                countryId === "{6154B7EE-709B-4EDB-85B9-A9BE188BE2B1}" ||
                ObjectUtil.isNullOrEmpty(countryId)) {
                el.value !== "" ? el.style.setProperty(prop, valid) : el.style.setProperty(prop, invalid);
                if (lbl) {
                    lbl.textContent = el.value !== "" ? "" : message;
                }
                if (rs)
                    rs.textContent = "*";
            }
            else {
                el.style.setProperty(prop, valid);
                lbl.textContent = "";
                if (rs)
                    rs.textContent = "";
            }
        },
        ToggleVisual: function (valid, invalid, selector, prop, message) {
          //console.log("TOGGLE VUS: " + selector, message);
            let blue = document.querySelector('.searchAirMessagesRegion.pad div.infoMessages');
            if (blue) blue.style.display = 'none';

            //try {
                if (selector !== 'month' && selector !== 'year') {
                    let lbl = document.querySelector(`.payment_table span.${selector}`);
                    let el = document.getElementById(selector);

                    if (selector === "State" || selector === "StateId") {
                        this.SetStateValidation(el, lbl, prop, valid, invalid, message);
                        //if (document.getElementById('StateId').value === '') {
                        //    document.querySelector(".State.errorText").textContent = requiredState;
                        //    document.getElementById('State').style.borderColor = 'red'
                        //}
                        //else {
                        //    document.querySelector(".State.errorText").textContent = "";
                        //    document.getElementById('State').style.borderColor = '#b2b8bd'
                        //}
                    }
                    else {
                        if (selector === "CardNumber") {
                            let nv = document.getElementById("noValid");
                            setTimeout(() => {
                                if (el.value === "") {
                                    el.style.setProperty(prop, invalid);
                                    if (nv.textContent === "") {
                                        lbl.textContent = message;
                                    }
                                }
                                else {
                                    let m = this.validateCreditCardNumber(document.getElementById('ccHidden').value + el.value.replaceAll("", ""));
                                    if (m.length === 0) {
                                        el.style.setProperty(prop, valid);
                                        lbl.textContent = "";
                                    }
                                    else {
                                        el.style.setProperty(prop, invalid);
                                        if (nv.textContent === "") {
                                            lbl.textContent = message;
                                        }
                                    }
                                }
                            }, 250);

                        }
                        else if (selector === "Amount") {
                            let paymentTooMuch = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmountTooMuch');
                            let paymentNotEnough = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.PaymentAmountNotEnough');
                            let minAmount; 
                            let maxAmount;
                                if (document.getElementById('SummaryandPayment')) {
                                     minAmount = App.Booking.depositAmount;
                                     maxAmount = BookingUtil.getGrandTotal();
                                }
                                else {
                                    minAmount = localStorage.getItem("minAmount");
                                    maxAmount = localStorage.getItem("maxAmount");
                                }
                            let enteredAmount = this.getEnteredAmount();

                            if (enteredAmount === 0) {
                                lbl.textContent = message;
                                el.style.setProperty(prop, invalid)
                            } else if (enteredAmount < minAmount) {
                                lbl.textContent = paymentNotEnough;
                                el.style.setProperty(prop, invalid)
                            }
                            else if (enteredAmount > maxAmount) {
                                lbl.textContent = paymentTooMuch;
                                el.style.setProperty(prop, invalid)
                            }
                            else {
                                lbl.textContent = "";
                                el.style.setProperty(prop, valid);
                            }
                        }
                        else {
                            //flight step
                            if (selector === "departure_city" || selector === "depart" || selector === "return") {
                                if (selector === "departure_city") {
                                    el = document.getElementById("departure_city");
                                    lbl = document.getElementById("departure_city_error");

                                    if (message === 'solid') {
                                        lbl.textContent = "";
                                        el.style.setProperty(prop, valid);
                                    }
                                    else {
                                        el.style.setProperty(prop, invalid);
                                        lbl.textContent = message;
                                    }
                                }
                                if (selector === "depart") {
                                    el = document.querySelector('.depart');
                                    lbl = document.getElementById(`${selector}_error`);
                                    el.value !== "" ? el.style.setProperty(prop, valid) : el.style.setProperty(prop, invalid);
                                    if (lbl) { lbl.textContent = el.value !== "" ? "" : message; }
                                }
                                if (selector === "return") {
                                    let m = App.dictionary.get('tourRelated.Booking.FlightsProtection.ChooseALaterReturnDate');
                                    el = document.querySelector('.return');
                                    lbl = document.getElementById(`${selector}_error`);
                                    if (el.value === "") {
                                        el.style.setProperty(prop, invalid);
                                        lbl.textContent = message;
                                    }
                                    else if (document.querySelector('.depart').value !== "" &&
                                        el.value !== "" &&
                                        el.value <= document.querySelector('.depart').value) {
                                        el.style.setProperty(prop, invalid);
                                        lbl.textContent = m;
                                    }
                                    else {
                                        el.style.setProperty(prop, valid);
                                        lbl.textContent = "";
                                    }
                                }
                            }
                            //individual input fields
                            else {
                                el.value !== "" ? el.style.setProperty(prop, valid) : el.style.setProperty(prop, invalid);

                                if (lbl) {
                                    lbl.textContent = el.value !== "" ? "" : message;
                                }
                                if (selector === "Country" || selector === "CountryId") {
                                    el = document.getElementById("State");
                                    lbl = document.querySelector('.payment_table span.State');
                                    message = "Please select your state.";
                                    this.SetStateValidation(el, lbl, prop, valid, invalid, message);
                                }
                            }
                        }
                    }
                }
                else {
                    //month or year dropdown
                    let el, elborder, empty, lbl;
                    let m = document.getElementById('ExpiryMonth');
                    let y = document.getElementById('ExpiryYear')
                    let month = m.nextSibling.querySelector('.current a');
                    let year = y.nextSibling.querySelector('.current a');
                    let invalidMessage = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardExpirationDateInvalid');

                    document.getElementById('expLblText').style.color = 'black';

                    if (selector === "month") {
                        el = month;
                        elborder = m.nextSibling.querySelector('.current');
                        lbl = document.getElementById("lblmonth");
                        empty = "Month";
                    }
                    else {
                        el = year;
                        elborder = y.nextSibling.querySelector('.current');
                        lbl = document.getElementById("lblyear");
                        empty = "Year";
                    }

                    if (el.textContent === empty) {
                        elborder.style.setProperty(prop, invalid);
                        lbl.textContent = message;
                    } else {
                        elborder.style.setProperty(prop, valid);
                        lbl.textContent = "";
                    }

                    if (month.textContent !== "Month" &&
                        year.textContent !== "Year") {
                        const today = new Date();
                        const expireDate = new Date();
                        // set the expiration date to the first day of the following month
                        expireDate.setFullYear(year.textContent, month.textContent, 1);
                        if (expireDate <= today) {
                            document.getElementById('lblmonth').textContent = invalidMessage;
                            document.getElementById('lblyear').textContent = "";
                            document.getElementById('expLblText').style.color = invalid;
                        }
                        else {
                            document.getElementById('lblmonth').textContent = "";
                            document.getElementById('lblyear').textContent = "";
                            document.getElementById('expLblText').style.color = 'black';
                        }
                    }
                }
               
           // } catch (error) { console.log(error.error); }
        },
        ToggleCheckBox: function (el, checked, message) {
            let lbl = document.querySelector(`.${el}`);

            let elColor = document.getElementById(el).parentNode.querySelector('strong');
            checked === true ? elColor.style.color = 'black' : elColor.style.color = '#B92E45';
            if (lbl)
                lbl.textContent = checked === true ? "" : message;
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
                this.SelectCCIcon(xAE, yAE, 1, ccColorArray, ccGreyArray);
            }
            else if (/^4/.test(value)) {
                cctype = "VI";
                this.SelectCCIcon(xVS, yVS, 4, ccColorArray, ccGreyArray);

            }
            else if (/^5[0-5]/.test(value)) {
                cctype = "MC";
                this.SelectCCIcon(xMC, yMC, 3, ccColorArray, ccGreyArray);
            }
            else if (/^(6011|622|64[4-9]|65)/.test(value)) {
                cctype = "dc";
                this.SelectCCIcon(xDS, yDS, 3, ccColorArray, ccGreyArray);
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

            this.ToggleValidMessage();
        },
        getCardTypeSCode: function (e) {
            const ccType = document.getElementById('ccHidden').value;
            const sc = document.getElementById('SecureCode');
            this.toggleBorderColor(e);
            ccType === 'AX' ? sc.maxLength = "4" : sc.maxLength = "3";
            this.SecureCodeLength(sc.value);
        },
        ToggleValidMessage: function () {
            let lbl = document.getElementById("noValid");
            let val = document.getElementById('ccHidden').value;
            let cc = document.getElementById('CardNumber').value;
            let cerr = document.querySelector(".CardNumber.errorText");
            let x;
            let b = (val === "" && cc !== "");
            if (b) {
                cerr.textContent = "";
                lbl.textContent = "Please enter one these 4 Credit Card types";
            } else {
                lbl.textContent = "";
            }
        },
        SecureCodeLength(d) {
            let content = document.getElementById('scError');
            let ccType = document.getElementById('ccHidden').value;

            if (document.getElementById("SecureCode").value === "") {
                content.textContent = "";
            }
            else {

                if ((ccType === 'VI' || ccType === 'MC' || ccType === 'dc') && d.length < 3) {
                    content.textContent = 'Please enter your 3 digit secure code';
                    document.getElementById('SecureCode').style.borderColor = 'red';
                }
                if ((ccType === 'VI' || ccType === 'MC' || ccType === 'dc') && d.length === 3) {
                    content.textContent = '';
                    document.getElementById('SecureCode').style.borderColor = '#b2b8bd';
                }
                if ((ccType === 'VI' || ccType === 'MC' || ccType === 'dc') && d.length > 3) {
                    content.textContent = '';
                    document.getElementById('SecureCode').style.borderColor = '#b2b8bd';
                    document.getElementById('SecureCode').value = '';
                }
                if (ccType === 'AX' && d.length < 4) {
                    content.textContent = 'Please enter your 4 digit secure code';
                    document.getElementById('SecureCode').style.borderColor = 'red';
                }
                if (ccType === 'AX' && d.length === 4) {
                    content.textContent = '';
                    document.getElementById('SecureCode').style.borderColor = '#b2b8bd';
                }

            }
        },
        SelectCCIcon(x, y, number, ccColorArray, ccGreyArray) {
            this.StyleIcons(x, y, ccColorArray, ccGreyArray);
            document.getElementById('CardType').nextSibling.querySelector('ul').querySelectorAll('li')[number].click();
        },
        StyleIcons: function (a, b, c, d) {
            c.map(cc => cc === a ? cc.style.display = 'block' : cc.style.display = "none");
            d.map(cc => cc === b ? cc.style.display = 'none' : cc.style.display = "block");
        },
        getEnteredAmount: function () {
            var txtAmountDue = document.getElementById('Amount').value;
            if (txtAmountDue === null || txtAmountDue === '') {
                return 0;
            }

            //remove leading character
            if (isNaN(txtAmountDue[0])) {
                txtAmountDue = txtAmountDue.substring(1, txtAmountDue.length);
                txtAmountDue = txtAmountDue.replace(',', '');
            }

            //convert to double
            var parsed = parseFloat(txtAmountDue);
            return parsed;
        },
        mod10: function (number) {
            var doubled = [];
            for (var i = number.length - 2; i >= 0; i = i - 2) {
                doubled.push(2 * number[i]);
            }
            var total = 0;
            for (var i = ((number.length % 2) === 0 ? 1 : 0); i < number.length; i = i + 2) {
                total += parseInt(number[i]);
            }
            for (var i = 0; i < doubled.length; i++) {
                var num = doubled[i];
                var digit;
                while (num != 0) {
                    digit = num % 10;
                    num = parseInt(num / 10);
                    total += digit;
                }
            }

            if (total % 10 === 0) {
                return (true);
            } else {
                return (false);
            }
        },
        validateCreditCardNumber: function (ccnum) {
            var ccMsg = App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardNumber');

            var errorMessages = [];

            if (ccnum.length < 15) {
                errorMessages.push(ccMsg);
                return errorMessages;
            }
            var lowered = ccnum.toLowerCase();

            var cctype = lowered.substr(0, 2);
            var match = cctype.match(/[a-zA-Z]{2}/);
            if (!match) {
                errorMessages.push(ccMsg);
                return errorMessages;
            }

            var number = lowered.substr(2).replaceAll(" ", "");
            match = number.match(/[^0-9]/);
            if (match) {
                errorMessages.push(ccMsg);
                return errorMessages;
            }

            switch (cctype) {
                case 'vi':
                case 'mc':
                case 'ax':
                    //Mod 10 check
                    if (!this.mod10(number)) {
                        errorMessages.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardNumberInvalid'));
                        return errorMessages;
                    }
                    break;
            }
            switch (cctype) {
                case 'vi':
                    if (number[0] !== '4' || (number.length !== 13 && number.length != 16)) {
                        errorMessages.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.Visa'));
                        return errorMessages;
                    }
                    break;
                case 'mc':
                    if (number[0] !== '5' || (number.length !== 16)) {
                        errorMessages.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.Mastercard'));
                        return errorMessages;
                    }
                    break;
                case 'dc':
                    if (number[0] !== '6' || (number.length !== 16)) {
                        errorMessages.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.Discover'));
                        return errorMessages;
                    }
                    break;
                case 'ax':
                    if (number[0] !== '3' || (number.length !== 15)) {
                        errorMessages.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.AmericanExpress'));
                        return errorMessages;
                    }
                    break;
                default:
                    errorMessages.push(App.dictionary.get('tourRelated.Booking.SummaryPayment.Validations.CardTypeNotRecognized'));
                    return errorMessages;
            }
            return errorMessages;
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
                case 'Country':
                case 'CountryId':
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
            if (e.which === undefined && e.currentTarget.id !== "CountryId" && e.currentTarget.id !== "StateId") {
                this.ValidatePayForm(message, 'red');
                console.log(e.currentTarget.id, e.which);
            }
            if (e.which === 32 || e.which === 8 || e.which >= 48 || e.which >= 96 && e.which <= 105 || e.which === 0) {
                if (e.currentTarget.id) {
                    this.ValidatePayForm(message, 'red');
                }
            }

        },
        getCardTypefromCode: function (code) {
            if (code === "AX") return "{7E122C48-85F4-4523-B944-46683CF84CB9}";
            if (code === "VI") return "{3CE8FE21-A935-4E6B-9A5C-1C3894568DBC}";
            if (code === "MC") return "{7721089C-0A70-4A0B-80E5-56AD2E8AAADC}";
            if (code === "dc") return "{6C18900B-0099-49A7-AA0C-550C4BAD0811}";
        },

    }
    return paymentFormUtil;
});