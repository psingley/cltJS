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
    'renderedLayouts/booking/steps/TravelerStepLayout',
    'renderedLayouts/booking/steps/FlightStepLayout',
    'objects/booking/context/thomasCook/tcBookingContext'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, UriUtil, ObjectUtil, StepNavigationLayout, BookingService, RoomListView, RoomsStepLayout, TourDateStepLayout, BookingUtil, AgentSummaryStepLayout, TourCustomizationsStepLayout, TravelerStepLayout, FlightStepLayout, TCBookingContext) {
        /**
         * @extends tcBookingContext
         * @class tcConsumerBookingContext
         */
        var tcConsumerBookingContext = (function () {

            var constructor = function () {
                this.onGetBookingComplete();
                this.onTogglePackageUpgrades();
                this.onSubmitTourCustomizationsClick();
                this.onPageLoad();
            };

            return constructor;
        })();

        tcConsumerBookingContext.prototype = new TCBookingContext();
        return tcConsumerBookingContext;
    });