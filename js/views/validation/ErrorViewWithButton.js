define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/validation/ErrorView',
    'text!templates/validation/validationWithButtonTemplate.html'
], function ($, _, Backbone, Marionette, App, ErrorView, ValidationTemplate) {
    var ErrorViewWithButton = ErrorView.extend({
    	className: 'errorMessages',
    	template: Backbone.Marionette.TemplateCache.get(ValidationTemplate),
    	events: function () {
    		var baseViewEvents = ErrorView.__super__.events;
    		var events = {
    			'click a.btn': 'backToDateSelector'
    		};

    		return _.extend(events, baseViewEvents);
    	},
    	templateHelpers: function () {
    		return {
    			buttonText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.BackToDateStepButton')
    		};
    	},
    	backToDateSelector: function(e) {
    		e.preventDefault();

    		//switch to step 1
    		$('li.stepNav[data-step=1] a').trigger('click');

    		//animate to the top of the dates
    		$('html, body').animate({ scrollTop: $('.bookingEngineSidebar').offset().top }, 'fast');
	    }
    });
    return ErrorViewWithButton;
});