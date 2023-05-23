define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'views/validation/ErrorView',
    'objects/booking/stepValidation/baseStepValidation'
], function ($, _, Backbone, Marionette, App, ObjectUtil, ErrorView, BaseStepValidation) {
    /**
     * Thomas Cook Step Validation
     *
     * @class tcStepValidation
     * @extends baseStepValidation
     */
    var tcStepValidation = (function () {

        var constructor = function () {

            this.validateFlightsAndProtections = function () {
                this.sections.flightsAndProtection.messages = [];

                var flightStepLayout = App.Booking.Steps['flightStep'];
                if (flightStepLayout.getAddAir()) {
                    //if add air is selected make sure that there was a selection made for sedan service
                    if(flightStepLayout.sedanService.isActive()){
                        var $sedanServiceSelection = flightStepLayout.sedanService.getSedanServiceSelection();
                        if ($sedanServiceSelection.length === 0) {
                            var sedanSelectionText = App.dictionary.get('tourRelated.Booking.FlightsProtection.SedanService.Selectionforsedanservice');
                            this.sections.flightsAndProtection.messages.push(sedanSelectionText);
                        }
                    }

                    //make sure that a flight was selected
                    if (!App.Booking.scheduleDefault) {
                        var schedule = flightStepLayout.getSchedule();
                        if (schedule === null) {
                            var flightSelectionText = App.dictionary.get('tourRelated.Booking.FlightsProtection.SelectaFlight');
                            this.sections.flightsAndProtection.messages.push(flightSelectionText);
                        }
                    }
                }

                //if (App.siteSettings.includeInterAirPrice && App.Booking.inTourFlightsExist && !App.Booking.airSearchDone) {
                //    var interAirFlightSelectionText = App.dictionary.get('tourRelated.Booking.FlightsProtection.SelectaFlight');
                //    this.sections.flightsAndProtection.messages.push(interAirFlightSelectionText);
                //}

                if (this.sections.flightsAndProtection.messages.length > 0) {
                    return false;
                }

                return true;
            };
        };
        return constructor;
    })();

    tcStepValidation.prototype = new BaseStepValidation();
    return tcStepValidation;
});