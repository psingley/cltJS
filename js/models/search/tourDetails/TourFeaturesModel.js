define([
    'underscore',
    'backbone'
], function (_, Backbone) {
	var TourFeaturesModel = Backbone.Model.extend({
		defaults: {
			title: '',
			count: 0
		},
		initialize: function (option) {

		}
	});
	// Return the model for the module
	return TourFeaturesModel;
});
