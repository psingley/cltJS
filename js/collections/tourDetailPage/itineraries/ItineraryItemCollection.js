// Filename: models/project
define([
	'underscore',
	'backbone',
	'models/tourDetailPage/itineraries/ItineraryItemModel'
], function (_, Backbone, ItineraryItemModel) {
	var ItineraryItemCollection = Backbone.Collection.extend({
		defaults: {
			model: ItineraryItemModel
		},
		initFromArray: function (array) {
			if (array) {
				this.set(
					_(array.map(function(date) {
						return new ItineraryItemModel(date);
					}))._wrapped);
			}
		}
	});
	// Return the model for the module
	return ItineraryItemCollection;
});