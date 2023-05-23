define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'util/objectUtil',
    'models/booking/travelerInformation/ContactInfoModel',
    'models/booking/travelerInformation/AdditionalInfoModel'
], function ($, _, Backbone, App, ObjectUtil, ContactInfoModel, AdditionalInfoModel) {
    var TravelerModel = Backbone.Model.extend({
        defaults: {
            id: null,
            firstName: '',
            lastName: '',
            middleInitial: '',
            suffix: null,
            salutation: null,
            gender: null,
            month: null,
            day: null,
            year: null,
            dateOfBirth: new Date(),
            passengerType: null,
            price: 0,
            interAirPrice: 0,
            placeholderText: '',
            contactInfo: new ContactInfoModel(),
            additionalInfo: new AdditionalInfoModel(),
            aaaExcursionDiscount: 75
        },
       getDateOfBirth: function () {
            if (this.get('month') == null || this.get('day') == null || this.get('year') == null) {
                return null;
            }

            if (this.get('month') == 0 || this.get('day') == 0 || this.get('year') == 0) {
                return null;
            }

            return new Date(this.get('year'), this.get('month') - 1, this.get('day'));
        },
        getTravelerRoom: function () {
            var room = App.Booking.rooms.find(function (traveler) {
                var roomTravelerIds = room.get('travelerIds');
                var isInRoom = $.inArray(traveler.get('id'), roomTravelerIds) > -1;
                return isInRoom;
            });

            if (room === undefined) {
                console.log('could not find a room for this traveler');
                return null;
            }

            return room;
        },
        errorMessages: null,
        validate: function () {
            this.errorMessages = this.validateForAgent();

            var contactInfoMessages = this.get('contactInfo').validate();
            this.errorMessages = this.errorMessages.concat(contactInfoMessages);

            return this.errorMessages;
        },
        validateForAgent: function () {
            this.errorMessages = [];
            var firstName = this.get('firstName');
            
            if (ObjectUtil.isNullOrEmpty(firstName.trim())) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.FirstName'));
            }
            try {
                
                var lastName = this.get('lastName');
                if (ObjectUtil.isNullOrEmpty(lastName.trim())) {
                    this.errorMessages.push(App.dictionary.get('common.FormValidations.LastName'));
                }
                //var lastName = document.querySelectorAll('input[name=lastName]');
                //lastName.forEach(function (element, index) {
                //    console.log("LAST NAME: " + lastName[index].value.trim());
                //    if (ObjectUtil.isNullOrEmpty(lastName[index].value.trim())) {
                //        this.errorMessages.push(App.dictionary.get('common.FormValidations.LastName'));
                //    }
                //});
            } catch (e) { console.log(e.message) }

            var middleInitial = this.get('middleInitial');
            if (!ObjectUtil.isNullOrEmpty(middleInitial)) {
                //test to make sure it is numeric
                if (!/^[A-Za-z0-9'-]*$/.test(middleInitial)) {
                    this.errorMessages.push(App.dictionary.get('common.FormValidations.MiddleInitialAlpha'));
                }
            }

            //gender
            var gender = this.get('gender');
            if (ObjectUtil.isNullOrEmpty(gender)) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.Gender'));
            }

            //dob
            this.validateDateOfBirth();

            return this.errorMessages;
        },
        validateDateOfBirth: function () {
            var day = this.get('day');
            var month = this.get('month');
            var year = this.get('year');
            var currentYear = new Date().getFullYear();

            var valid = true;
            if (month === null || month === 0) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBMonthRequired'));
                valid = false;
            } else if (!/^[0-9]+$/.test(month)) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DateOfBirthMonth'));
                valid = false;
            } else if (month > 12) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBMonthGreaterThan'));
                valid = false;
            }

            if (day === null || day === 0) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBDayRequired'));
                valid = false;
            } else if (!/^[0-9]+$/.test(day)) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DateOfBirthDay'));
                valid = false;
            } else if (day > 31) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBDayGreaterThan'));
                valid = false;
            }

            if (year === null || year === 0) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBYearRequired'));
                valid = false;
            } else if (!/^[0-9]+$/.test(year) || year.length < 4) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DateOfBirthYear'));
                valid = false;
            } else if (year > currentYear) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBYearGreaterThan'));
                valid = false;
            }

            if (!valid) {
                return;
            }

            var date = this.getDateOfBirth();
            if (date == null) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOB'));
            }

            if (date > new Date()) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBCurrentDate'));
            }

            if (date < new Date('1900', '00', '02')) {
                this.errorMessages.push(App.dictionary.get('common.FormValidations.DOBLessThan'));
            }

            this.set('dateOfBirth', date);
        }
    });

    return TravelerModel;
});