define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/booking/flights/FlightScheduleLayoutView',
    'collections/booking/flights/ScheduleCollection'
], function ($, _, Backbone, Marionette, App, FlightScheduleLayout, ScheduleCollection) {
    var FlightScheduleListView = Backbone.Marionette.CollectionView.extend({
        collection: ScheduleCollection,
        itemView: FlightScheduleLayout,
        doSort: function (sortCode, sortDirection, sortFieldText) {
            this.collection.setSortField(sortCode, sortDirection, sortFieldText);
            this.collection.sort();
            this.collection.trigger('reset');
        },
        onAfterItemAdded: function (itemView) {
	        if ($(itemView.el).hasClass( "flight")) {
	        	var flight = $(itemView.el);
	        	var flightDetailsBtn = flight.find(".flight_details");
	        	var flightDetails = flight.find(".option_details");
	        	var count = parseInt(this.children.length);
		        var flightDetailsId = "flight-details-" + count;
	        	flightDetailsBtn.attr("data-target", "#" + flightDetailsId);
	        	flightDetails.attr("id", flightDetailsId);
	        	flight.find("[data-toggle=tooltip]").tooltip();
	        }
        }
    });
    return FlightScheduleListView;
});