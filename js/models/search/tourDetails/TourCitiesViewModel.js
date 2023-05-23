// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
	'collections/tour/itineraries/TourDatesGroupByYearCollection'
], function ($, _, Backbone, TourDatesGroupByYearCollection) {
	var TourCitiesViewModel = Backbone.Model.extend({
		defaults: {
			title: '',
			tourDatesByYear: TourDatesGroupByYearCollection
		},
		initialize: function () {
			this.tourDatesByYear = new TourDatesGroupByYearCollection();
		}
	});
	// Return the model for the module
	return TourCitiesViewModel;
});