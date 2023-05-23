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
         * The default agent booking context for all sites
         * booking engine
         *
         * It can be inherited by other booking context classes.
         *
         * @class agentBookingContext
         * @extends bookingContext
         * @constructor
         */

        var agentBookingContext = (function () {

            var constructor = function () {
                this.onGetBookingComplete();
                this.onTogglePackageUpgrades();
                this.onSubmitTourCustomizationsClick();
                this.onPageLoad();
            };

            return constructor;
        })();

        agentBookingContext.prototype = new BookingContext();

        agentBookingContext.prototype.travelerStep = function () {
        	return new AgentTravelerStepLayout();
        };

        agentBookingContext.prototype.onPageLoad = function () {
            domReady(function () {
                //instantiate all layouts for server side rendered components
                new StepNavigationLayout();

                //instantiate step layouts
                App.Booking.Steps = {
                	travelerStep: new AgentTravelerStepLayout(),
                    upgradesStep: new TourCustomizationsStepLayout(),
                    roomsStep: new RoomsStepLayout(),
                    tourDateStep: new TourDateStepLayout(),
                    flightStep: new FlightStepLayout(),
                    summaryStep: new AgentSummaryStepLayout()
                };
            });
        };

        return agentBookingContext;
    });