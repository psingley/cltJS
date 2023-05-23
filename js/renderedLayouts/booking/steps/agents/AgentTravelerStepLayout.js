define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/booking/steps/BaseStepLayout',
    'services/bookingService',
    'util/booking/bookingUtil',
    'util/booking/travelerFormUtil',
    'views/validation/ErrorView',
    'event.aggregator',
    'views/booking/travelerInformation/TravelerListView',
    'util/objectUtil',
    'goalsUtil',
    'renderedLayouts/booking/steps/TravelerStepLayout',
    'util/travelerUtil',
], function ($, _, Backbone, Marionette, App, BaseStepLayout, BookingService, BookingUtil, TravelerFormUtil, ErrorView,
    EventAggregator, TravelerListView, ObjectUtil, goalsUtil, TravelerStepLayout, TravelerUtil) {
	var AgentTravelerStepLayout = TravelerStepLayout.extend({
		initialize: function () {
			AgentTravelerStepLayout.__super__.initialize.apply(this);
		},
		requiredFields: ['#lblFirstName','#lblLastName','#lblGender','#lblDOB'],
		validateForAgent: true,
        validateTravelers: function (outerScope) {
        	//get all invalid traveler views
        	var invalidTravelerViews = outerScope.getSection().travelerViews;
        	//iterate through them and output validation messages
        	_.each(invalidTravelerViews, function (travelerView) {
        		var messages = travelerView.model.validateForAgent();
        		//var errorView = new ErrorView(messages);
        		//travelerView.travelerMessagesRegion.show(errorView);
                if (messages.length > 0) {
                    let inputs = document.getElementById('travelerInformationContent').querySelectorAll('.req');
                    inputs.forEach((c, i) => {
                        let target = c.name ? c.name : "";
                        let classname = c.className ? c.className : "";
                        TravelerUtil.ValidationStation(target, classname);
                    });
                }
        	});
        }
    });
	return AgentTravelerStepLayout;
});