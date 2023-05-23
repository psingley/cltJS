define([
    'jquery',
    'underscore',
    'backbone',
    'App',
    'models/booking/travelerInformation/ContactInfoModel',
    'util/dataLayerUtil',
    'util/validationUtil',
    'util/objectUtil',
], function ($, _, Backbone, App, ContactInfoModel, DataLayerUtil, ValidationUtil, ObjectUtil) {

    var travelerUtil = {
        ValidationStation: function (formfield, classname) {
            try {
                if (classname.includes('country')) { formfield = 'country'; }
                if (classname.includes('state')) { formfield = 'state'; }
                let countryId = document.getElementById('travelerInformationContent').querySelectorAll('.countryId');

                const color = "#b2b8bd";
                const errorcolor = "red";
                const el = document.getElementById('travelerInformationContent');
                let field;
                let field2;
                let message;
                let msgField;
                let msgField2;
                let visablefield;

                    switch (formfield) {
                        case "firstName":
                        case "lastName":
                        case "address1":
                        case "city":
                            field = el.querySelectorAll(`input[name=${formfield}]`);
                            msgField = el.querySelectorAll(`.${formfield}.errorText`);
                            if (formfield === "firstName") { message = App.dictionary.get('common.FormValidations.FirstName'); }
                            else if (formfield === "lastName") { message = App.dictionary.get('common.FormValidations.LastName'); }
                            else if (formfield === "address1") { message = App.dictionary.get('common.FormValidations.Address'); }
                            else if (formfield === "city") { message = App.dictionary.get('common.FormValidations.City'); }
                            field.forEach((c, i) => {
                                if (c.value.trim() === "") {
                                    c.style.borderColor = errorcolor;
                                    if (msgField[i])
                                        msgField[i].textContent = message;
                                } else {
                                    msgField[i].textContent = "";
                                    c.style.borderColor = color;
                                }
                            });
                            break;
                        case "middleInitial":
                            field = el.querySelectorAll(`input[name=${formfield}]`);
                            msgField = document.querySelectorAll(`.${formfield}.errorText`);
                            field.forEach((c, x) => {
                                //test to make sure it is numeric!/^[a-z]+$/i.test(middleInitial)
                                console.log(c.value);
                                if (!/^[A-Za-z0-9'-]*$/.test(c.value)) {
                                    msgField[x].textContent = App.dictionary.get('common.FormValidations.MiddleInitialAlpha');
                                    c.style.borderColor = errorcolor;
                                }
                                else {
                                    msgField[x].textContent = "";
                                    c.style.borderColor = color;
                                }
                            });
                            break;
                        case 'gender':
                            msgField = el.querySelectorAll('.new_select.genderDropDown .current');
                            field = document.querySelectorAll(".gender.errorText");
                            message = App.dictionary.get('common.FormValidations.Gender');
                            field.forEach((c, i) => {
                                if (msgField[i].querySelector('a').textContent === 'Select One') {
                                    c.textContent = message;
                                    msgField[i].style.borderColor = errorcolor;
                                } else {
                                    c.textContent = "";
                                    msgField[i].style.borderColor = color;
                                }
                            });
                            break;
                        case 'year':
                        case 'month':
                        case 'day':
                            field = el.querySelectorAll(`input[name=${this.msgInputs[formfield]}]`);
                            msgField = document.querySelectorAll(`.${this.msgInputs[formfield]}.errorText`);
                            field.forEach((c, i) => {
                                msgField[i].textContent = this.validateDateOfBirth(formfield, c.value);
                                this.ToggleBorderColor(c, msgField[i].textContent);
                            });
                            break;
                        case 'phone':
                        case 'mobile':
                            field = el.querySelectorAll(`input[name=${formfield}]`);
                            msgField = document.querySelectorAll(`.${formfield}.errorText`);
                            field.forEach((c, i) => {
                                if (formfield === 'mobile' && c.value === "") {
                                    msgField[i].textContent = "";
                                    this.ToggleBorderColor(c, msgField[i].textContent);
                                    return;
                                }
                                if (msgField[i]) {
                                    msgField[i].textContent = ValidationUtil.validatePhoneNumber(c.value);
                                    this.ToggleBorderColor(c, msgField[i].textContent);
                                }
                            });
                            break;
                        case 'state':
                        case 'country':
                            field = formfield === 'state' ? el.querySelectorAll('input.stateId') : el.querySelectorAll('input.countryId');
                            visablefield = el.querySelectorAll(`.${formfield}.req`);
                            msgField = document.querySelectorAll(`.${formfield}.errorText`);
                            message = formfield === 'state' ? App.dictionary.get('common.FormValidations.State') : App.dictionary.get('common.FormValidations.Country');

                            field.forEach((c, i) => {
                                if (msgField[i]) {
                                    msgField[i].textContent = c.value === "" ? msgField[i].textContent = message : msgField[i].textContent = "";
                                    this.ToggleBorderColor(visablefield[i], msgField[i].textContent);
                                    if (formfield === 'state') {
                                        el.querySelectorAll('.state.errorText.ui-autocomplete-input')[i].style.border = '0';
                                    }
                                    if (formfield === 'country') {
                                        el.querySelectorAll('.country.errorText.ui-autocomplete-input')[i].style.border = '0';
                                    }
                                }
                            });
                            break;
                        case 'email':
                        case 'confirmEmail':
                            field = el.querySelectorAll('input[name=email]');
                            field2 = el.querySelectorAll('input[name=confirmEmail]');
                            msgField = document.getElementById('travelerInformationContent').querySelectorAll('.email.errorText');
                            msgField2 = document.getElementById('travelerInformationContent').querySelectorAll('.confirmEmail.errorText');
                            field.forEach((c, i) => {
                                if (msgField[i] && msgField2[i]) {
                                    msgField[i].textContent = ValidationUtil.validateEmail(c.value);
                                    msgField2[i].textContent = ValidationUtil.validateEmail(field2[i].value);
                                    this.ToggleBorderColor(c, msgField[i].textContent);
                                    this.ToggleBorderColor(field2[i], msgField2[i].textContent);
                                    if (msgField[i].textContent === "" && msgField2[i].textContent === "") {
                                        msgField2[i].textContent = ValidationUtil.validateEmailConfirmEmail(c.value, field2[i].value);
                                    }
                                }
                            });

                            break;
                        case 'zipCode':
                            field = el.querySelectorAll(`input[name=${formfield}]`);
                            msgField = document.querySelectorAll('.zipCode.errorText');
                            field.forEach((c, i) => {
                                msgField[i].textContent = ValidationUtil.validateZip(c.value, countryId[i].value);
                                this.ToggleBorderColor(c, msgField[i].textContent);
                            });
                            break;
                        default:
                            break;
                    }
                } catch (ee) {
                    console.log(ee);
            }

           },
           ToggleBorderColor: function (formfield, messagefield) {
            const color = "#b2b8bd";
            const errorcolor = "red";
            try {
                formfield.style.borderColor = messagefield !== '' ? formfield.style.borderColor = errorcolor : formfield.style.borderColor = color;
            } catch(err) {
                console.log(formfield, messagefield,err.error) }
            },

        msgInputs: {
            "first": 'firstName',
            "last": 'lastName',
            "day": 'day',
            "month": 'month',
            "year": "year",
            "phone": "phone",
            "confirmation": 'confirmEmail',
            "address": 'address1',
            "gender": 'new_select',
            "state": 'state',
            "province" : 'state',
            "city": 'city',
            "zip": "zipCode",
            "postal": "zipCode",
            "country":"country"
        },
        
        FillPartialContact: function () {
            let qs1 = document.querySelectorAll('.aTraveler');
            qs1.forEach(function (element, index) {
                if (document.querySelectorAll('.guestName')) {
                    let i = index + 1;
                    document.querySelectorAll('.guestName')[index].textContent = "Guest " + i;
                }
            })
            if (localStorage.getItem('newContacts')) {
                qs1.forEach(function (element, index) {
                    if (JSON.parse(localStorage.getItem('newContacts'))[index]) {
                        document.querySelectorAll('input.firstTravelerName')[index].value = JSON.parse(localStorage.getItem('newContacts'))[index].Firstname;
                        document.querySelectorAll('input.lastTravelerName')[index].value = JSON.parse(localStorage.getItem('newContacts'))[index].Lastname;
                        document.querySelectorAll('input.emailTravelerName')[index].value = JSON.parse(localStorage.getItem('newContacts'))[index].Email.trim();
                    }

                })
            }
        },

        FillPartialTraveler: function () {
            try {
                let qs1 = document.querySelectorAll("input[name='firstName']");
                if (localStorage.getItem('newContacts')) {
                    qs1.forEach(function (element, index) {
                        if (JSON.parse(localStorage.getItem('newContacts'))[index]) {
                            document.querySelectorAll("input[name='firstName']")[index].value = JSON.parse(localStorage.getItem('newContacts'))[index].Firstname;
                            document.querySelectorAll("input[name='lastName']")[index].value = JSON.parse(localStorage.getItem('newContacts'))[index].Lastname;
                            document.querySelectorAll(".form-group .email")[index].value = JSON.parse(localStorage.getItem('newContacts'))[index].Email.trim();
                        }

                    })
                }
            } catch (error) {
                console.log(error.message);
            }
        },
        SetRequired: function () {
            let qs1 = document.querySelectorAll('.aTraveler');
            qs1.forEach(function (element, index) {
                if (index > 0) {
                    document.querySelectorAll('input.emailTravelerName')[index].required = "";
                    document.querySelectorAll('input.emailTravelerName')[index].parentElement.parentElement.querySelector('h4').textContent =
                        document.querySelectorAll('input.emailTravelerName')[index].parentElement.parentElement.querySelector('h4').textContent.replace("*", '');
                }
            });
        },
        ValidateBlur: function (e) {
            if (e.currentTarget.required) {
                if (!e.currentTarget.validity.valid || !e.currentTarget.value.trim().length) {
                    e.target.style.borderColor = "red";
                    let el = e.target.closest('.aTraveler').querySelector('span.' + e.target.className);
                    if (e.currentTarget.validity.typeMismatch) {
                        el.textContent = el.dataset.email;
                    }
                    else {
                        el.textContent = el.dataset.message;
                    }
                    //document.querySelector(".validationMessages ul li").textContent += el.dataset.message;

                }
                else {
                    e.target.style.borderColor = '';
                    
                    let el = e.target.closest('.aTraveler').querySelector('span.' + e.target.className);
                    el.textContent = '';

                }
                return true;
            }

        },
        ValidateSubmit: function () {
            const contactsForm = document.querySelectorAll(".travelersListContent input[required]");
            let lgth = contactsForm.length;
            let l = 0;
            errorMessages = [];
            contactsForm.forEach(function (element) {
                if (!element.validity.valid) {
                    element.style.borderColor = "red";
                    let el = element.closest('.aTraveler').querySelector('span.' + element.className);
                    if (element.validity.typeMismatch) {
                        el.textContent = el.dataset.email;
                    }
                    else {
                        el.textContent = el.dataset.message;
                    }
                    //document.querySelector(".validationMessages ul li").textContent += el.dataset.message;
                    if (l <= lgth) l++;
                    errorMessages.push(el.dataset.message);
                }
                else {
                    element.style.borderColor = '';
                    let el = element.closest('.aTraveler').querySelector('span.' + element.className);
                    el.textContent = '';
                }
        
            });

            if (l === 0) {
                return true;
            }
            else {
                DataLayerUtil.ErrorMessages("Client-side validation", errorMessages)
                return false;
            }
        },
        ValidateContactInfo: function () {
            const contactsForm = document.querySelectorAll(".form-control input[required]");
            let lgth = contactsForm.length;
            let l = 0;
            contactsForm.forEach(function (element) {
                if (!element.validity.valid) {
                    element.style.borderColor = "red";
                    let el = element.closest('.aTraveler').querySelector('li.' + element.className);
                    //document.querySelector(".validationMessages ul li").textContent += el.dataset.message;
                    if (l <= lgth) l++;
                    errorMessages.push(el.dataset.message);
                }
                else {
                    element.style.borderColor = '';
                }

            });

            if (l === 0) {
                return true;
            }
            else {
                DataLayerUtil.ErrorMessages("Client-side validation", errorMessages)
                return false;
            }
        },

        AddNewContacts: function (el, firstname, lastname, email) {
            let newcontacts = [];
            let qs1 = document.querySelectorAll(el);
            qs1.forEach(function (element, index) {
                try {
                    newcontacts.push({
                        'Firstname': document.querySelectorAll(firstname)[index].value,
                        'Lastname': document.querySelectorAll(lastname)[index].value,
                        'Email': document.querySelectorAll(email)[index].value.trim(),
                    });
                } catch (err) {
                    console.log(err.error)
                }
            })
            localStorage.newContacts = JSON.stringify(newcontacts);
        },
        validateDateOfBirth: function (key, value) {
            var day;
            var month;
            var year;
            var currentYear = new Date().getFullYear();
            var errorMessages = [];
            if (key === 'month') {
                month = value;
                if (month === null || month === 0 || month === "") {
                    errorMessages.push(App.dictionary.get('common.FormValidations.DOBMonthRequired'));

                } else if (!/^[0-9]+$/.test(month)) {
                   errorMessages.push(App.dictionary.get('common.FormValidations.DateOfBirthMonth'));

                } else if (month > 12) {
                   errorMessages.push(App.dictionary.get('common.FormValidations.DOBMonthGreaterThan'));

                }
            }
            if (key === 'day') {
                day = value;
                if (day === null || day === 0 || day === "") {
                    errorMessages.push(App.dictionary.get('common.FormValidations.DOBDayRequired'));

                } else if (!/^[0-9]+$/.test(day)) {
                    errorMessages.push(App.dictionary.get('common.FormValidations.DateOfBirthDay'));

                } else if (day > 31) {
                   errorMessages.push(App.dictionary.get('common.FormValidations.DOBDayGreaterThan'));

                }
            }

            if (key === 'year') {
                year = value;
                if (year === null || year === 0 || year === "") {
                    errorMessages.push(App.dictionary.get('common.FormValidations.DOBYearRequired'));
                

                } else if (!/^[0-9]+$/.test(year) || year.length < 4) {
                    errorMessages.push(App.dictionary.get('common.FormValidations.DateOfBirthYear'));
                   

                } else if (year > currentYear) {
                    errorMessages.push(App.dictionary.get('common.FormValidations.DOBYearGreaterThan'));
                  
                }
            }
            return errorMessages;
        },
        clearForm: function () {
            document.getElementById('Fullname').value = '';
            document.getElementById('Address1').value = '';
            document.getElementById('Address2').value = '';
            document.getElementById('City').value = '';
            document.getElementById('Zip').value = '';
            document.getElementById('State').value = '';
            document.getElementById('StateId').value = '';
            document.getElementById('Country').value = '';
            document.getElementById('CountryId').value = '';
            document.getElementById('hPackageDateId').value = '';
            document.getElementById('CardNumber').value = '';
            document.getElementById('SecureCode').value = '';
            document.getElementById('paymentForm').querySelectorAll('.current a')[1].textContent = 'Month';
            document.getElementById('paymentForm').querySelectorAll('.current a')[2].textContent = 'Year';
        },
        showIATA: function () {
            let included = document.getElementById("flightTotal");
            let divIATA = document.querySelectorAll(".divIATA");
            if (included) {
                if (included.textContent === "Included") {
                    divIATA.forEach(el => el.style.display = "block");
                }
                else {
                    divIATA.forEach(el => el.style.display = "none");
                }
            }
        },
        validateIATA: function () {
            let ddiata = document.getElementById("ddIATA");
            if (ddiata) {
                ddiata = ddiata.value;
                console.log(ddiata);
            }
        }
    }
    return travelerUtil;
}); 