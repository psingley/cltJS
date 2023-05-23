define([
    'underscore',
    'backbone',
	'collections/tour/itineraries/ItineraryItemCollection',
	'collections/tour/itineraries/TourDatesGroupByYearCollection'
], function (_, Backbone, ItineraryItemCollection, TourDatesGroupByYearCollection) {
	var TourItineraryModel = Backbone.Model.extend({
		defaults: {
			title: '',
			tourDatesByYear: TourDatesGroupByYearCollection,
			itineraryList: ItineraryItemCollection
		},
		initialize: function (option) {
			this.tourDatesByYear = new TourDatesGroupByYearCollection();
			this.itineraryList = new ItineraryItemCollection();
		}		
	});
	// Return the model for the module
	return TourItineraryModel;
});
