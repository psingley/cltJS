// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/search/tourDetails/TourCityModel'
], function (_, Backbone, TourCityModel) {
	var ItineraryItemCollection = Backbone.Collection.extend({
		defaults: {
			model: TourCityModel
		},
		initFromArray: function (array) {
			this.set(
			   _(array.map(function (date) {
			   	return new TourCityModel(date);
			   }))._wrapped);
		}
	});
	// Return the model for the module
	return ItineraryItemCollection;
});