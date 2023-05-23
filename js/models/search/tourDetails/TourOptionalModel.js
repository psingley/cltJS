define([
    'underscore',
    'backbone'
], function (_, Backbone) {
	var TourOptionalModel = Backbone.Model.extend({
		defaults: {
			title: ''
		},
		initialize: function (option) {

		}
	});
	// Return the model for the module
	return TourOptionalModel;
});
