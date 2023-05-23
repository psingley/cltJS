define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'event.aggregator',
    'util/uriUtil',
    'util/objectUtil',
    'renderedLayouts/booking/StepNavigationLayout',
    'services/bookingService',
    'views/booking/rooms/RoomListView',
    'renderedLayouts/booking/steps/RoomsStepLayout',
    'renderedLayouts/booking/steps/TourDateStepLayout',
    'util/booking/bookingUtil',
    'renderedLayouts/booking/steps/SummaryStepLayout',
    'renderedLayouts/booking/steps/TourCustomizationsStepLayout',
    'renderedLayouts/booking/steps/thomasCook/TCTravellerStepLayout',
    'renderedLayouts/booking/steps/FlightStepLayout',
    'objects/booking/context/bookingContext',
    'collections/booking/travelerInformation/thomasCook/TCTravellerCollection'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, UriUtil, ObjectUtil, StepNavigationLayout, BookingService, RoomListView, RoomsStepLayout, TourDateStepLayout, BookingUtil, SummaryStepLayout, TourCustomizationsStepLayout, TCTravellerStepLayout, FlightStepLayout, BookingContext, TCTravellerCollection) {
        /**
         * @extends bookingContext
         * @class tcBookingContext
         */
        var tcBookingContext = (function () {

            var constructor = function () {
            };

            return constructor;
        })();

        tcBookingContext.prototype = new BookingContext();

        tcBookingContext.prototype.setTravelers = function (booking) {
        	if (!(App.Booking.travelers.length > 0)) {
				App.Booking.travelers = new TCTravellerCollection();
				App.Booking.travelers.setTravelers(booking.get('travelers'));
			}
        };

        /**
         * Overrides base summary step
         *
         * @method summaryStep
         * returns void
         */
        tcBookingContext.prototype.travelerStep = function () {
			return new TCTravellerStepLayout();
		};

        return tcBookingContext;
    });