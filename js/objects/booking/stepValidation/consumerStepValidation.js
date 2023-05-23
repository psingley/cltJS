define([
    'jquery',
    'underscore',
    'app',
    'objects/booking/stepValidation/baseStepValidation'
], function ($, _, App, BaseStepValidation) {
    /**
     * Step validation class for consumers.
     *
     * @class consumerStepValidation
     * @extends baseStepValidation
     */
    var consumerStepValidation = (function () {

        var constructor = function () {
            var outerScope = this;
            this.sections = {

                tourDate: {
                    id: "{DE965514-32F1-4785-B79B-B2446A07E4DB}",
                    validateStep: function () {
                        return true;
                    },
                    messages: []
                },
                roomingAndTravelers: {
                    id: "{D2D203ED-B780-4592-A2F1-20A526F2F13C}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        return validateTourDate;
                    },
                    messages: []
                },
                tourCustomizations: {
                    id: "{59CA50F9-25D7-4DAE-A361-52122650648E}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        var validateRooms = outerScope.validateRooms();
                        return validateRooms && validateTourDate;
                    },
                    messages: []
                },
                flightsAndProtection: {
                    id: "{A049991B-A8C0-4EB5-AE65-B5185C28492F}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        var validateRooms = outerScope.validateRooms();
                        var validateCustomizations = outerScope.validateTourCustomizations();
                        return validateRooms && validateTourDate && validateCustomizations;
                    },
                    messages: []
                },
                travelerInfo: {
                    id: "{20A91AE4-C440-4208-88C0-0349E38FC2EC}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        var validateRooms = outerScope.validateRooms();
                        var validateCustomizations = outerScope.validateTourCustomizations();
                        var validateFlights = outerScope.validateFlightsAndProtections();
                        return validateRooms && validateTourDate && validateCustomizations && validateFlights;
                    },
                    messages: [],
                    travelerViews: []
                },
                summaryAndPayment: {
                    id: "{8D956464-6B77-4EA2-8A3C-643AF8E458DF}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        var validateRooms = outerScope.validateRooms();
                        var validateAllTravelersInfo = outerScope.validateAllTravelersInfo();
                        var validateFlights = outerScope.validateFlightsAndProtections();
	                    return validateRooms && validateTourDate && validateAllTravelersInfo && validateFlights;
                    }
                }
            };
        };

        return constructor;
    })();

    consumerStepValidation.prototype = new BaseStepValidation();
    return consumerStepValidation;
});