define([
    'jquery',
    'underscore',
    'app',
    'objects/booking/stepValidation/thomasCook/tcStepValidation'
], function ($, _, App, TCStepValidation) {
    /**
     * Thomas Cook agent step validation
     *
     * @class tcAgentStepValidation
     * @extends tcStepValidation
     */
    var tcAgentStepValidation = (function () {

        var constructor = function () {
        	var outerScope = this;

        	this.validateAllTravelersInfo = function () {

        		var outerScope = this;
        		var invalidTravelers = '';
        		this.sections.travelerInfo.messages = [];
        		this.sections.travelerInfo.travelerViews = [];

        		App.Booking.travelers.each(
					function (traveler) {
						var messages = traveler.validateForAgent();
						if (messages.length > 0) {
							var prevTravelerView = App.Booking.travelerListView.findByModel(traveler);
							if (prevTravelerView != null) {
								outerScope.sections.travelerInfo.travelerViews.push(prevTravelerView);
							}

							if (invalidTravelers != '') {
								invalidTravelers += ", ";
							}

							if (traveler.get('firstName') === '') {
								invalidTravelers += traveler.get('placeholderText');
							} else {
								invalidTravelers += traveler.get('firstName');
							}
						}
					});

        		if (invalidTravelers.length > 0) {
        			var requiredFieldsText = App.dictionary.get('tourRelated.Booking.TravelerInfo.RequiredFields');
        			this.sections.travelerInfo.messages.push(requiredFieldsText + " " + invalidTravelers);
        			return false;
        		}

        		return true;
        	};

            this.sections = {
                tourDate: {
                    id: "{8541D930-AD04-4721-ABF5-9BDB3B63D923}",
                    validateStep: function () {
                        return true;
                    },
                    messages: []
                },
                roomingAndTravelers: {
                    id: "{11DA0602-3B68-4BA3-822F-93C4BA1E77E1}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        return validateTourDate;
                    },
                    messages: []
                },
                tourCustomizations: {
                    id: "{DD9D589D-E3F0-4A95-96F6-813510DA3E33}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        var validateRooms = outerScope.validateRooms();
                        return validateRooms && validateTourDate;
                    },
                    messages: []
                },
                flightsAndProtection: {
                    id: "{EFC30896-C458-4AC3-8DE6-6D1B7E2020CF}",
                    validateStep: function () {
                        var validateTourDate = outerScope.validateTourDate();
                        var validateRooms = outerScope.validateRooms();
                        var validateCustomizations = outerScope.validateTourCustomizations();
                        return validateRooms && validateTourDate && validateCustomizations;
                    },
                    messages: []
                },
                travelerInfo: {
                    id: "{9331ABF2-1BDF-43A9-BFFE-A4DF102FC2C5}",
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
                    id: "{DCC905AC-B75B-4FAF-A5EF-5F612383F937}",
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

    tcAgentStepValidation.prototype = new TCStepValidation();
    return tcAgentStepValidation;
});