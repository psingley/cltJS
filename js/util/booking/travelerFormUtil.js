define([
    'jquery',
    'underscore',
    'app',
    'backbone',
    'marionette',
    'util/objectUtil',
    'views/validation/ErrorView'
], function ($, _, App, Backbone, Marionette, ObjectUtil,ErrorView) {
    var travelerFormUtil = function (travelerId) {


        var infoContainer = $('#' + travelerId + '.traveler_info');

        this.showInfoContainer = function () {
            var header = infoContainer.prevAll('.header');
            var isClosed = header.find('a.arrow_down').hasClass('close');
            if (isClosed) {
                header.click();
            }
        };

        this.getFirstName = function () {

            return infoContainer.find('input[name=firstName]').val();
        };

        this.getLastName = function () {

            return infoContainer.find('input[name=lastName]').val();
        };

        this.getConfirmEmail = function () {
            return infoContainer.find('input[name=confirmEmail]').val();
        };

        this.getEmail = function () {
            return infoContainer.find('input[name=email]').val();
        };

        //get phone number
        this.getPhoneNumber = function () {
            return infoContainer.find('input.large.phone').val();
        };
        //get phone number
        this.validatePhoneNumber = function () {

            var phone = this.getPhoneNumber();
            if (ObjectUtil.isNullOrEmpty(phone)) {
                return false;
            }

            if (phone.length < 10) {
                return false;
            }

            //get only digits
            var phone = phone.match(/[0-9]+/g);

            if (phone == null) {
                return false;
            }

            //join the digits
            phone = phone.join('');

            //lets check if it's numbers only
            if (isNaN(phone) || phone.length < 10) {
                return false;
            } else {
                return true;
            }

        };

        //validate email address fields
        this.validateEmail = function () {
            var errorMessages = [];

            var email = this.getEmail();
            var confirmEmail = this.getConfirmEmail();

            //validation messages
            var requiredEmail = App.dictionary.get('common.FormValidations.Email-Required');
            var requiredInvalidEmail = App.dictionary.get('common.FormValidations.Email-IsValid');
            var requiredEmailsMatch = App.dictionary.get('common.FormValidations.Email-Match');
            var requiredConfirmEmail = App.dictionary.get('common.FormValidations.Email-ConfirmRequired');

            //verify the email has been entered
            if (email == null || email == '') {
                errorMessages.push(requiredEmail);
                return errorMessages;
            }

            if (!this.isEmailAddress(email)) {
                ///verify email is a valid email address
                errorMessages.push(requiredInvalidEmail);
            } else if (confirmEmail == null || confirmEmail == '') {
                //is the confirm email filled out?
                errorMessages.push(requiredConfirmEmail);
            } else if (confirmEmail != email) {
                //does the confirm email match the email field?
                errorMessages.push(requiredEmailsMatch);
            }

            return errorMessages;
        };

        this.isEmailAddress = function (email) {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return (true);
            }
            return (false);
        };

        //get gender
        this.getGender = function () {

            //get the phone
            return infoContainer.find(".genderDropDown.travelerInput option:selected").data('id');
        };

        //validate gender
        this.validateGender = function () {
            var gender = this.getGender();
            return !ObjectUtil.isNullOrEmpty(gender);

        };

        //get birthday month
        this.getDateOfBirthMonth = function () {
            return infoContainer.find("select.piDateOfBirthMonth").val();
        };

        //validate birthday month
        this.validateDateOfBirthMonth = function () {
            var month = this.getDateOfBirthMonth();
            return ObjectUtil.isNullOrEmpty(month) || isNaN(month) || month < 1 || month > 12 ? false : true;
        };

        //get birthday day
        this.getDateOfBirthDay = function () {
            return infoContainer.find("input.piDateOfBirthDay").val();
        };

        //get birthday day
        this.validateDateOfBirthDay = function () {
            var day = this.getDateOfBirthDay();
            if (isNaN(day)) {
                return false;
            }

            return (ObjectUtil.isNullOrEmpty(day) || day < 1 || day > 31) ? false : true;

        };

        //get birthday Year
        this.getDateOfBirthYear = function () {
            return infoContainer.find("input.piDateOfBirthYear").val();
        };

        //validate birthday Year
        this.validateDateOfBirthYear = function () {
            var year = this.getDateOfBirthYear();

            if (isNaN(year)) {
                return false;
            }

            var currentDate = new Date();
            return (ObjectUtil.isNullOrEmpty(year) || year < 1900 || year > currentDate.getFullYear()) ? false : true;
        };

        //get dateOfBirth
        this.getDateOfBirth = function () {
            var month = this.getDateOfBirthMonth();
            var day = this.getDateOfBirthDay();
            var year = this.getDateOfBirthYear();
            var dobString = month + "/" + day + "/" + year;
            return new Date(dobString);
        };

        //get age
        this.getAge = function () {
            var today = new Date();
            var dateOfBirth = this.getDateOfBirth();
            var age = today.getFullYear() - dateOfBirth.getFullYear();
            var month = today.getMonth() - dateOfBirth.getMonth();
            if (month < 0 || (month === 0 && today.getDate() < dateOfBirth.getDate())) {
                age--;
            }
            return age;
        }

        this.validateTravelerInfo = function () {

            var errorMessages = [];
            return errorMessages;
        };


        //show error message
        this.displayErrorMessages = function (errorMessages) {
            this.clearErrorMessages();
            this.getErrorRegion().show(new ErrorView(errorMessages));
        };

        //clear error message
        this.clearErrorMessages = function () {
            $('#' + travelerId + ' .travelerErrorMessages').html('');
        };

        //clear errors message
        this.getErrorRegion = function () {

            var errorMessagesRegionObj = $('#' + travelerId + ' .travelerErrorMessages');
            var errorMessagesRegion = new Backbone.Marionette.Region({
                el: errorMessagesRegionObj
            });

            return errorMessagesRegion;
        };
    };
    return travelerFormUtil;
});