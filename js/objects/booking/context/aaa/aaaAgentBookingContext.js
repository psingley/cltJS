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
    'renderedLayouts/booking/steps/agents/AgentSummaryStepLayout',
    'renderedLayouts/booking/steps/TourCustomizationsStepLayout',
    'renderedLayouts/booking/steps/agents/AgentTravelerStepLayout',
    'renderedLayouts/booking/steps/FlightStepLayout',
    'objects/booking/context/bookingContext'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, UriUtil, ObjectUtil, StepNavigationLayout,
		BookingService, RoomListView, RoomsStepLayout, TourDateStepLayout, BookingUtil, AgentSummaryStepLayout,
		TourCustomizationsStepLayout, AgentTravelerStepLayout, FlightStepLayout, BookingContext) {

        /**
         * @extends bookingContext
         * @class aaaAgentBookingContext
         * @constructor
         */
        var aaaAgentBookingContext = (function () {

            var constructor = function () {
                this.onGetBookingComplete();
                this.onTogglePackageUpgrades();
                this.onSubmitTourCustomizationsClick();
                this.onPageLoad();
            };

            return constructor;
        })();

        aaaAgentBookingContext.prototype = new BookingContext();

		 /**
		 * Sets the traveler booking step
		 *
		 * @method travelerStep
		 * @type renderedLayouts.booking.steps.TravelerStepLayout
		 */
        aaaAgentBookingContext.prototype.travelerStep = function () {
        	return new AgentTravelerStepLayout();
        };

        /**
         * Overrides base summary step
         *
         * @method summaryStep
         */
        aaaAgentBookingContext.prototype.summaryStep = function () {
	        return new AgentSummaryStepLayout();
        };

        return aaaAgentBookingContext;
    });