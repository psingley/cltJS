// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/search/tourDetails/TourFeaturesModel'
], function (_, Backbone, TourFeaturesModel) {
	var TourFeaturesCollection = Backbone.Collection.extend({
		defaults: {
			model: TourFeaturesModel
		},
		initFromArray: function (array) {
			this.set(
			   _(array.map(function (date) {
			   	return new TourFeaturesModel(date);
			   }))._wrapped);
		}
	});
	// Return the model for the module
	return TourFeaturesCollection;
});