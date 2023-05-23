define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'event.aggregator',
    'renderedLayouts/booking/steps/ca/CANTravelerStepLayout',
    'objects/booking/context/bookingContext',
    'collections/booking/travelerInformation/ca/CANTravelerCollection'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, CANTravelerStepLayout, BookingContext, CANTravelerCollection) {
        /**
         * @extends bookingContext
         * @class caBookingContext
         */
        var caBookingContext = (function () {

            var constructor = function () {
            };

            return constructor;
        })();

        caBookingContext.prototype = new BookingContext();

        caBookingContext.prototype.setTravelers = function (booking) {
			if (!(App.Booking.travelers.length > 0)) {
				App.Booking.travelers = new CANTravelerCollection();
				App.Booking.travelers.setTravelers(booking.get('travelers'));
			}
		};

        /**
         * Overrides base traveler step
         *
         * @method travelerStep
         * returns void
         */
        caBookingContext.prototype.travelerStep = function () {
			return new CANTravelerStepLayout();
		};

        return caBookingContext;
    });