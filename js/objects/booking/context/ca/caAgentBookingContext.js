define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'event.aggregator',
    'util/uriUtil',
    'util/objectUtil',
    'objects/booking/context/ca/caBookingContext',
    'renderedLayouts/booking/steps/agents/AgentTravelerStepLayout',
    'renderedLayouts/booking/steps/agents/AgentSummaryStepLayout'
],
    function (domReady, App, $, Backbone, Marionette, EventAggregator, UriUtil, ObjectUtil, CaBookingContext,
		AgentTravelerStepLayout, AgentSummaryStepLayout) {
        /**
         * @extends BookingContext
         * @class caAgentBookingContext
         */
        var caAgentBookingContext = (function () {

            var constructor = function () {
                this.onGetBookingComplete();
                this.onTogglePackageUpgrades();
                this.onSubmitTourCustomizationsClick();
                this.onPageLoad();
            };

            return constructor;
        })();

        caAgentBookingContext.prototype = new CaBookingContext();

        caAgentBookingContext.prototype.travelerStep = function () {
        	return new AgentTravelerStepLayout();
        };

        caAgentBookingContext.prototype.summaryStep = function () {
	        return new AgentSummaryStepLayout();
        };
        return caAgentBookingContext;
    });